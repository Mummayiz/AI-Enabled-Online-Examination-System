from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db
from models import Exam, Question, ExamSession, Result
from datetime import datetime
from functools import wraps
import random

student_bp = Blueprint('student', __name__)

def student_required(f):
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        if current_user.role != 'student':
            return jsonify({'error': 'Student access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

@student_bp.route('/exams', methods=['GET'])
@student_required
def get_available_exams():
    try:
        now = datetime.utcnow()
        
        # Get active exams that are currently available
        exams = Exam.query.filter_by(is_active=True).all()
        
        available_exams = []
        for exam in exams:
            # Check if exam is within schedule
            is_available = True
            if exam.start_time and exam.start_time > now:
                is_available = False
            if exam.end_time and exam.end_time < now:
                is_available = False
            
            # Check if student has already taken the exam
            existing_session = ExamSession.query.filter_by(
                student_id=current_user.id,
                exam_id=exam.id,
                is_completed=True
            ).first()
            
            exam_data = exam.to_dict()
            exam_data['is_available'] = is_available
            exam_data['already_taken'] = existing_session is not None
            
            available_exams.append(exam_data)
        
        return jsonify({'exams': available_exams}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@student_bp.route('/exams/<int:exam_id>/start', methods=['POST'])
@student_required
def start_exam(exam_id):
    try:
        exam = Exam.query.get(exam_id)
        if not exam:
            return jsonify({'error': 'Exam not found'}), 404
        
        # Check if exam is active
        if not exam.is_active:
            return jsonify({'error': 'Exam is not active'}), 400
        
        # Check schedule
        now = datetime.utcnow()
        if exam.start_time and exam.start_time > now:
            return jsonify({'error': 'Exam has not started yet'}), 400
        if exam.end_time and exam.end_time < now:
            return jsonify({'error': 'Exam has ended'}), 400
        
        # Check if already taken
        existing_session = ExamSession.query.filter_by(
            student_id=current_user.id,
            exam_id=exam_id,
            is_completed=True
        ).first()
        
        if existing_session:
            return jsonify({'error': 'You have already taken this exam'}), 400
        
        # Check for incomplete session
        incomplete_session = ExamSession.query.filter_by(
            student_id=current_user.id,
            exam_id=exam_id,
            is_completed=False
        ).first()
        
        if incomplete_session:
            # Return existing session
            questions = Question.query.filter_by(exam_id=exam_id).all()
            questions_data = [q.to_dict() for q in questions]
            
            # Randomize if needed
            if exam.randomize_questions:
                random.shuffle(questions_data)
            
            return jsonify({
                'session': incomplete_session.to_dict(),
                'exam': exam.to_dict(),
                'questions': questions_data
            }), 200
        
        # Create new session
        session = ExamSession(
            student_id=current_user.id,
            exam_id=exam_id
        )
        
        db.session.add(session)
        db.session.commit()
        
        # Get questions
        questions = Question.query.filter_by(exam_id=exam_id).all()
        questions_data = [q.to_dict() for q in questions]
        
        # Randomize if needed
        if exam.randomize_questions:
            random.shuffle(questions_data)
        
        return jsonify({
            'session': session.to_dict(),
            'exam': exam.to_dict(),
            'questions': questions_data
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@student_bp.route('/sessions/<int:session_id>/submit', methods=['POST'])
@student_required
def submit_exam(session_id):
    try:
        session = ExamSession.query.get(session_id)
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        # Verify session belongs to current user
        if session.student_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Check if already completed
        if session.is_completed:
            return jsonify({'error': 'Exam already submitted'}), 400
        
        data = request.get_json()
        answers = data.get('answers', {})
        
        # Save answers
        session.set_answers(answers)
        session.end_time = datetime.utcnow()
        session.is_completed = True
        
        # Check if auto-submitted due to violations
        if session.violation_count >= 5:
            session.auto_submitted = True
        
        # Calculate result
        exam = session.exam
        questions = Question.query.filter_by(exam_id=exam.id).all()
        
        correct_count = 0
        wrong_count = 0
        unanswered_count = 0
        marks_obtained = 0.0
        
        for question in questions:
            student_answer = answers.get(str(question.id), '').upper()
            
            if not student_answer:
                unanswered_count += 1
            elif student_answer == question.correct_answer:
                correct_count += 1
                marks_obtained += question.marks
            else:
                wrong_count += 1
                # Apply negative marking if enabled
                if exam.negative_marking:
                    marks_obtained -= exam.negative_marks_value
        
        # Ensure marks don't go below 0
        marks_obtained = max(0, marks_obtained)
        
        percentage = (marks_obtained / exam.total_marks) * 100 if exam.total_marks > 0 else 0
        passed = marks_obtained >= exam.passing_marks
        
        # Create result
        result = Result(
            student_id=current_user.id,
            exam_id=exam.id,
            session_id=session.id,
            marks_obtained=marks_obtained,
            total_marks=exam.total_marks,
            percentage=percentage,
            passed=passed,
            correct_answers=correct_count,
            wrong_answers=wrong_count,
            unanswered=unanswered_count,
            violation_count=session.violation_count
        )
        
        db.session.add(result)
        db.session.commit()
        
        return jsonify({
            'message': 'Exam submitted successfully',
            'result': result.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@student_bp.route('/results', methods=['GET'])
@student_required
def get_my_results():
    try:
        results = Result.query.filter_by(student_id=current_user.id).order_by(Result.created_at.desc()).all()
        
        results_data = []
        for result in results:
            result_dict = result.to_dict()
            result_dict['exam_title'] = result.exam.title
            results_data.append(result_dict)
        
        return jsonify({'results': results_data}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@student_bp.route('/results/<int:result_id>', methods=['GET'])
@student_required
def get_result_detail(result_id):
    try:
        result = Result.query.get(result_id)
        if not result:
            return jsonify({'error': 'Result not found'}), 404
        
        # Verify result belongs to current user
        if result.student_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        result_dict = result.to_dict()
        result_dict['exam'] = result.exam.to_dict()
        result_dict['student'] = result.student.to_dict()
        
        return jsonify({'result': result_dict}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
