/**
 * AUTHENTICATION PAGES (LOGIN, SIGNUP, FORGOT PASSWORD)
 */

import { Api } from '../api.js';
import { Auth } from '../auth.js';
import { Components } from '../components.js';

export const LoginPage = {
    render() {
        return `
            <div class="auth-viewport-wrapper">
                <div class="auth-card glass-panel">
                    <div class="auth-header">
                        <a href="#/" class="auth-logo">
                            <i class="fa-solid fa-graduation-cap"></i>
                            <span>FluentlyAI</span>
                        </a>
                        <h2>Welcome back</h2>
                        <p>Sign in to your learning dashboard</p>
                    </div>
                    
                    <form id="login-form">
                        <div class="form-group">
                            <label class="form-label" for="login-email">Email Address</label>
                            <input class="form-control" type="email" id="login-email" required placeholder="alex.student@college.edu">
                        </div>
                        
                        <div class="form-group">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <label class="form-label" for="login-password">Password</label>
                                <a href="#/forgot-password" style="font-size: 0.78rem; color: var(--accent-indigo); text-decoration: none;">Forgot password?</a>
                            </div>
                            <input class="form-control" type="password" id="login-password" required placeholder="••••••••">
                        </div>
                        
                        <button class="btn-primary" type="submit" style="width: 100%; margin-top: 10px;">
                            Sign In <i class="fa-solid fa-right-to-bracket"></i>
                        </button>
                    </form>
                    
                    <div class="auth-footer-links">
                        Don't have an account? <a href="#/signup">Create one here</a>
                    </div>
                </div>
            </div>
        `;
    },
    
    bindEvents() {
        const form = document.getElementById('login-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            // Show loading spinner on button
            const btn = form.querySelector('button[type="submit"]');
            const originalContent = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
            
            try {
                const response = await Api.post('/auth/login', { email, password });
                
                // Store JWT token and Profile data
                const { access_token, user } = response.data;
                Auth.saveSession(access_token, user);
                
                Components.showToast("Login successful!", "success");
                
                // Route Guard depending on onboarding status
                if (!user.onboarding_completed) {
                    window.location.hash = '/onboarding';
                } else {
                    window.location.hash = '/dashboard';
                }
            } catch (error) {
                Components.showToast(error.message, "error");
                btn.disabled = false;
                btn.innerHTML = originalContent;
            }
        });
    }
};

export const SignupPage = {
    // Shared active state in-memory during page instance
    activeRole: 'student', 

    render() {
        return `
            <div class="auth-viewport-wrapper">
                <div class="auth-card glass-panel">
                    <div class="auth-header">
                        <a href="#/" class="auth-logo">
                            <i class="fa-solid fa-graduation-cap"></i>
                            <span>FluentlyAI</span>
                        </a>
                        <h2>Create your account</h2>
                        <p>Join the next generation of language learning</p>
                    </div>
                    
                    <!-- Role toggle selection -->
                    <div class="role-toggle-container">
                        <button class="role-toggle-btn active" type="button" id="role-btn-student" data-role="student">Student</button>
                        <button class="role-toggle-btn" type="button" id="role-btn-faculty" data-role="faculty">Faculty</button>
                    </div>
                    
                    <form id="signup-form">
                        <div class="form-group">
                            <label class="form-label" for="signup-name">Full Name</label>
                            <input class="form-control" type="text" id="signup-name" required placeholder="Alex Rivera">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="signup-email">Academic Email</label>
                            <input class="form-control" type="email" id="signup-email" required placeholder="alex.student@college.edu">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="signup-password">Password</label>
                            <input class="form-control" type="password" id="signup-password" required placeholder="Min 6 characters">
                        </div>
                        
                        <button class="btn-primary" type="submit" style="width: 100%; margin-top: 10px;">
                            Sign Up <i class="fa-solid fa-user-plus"></i>
                        </button>
                    </form>
                    
                    <div class="auth-footer-links">
                        Already have an account? <a href="#/login">Log in here</a>
                    </div>
                </div>
            </div>
        `;
    },
    
    bindEvents() {
        const form = document.getElementById('signup-form');
        const studentBtn = document.getElementById('role-btn-student');
        const facultyBtn = document.getElementById('role-btn-faculty');
        
        if (!form) return;
        
        // Reset local in-memory role back to student on bind
        this.activeRole = 'student';
        
        // Handle switching roles
        const switchRole = (role) => {
            this.activeRole = role;
            if (role === 'student') {
                studentBtn.classList.add('active');
                facultyBtn.classList.remove('active');
                document.getElementById('signup-email').placeholder = 'alex.student@college.edu';
            } else {
                facultyBtn.classList.add('active');
                studentBtn.classList.remove('active');
                document.getElementById('signup-email').placeholder = 'sarah.faculty@college.edu';
            }
        };
        
        studentBtn.addEventListener('click', () => switchRole('student'));
        facultyBtn.addEventListener('click', () => switchRole('faculty'));
        
        // Submission logic
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const full_name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const role = this.activeRole;
            
            const btn = form.querySelector('button[type="submit"]');
            const originalContent = btn.innerHTML;
            
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';
            
            try {
                await Api.post('/auth/signup', {
                    full_name,
                    email,
                    password,
                    role
                });
                
                Components.showToast("Registration successful! Please log in.", "success");
                window.location.hash = '/login';
            } catch (error) {
                Components.showToast(error.message, "error");
                btn.disabled = false;
                btn.innerHTML = originalContent;
            }
        });
    }
};

export const ForgotPasswordPage = {
    render() {
        return `
            <div class="auth-viewport-wrapper">
                <div class="auth-card glass-panel">
                    <div class="auth-header">
                        <a href="#/" class="auth-logo">
                            <i class="fa-solid fa-graduation-cap"></i>
                            <span>FluentlyAI</span>
                        </a>
                        <h2>Reset Password</h2>
                        <p>Provide your registered email to retrieve your key</p>
                    </div>
                    
                    <form id="forgot-form">
                        <div class="form-group">
                            <label class="form-label" for="forgot-email">Academic Email</label>
                            <input class="form-control" type="email" id="forgot-email" required placeholder="alex.student@college.edu">
                        </div>
                        
                        <button class="btn-primary" type="submit" style="width: 100%; margin-top: 10px;">
                            Request Reset Links <i class="fa-solid fa-paper-plane"></i>
                        </button>
                    </form>
                    
                    <div class="auth-footer-links">
                        Back to <a href="#/login">Sign In</a>
                    </div>
                </div>
            </div>
        `;
    },
    
    bindEvents() {
        const form = document.getElementById('forgot-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('forgot-email').value;
            
            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending Request...';
            
            try {
                const response = await Api.post('/auth/forgot-password', { email });
                Components.showToast(response.message, "success");
                
                // Return to login after brief timeout
                setTimeout(() => {
                    window.location.hash = '/login';
                }, 3000);
            } catch (error) {
                Components.showToast(error.message, "error");
                btn.disabled = false;
                btn.innerHTML = 'Request Reset Links <i class="fa-solid fa-paper-plane"></i>';
            }
        });
    }
};
