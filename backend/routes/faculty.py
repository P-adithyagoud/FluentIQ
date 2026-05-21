from flask import Blueprint, request, g
from backend.middleware.auth_middleware import role_required, onboarding_required
from backend.services.faculty_service import FacultyService
from backend.utils.helpers import success_response, error_response

faculty_bp = Blueprint('faculty', __name__)

@faculty_bp.route('/onboarding', methods=['POST'])
@role_required(['faculty'])
def post_onboarding():
    """Handles and saves faculty basic details to complete onboarding"""
    user = g.current_user
    data = request.get_json() or {}
    
    result = FacultyService.complete_onboarding(user.id, data)
    
    if not result["success"]:
        return error_response(result["message"], result["code"])
        
    return success_response(result["data"], result.get("message", "Success"), result["code"])


@faculty_bp.route('/dashboard', methods=['GET'])
@role_required(['faculty'])
@onboarding_required
def get_dashboard():
    """Retrieves analytical cards and department summaries for administrative dashboards"""
    # 1. Fetch dashboard metric summary aggregates
    result = FacultyService.get_dashboard_analytics()
    
    if not result["success"]:
        return error_response(result["message"], result["code"])
        
    # 2. Append faculty profile context
    user = g.current_user
    result["data"]["faculty_details"] = user.to_dict()
    if user.faculty_profile:
        result["data"]["faculty_details"]["faculty_profile"] = user.faculty_profile.to_dict()
        
    return success_response(result["data"], result.get("message", "Success"), result["code"])


@faculty_bp.route('/students', methods=['GET'])
@role_required(['faculty'])
@onboarding_required
def get_students():
    """Lists all onboarded students with robust searching, sorting, and department/level filters"""
    search_query = request.args.get('search')
    department = request.args.get('department')
    english_level = request.args.get('level')
    sort_by = request.args.get('sort_by')
    
    result = FacultyService.list_students(
        search_query=search_query,
        department=department,
        english_level=english_level,
        sort_by=sort_by
    )
    
    if not result["success"]:
        return error_response(result["message"], result["code"])
        
    return success_response(result["data"], result.get("message", "Success"), result["code"])
