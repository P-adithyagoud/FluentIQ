from sqlalchemy import func
from backend.models.base import db
from backend.models.profile import Profile, StudentProfile, FacultyProfile

class FacultyService:
    @staticmethod
    def complete_onboarding(user_id, onboarding_data):
        """Processes and saves the basic faculty details to complete onboarding"""
        profile = Profile.query.filter_by(id=user_id).first()
        if not profile:
            return {"success": False, "message": "User profile not found", "code": 404}
            
        if profile.role != 'faculty':
            return {"success": False, "message": "User is not faculty", "code": 400}
            
        college_name = onboarding_data.get('college_name')
        department = onboarding_data.get('department')
        designation = onboarding_data.get('designation')
        
        if not college_name or not department or not designation:
            return {"success": False, "message": "All fields (College Name, Department, Designation) are required", "code": 400}
            
        try:
            # Check if faculty profile already exists
            faculty_profile = FacultyProfile.query.filter_by(user_id=user_id).first()
            if not faculty_profile:
                faculty_profile = FacultyProfile(user_id=user_id)
                
            faculty_profile.college_name = college_name.strip()
            faculty_profile.department = department.strip()
            faculty_profile.designation = designation.strip()
            
            db.session.add(faculty_profile)
            
            # Update user record
            profile.onboarding_completed = True
            db.session.add(profile)
            
            db.session.commit()
            
            return {
                "success": True,
                "message": "Faculty onboarding completed successfully",
                "data": faculty_profile.to_dict(),
                "code": 200
            }
        except Exception as e:
            db.session.rollback()
            return {"success": False, "message": f"Database transaction failed: {str(e)}", "code": 500}

    @staticmethod
    def get_dashboard_analytics():
        """Aggregates platform analytical insights for the Faculty Admin Dashboard"""
        try:
            # 1. Total student profiles
            total_students = StudentProfile.query.count()
            
            # If no students, return empty structure
            if total_students == 0:
                return {
                    "success": True,
                    "message": "Dashboard analytics retrieved successfully",
                    "data": {
                        "total_students": 0,
                        "average_confidence": 0.0,
                        "level_distribution": {"beginner": 0, "intermediate": 0, "advanced": 0},
                        "department_distribution": {},
                        "top_interest": "None"
                    },
                    "code": 200
                }
                
            # 2. Average speaking confidence
            avg_confidence = db.session.query(func.avg(StudentProfile.speaking_confidence)).scalar() or 0.0
            avg_confidence = round(float(avg_confidence), 1)
            
            # 3. English level distribution
            levels = db.session.query(
                StudentProfile.english_level, 
                func.count(StudentProfile.id)
            ).group_by(StudentProfile.english_level).all()
            
            level_distribution = {"beginner": 0, "intermediate": 0, "advanced": 0}
            for lvl, count in levels:
                if lvl in level_distribution:
                    level_distribution[lvl] = count
                    
            # 4. Department distribution
            departments = db.session.query(
                StudentProfile.department,
                func.count(StudentProfile.id)
            ).group_by(StudentProfile.department).all()
            
            department_distribution = {dept: count for dept, count in departments if dept}
            
            # 5. Extract top interest from array lists
            # For simplicity across SQLite and Postgres, we fetch interest arrays and aggregate in Python
            all_interests = db.session.query(StudentProfile.interests).all()
            interest_counts = {}
            for row in all_interests:
                interests_list = row[0]
                if isinstance(interests_list, list):
                    for interest in interests_list:
                        interest_counts[interest] = interest_counts.get(interest, 0) + 1
                        
            top_interest = "None"
            if interest_counts:
                top_interest = max(interest_counts, key=interest_counts.get)
                
            return {
                "success": True,
                "message": "Dashboard analytics retrieved successfully",
                "data": {
                    "total_students": total_students,
                    "average_confidence": avg_confidence,
                    "level_distribution": level_distribution,
                    "department_distribution": department_distribution,
                    "top_interest": top_interest
                },
                "code": 200
            }
        except Exception as e:
            return {"success": False, "message": f"Analytics retrieval failed: {str(e)}", "code": 500}

    @staticmethod
    def list_students(search_query=None, department=None, english_level=None, sort_by=None):
        """Fetches the list of students with advanced support for search, filter, and sort"""
        try:
            # Query joining Profile and StudentProfile
            query = db.session.query(Profile, StudentProfile).join(
                StudentProfile, Profile.id == StudentProfile.user_id
            )
            
            # Apply filters
            if department:
                query = query.filter(StudentProfile.department.ilike(department))
                
            if english_level:
                query = query.filter(StudentProfile.english_level == english_level.lower())
                
            if search_query:
                # Search by full_name, email, or roll_number
                query = query.filter(
                    (Profile.full_name.ilike(f"%{search_query}%")) |
                    (Profile.email.ilike(f"%{search_query}%")) |
                    (StudentProfile.roll_number.ilike(f"%{search_query}%"))
                )
                
            # Apply sorting
            if sort_by == 'confidence_desc':
                query = query.order_by(StudentProfile.speaking_confidence.desc())
            elif sort_by == 'confidence_asc':
                query = query.order_by(StudentProfile.speaking_confidence.asc())
            elif sort_by == 'name_asc':
                query = query.order_by(Profile.full_name.asc())
            elif sort_by == 'name_desc':
                query = query.order_by(Profile.full_name.desc())
            else:
                query = query.order_by(StudentProfile.created_at.desc()) # Default: newest first
                
            results = query.all()
            
            # Format outputs
            students_list = []
            for profile, student in results:
                students_list.append({
                    **profile.to_dict(),
                    "student_details": student.to_dict()
                })
                
            return {
                "success": True,
                "message": "Student list retrieved successfully",
                "data": students_list,
                "code": 200
            }
        except Exception as e:
            return {"success": False, "message": f"Student query failed: {str(e)}", "code": 500}
