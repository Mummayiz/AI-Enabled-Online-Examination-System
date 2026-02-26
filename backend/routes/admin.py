from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db
from models import Exam, Question, User, Result
from datetime import datetime
from functools import wraps

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        if current_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

# Exam Management
@admin_bp.route('/exams', methods=['GET'])
@admin_required
def get_exams():
    try:
        exams = Exam.query.all()
        return jsonify({
            'exams': [exam.to_dict() for exam in exams]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/exams', methods=['POST'])
@admin_required
def create_exam():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'duration', 'total_marks', 'passing_marks']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Parse datetime fields
        start_time = None
        end_time = None
        if data.get('start_time'):
            start_time = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
        if data.get('end_time'):
            end_time = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
        
        exam = Exam(
            title=data['title'],
            description=data.get('description', ''),
            duration=data['duration'],
            total_marks=data['total_marks'],
            passing_marks=data['passing_marks'],
            negative_marking=data.get('negative_marking', False),
            negative_marks_value=data.get('negative_marks_value', 0.0),
            randomize_questions=data.get('randomize_questions', False),
            start_time=start_time,
            end_time=end_time,
            created_by=current_user.id,
            is_active=data.get('is_active', True)
        )
        
        db.session.add(exam)
        db.session.commit()
        
        return jsonify({
            'message': 'Exam created successfully',
            'exam': exam.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/exams/<int:exam_id>', methods=['GET'])
@admin_required
def get_exam(exam_id):
    try:
        exam = Exam.query.get(exam_id)
        if not exam:
            return jsonify({'error': 'Exam not found'}), 404
        
        return jsonify({'exam': exam.to_dict(include_questions=True)}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/exams/<int:exam_id>', methods=['PUT'])
@admin_required
def update_exam(exam_id):
    try:
        exam = Exam.query.get(exam_id)
        if not exam:
            return jsonify({'error': 'Exam not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'title' in data:
            exam.title = data['title']
        if 'description' in data:
            exam.description = data['description']
        if 'duration' in data:
            exam.duration = data['duration']
        if 'total_marks' in data:
            exam.total_marks = data['total_marks']
        if 'passing_marks' in data:
            exam.passing_marks = data['passing_marks']
        if 'negative_marking' in data:
            exam.negative_marking = data['negative_marking']
        if 'negative_marks_value' in data:
            exam.negative_marks_value = data['negative_marks_value']
        if 'randomize_questions' in data:
            exam.randomize_questions = data['randomize_questions']
        if 'start_time' in data:
            exam.start_time = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00')) if data['start_time'] else None
        if 'end_time' in data:
            exam.end_time = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00')) if data['end_time'] else None
        if 'is_active' in data:
            exam.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Exam updated successfully',
            'exam': exam.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/exams/<int:exam_id>', methods=['DELETE'])
@admin_required
def delete_exam(exam_id):
    try:
        exam = Exam.query.get(exam_id)
        if not exam:
            return jsonify({'error': 'Exam not found'}), 404
        
        db.session.delete(exam)
        db.session.commit()
        
        return jsonify({'message': 'Exam deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Question Management
@admin_bp.route('/exams/<int:exam_id>/questions', methods=['POST'])
@admin_required
def add_question(exam_id):
    try:
        exam = Exam.query.get(exam_id)
        if not exam:
            return jsonify({'error': 'Exam not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'marks']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate correct_answer
        if data['correct_answer'].upper() not in ['A', 'B', 'C', 'D']:
            return jsonify({'error': 'correct_answer must be A, B, C, or D'}), 400
        
        question = Question(
            exam_id=exam_id,
            question_text=data['question_text'],
            option_a=data['option_a'],
            option_b=data['option_b'],
            option_c=data['option_c'],
            option_d=data['option_d'],
            correct_answer=data['correct_answer'].upper(),
            marks=data['marks']
        )
        
        db.session.add(question)
        db.session.commit()
        
        return jsonify({
            'message': 'Question added successfully',
            'question': question.to_dict(include_answer=True)
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/questions/<int:question_id>', methods=['PUT'])
@admin_required
def update_question(question_id):
    try:
        question = Question.query.get(question_id)
        if not question:
            return jsonify({'error': 'Question not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'question_text' in data:
            question.question_text = data['question_text']
        if 'option_a' in data:
            question.option_a = data['option_a']
        if 'option_b' in data:
            question.option_b = data['option_b']
        if 'option_c' in data:
            question.option_c = data['option_c']
        if 'option_d' in data:
            question.option_d = data['option_d']
        if 'correct_answer' in data:
            if data['correct_answer'].upper() not in ['A', 'B', 'C', 'D']:
                return jsonify({'error': 'correct_answer must be A, B, C, or D'}), 400
            question.correct_answer = data['correct_answer'].upper()
        if 'marks' in data:
            question.marks = data['marks']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Question updated successfully',
            'question': question.to_dict(include_answer=True)
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/questions/<int:question_id>', methods=['DELETE'])
@admin_required
def delete_question(question_id):
    try:
        question = Question.query.get(question_id)
        if not question:
            return jsonify({'error': 'Question not found'}), 404
        
        db.session.delete(question)
        db.session.commit()
        
        return jsonify({'message': 'Question deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Analytics
@admin_bp.route('/analytics', methods=['GET'])
@admin_required
def get_analytics():
    try:
        total_students = User.query.filter_by(role='student').count()
        total_exams = Exam.query.count()
        total_results = Result.query.count()
        
        # Get recent results
        recent_results = Result.query.order_by(Result.created_at.desc()).limit(10).all()
        
        # Calculate average performance
        results = Result.query.all()
        avg_percentage = sum([r.percentage for r in results]) / len(results) if results else 0
        
        return jsonify({
            'total_students': total_students,
            'total_exams': total_exams,
            'total_results': total_results,
            'avg_percentage': round(avg_percentage, 2),
            'recent_results': [r.to_dict() for r in recent_results]
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/exams/<int:exam_id>/analytics', methods=['GET'])
@admin_required
def get_exam_analytics(exam_id):
    try:
        exam = Exam.query.get(exam_id)
        if not exam:
            return jsonify({'error': 'Exam not found'}), 404
        
        results = Result.query.filter_by(exam_id=exam_id).all()
        
        if not results:
            return jsonify({
                'exam': exam.to_dict(),
                'total_attempts': 0,
                'avg_percentage': 0,
                'pass_rate': 0,
                'results': []
            }), 200
        
        total_attempts = len(results)
        passed_count = sum([1 for r in results if r.passed])
        avg_percentage = sum([r.percentage for r in results]) / total_attempts
        pass_rate = (passed_count / total_attempts) * 100
        
        return jsonify({
            'exam': exam.to_dict(),
            'total_attempts': total_attempts,
            'avg_percentage': round(avg_percentage, 2),
            'pass_rate': round(pass_rate, 2),
            'passed_count': passed_count,
            'failed_count': total_attempts - passed_count,
            'results': [r.to_dict() for r in results]
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
