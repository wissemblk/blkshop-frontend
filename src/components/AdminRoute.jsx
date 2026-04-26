// frontend/src/components/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { isAdmin } = useAuth();

    return isAdmin() ? children : <Navigate to="/" />;
};

export default AdminRoute;