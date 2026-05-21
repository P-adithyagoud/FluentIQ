from flask import Blueprint, request, g
from backend.middleware.auth_middleware import role_required, onboarding_required
from backend.services.student_service import StudentService
from backend.utils.helpers import success_response, error_response

student_bp = Blueprint('student', __name__)

@student_bp.route('/profile', methods=['GET'])
@role_required(['student'])
def get_profile():
    """Retrieves full student profile (including basic details and onboarding details)"""
    user = g.current_user
    result = StudentService.get_student_profile(user.id)
    
    if not result["success"]:
        return error_response(result["message"], result["code"])
        
    return success_response(result["data"], result.get("message", "Success"), result["code"])


@student_bp.route('/profile', methods=['PUT'])
@role_required(['student'])
@onboarding_required
def update_profile():
    """Updates fields within the student profile"""
    user = g.current_user
    data = request.get_json() or {}
    
    result = StudentService.update_student_profile(user.id, data)
    
    if not result["success"]:
        return error_response(result["message"], result["code"])
        
    return success_response(result["data"], result.get("message", "Success"), result["code"])


@student_bp.route('/onboarding', methods=['POST'])
@role_required(['student'])
def post_onboarding():
    """Saves multi-step wizard onboarding results and marks onboarding as completed"""
    user = g.current_user
    data = request.get_json() or {}
    
    result = StudentService.complete_onboarding(user.id, data)
    
    if not result["success"]:
        return error_response(result["message"], result["code"])
        
    return success_response(result["data"], result.get("message", "Success"), result["code"])
