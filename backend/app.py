import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from backend.config.config import Config
from backend.models.base import db
from backend.models.profile import Profile, StudentProfile, FacultyProfile
from backend.routes.auth import auth_bp
from backend.routes.student import student_bp
from backend.routes.faculty import faculty_bp
from backend.utils.helpers import success_response, error_response

class PrefixMiddleware(object):
    """WSGI middleware to strip a URL prefix from requests before processing in Flask"""
    def __init__(self, app, prefix=''):
        self.app = app
        self.prefix = prefix

    def __call__(self, environ, start_response):
        path_info = environ.get('PATH_INFO', '')
        if path_info.startswith(self.prefix):
            environ['PATH_INFO'] = path_info[len(self.prefix):]
            environ['SCRIPT_NAME'] = self.prefix
        return self.app(environ, start_response)

def create_app():
    """Application Factory to configure and initialize the Flask REST API"""
    app = Flask(
        __name__,
        static_folder=os.path.abspath(os.path.join(os.path.dirname(__file__), '../frontend')),
        static_url_path=''
    )
    
    # Apply URL prefix middleware for Vercel's experimentalServices routing compatibility
    app.wsgi_app = PrefixMiddleware(app.wsgi_app, prefix='/_/backend')
    
    app.config.from_object(Config)
    
    # Enable Cross-Origin Resource Sharing (CORS) for all routes
    # This is critical for connecting a decoupled frontend (e.g. port 3000) to this API (port 5000)
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
    
    # Initialize database
    db.init_app(app)
    
    # Initialize JWT session manager
    jwt = JWTManager(app)
    
    # Register API Blueprints
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(student_bp, url_prefix='/student')
    app.register_blueprint(faculty_bp, url_prefix='/faculty')
    
    # Global JWT Error handler overrides to return uniform JSON formats
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return error_response("The token has expired", 401)
        
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return error_response("Signature verification failed", 401)
        
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return error_response("Request does not contain an authorization token", 401)
    
    @app.route('/')
    def root():
        """Serve the frontend SPA client"""
        return app.send_static_file('index.html')
        
    # Auto-database creation and seeding logic
    with app.app_context():
        try:
            db.create_all()
            seed_database()
        except Exception as e:
            app.logger.error(f"Database bootstrap failed: {str(e)}")
            
    return app

def seed_database():
    """Pre-seeds standard student and faculty accounts for sandbox testing (password: password123)"""
    # If users exist, skip seeding
    if Profile.query.first():
        return
        
    print("[DATABASE SEED] Pre-populating sandbox profiles with password: password123...")
    
    # 1. Add Faculty: Dr. Sarah Jenkins
    faculty = Profile(
        id='f0000000-0000-0000-0000-000000000001',
        role='faculty',
        full_name='Dr. Sarah Jenkins',
        email='sarah.faculty@college.edu',
        avatar_url='https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        onboarding_completed=True
    )
    faculty.set_password('password123')
    db.session.add(faculty)
    
    f_details = FacultyProfile(
        user_id='f0000000-0000-0000-0000-000000000001',
        college_name='State Institute of Engineering',
        department='English and Humanities',
        designation='Professor & Head'
    )
    db.session.add(f_details)
    
    # 2. Add Student (Onboarded, Advanced): Alex Rivera
    alex = Profile(
        id='e0000000-0000-0000-0000-000000000001',
        role='student',
        full_name='Alex Rivera',
        email='alex.student@college.edu',
        avatar_url='https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
        onboarding_completed=True
    )
    alex.set_password('password123')
    db.session.add(alex)
    
    alex_details = StudentProfile(
        user_id='e0000000-0000-0000-0000-000000000001',
        college_name='State Institute of Engineering',
        department='Computer Science',
        section='A',
        roll_number='CS-2024-042',
        english_level='advanced',
        speaking_confidence=8,
        interests=['AI', 'Coding', 'Technology'],
        hobbies=['Chess', 'Writing'],
        learning_goal='Crack Interviews'
    )
    db.session.add(alex_details)
    
    # 3. Add Student (Onboarded, Intermediate): Priya Sharma
    priya = Profile(
        id='e0000000-0000-0000-0000-000000000002',
        role='student',
        full_name='Priya Sharma',
        email='priya.student@college.edu',
        avatar_url='https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
        onboarding_completed=True
    )
    priya.set_password('password123')
    db.session.add(priya)
    
    priya_details = StudentProfile(
        user_id='e0000000-0000-0000-0000-000000000002',
        college_name='State Institute of Engineering',
        department='Electronics & Comm.',
        section='B',
        roll_number='EC-2024-099',
        english_level='intermediate',
        speaking_confidence=5,
        interests=['Public Speaking', 'Movies', 'Entrepreneurship'],
        hobbies=['Music', 'Traveling'],
        learning_goal='Improve Speaking'
    )
    db.session.add(priya_details)
    
    # 4. Add Student (Registered but Not Onboarded): Ethan Hunt
    ethan = Profile(
        id='e0000000-0000-0000-0000-000000000003',
        role='student',
        full_name='Ethan Hunt',
        email='ethan.student@college.edu',
        avatar_url='https://api.dicebear.com/7.x/avataaars/svg?seed=ethan',
        onboarding_completed=False
    )
    ethan.set_password('password123')
    db.session.add(ethan)
    
    db.session.commit()
    print("[DATABASE SEED] Seed completed successfully.")

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    # Run server locally on 0.0.0.0 (externally visible for development)
    app.run(host='0.0.0.0', port=port)
