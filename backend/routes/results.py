from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db
from models import Result, Exam, User
from functools import wraps

results_bp = Blueprint('results', __name__)

def admin_required(f):
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        if current_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

@results_bp.route('', methods=['GET'])
@admin_required
def get_all_results():
    try:
        results = Result.query.order_by(Result.created_at.desc()).all()
        
        results_data = []
        for result in results:
            result_dict = result.to_dict()
            result_dict['exam_title'] = result.exam.title
            result_dict['student_name'] = result.student.username
            results_data.append(result_dict)
        
        return jsonify({'results': results_data}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@results_bp.route('/<int:result_id>', methods=['GET'])
@login_required
def get_result(result_id):
    try:
        result = Result.query.get(result_id)
        if not result:
            return jsonify({'error': 'Result not found'}), 404
        
        # Admin can see any result, student can only see their own
        if current_user.role != 'admin' and result.student_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        result_dict = result.to_dict()
        result_dict['exam'] = result.exam.to_dict()
        result_dict['student'] = result.student.to_dict()
        
        return jsonify({'result': result_dict}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
