/**
 * REUSABLE VIEW COMPONENTS & DYNAMIC INTERACTIVE WIDGETS
 */

import { Auth } from './auth.js';

export const Components = {
    /**
     * Renders floating Toast Notification card
     * Types: 'success', 'error', 'warning', 'info'
     */
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        // Icon mapping
        const icons = {
            success: 'fa-circle-check',
            error: 'fa-circle-exclamation',
            warning: 'fa-triangle-exclamation',
            info: 'fa-circle-info'
        };
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} glass-panel`;
        
        toast.innerHTML = `
            <i class="fa-solid ${icons[type]} toast-icon"></i>
            <div class="toast-message">${message}</div>
            <button class="toast-close" type="button"><i class="fa-solid fa-xmark"></i></button>
        `;
        
        container.appendChild(toast);
        
        // Toast fade out trigger
        const removeToast = () => {
            toast.style.transform = 'translateX(120%)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        };
        
        // Auto remove
        const autoTimer = setTimeout(removeToast, 3500);
        
        // Manual close
        toast.querySelector('.toast-close').addEventListener('click', () => {
            clearTimeout(autoTimer);
            removeToast();
        });
    },

    /**
     * Renders modular adaptive Sidebar based on user role (Student vs Faculty)
     */
    renderSidebar(activePath = '') {
        const user = Auth.getUser();
        if (!user) return '';
        
        const isStudent = user.role === 'student';
        
        // Menu item setup based on role
        const menuItems = isStudent ? [
            { path: '/dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
            { path: '/profile', label: 'My Profile', icon: 'fa-user' }
        ] : [
            { path: '/dashboard', label: 'Overview', icon: 'fa-chart-pie' },
            { path: '/students', label: 'Students Directory', icon: 'fa-users' }
        ];
        
        const sidebarHTML = `
            <aside class="app-sidebar">
                <div class="sidebar-logo">
                    <i class="fa-solid fa-graduation-cap"></i>
                    <span>FluentlyAI</span>
                </div>
                
                <ul class="sidebar-menu">
                    ${menuItems.map(item => `
                        <li class="sidebar-item ${activePath === item.path ? 'active' : ''}">
                            <a href="#${item.path}">
                                <i class="fa-solid ${item.icon}"></i>
                                <span>${item.label}</span>
                            </a>
                        </li>
                    `).join('')}
                </ul>
                
                <div class="sidebar-footer">
                    <img class="user-avatar" src="${user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}" alt="Avatar">
                    <div class="user-info">
                        <div class="user-name">${user.full_name}</div>
                        <div class="user-role-lbl">${user.role}</div>
                    </div>
                    <button class="btn-logout-icon" id="btn-sidebar-logout" title="Log Out">
                        <i class="fa-solid fa-arrow-right-from-bracket"></i>
                    </button>
                </div>
            </aside>
        `;
        
        return sidebarHTML;
    },

    /**
     * Renders modular Page Top Navigation Header
     */
    renderTopNav(title, subtitle = '') {
        return `
            <header class="app-top-nav">
                <div class="page-title-box">
                    <h1>${title}</h1>
                    ${subtitle ? `<p>${subtitle}</p>` : ''}
                </div>
                
                <div class="nav-actions">
                    <button class="btn-notification" type="button" title="View alerts">
                        <i class="fa-regular fa-bell"></i>
                    </button>
                </div>
            </header>
        `;
    },

    /**
     * Renders loading skeletons inside data containers
     */
    renderSkeletonLoader() {
        return `
            <div class="glass-panel" style="padding: 30px; display: flex; flex-direction: column; gap: 15px; width: 100%;">
                <div class="skeleton-line skeleton-title" style="width: 40%"></div>
                <div class="skeleton-line" style="width: 100%"></div>
                <div class="skeleton-line" style="width: 85%"></div>
                <div class="skeleton-line" style="width: 95%"></div>
            </div>
        `;
    },

    /**
     * Connects events on global elements (like the sidebar logout)
     */
    bindGlobalEvents() {
        const logoutBtn = document.getElementById('btn-sidebar-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                Auth.logout();
                this.showToast("Logged out successfully", "success");
            });
        }
    }
};
