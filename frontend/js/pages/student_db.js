/**
 * STUDENT DASHBOARD PAGE
 */

import { Api } from '../api.js';
import { Auth } from '../auth.js';
import { Components } from '../components.js';

export const StudentDashboardPage = {
    isRecording: false,

    async render() {
        const user = Auth.getUser();
        if (!user) return '<div class="app-skeleton-loader"></div>';
        
        // Return Layout Shell containing Sidebar, TopNav, and Student Grid
        return `
            <div class="page-container">
                <!-- Sidebar Nav Component -->
                ${Components.renderSidebar('/dashboard')}
                
                <main class="main-view-viewport">
                    <!-- Top header nav -->
                    ${Components.renderTopNav(`Hi, ${user.full_name.split(' ')[0]} 👋`, 'Welcome to your language dashboard')}
                    
                    <div id="student-db-content">
                        <!-- Loading skeleton, replaced on async fetch -->
                        ${Components.renderSkeletonLoader()}
                    </div>
                </main>
            </div>
        `;
    },

    async bindEvents() {
        // Connect global layout actions (Sidebar logout, etc.)
        Components.bindGlobalEvents();
        
        const container = document.getElementById('student-db-content');
        if (!container) return;
        
        try {
            // Fetch student profile details from API
            const response = await Api.get('/student/profile');
            const data = response.data;
            
            // Cache full details locally
            Auth.updateUser(data);
            
            // Render the dashboard with database values
            container.innerHTML = this.buildDashboardHTML(data);
            
            // Bind Speech Practice Interactive simulator
            this.bindPracticeSimEvents();
        } catch (error) {
            Components.showToast(`Failed to pull statistics: ${error.message}`, "error");
            container.innerHTML = `
                <div class="glass-panel" style="padding:40px; text-align:center;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:2.5rem; color:var(--accent-purple); margin-bottom:15px;"></i>
                    <h3>Cannot Load Data</h3>
                    <p style="margin-top:10px;">${error.message}</p>
                    <button class="btn-primary" onclick="window.location.reload()" style="margin-top:20px;">Retry Connect</button>
                </div>
            `;
        }
    },

    buildDashboardHTML(data) {
        const details = data.student_details || {};
        
        // Map recommendation details based on level
        const levelData = {
            beginner: {
                title: 'Beginner (A1/A2)',
                desc: 'Focus on building primary vocabulary, forming simple daily greetings, and mastering basic verb tenses.',
                next: 'Intermediate level target: 15 speaking hours',
                action: 'Start Vocab Builder'
            },
            intermediate: {
                title: 'Intermediate (B1/B2)',
                desc: 'Focus on speech pacing, sentence variety, linking words, and expressing complex opinions naturally.',
                next: 'Advanced level target: 30 speaking hours',
                action: 'Practice Sentence Connectors'
            },
            advanced: {
                title: 'Advanced (C1/C2)',
                desc: 'Focus on native idioms, speech tone modeling, public debate delivery, and elimination of minor filler phrases.',
                next: 'Mastery target: Pitch proposal evaluations',
                action: 'Start Accent Training'
            }
        };
        
        const currentLevelInfo = levelData[details.english_level] || levelData.intermediate;
        
        // Progress SVG math: Radius = 50, Circumference = 2 * pi * r = 314
        const completionPct = details.speaking_confidence ? (details.speaking_confidence * 10) : 50;
        const strokeOffset = 314 - (314 * completionPct) / 100;
        
        return `
            <div class="student-grid">
                <!-- LEFT COLUMN: Main metrics & Practice -->
                <div>
                    <!-- Welcome Hero Card -->
                    <div class="glass-panel welcome-panel" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%); border-color: rgba(99, 102, 241, 0.25);">
                        <div class="welcome-panel-content">
                            <h2>Supercharge Your Speech</h2>
                            <p>You have completed your enrollment in <strong>${details.college_name}</strong>. Start practice modules matching your goal: <em>${details.learning_goal}</em>.</p>
                            <button class="btn-primary" id="btn-quick-practice">${currentLevelInfo.action} <i class="fa-solid fa-wand-magic-sparkles"></i></button>
                        </div>
                    </div>
                    
                    <!-- Metrics Mini Row -->
                    <div class="student-metrics-cards">
                        <div class="glass-panel metric-mini-card">
                            <i class="fa-solid fa-graduation-cap"></i>
                            <h3>College Branch</h3>
                            <div class="val">${details.department}</div>
                        </div>
                        <div class="glass-panel metric-mini-card">
                            <i class="fa-solid fa-id-badge"></i>
                            <h3>Academic Roll</h3>
                            <div class="val" style="font-size: 1.25rem; font-weight:700; margin-top:5px;">${details.roll_number} (Sec ${details.section})</div>
                        </div>
                    </div>
                    
                    <!-- Wide Level Card -->
                    <div class="glass-panel level-card-wide">
                        <div class="level-card-header">
                            <h3>Curated Syllabus Target</h3>
                            <span class="level-badge">${details.english_level}</span>
                        </div>
                        <div class="level-card-body">
                            <h4 style="font-size: 1.1rem; margin-bottom: 5px; color: var(--accent-indigo);">${currentLevelInfo.title}</h4>
                            <p>${currentLevelInfo.desc}</p>
                            <div style="margin-top: 15px; font-size: 0.8rem; color: var(--text-dim); font-weight: 600;">
                                <i class="fa-solid fa-circle-nodes"></i> ${currentLevelInfo.next}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Simulated Speech practice widget -->
                    <div class="glass-panel practice-speech-box">
                        <div style="text-align: center; margin-bottom: 15px;">
                            <span class="section-tag">Speech Lab Simulator</span>
                            <h3>Simulated AI Speaking Practice</h3>
                            <p style="font-size: 0.88rem; max-width: 440px; margin: 4px auto 0 auto;">Click the microphone and read this prompt: <strong>"Artificial intelligence is redefining modern educational frameworks."</strong></p>
                        </div>
                        
                        <div class="mic-circle-outer" id="mic-trigger-btn">
                            <div class="mic-circle-inner">
                                <i class="fa-solid fa-microphone" id="mic-icon-sym"></i>
                            </div>
                        </div>
                        
                        <div style="text-align: center; height: 35px;">
                            <span id="practice-status-lbl" style="font-size: 0.88rem; color: var(--text-muted); font-weight: 500;">Ready to record</span>
                        </div>
                    </div>
                </div>
                
                <!-- RIGHT COLUMN: Sidebars, Goals & History -->
                <div>
                    <!-- Circle SVG Completeness Loader -->
                    <div class="glass-panel progress-ring-container">
                        <h3>Speaking Index</h3>
                        <p style="font-size: 0.78rem; text-align: center; margin-bottom: 20px;">Curve represents confidence calibration</p>
                        
                        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
                            <svg class="progress-circle-svg" width="120" height="120">
                                <defs>
                                    <linearGradient id="indigo-purple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stop-color="var(--accent-indigo)"/>
                                        <stop offset="100%" stop-color="var(--accent-purple)"/>
                                    </linearGradient>
                                </defs>
                                <circle class="progress-circle-bg" cx="60" cy="60" r="50" stroke-width="8"></circle>
                                <circle class="progress-circle-bar" cx="60" cy="60" r="50" stroke-width="8" 
                                    stroke-dasharray="314" stroke-dashoffset="${strokeOffset}"></circle>
                            </svg>
                            <div class="progress-circle-label-box">
                                <span class="progress-circle-pct">${details.speaking_confidence}/10</span>
                                <span class="progress-circle-lbl">Confidence</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Selected Tags Card -->
                    <div class="glass-panel" style="padding: 24px; margin-bottom: 30px;">
                        <h4 style="margin-bottom: 12px;">Interests & Hobbies</h4>
                        <div class="chip-grid">
                            ${details.interests.map(item => `<span class="chip-label" style="background:var(--accent-indigo-glow); border-color:var(--accent-indigo); cursor:default; padding: 4px 12px; font-size:0.75rem;">${item}</span>`).join('')}
                            ${details.hobbies.map(item => `<span class="chip-label" style="cursor:default; padding: 4px 12px; font-size:0.75rem;">${item}</span>`).join('')}
                        </div>
                    </div>
                    
                    <!-- Recent Activity timeline -->
                    <div class="glass-panel recent-activity-panel">
                        <h3>Activity Feed</h3>
                        <div class="timeline-list">
                            <div class="timeline-item">
                                <div class="timeline-icon"><i class="fa-solid fa-microphone-lines"></i></div>
                                <div class="timeline-details">
                                    <h4>Speech Assessment</h4>
                                    <p>Read pronunciation test #12 (Accuracy: 94%)</p>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-icon"><i class="fa-solid fa-circle-check"></i></div>
                                <div class="timeline-details">
                                    <h4>Profile Verified</h4>
                                    <p>Academic onboarding synchronized with server</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    bindPracticeSimEvents() {
        const micOuter = document.getElementById('mic-trigger-btn');
        const micIcon = document.getElementById('mic-icon-sym');
        const statusLabel = document.getElementById('practice-status-lbl');
        const quickBtn = document.getElementById('btn-quick-practice');
        
        if (quickBtn) {
            quickBtn.addEventListener('click', () => {
                Components.showToast("Quick Practice course selected! Ready to record below.", "info");
            });
        }
        
        if (!micOuter) return;
        
        micOuter.addEventListener('click', () => {
            if (this.isRecording) {
                // Stop Recording (Success evaluation simulation)
                this.isRecording = false;
                micOuter.classList.remove('recording');
                micIcon.className = 'fa-solid fa-spinner fa-spin';
                statusLabel.textContent = 'Analyzing voice markers...';
                
                setTimeout(() => {
                    micIcon.className = 'fa-solid fa-microphone';
                    statusLabel.textContent = 'Voice Evaluated: 92% Pronunciation Score!';
                    statusLabel.style.color = 'var(--accent-emerald)';
                    Components.showToast("Practice speech analyzed! Excellent pacing.", "success");
                    
                    // Reset status text color after time
                    setTimeout(() => {
                        statusLabel.textContent = 'Ready to record';
                        statusLabel.style.color = 'var(--text-muted)';
                    }, 4000);
                }, 1500);
            } else {
                // Start Recording
                this.isRecording = true;
                micOuter.classList.add('recording');
                micIcon.className = 'fa-solid fa-waveform fa-beat'; // waveform pulse
                statusLabel.textContent = 'Listening... Read the prompt aloud.';
                statusLabel.style.color = 'var(--accent-purple)';
            }
        });
    }
};
