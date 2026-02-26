from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db
from models import Violation, ExamSession
from functools import wraps

violations_bp = Blueprint('violations', __name__)

def student_required(f):
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        if current_user.role != 'student':
            return jsonify({'error': 'Student access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

@violations_bp.route('', methods=['POST'])
@student_required
def log_violation():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('session_id') or not data.get('violation_type'):
            return jsonify({'error': 'session_id and violation_type are required'}), 400
        
        session = ExamSession.query.get(data['session_id'])
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        # Verify session belongs to current user
        if session.student_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Create violation record
        violation = Violation(
            session_id=data['session_id'],
            violation_type=data['violation_type'],
            details=data.get('details', '')
        )
        
        db.session.add(violation)
        
        # Increment violation count in session
        session.violation_count += 1
        
        db.session.commit()
        
        return jsonify({
            'message': 'Violation logged',
            'violation_count': session.violation_count,
            'should_submit': session.violation_count >= 5
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@violations_bp.route('/session/<int:session_id>', methods=['GET'])
@login_required
def get_session_violations(session_id):
    try:
        session = ExamSession.query.get(session_id)
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        # Allow both admin and student (if it's their session)
        if current_user.role != 'admin' and session.student_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        violations = Violation.query.filter_by(session_id=session_id).all()
        
        return jsonify({
            'violations': [v.to_dict() for v in violations],
            'total_count': len(violations)
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
