/**
 * LANDING PRESENTATION VIEW PAGE
 */

export const LandingPage = {
    render() {
        return `
            <div class="landing-shell">
                <!-- Navigation Header -->
                <nav class="landing-nav">
                    <div class="landing-logo">
                        <i class="fa-solid fa-graduation-cap"></i>
                        <span>FluentlyAI</span>
                    </div>
                    <div>
                        <a href="#/login" class="btn-secondary" style="padding: 8px 20px; font-size: 0.9rem; margin-right: 12px;">Log In</a>
                        <a href="#/signup" class="btn-primary" style="padding: 8px 20px; font-size: 0.9rem;">Sign Up</a>
                    </div>
                </nav>
                
                <!-- Hero Section -->
                <section class="landing-hero">
                    <div class="hero-left">
                        <span class="section-tag">Next-Gen Language Education</span>
                        <h1>Speak English with <span>Confidence</span> Powered by AI.</h1>
                        <p>An enterprise-grade English learning ecosystem tailored for universities. FluentlyAI provides real-time speech assessments, academic onboarding wizards, and department-level tracking tools for faculty.</p>
                        <div class="hero-btns">
                            <a href="#/signup" class="btn-primary">Get Started Now <i class="fa-solid fa-arrow-right"></i></a>
                            <a href="#/login" class="btn-secondary">Platform Demo</a>
                        </div>
                    </div>
                    
                    <div class="hero-right">
                        <!-- Glassmorphic Mock Interface Preview -->
                        <div class="hero-right-glass glass-panel">
                            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--border-glass); padding-bottom: 15px;">
                                <div style="display:flex; align-items:center; gap: 8px;">
                                    <div style="width: 10px; height: 10px; border-radius: 50%; background: #ff5f56;"></div>
                                    <div style="width: 10px; height: 10px; border-radius: 50%; background: #ffbd2e;"></div>
                                    <div style="width: 10px; height: 10px; border-radius: 50%; background: #27c93f;"></div>
                                </div>
                                <span style="font-size: 0.75rem; color: var(--text-dim); font-family: var(--font-secondary);">fluently-sandbox-preview.app</span>
                            </div>
                            
                            <div class="demo-feature-card active">
                                <i class="fa-solid fa-microphone-lines"></i>
                                <div style="text-align: left;">
                                    <h4 style="font-size: 0.95rem; margin-bottom: 2px;">AI Speech Pronunciation</h4>
                                    <p style="font-size: 0.78rem; line-height: 1.3;">Speaks phoneme strings, validates vocabulary and confidence.</p>
                                </div>
                            </div>
                            
                            <div class="demo-feature-card">
                                <i class="fa-solid fa-wand-magic-sparkles"></i>
                                <div style="text-align: left;">
                                    <h4 style="font-size: 0.95rem; margin-bottom: 2px;">Smart Leveling Wizard</h4>
                                    <p style="font-size: 0.78rem; line-height: 1.3;">Curates beginner, intermediate or advanced practice tracks.</p>
                                </div>
                            </div>
                            
                            <div class="demo-feature-card">
                                <i class="fa-solid fa-chart-line"></i>
                                <div style="text-align: left;">
                                    <h4 style="font-size: 0.95rem; margin-bottom: 2px;">Faculty Tracking Panel</h4>
                                    <p style="font-size: 0.78rem; line-height: 1.3;">Monitors roll metrics and confidence indices per section.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                <!-- Information Grid -->
                <section class="landing-features-section">
                    <span class="section-tag">Powerful Ecosystem Capabilities</span>
                    <h2>A Tailored Platform Designed for Excellence</h2>
                    
                    <div class="features-grid">
                        <div class="feature-box glass-panel">
                            <div class="feature-icon-box">
                                <i class="fa-solid fa-chart-simple"></i>
                            </div>
                            <h3>Comprehensive Analytics</h3>
                            <p style="font-size: 0.88rem; line-height: 1.5;">Faculty can access visual indices of confidence curves, departmental alignments, and enrollments at a glance.</p>
                        </div>
                        
                        <div class="feature-box glass-panel">
                            <div class="feature-icon-box">
                                <i class="fa-solid fa-shield-halved"></i>
                            </div>
                            <h3>Role-Based Security</h3>
                            <p style="font-size: 0.88rem; line-height: 1.5;">Secure state handling with JWT sessions and database PostgreSQL Row Level Security (RLS) constraints.</p>
                        </div>
                        
                        <div class="feature-box glass-panel">
                            <div class="feature-icon-box">
                                <i class="fa-solid fa-circle-nodes"></i>
                            </div>
                            <h3>Future AI Integrations</h3>
                            <p style="font-size: 0.88rem; line-height: 1.5;">Architected with modular service structures ready for direct connection to LLMs and Speech-to-Text pipelines.</p>
                        </div>
                    </div>
                </section>
                
                <footer style="margin-top: 80px; padding: 30px 0; border-top: 1px solid var(--border-glass); text-align: center; font-size: 0.85rem; color: var(--text-dim);">
                    <p>&copy; 2026 FluentlyAI. Built for next-generation speech training. All rights reserved.</p>
                </footer>
            </div>
        `;
    },
    
    bindEvents() {
        // Nothing special to bind for landing; routing links handle movement
    }
};
