/**
 * FACULTY OVERVIEW DASHBOARD PAGE (ADMIN PANEL)
 */

import { Api } from '../api.js';
import { Auth } from '../auth.js';
import { Components } from '../components.js';

export const FacultyDashboardPage = {
    // In-memory filters state
    filters: {
        search: '',
        department: '',
        level: '',
        sort_by: 'newest'
    },

    async render() {
        const user = Auth.getUser();
        if (!user) return '<div class="app-skeleton-loader"></div>';
        
        return `
            <div class="page-container">
                <!-- Sidebar Nav component -->
                ${Components.renderSidebar('/dashboard')}
                
                <main class="main-view-viewport">
                    <!-- Top header nav -->
                    ${Components.renderTopNav(`Hello, ${user.full_name.split(' ')[0]} 🏛️`, 'Academic Administrator Overview')}
                    
                    <div id="faculty-db-content">
                        <!-- Loading skeleton -->
                        ${Components.renderSkeletonLoader()}
                    </div>
                </main>
            </div>
        `;
    },

    async bindEvents() {
        Components.bindGlobalEvents();
        
        const container = document.getElementById('faculty-db-content');
        if (!container) return;
        
        try {
            // Fetch analytics aggregates
            const analyticsResponse = await Api.get('/faculty/dashboard');
            const analytics = analyticsResponse.data;
            
            // Build the main frame structure
            container.innerHTML = this.buildDashboardFrameHTML(analytics);
            
            // Fetch and render the students table
            await this.fetchAndRenderStudentsTable();
            
            // Bind search, filter & sorting events
            this.bindFilterEvents();
        } catch (error) {
            Components.showToast(`Analytics load failed: ${error.message}`, "error");
            container.innerHTML = `
                <div class="glass-panel" style="padding:40px; text-align:center;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:2.5rem; color:var(--accent-purple); margin-bottom:15px;"></i>
                    <h3>Analytics Offline</h3>
                    <p style="margin-top:10px;">${error.message}</p>
                    <button class="btn-primary" onclick="window.location.reload()" style="margin-top:20px;">Retry Connect</button>
                </div>
            `;
        }
    },

    buildDashboardFrameHTML(analytics) {
        const stats = analytics || {};
        const faculty = stats.faculty_details || {};
        const profile = faculty.faculty_profile || {};
        
        // Calculate percentages for level distributions
        const total = stats.total_students || 0;
        const levels = stats.level_distribution || { beginner: 0, intermediate: 0, advanced: 0 };
        
        const begPct = total ? Math.round((levels.beginner / total) * 100) : 0;
        const intPct = total ? Math.round((levels.intermediate / total) * 100) : 0;
        const advPct = total ? Math.round((levels.advanced / total) * 100) : 0;
        
        return `
            <!-- Analytics Banner -->
            <div class="faculty-analytics-banner">
                <div class="glass-panel metric-mini-card glass-card-interactive">
                    <i class="fa-solid fa-users" style="color:var(--accent-indigo);"></i>
                    <h3>Total Registered Students</h3>
                    <div class="val" id="st-total">${total}</div>
                </div>
                <div class="glass-panel metric-mini-card glass-card-interactive">
                    <i class="fa-solid fa-microphone-lines" style="color:var(--accent-purple);"></i>
                    <h3>Confidence Index</h3>
                    <div class="val" id="st-confidence">${stats.average_confidence || 0.0}/10</div>
                </div>
                <div class="glass-panel metric-mini-card glass-card-interactive">
                    <i class="fa-solid fa-chart-line" style="color:var(--accent-emerald);"></i>
                    <h3>Primary Interests Focus</h3>
                    <div class="val" style="font-size:1.45rem; font-weight:800;" id="st-interest">${stats.top_interest || 'None'}</div>
                </div>
            </div>
            
            <!-- Table controls section -->
            <div class="glass-panel data-table-panel" style="margin-bottom: 40px;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-glass); padding-bottom:15px; margin-bottom:20px;">
                    <h3>Academic Enrollment Directory</h3>
                    <span style="font-size:0.8rem; color:var(--text-muted); font-weight:600;"><i class="fa-solid fa-graduation-cap"></i> ${profile.college_name || 'State University'} (${profile.department || 'English Dept'})</span>
                </div>
                
                <div class="table-controls-row">
                    <!-- Live Search Box -->
                    <div class="search-box-wrap">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <input class="form-control" type="text" id="student-search-input" placeholder="Search by name, email, roll..." value="${this.filters.search}">
                    </div>
                    
                    <!-- Filters Grid selection -->
                    <div class="filter-group-wrap">
                        <!-- Department Filter -->
                        <select class="filter-select" id="filter-dept">
                            <option value="">All Departments</option>
                            <option value="Computer Science" ${this.filters.department === 'Computer Science' ? 'selected' : ''}>Computer Science</option>
                            <option value="Electronics & Comm." ${this.filters.department === 'Electronics & Comm.' ? 'selected' : ''}>Electronics & Comm.</option>
                            <option value="Information Tech." ${this.filters.department === 'Information Tech.' ? 'selected' : ''}>Information Tech.</option>
                        </select>
                        
                        <!-- Level Filter -->
                        <select class="filter-select" id="filter-level">
                            <option value="">All Assessment Levels</option>
                            <option value="beginner" ${this.filters.level === 'beginner' ? 'selected' : ''}>Beginner</option>
                            <option value="intermediate" ${this.filters.level === 'intermediate' ? 'selected' : ''}>Intermediate</option>
                            <option value="advanced" ${this.filters.level === 'advanced' ? 'selected' : ''}>Advanced</option>
                        </select>
                        
                        <!-- Sort Filter -->
                        <select class="filter-select" id="filter-sort">
                            <option value="newest" ${this.filters.sort_by === 'newest' ? 'selected' : ''}>Newest Enrolled</option>
                            <option value="confidence_desc" ${this.filters.sort_by === 'confidence_desc' ? 'selected' : ''}>Highest Confidence</option>
                            <option value="confidence_asc" ${this.filters.sort_by === 'confidence_asc' ? 'selected' : ''}>Lowest Confidence</option>
                            <option value="name_asc" ${this.filters.sort_by === 'name_asc' ? 'selected' : ''}>Name A-Z</option>
                        </select>
                    </div>
                </div>
                
                <!-- Dynamic Students data table inject point -->
                <div id="students-table-mount" style="min-height: 250px;">
                    ${Components.renderSkeletonLoader()}
                </div>
            </div>
            
            <!-- Lower Section: Aggregates charts -->
            <div class="dept-graphs-grid">
                <!-- Level distribution panel -->
                <div class="glass-panel dept-analytics-card">
                    <h3>Assessment Demographics</h3>
                    <p style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">English proficiency split curve</p>
                    
                    <div class="dept-chart-list">
                        <div class="dept-chart-row">
                            <div class="dept-chart-lbls">
                                <span>Advanced Learners</span>
                                <span>${levels.advanced || 0} students (${advPct}%)</span>
                            </div>
                            <div class="dept-progress-outer">
                                <div class="dept-progress-inner" style="width:${advPct}%; background:var(--accent-indigo);"></div>
                            </div>
                        </div>
                        <div class="dept-chart-row">
                            <div class="dept-chart-lbls">
                                <span>Intermediate Learners</span>
                                <span>${levels.intermediate || 0} students (${intPct}%)</span>
                            </div>
                            <div class="dept-progress-outer">
                                <div class="dept-progress-inner" style="width:${intPct}%; background:var(--accent-purple);"></div>
                            </div>
                        </div>
                        <div class="dept-chart-row">
                            <div class="dept-chart-lbls">
                                <span>Beginner Learners</span>
                                <span>${levels.beginner || 0} students (${begPct}%)</span>
                            </div>
                            <div class="dept-progress-outer">
                                <div class="dept-progress-inner" style="width:${begPct}%; background:var(--accent-amber);"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Department Distribution progress -->
                <div class="glass-panel dept-analytics-card">
                    <h3>Enrollment Allocation Curve</h3>
                    <p style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">Students distribution across academic groups</p>
                    
                    <div class="dept-chart-list" id="dept-distribution-chart-mount">
                        ${Object.keys(stats.department_distribution || {}).length > 0 ? 
                            Object.entries(stats.department_distribution).map(([dept, count]) => {
                                const deptPct = total ? Math.round((count / total) * 100) : 0;
                                return `
                                    <div class="dept-chart-row">
                                        <div class="dept-chart-lbls">
                                            <span>${dept}</span>
                                            <span>${count} students (${deptPct}%)</span>
                                        </div>
                                        <div class="dept-progress-outer">
                                            <div class="dept-progress-inner" style="width:${deptPct}%; background:linear-gradient(90deg, var(--accent-indigo), var(--accent-purple));"></div>
                                        </div>
                                    </div>
                                `;
                            }).join('') : `
                                <div style="text-align:center; padding: 20px 0; color:var(--text-dim);">No department allocation data.</div>
                            `
                        }
                    </div>
                </div>
            </div>
        `;
    },

    async fetchAndRenderStudentsTable() {
        const mount = document.getElementById('students-table-mount');
        if (!mount) return;
        
        try {
            // Build query params
            const queryParams = new URLSearchParams();
            if (this.filters.search) queryParams.append('search', this.filters.search);
            if (this.filters.department) queryParams.append('department', this.filters.department);
            if (this.filters.level) queryParams.append('level', this.filters.level);
            if (this.filters.sort_by) queryParams.append('sort_by', this.filters.sort_by);
            
            const response = await Api.get(`/faculty/students?${queryParams.toString()}`);
            const students = response.data;
            
            if (students.length === 0) {
                mount.innerHTML = `
                    <div style="text-align:center; padding:50px 20px; color:var(--text-muted);">
                        <i class="fa-solid fa-folder-open" style="font-size:2.5rem; color:var(--text-dim); margin-bottom:15px;"></i>
                        <h4>No Students Found</h4>
                        <p style="font-size:0.85rem; margin-top:5px;">No students match the active search or filters criteria.</p>
                    </div>
                `;
                return;
            }
            
            mount.innerHTML = `
                <table class="student-data-table">
                    <thead>
                        <tr>
                            <th>Student Identity</th>
                            <th>Branch Details</th>
                            <th>Roll Number</th>
                            <th>Language Level</th>
                            <th>Speaking Confidence</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(student => {
                            const details = student.student_details || {};
                            const confidencePct = details.speaking_confidence ? (details.speaking_confidence * 10) : 50;
                            
                            return `
                                <tr>
                                    <td>
                                        <div class="student-row-identity">
                                            <img class="student-row-avatar" src="${student.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex'}" alt="Avatar">
                                            <div>
                                                <div style="font-weight:600; color:var(--text-white);">${student.full_name}</div>
                                                <div style="font-size:0.75rem; color:var(--text-dim);">${student.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style="font-weight:500;">${details.department}</div>
                                        <div style="font-size:0.75rem; color:var(--text-dim);">Section ${details.section}</div>
                                    </td>
                                    <td style="font-family:var(--font-secondary); font-weight:600; font-size:0.85rem; color:var(--text-muted);">${details.roll_number}</td>
                                    <td>
                                        <div class="student-tbl-badges">
                                            <span class="student-tbl-badge-level ${details.english_level}">${details.english_level}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="confidence-indicator-cell">
                                            <div class="confidence-bar-outer">
                                                <div class="confidence-bar-inner" style="width: ${confidencePct}%;"></div>
                                            </div>
                                            <span style="font-weight:700; font-size:0.82rem; color:var(--accent-indigo);">${details.speaking_confidence}/10</span>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        } catch (error) {
            mount.innerHTML = `
                <div style="text-align:center; padding:30px; color:var(--text-muted);">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:2rem; color:var(--accent-purple); margin-bottom:10px;"></i>
                    <h4>Failed to fetch student rows</h4>
                    <p style="font-size:0.85rem;">${error.message}</p>
                </div>
            `;
        }
    },

    bindFilterEvents() {
        const searchInput = document.getElementById('student-search-input');
        const deptSelect = document.getElementById('filter-dept');
        const levelSelect = document.getElementById('filter-level');
        const sortSelect = document.getElementById('filter-sort');
        
        let debounceTimer;
        
        // Key debounce listener for live search (waits 350ms before dispatching search to DB)
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(async () => {
                    await this.fetchAndRenderStudentsTable();
                }, 350);
            });
        }
        
        // Filter selectors bindings
        if (deptSelect) {
            deptSelect.addEventListener('change', async (e) => {
                this.filters.department = e.target.value;
                await this.fetchAndRenderStudentsTable();
            });
        }
        
        if (levelSelect) {
            levelSelect.addEventListener('change', async (e) => {
                this.filters.level = e.target.value;
                await this.fetchAndRenderStudentsTable();
            });
        }
        
        if (sortSelect) {
            sortSelect.addEventListener('change', async (e) => {
                this.filters.sort_by = e.target.value;
                await this.fetchAndRenderStudentsTable();
            });
        }
    }
};
