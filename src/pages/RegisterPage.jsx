// frontend/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (formData.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setLoading(true);

        const result = await register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            address: formData.address
        });
        
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || "Erreur d'inscription");
        }
        
        setLoading(false);
    };

    const styles = {
        container: {
            maxWidth: '500px',
            margin: '50px auto',
            padding: '30px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },
        title: {
            textAlign: 'center',
            marginBottom: '30px',
            color: '#333'
        },
        formGroup: {
            marginBottom: '20px'
        },
        label: {
            display: 'block',
            marginBottom: '5px',
            color: '#555',
            fontWeight: '500'
        },
        input: {
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px'
        },
        textarea: {
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
            minHeight: '80px'
        },
        button: {
            width: '100%',
            padding: '12px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '15px'
        },
        buttonDisabled: {
            opacity: 0.7,
            cursor: 'not-allowed'
        },
        error: {
            color: '#dc3545',
            marginBottom: '15px',
            textAlign: 'center',
            padding: '10px',
            backgroundColor: '#f8d7da',
            borderRadius: '4px'
        },
        loginLink: {
            textAlign: 'center',
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #ddd'
        },
        link: {
            color: '#007bff',
            textDecoration: 'none'
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Inscription</h2>
            
            {error && <div style={styles.error}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Nom complet</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>Mot de passe</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>Confirmer le mot de passe</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>Adresse de livraison</label>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        style={styles.textarea}
                        placeholder="Numéro, rue, code postal, ville"
                    />
                </div>
                
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{...styles.button, ...(loading && styles.buttonDisabled)}}
                >
                    {loading ? 'Inscription...' : "S'inscrire"}
                </button>
                
                <div style={styles.loginLink}>
                    Déjà inscrit ?{' '}
                    <Link to="/login" style={styles.link}>
                        Se connecter
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default RegisterPage;