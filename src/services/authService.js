// frontend/src/services/authService.js
import api from './api';

class AuthService {
    async login(credentials) {
        try {
            console.log('📤 AuthService.login - Envoi:', credentials);
            
            // S'assurer que credentials est un objet simple
            const payload = {
                email: credentials.email || credentials,
                password: credentials.password
            };
            
            console.log('📦 Payload final:', payload);
            
            const response = await api.post('/auth/login', payload);
            
            console.log('📥 Réponse reçue:', response.data);
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            
            return response.data;
        } catch (error) {
            console.error('❌ Erreur login service:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                data: error.config?.data
            });
            throw error;
        }
    }

    async register(userData) {
        try {
            const response = await api.post('/auth/register', userData);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            console.error('❌ Erreur register:', error);
            throw error;
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    getCurrentUser() {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('❌ Erreur parsing user:', error);
            return null;
        }
    }

    getToken() {
        return localStorage.getItem('token');
    }

    isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    isAdmin() {
        const user = this.getCurrentUser();
        return user?.role === 'admin';
    }
}

export default new AuthService();