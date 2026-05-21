from flask import Blueprint, request
from backend.services.auth_service import AuthService
from backend.utils.helpers import success_response, error_response

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Endpoint to handle user registration (Student or Faculty)"""
    data = request.get_json() or {}
    
    full_name = data.get('full_name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    
    result = AuthService.register_user(full_name, email, password, role)
    
    if not result["success"]:
        return error_response(result["message"], result["code"])
        
    return success_response(result["data"], result["message"], result["code"])


@auth_bp.route('/login', methods=['POST'])
def login():
    """Endpoint to handle credentials authentication and issue JWTs"""
    data = request.get_json() or {}
    
    email = data.get('email')
    password = data.get('password')
    
    result = AuthService.authenticate_user(email, password)
    
    if not result["success"]:
        return error_response(result["message"], result["code"])
        
    return success_response(result["data"], result["message"], result["code"])


@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Endpoint to clear sessions or confirm logout (state handled in client JWT removal)"""
    # In stateless JWT setups, client simply discards the token.
    # We return success to let the frontend clear storage seamlessly.
    return success_response(message="Logged out successfully")


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Endpoint to trigger forgot password flow"""
    data = request.get_json() or {}
    email = data.get('email')
    
    result = AuthService.simulate_forgot_password(email)
    
    if not result["success"]:
        return error_response(result["message"], result["code"])
        
    return success_response(message=result["message"], status_code=result["code"])
