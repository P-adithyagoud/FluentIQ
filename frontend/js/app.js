/**
 * MAIN SPA ENTRY POINT & ROUTER CONTROLLER
 */

import { Auth } from './auth.js';
import { Components } from './components.js';

// Page imports
import { LandingPage } from './pages/landing.js';
import { LoginPage, SignupPage, ForgotPasswordPage } from './pages/auth_pages.js';
import { OnboardingPage } from './pages/onboarding.js';
import { StudentDashboardPage } from './pages/student_db.js';
import { FacultyDashboardPage } from './pages/faculty_db.js';

// Route Definition Registry
const ROUTES = {
    '/': { page: LandingPage, private: false },
    '/login': { page: LoginPage, private: false },
    '/signup': { page: SignupPage, private: false },
    '/forgot-password': { page: ForgotPasswordPage, private: false },
    '/onboarding': { page: OnboardingPage, private: true, onboarding: false },
    '/dashboard': { page: null, private: true, onboarding: true } // Dynamic role-based resolution
};

class AppController {
    constructor() {
        this.viewport = document.getElementById('app-viewport');
    }
    
    init() {
        // 1. Hook hashchange router listener
        window.addEventListener('hashchange', () => this.handleRouting());
        
        // 2. Hook initial load event listener
        window.addEventListener('DOMContentLoaded', () => this.handleRouting());
        
        // 3. Handle session expire event intercepts
        window.addEventListener('auth-expired', () => {
            Components.showToast("Your session has expired. Please log in again.", "warning");
            window.location.hash = '/login';
        });
        
        console.log("[FLUENTLY SPA] Single Page Application Bootstrapped successfully.");
    }
    
    async handleRouting() {
        // Extract route hash path (e.g. #/login -> /login, defaults to /)
        let hashPath = window.location.hash.slice(1) || '/';
        
        // Match base path ignoring dynamic url queries if any
        const pathOnly = hashPath.split('?')[0];
        const route = ROUTES[pathOnly];
        
        if (!route) {
            console.error(`[SPA ROUTER] Route not found: ${pathOnly}. Redirecting to landing.`);
            window.location.hash = '/';
            return;
        }
        
        const authenticated = Auth.isAuthenticated();
        const user = Auth.getUser();
        
        // ==========================================
        // ROUTE GUARD SECURITY CONTROLLERS
        // ==========================================
        
        // A. Guard: User tries to access private page offline
        if (route.private && !authenticated) {
            console.warn("[ROUTE GUARD] Private page accessed offline. Forcing log in.");
            Components.showToast("Please sign in to access this page", "info");
            window.location.hash = '/login';
            return;
        }
        
        // B. Guard: User is authenticated but hasn't completed onboarding
        if (authenticated && user && !user.onboarding_completed && pathOnly !== '/onboarding') {
            console.warn("[ROUTE GUARD] Onboarding incomplete. Redirecting to setup.");
            Components.showToast("Please complete academic onboarding to continue", "warning");
            window.location.hash = '/onboarding';
            return;
        }
        
        // C. Guard: User is authenticated + onboarded, and tries to visit login/signup
        if (authenticated && user && user.onboarding_completed && (pathOnly === '/login' || pathOnly === '/signup' || pathOnly === '/')) {
            console.log("[ROUTE GUARD] Active session detected. Bypassing log in.");
            window.location.hash = '/dashboard';
            return;
        }
        
        // D. Guard: Already onboarded user tries to re-access onboarding
        if (authenticated && user && user.onboarding_completed && pathOnly === '/onboarding') {
            console.log("[ROUTE GUARD] Onboarding already complete. Redirecting to dashboard.");
            window.location.hash = '/dashboard';
            return;
        }
        
        // ==========================================
        // RENDER PAGE VIEW
        // ==========================================
        let pageRenderer = route.page;
        
        // Dynamic dashboard resolution based on user role
        if (pathOnly === '/dashboard') {
            if (user.role === 'student') {
                pageRenderer = StudentDashboardPage;
            } else if (user.role === 'faculty') {
                pageRenderer = FacultyDashboardPage;
            } else {
                console.error("[SPA ROUTER] Unidentified role claims on profile. Resetting session.");
                Auth.logout();
                return;
            }
        }
        
        // Show page transition loader skeleton prior to render
        this.viewport.innerHTML = `
            <div style="padding: 40px; display:flex; justify-content:center; align-items:center; min-height:80vh; width:100%;">
                <div class="skeleton-circle" style="width:50px; height:50px;"></div>
            </div>
        `;
        
        try {
            // Render HTML content
            const renderedHtml = await pageRenderer.render();
            this.viewport.innerHTML = renderedHtml;
            
            // Bind page-specific DOM interactions & event listeners
            if (pageRenderer.bindEvents) {
                await pageRenderer.bindEvents();
            }
        } catch (error) {
            console.error("[SPA ROUTER] Render failure:", error);
            this.viewport.innerHTML = `
                <div class="glass-panel" style="max-width: 500px; margin: 80px auto; padding: 40px; text-align: center;">
                    <i class="fa-solid fa-bug" style="font-size:2.5rem; color:var(--accent-purple); margin-bottom:15px;"></i>
                    <h2>Viewport Rendering Exception</h2>
                    <p style="margin-top:10px; font-size:0.9rem; color:var(--text-muted);">${error.message || error}</p>
                    <a href="#/" class="btn-primary" style="margin-top:20px; display:inline-flex;">Return Home</a>
                </div>
            `;
        }
    }
}

// Initialise and bootstrap
const app = new AppController();
app.init();
export default app;
