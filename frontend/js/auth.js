/**
 * SESSION & AUTH STATE MANAGER
 */

export const Auth = {
    /**
     * Persists active session credentials
     */
    saveSession(token, user) {
        localStorage.setItem('fluently_jwt_token', token);
        localStorage.setItem('fluently_user_data', JSON.stringify(user));
    },

    /**
     * Clears local storage state
     */
    clearSession() {
        localStorage.removeItem('fluently_jwt_token');
        localStorage.removeItem('fluently_user_data');
    },

    /**
     * Retrieves token string
     */
    getToken() {
        return localStorage.getItem('fluently_jwt_token');
    },

    /**
     * Retrieves currently loaded user model
     */
    getUser() {
        const userStr = localStorage.getItem('fluently_user_data');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    },

    /**
     * Updates partial user fields (such as onboarding status)
     */
    updateUser(updates) {
        const currentUser = this.getUser();
        if (currentUser) {
            const updated = { ...currentUser, ...updates };
            localStorage.setItem('fluently_user_data', JSON.stringify(updated));
            return updated;
        }
        return null;
    },

    /**
     * Evaluates if active token is set
     */
    isAuthenticated() {
        return !!this.getToken();
    },

    /**
     * Clears state and fires redirect logic
     */
    logout() {
        this.clearSession();
        window.location.hash = '/login';
    }
};
