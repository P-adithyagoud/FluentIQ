from flask_jwt_extended import create_access_token, create_refresh_token
from backend.models.base import db
from backend.models.profile import Profile
from backend.utils.helpers import validate_email, validate_password_strength

class AuthService:
    @staticmethod
    def register_user(full_name, email, password, role):
        """Registers a new user in the platform database"""
        # Validate inputs
        if not full_name or not email or not password or not role:
            return {"success": False, "message": "All fields are required", "code": 400}
            
        if role not in ['student', 'faculty']:
            return {"success": False, "message": "Invalid user role specified", "code": 400}
            
        email_clean = email.strip().lower()
        if not validate_email(email_clean):
            return {"success": False, "message": "Invalid email address format", "code": 400}
            
        if not validate_password_strength(password):
            return {"success": False, "message": "Password must be at least 6 characters long", "code": 400}
            
        # Check if user already exists
        existing_user = Profile.query.filter_by(email=email_clean).first()
        if existing_user:
            return {"success": False, "message": "Email is already registered", "code": 409}
            
        # Create user
        try:
            new_profile = Profile(
                full_name=full_name.strip(),
                email=email_clean,
                role=role,
                onboarding_completed=False,
                avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={full_name.strip()}"
            )
            new_profile.set_password(password)
            new_profile.save()
            
            return {
                "success": True, 
                "message": "Registration successful. Please proceed to onboarding.", 
                "data": new_profile.to_dict(),
                "code": 201
            }
        except Exception as e:
            db.session.rollback()
            return {"success": False, "message": f"Database insertion failed: {str(e)}", "code": 500}

    @staticmethod
    def authenticate_user(email, password):
        """Authenticates user and signs high-security JWT access/refresh tokens"""
        if not email or not password:
            return {"success": False, "message": "Email and password are required", "code": 400}
            
        email_clean = email.strip().lower()
        user = Profile.query.filter_by(email=email_clean).first()
        
        if not user or not user.check_password(password):
            return {"success": False, "message": "Invalid email or password", "code": 401}
            
        # Sign JWT tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return {
            "success": True,
            "message": "Login successful",
            "data": {
                "user": user.to_dict(),
                "access_token": access_token,
                "refresh_token": refresh_token
            },
            "code": 200
        }
        
    @staticmethod
    def simulate_forgot_password(email):
        """Simulates password reset flow by logging token instructions"""
        if not email:
            return {"success": False, "message": "Email is required", "code": 400}
            
        email_clean = email.strip().lower()
        user = Profile.query.filter_by(email=email_clean).first()
        
        # Security best practice: don't reveal if user exists.
        # Return success either way, but perform logging internally.
        if user:
            # Code to send email or generate token would run here.
            print(f"[AUTH SIMULATOR] Reset instructions sent to: {email_clean}")
            
        return {
            "success": True,
            "message": "If this email is registered, instructions have been sent to reset your password.",
            "code": 200
        }
