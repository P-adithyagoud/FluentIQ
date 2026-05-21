/**
 * ONBOARDING SYSTEM (STUDENT MULTI-STEP WIZARD / FACULTY ACADEMIC FORM)
 */

import { Api } from '../api.js';
import { Auth } from '../auth.js';
import { Components } from '../components.js';

export const OnboardingPage = {
    currentStep: 1,
    formData: {
        college_name: '',
        department: '',
        section: '',
        roll_number: '',
        interests: [],
        hobbies: [],
        english_level: '',
        speaking_confidence: 5,
        learning_goal: '',
        // Faculty fields
        designation: ''
    },

    render() {
        const user = Auth.getUser();
        if (!user) return '<div class="app-skeleton-loader"></div>';
        
        const isStudent = user.role === 'student';
        this.currentStep = 1; // Reset step count
        
        return `
            <div class="onboarding-viewport-wrapper">
                <div class="onboarding-wizard-container glass-panel">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <span class="section-tag">${user.role} Academic Setup</span>
                        <h1 style="font-size: 1.8rem; margin-top: 5px;">Configure your account</h1>
                        <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 4px;">Welcome ${user.full_name}, let's set up your profile.</p>
                    </div>
                    
                    ${isStudent ? this.renderStudentWizard() : this.renderFacultyForm()}
                </div>
            </div>
        `;
    },

    renderStudentWizard() {
        return `
            <!-- Step Indicator Progressbar -->
            <div class="step-progressbar">
                <div class="step-dot active" data-step="1">1</div>
                <div class="step-dot" data-step="2">2</div>
                <div class="step-dot" data-step="3">3</div>
                <div class="step-dot" data-step="4">4</div>
            </div>
            
            <!-- STEP 1: Academic details -->
            <div class="wizard-step-content active" id="step-content-1">
                <h2>Academic Credentials</h2>
                <p>Provide your enrollment details to synchronize with your college board.</p>
                
                <div class="form-group">
                    <label class="form-label">College Name</label>
                    <input class="form-control" type="text" id="ob-college" required placeholder="State Institute of Engineering" value="${this.formData.college_name}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Department / Branch</label>
                    <input class="form-control" type="text" id="ob-dept" required placeholder="Computer Science" value="${this.formData.department}">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label class="form-label">Section</label>
                        <input class="form-control" type="text" id="ob-section" required placeholder="A" value="${this.formData.section}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Roll Number</label>
                        <input class="form-control" type="text" id="ob-roll" required placeholder="CS-2024-042" value="${this.formData.roll_number}">
                    </div>
                </div>
            </div>
            
            <!-- STEP 2: Interests & Hobbies -->
            <div class="wizard-step-content" id="step-content-2">
                <h2>Interests & Hobbies</h2>
                <p>Select your areas of focus so our speech engines can generate tailored practice cues.</p>
                
                <div class="form-group" style="margin-bottom: 24px;">
                    <label class="form-label" style="margin-bottom: 10px;">Select Interests (Pick all that apply)</label>
                    <div class="chip-grid">
                        ${['AI', 'Coding', 'Gaming', 'Public Speaking', 'Reading', 'Movies', 'Entrepreneurship', 'Technology'].map(item => `
                            <input class="chip-checkbox" type="checkbox" id="int-${item}" value="${item}" ${this.formData.interests.includes(item) ? 'checked' : ''}>
                            <label class="chip-label" for="int-${item}">${item}</label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label" style="margin-bottom: 10px;">Select Hobbies</label>
                    <div class="chip-grid">
                        ${['Cricket', 'Music', 'Writing', 'Photography', 'Chess', 'Drawing', 'Traveling'].map(item => `
                            <input class="chip-checkbox" type="checkbox" id="hob-${item}" value="${item}" ${this.formData.hobbies.includes(item) ? 'checked' : ''}>
                            <label class="chip-label" for="hob-${item}">${item}</label>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <!-- STEP 3: Assessment details -->
            <div class="wizard-step-content" id="step-content-3">
                <h2>English Assessment</h2>
                <p>Provide your current level estimates so we can adjust our vocab lists.</p>
                
                <div class="form-group" style="margin-bottom: 24px;">
                    <label class="form-label" style="margin-bottom: 8px;">Assess Your English Level</label>
                    <div class="level-select-grid">
                        <div class="level-option-card glass-panel ${this.formData.english_level === 'beginner' ? 'selected' : ''}" data-lvl="beginner">
                            <div class="level-option-title">Beginner</div>
                            <div class="level-option-desc">I can understand basic greetings and write simple short sentences.</div>
                        </div>
                        <div class="level-option-card glass-panel ${this.formData.english_level === 'intermediate' ? 'selected' : ''}" data-lvl="intermediate">
                            <div class="level-option-title">Intermediate</div>
                            <div class="level-option-desc">I can converse on daily topics but feel stuck when speaking at length.</div>
                        </div>
                        <div class="level-option-card glass-panel ${this.formData.english_level === 'advanced' ? 'selected' : ''}" data-lvl="advanced">
                            <div class="level-option-title">Advanced</div>
                            <div class="level-option-desc">I speak fluently on technical topics and read complex textbooks easily.</div>
                        </div>
                    </div>
                </div>
                
                <!-- Confidence Range Slider -->
                <div class="slider-container">
                    <label class="form-label">Estimate Your Speaking Confidence</label>
                    <input class="confidence-slider" type="range" id="ob-slider" min="1" max="10" value="${this.formData.speaking_confidence}">
                    <div class="slider-val-box">
                        <span>Anxious (1)</span>
                        <span class="slider-bubble" id="ob-slider-lbl">${this.formData.speaking_confidence}/10</span>
                        <span>Fearless (10)</span>
                    </div>
                </div>
                
                <div class="form-group" style="margin-top: 20px;">
                    <label class="form-label" for="ob-goal">Primary Learning Goal</label>
                    <select class="form-control" id="ob-goal" required>
                        <option value="" disabled ${!this.formData.learning_goal ? 'selected' : ''}>Choose a specific goal...</option>
                        ${[
                            'Improve Speaking',
                            'Crack Interviews',
                            'Improve Vocabulary',
                            'Public Speaking',
                            'Communication Skills',
                            'Group Discussions'
                        ].map(goal => `
                            <option value="${goal}" ${this.formData.learning_goal === goal ? 'selected' : ''}>${goal}</option>
                        `).join('')}
                    </select>
                </div>
            </div>
            
            <!-- STEP 4: Review Summary Details -->
            <div class="wizard-step-content" id="step-content-4">
                <h2>Review details</h2>
                <p>Confirm the credentials below are correct before submitting to your student card.</p>
                
                <div class="review-summary-panel">
                    <div class="review-item">
                        <span class="review-label">College</span>
                        <span class="review-value" id="rv-college">-</span>
                    </div>
                    <div class="review-item">
                        <span class="review-label">Department</span>
                        <span class="review-value" id="rv-dept">-</span>
                    </div>
                    <div class="review-item">
                        <span class="review-label">Roll & Section</span>
                        <span class="review-value" id="rv-roll">-</span>
                    </div>
                    <div class="review-item">
                        <span class="review-label">Confidence</span>
                        <span class="review-value" id="rv-confidence">-</span>
                    </div>
                    <div class="review-item">
                        <span class="review-label">Assessment Level</span>
                        <span class="review-value" id="rv-level">-</span>
                    </div>
                    <div class="review-item">
                        <span class="review-label">Learning Goal</span>
                        <span class="review-value" id="rv-goal">-</span>
                    </div>
                    <div class="review-item" style="flex-direction: column; align-items: flex-start; gap: 6px; border-bottom:none;">
                        <span class="review-label">Interests & Hobbies</span>
                        <span class="review-value" id="rv-tags" style="text-align: left; font-size: 0.82rem; color: var(--text-muted); font-weight: 500;">-</span>
                    </div>
                </div>
            </div>
            
            <!-- Step Navigation Buttons -->
            <div class="wizard-buttons">
                <button class="btn-secondary" type="button" id="btn-wizard-prev" style="visibility: hidden;">
                    <i class="fa-solid fa-arrow-left"></i> Previous
                </button>
                <button class="btn-primary" type="button" id="btn-wizard-next">
                    Next Step <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `;
    },

    renderFacultyForm() {
        return `
            <form id="faculty-ob-form" style="text-align: left;">
                <p style="margin-bottom: 24px; font-size: 0.9rem; color: var(--text-muted);">Configure your administrative credentials to activate your class overview dashboard.</p>
                
                <div class="form-group">
                    <label class="form-label">College Name</label>
                    <input class="form-control" type="text" id="fac-college" required placeholder="State Institute of Engineering">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Department / Branch</label>
                    <input class="form-control" type="text" id="fac-dept" required placeholder="English and Humanities">
                </div>
                
                <div class="form-group" style="margin-bottom: 30px;">
                    <label class="form-label">Academic Designation</label>
                    <input class="form-control" type="text" id="fac-designation" required placeholder="Professor & Head / Instructor">
                </div>
                
                <button class="btn-primary" type="submit" style="width: 100%;">
                    Activate Dashboard <i class="fa-solid fa-circle-check"></i>
                </button>
            </form>
        `;
    },

    bindEvents() {
        const user = Auth.getUser();
        if (!user) return;
        
        if (user.role === 'student') {
            this.bindStudentEvents();
        } else {
            this.bindFacultyEvents();
        }
    },

    bindStudentEvents() {
        const btnPrev = document.getElementById('btn-wizard-prev');
        const btnNext = document.getElementById('btn-wizard-next');
        const slider = document.getElementById('ob-slider');
        const sliderLabel = document.getElementById('ob-slider-lbl');
        
        // Confidence slider label update
        if (slider) {
            slider.addEventListener('input', (e) => {
                this.formData.speaking_confidence = e.target.value;
                sliderLabel.textContent = `${e.target.value}/10`;
            });
        }
        
        // Custom select for level option cards
        const levelCards = document.querySelectorAll('.level-option-card');
        levelCards.forEach(card => {
            card.addEventListener('click', () => {
                levelCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.formData.english_level = card.getAttribute('data-lvl');
            });
        });
        
        // Navigation controller
        const updateStepView = () => {
            // Manage Previous Button Visibility
            if (this.currentStep === 1) {
                btnPrev.style.visibility = 'hidden';
            } else {
                btnPrev.style.visibility = 'visible';
            }
            
            // Manage Next Button Label
            if (this.currentStep === 4) {
                btnNext.innerHTML = 'Complete Setup <i class="fa-solid fa-circle-check"></i>';
            } else {
                btnNext.innerHTML = 'Next Step <i class="fa-solid fa-arrow-right"></i>';
            }
            
            // Highlight Progress Dot
            document.querySelectorAll('.step-dot').forEach((dot, index) => {
                const step = index + 1;
                dot.className = 'step-dot';
                if (step === this.currentStep) {
                    dot.classList.add('active');
                } else if (step < this.currentStep) {
                    dot.classList.add('completed');
                }
            });
            
            // Switch Visible Step View
            document.querySelectorAll('.wizard-step-content').forEach(view => {
                view.classList.remove('active');
            });
            document.getElementById(`step-content-${this.currentStep}`).classList.add('active');
            
            // Load review summaries on step 4
            if (this.currentStep === 4) {
                this.populateReviewDetails();
            }
        };
        
        // Forward click controller with validation checks
        btnNext.addEventListener('click', async () => {
            if (this.currentStep === 1) {
                // Collect basic details
                this.formData.college_name = document.getElementById('ob-college').value;
                this.formData.department = document.getElementById('ob-dept').value;
                this.formData.section = document.getElementById('ob-section').value;
                this.formData.roll_number = document.getElementById('ob-roll').value;
                
                if (!this.formData.college_name || !this.formData.department || !this.formData.section || !this.formData.roll_number) {
                    Components.showToast("Please fill in all academic details", "warning");
                    return;
                }
            } else if (this.currentStep === 2) {
                // Collect chip lists
                const selectedInterests = Array.from(document.querySelectorAll('.chip-checkbox[id^="int-"]:checked')).map(el => el.value);
                const selectedHobbies = Array.from(document.querySelectorAll('.chip-checkbox[id^="hob-"]:checked')).map(el => el.value);
                
                this.formData.interests = selectedInterests;
                this.formData.hobbies = selectedHobbies;
            } else if (this.currentStep === 3) {
                // Collect levels & goal
                this.formData.learning_goal = document.getElementById('ob-goal').value;
                
                if (!this.formData.english_level) {
                    Components.showToast("Please select your English level assessment", "warning");
                    return;
                }
                
                if (!this.formData.learning_goal) {
                    Components.showToast("Please choose a primary learning goal", "warning");
                    return;
                }
            } else if (this.currentStep === 4) {
                // Final submit call
                btnNext.disabled = true;
                btnNext.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
                
                try {
                    await Api.post('/student/onboarding', this.formData);
                    
                    // Update session profile flag
                    Auth.updateUser({ onboarding_completed: true });
                    Components.showToast("Onboarding completed successfully!", "success");
                    
                    // Transition to Student dashboard
                    window.location.hash = '/dashboard';
                } catch (error) {
                    Components.showToast(error.message, "error");
                    btnNext.disabled = false;
                    btnNext.innerHTML = 'Complete Setup <i class="fa-solid fa-circle-check"></i>';
                }
                return;
            }
            
            this.currentStep++;
            updateStepView();
        });
        
        // Backward click controller
        btnPrev.addEventListener('click', () => {
            if (this.currentStep > 1) {
                this.currentStep--;
                updateStepView();
            }
        });
    },

    bindFacultyEvents() {
        const form = document.getElementById('faculty-ob-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const college_name = document.getElementById('fac-college').value;
            const department = document.getElementById('fac-dept').value;
            const designation = document.getElementById('fac-designation').value;
            
            const btnSubmit = form.querySelector('button[type="submit"]');
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Activating...';
            
            try {
                await Api.post('/faculty/onboarding', {
                    college_name,
                    department,
                    designation
                });
                
                Auth.updateUser({ onboarding_completed: true });
                Components.showToast("Administrative profile active!", "success");
                
                window.location.hash = '/dashboard';
            } catch (error) {
                Components.showToast(error.message, "error");
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = 'Activate Dashboard <i class="fa-solid fa-circle-check"></i>';
            }
        });
    },

    populateReviewDetails() {
        document.getElementById('rv-college').textContent = this.formData.college_name;
        document.getElementById('rv-dept').textContent = this.formData.department;
        document.getElementById('rv-roll').textContent = `${this.formData.roll_number} (Sec ${this.formData.section.toUpperCase()})`;
        document.getElementById('rv-confidence').textContent = `${this.formData.speaking_confidence}/10`;
        document.getElementById('rv-level').textContent = this.formData.english_level.toUpperCase();
        document.getElementById('rv-goal').textContent = this.formData.learning_goal;
        
        const tags = [...this.formData.interests, ...this.formData.hobbies];
        document.getElementById('rv-tags').textContent = tags.length > 0 ? tags.join(', ') : 'None selected';
    }
};
