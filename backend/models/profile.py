import uuid
import bcrypt
from datetime import datetime
from backend.models.base import db, BaseModel

def generate_uuid():
    """Generates standard string-based UUIDs"""
    return str(uuid.uuid4())

class Profile(BaseModel):
    """Core Profile table for all system users (Students and Faculty)"""
    __tablename__ = 'profiles'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    role = db.Column(db.String(20), nullable=False) # 'student' or 'faculty'
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    avatar_url = db.Column(db.String(500), nullable=True)
    onboarding_completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    student_profile = db.relationship('StudentProfile', backref='profile', uselist=False, cascade="all, delete-orphan")
    faculty_profile = db.relationship('FacultyProfile', backref='profile', uselist=False, cascade="all, delete-orphan")
    
    def set_password(self, password):
        """Hashes password using bcrypt and stores it"""
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
        
    def check_password(self, password):
        """Verifies the password hash against user input"""
        if not self.password_hash:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self, exclude=None):
        # Always hide password hash from serialization
        if exclude is None:
            exclude = []
        exclude.append('password_hash')
        return super().to_dict(exclude=exclude)


class StudentProfile(BaseModel):
    """Profile table for student-specific onboarding metadata"""
    __tablename__ = 'student_profiles'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False)
    college_name = db.Column(db.String(150), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    section = db.Column(db.String(10), nullable=False)
    roll_number = db.Column(db.String(50), unique=True, nullable=False)
    
    # Onboarding Assessment
    english_level = db.Column(db.String(20), nullable=True) # 'beginner', 'intermediate', 'advanced'
    speaking_confidence = db.Column(db.Integer, nullable=True) # 1 - 10 scale
    learning_goal = db.Column(db.String(255), nullable=True)
    
    # Hobbies & Interests stored as JSON lists for SQL compatibility
    interests = db.Column(db.JSON, nullable=False, default=list)
    hobbies = db.Column(db.JSON, nullable=False, default=list)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class FacultyProfile(BaseModel):
    """Profile table for faculty-specific metadata"""
    __tablename__ = 'faculty_profiles'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False)
    college_name = db.Column(db.String(150), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    designation = db.Column(db.String(100), nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
