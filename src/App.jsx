// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/NavBar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailsPage';
import AdminPage from './pages/AdminPage';

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/products/:id" element={<ProductDetailPage />} />
                        
                        <Route path="/cart" element={
                            <PrivateRoute>
                                <CartPage />
                            </PrivateRoute>
                        } />
                        
                        <Route path="/checkout" element={
                            <PrivateRoute>
                                <CheckoutPage />
                            </PrivateRoute>
                        } />
                        
                        <Route path="/orders" element={
                            <PrivateRoute>
                                <OrdersPage />
                            </PrivateRoute>
                        } />
                        
                        <Route path="/orders/:id" element={
                            <PrivateRoute>
                                <OrderDetailPage />
                            </PrivateRoute>
                        } />
                        
                        <Route path="/admin/*" element={
                            <AdminRoute>
                                <AdminPage />
                            </AdminRoute>
                        } />
                    </Routes>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;