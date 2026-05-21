from functools import wraps
from flask import g
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from backend.models.profile import Profile
from backend.utils.helpers import error_response

def role_required(allowed_roles):
    """
    Decorator to restrict route access by user roles.
    Injects g.current_user for use within the route.
    Usage:
        @app.route('/student/profile')
        @role_required(['student'])
        def get_profile():
            user = g.current_user
            ...
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                # 1. Verify the JWT token is present and valid
                verify_jwt_in_request()
            except Exception as e:
                return error_response(f"Authentication failed: {str(e)}", 401)
                
            # 2. Extract identity
            user_id = get_jwt_identity()
            if not user_id:
                return error_response("Invalid authentication token claims", 401)
                
            # 3. Retrieve profile from database
            user = Profile.query.filter_by(id=user_id).first()
            if not user:
                return error_response("User profile not found", 404)
                
            # 4. Check if the user role is authorized
            if user.role not in allowed_roles:
                return error_response(f"Access denied: Requires one of these roles: {allowed_roles}", 403)
                
            # 5. Populate global request context
            g.current_user = user
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def onboarding_required(fn):
    """
    Decorator to ensure a user has completed the onboarding flow before accessing
    sensitive dashboard features.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # Assumes role_required was already run and g.current_user is set
        user = getattr(g, 'current_user', None)
        if not user:
            return error_response("Authentication context required", 401)
            
        if not user.onboarding_completed:
            return error_response("Onboarding must be completed before accessing this route", 403, {"onboarding_completed": False})
            
        return fn(*args, **kwargs)
    return wrapper
