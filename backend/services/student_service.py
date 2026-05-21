from backend.models.base import db
from backend.models.profile import Profile, StudentProfile

class StudentService:
    @staticmethod
    def complete_onboarding(user_id, onboarding_data):
        """Processes the 4-step wizard data and completes student onboarding"""
        profile = Profile.query.filter_by(id=user_id).first()
        if not profile:
            return {"success": False, "message": "User profile not found", "code": 404}
            
        if profile.role != 'student':
            return {"success": False, "message": "User is not a student", "code": 400}
            
        # Extract and validate fields
        college_name = onboarding_data.get('college_name')
        department = onboarding_data.get('department')
        section = onboarding_data.get('section')
        roll_number = onboarding_data.get('roll_number')
        
        # Assessment fields
        english_level = onboarding_data.get('english_level')
        speaking_confidence = onboarding_data.get('speaking_confidence')
        learning_goal = onboarding_data.get('learning_goal')
        
        # Tags fields
        interests = onboarding_data.get('interests', [])
        hobbies = onboarding_data.get('hobbies', [])
        
        if not college_name or not department or not section or not roll_number:
            return {"success": False, "message": "Basic details (College, Department, Section, Roll Number) are required", "code": 400}
            
        if not english_level or speaking_confidence is None or not learning_goal:
            return {"success": False, "message": "All English assessment questions are required", "code": 400}
            
        # Check roll number uniqueness
        roll_number_clean = roll_number.strip().upper()
        existing_roll = StudentProfile.query.filter_by(roll_number=roll_number_clean).first()
        if existing_roll and existing_roll.user_id != user_id:
            return {"success": False, "message": "Roll number is already registered by another student", "code": 409}
            
        try:
            # Check if student profile already exists
            student_profile = StudentProfile.query.filter_by(user_id=user_id).first()
            
            if not student_profile:
                student_profile = StudentProfile(user_id=user_id)
                
            student_profile.college_name = college_name.strip()
            student_profile.department = department.strip()
            student_profile.section = section.strip().upper()
            student_profile.roll_number = roll_number_clean
            student_profile.english_level = english_level.strip().lower()
            student_profile.speaking_confidence = int(speaking_confidence)
            student_profile.learning_goal = learning_goal.strip()
            student_profile.interests = interests
            student_profile.hobbies = hobbies
            
            # Save student details
            db.session.add(student_profile)
            
            # Update core user record
            profile.onboarding_completed = True
            db.session.add(profile)
            
            db.session.commit()
            
            return {
                "success": True,
                "message": "Student onboarding completed successfully",
                "data": student_profile.to_dict(),
                "code": 200
            }
        except Exception as e:
            db.session.rollback()
            return {"success": False, "message": f"Database transaction failed: {str(e)}", "code": 500}

    @staticmethod
    def get_student_profile(user_id):
        """Retrieves user profile merged with student onboarding details"""
        profile = Profile.query.filter_by(id=user_id).first()
        if not profile:
            return {"success": False, "message": "User profile not found", "code": 404}
            
        student_profile = StudentProfile.query.filter_by(user_id=user_id).first()
        
        merged_data = profile.to_dict()
        if student_profile:
            merged_data["student_details"] = student_profile.to_dict()
        else:
            merged_data["student_details"] = None
            
        return {
            "success": True,
            "message": "Student profile retrieved successfully",
            "data": merged_data,
            "code": 200
        }

    @staticmethod
    def update_student_profile(user_id, update_data):
        """Updates specific fields inside the student profile"""
        profile = Profile.query.filter_by(id=user_id).first()
        if not profile:
            return {"success": False, "message": "User profile not found", "code": 404}
            
        student_profile = StudentProfile.query.filter_by(user_id=user_id).first()
        if not student_profile:
            return {"success": False, "message": "Student profile not found. Please complete onboarding.", "code": 404}
            
        # Update core details
        if "full_name" in update_data:
            profile.full_name = update_data["full_name"].strip()
            
        # Update student profile details
        for field in ["college_name", "department", "section", "learning_goal", "english_level"]:
            if field in update_data:
                setattr(student_profile, field, update_data[field].strip())
                
        if "speaking_confidence" in update_data:
            student_profile.speaking_confidence = int(update_data["speaking_confidence"])
            
        if "interests" in update_data:
            student_profile.interests = list(update_data["interests"])
            
        if "hobbies" in update_data:
            student_profile.hobbies = list(update_data["hobbies"])
            
        try:
            db.session.commit()
            return {
                "success": True,
                "message": "Profile updated successfully",
                "data": {
                    **profile.to_dict(),
                    "student_details": student_profile.to_dict()
                },
                "code": 200
            }
        except Exception as e:
            db.session.rollback()
            return {"success": False, "message": f"Update failed: {str(e)}", "code": 500}
