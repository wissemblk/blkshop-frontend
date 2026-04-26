// frontend/src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const { getCartItemCount } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const styles = {
        navbar: {
            backgroundColor: '#343a40',
            padding: '1rem',
            color: 'white'
        },
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        logo: {
            fontSize: '1.5em',
            fontWeight: 'bold',
            color: 'white',
            textDecoration: 'none'
        },
        navLinks: {
            display: 'flex',
            gap: '20px',
            alignItems: 'center'
        },
        link: {
            color: 'white',
            textDecoration: 'none',
            padding: '5px 10px'
        },
        cartLink: {
            color: 'white',
            textDecoration: 'none',
            padding: '5px 10px',
            backgroundColor: '#007bff',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
        },
        cartCount: {
            backgroundColor: '#dc3545',
            borderRadius: '50%',
            padding: '2px 8px',
            fontSize: '0.8em'
        },
        userInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        userName: {
            color: '#ffc107'
        },
        logoutButton: {
            backgroundColor: 'transparent',
            border: '1px solid white',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer'
        }
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.container}>
                <Link to="/" style={styles.logo}>
                    BLKShop Home
                </Link>

                <div style={styles.navLinks}>
                    <Link to="/products" style={styles.link}>
                        Produits
                    </Link>

                    {isAuthenticated() ? (
                        <>
                            <Link to="/cart" style={styles.cartLink}>
                                🛒 Panier
                                {getCartItemCount() > 0 && (
                                    <span style={styles.cartCount}>
                                        {getCartItemCount()}
                                    </span>
                                )}
                            </Link>

                            <Link to="/orders" style={styles.link}>
                                Mes commandes
                            </Link>

                            {isAdmin() && (
                                <Link to="/admin" style={styles.link}>
                                    Admin
                                </Link>
                            )}

                            <div style={styles.userInfo}>
                                <span style={styles.userName}>
                                    {user?.name}
                                </span>
                                <button 
                                    onClick={handleLogout}
                                    style={styles.logoutButton}
                                >
                                    Déconnexion
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={styles.link}>
                                Connexion
                            </Link>
                            <Link to="/register" style={styles.link}>
                                Inscription
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;