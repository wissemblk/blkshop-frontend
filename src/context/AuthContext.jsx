// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = () => {
            try {
                const currentUser = authService.getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                console.error('❌ Erreur chargement utilisateur:', error);
            } finally {
                setLoading(false);
            }
        };
        
        loadUser();
    }, []);

    const login = async (email, password) => {
        try {
            console.log('🔑 AuthContext.login - Tentative avec:', { email });
            
            const response = await authService.login({ email, password });
            
            console.log('✅ AuthContext.login - Succès:', response.user);
            
            setUser(response.user);
            return { success: true };
            
        } catch (error) {
            console.error('❌ AuthContext.login - Erreur:', error);
            
            const errorMessage = error.response?.data?.error || 
                                error.response?.data?.details || 
                                'Erreur de connexion';
            
            return { 
                success: false, 
                error: errorMessage 
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authService.register(userData);
            setUser(response.user);
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Erreur d'inscription";
            return { 
                success: false, 
                error: errorMessage 
            };
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const isAuthenticated = () => {
        return authService.isAuthenticated();
    };

    const isAdmin = () => {
        return authService.isAdmin();
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        isAdmin
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};