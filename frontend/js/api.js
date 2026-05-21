/**
 * API SERVICE WRAPPER
 * Interacts with the Flask Backend REST API (running on http://localhost:5000)
 */

import { Auth } from './auth.js';

const BASE_URL = `http://${window.location.hostname}:5000`;

class ApiService {
    /**
     * Executes HTTP requests with JWT headers pre-filled
     */
    async request(endpoint, options = {}) {
        const url = `${BASE_URL}${endpoint}`;
        
        // Setup headers
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };
        
        // Auto-inject JWT Bearer Token if available
        const token = Auth.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const config = {
            ...options,
            headers
        };
        
        try {
            const response = await fetch(url, config);
            const responseData = await response.json().catch(() => ({}));
            
            if (!response.ok) {
                // Intercept token expiry/revocation
                if (response.status === 401 && Auth.isAuthenticated()) {
                    console.warn("[API INTERCEPTOR] JWT Token expired or invalid. Clearing session.");
                    Auth.clearSession();
                    window.dispatchEvent(new CustomEvent('auth-expired'));
                }
                
                throw {
                    status: response.status,
                    message: responseData.message || 'An API error occurred',
                    errors: responseData.errors || null
                };
            }
            
            return responseData;
        } catch (error) {
            // Normalize non-HTTP/network exceptions
            if (!error.status) {
                throw {
                    status: 0,
                    message: 'Cannot connect to backend server. Verify the Flask API is running on port 5000.',
                    errors: null
                };
            }
            throw error;
        }
    }
    
    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }
    
    post(endpoint, body = {}, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body)
        });
    }
    
    put(endpoint, body = {}, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }
    
    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
}

export const Api = new ApiService();
