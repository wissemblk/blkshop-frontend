// frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
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
        setLoading(true);

        try {
            // S'assurer que les données sont propres
            const credentials = {
                email: formData.email.trim(),
                password: formData.password
            };
            
            console.log('📤 Envoi credentials:', credentials);
            
            const result = await login(credentials.email, credentials.password);
            
            if (result.success) {
                console.log('✅ Login réussi, redirection...');
                navigate('/');
            } else {
                setError(result.error || 'Erreur de connexion');
            }
        } catch (err) {
            console.error('❌ Erreur login:', err);
            setError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    // Styles (gardez vos styles existants)
    const styles = {
        container: {
            maxWidth: '400px',
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
        button: {
            width: '100%',
            padding: '12px',
            backgroundColor: '#007bff',
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
        registerLink: {
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
            <h2 style={styles.title}>Connexion</h2>
            
            {error && <div style={styles.error}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={styles.input}
                        placeholder="exemple@email.com"
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
                        placeholder="••••••••"
                    />
                </div>
                
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{...styles.button, ...(loading && styles.buttonDisabled)}}
                >
                    {loading ? 'Connexion...' : 'Se connecter'}
                </button>
                
                <div style={styles.registerLink}>
                    Pas encore de compte ?{' '}
                    <Link to="/register" style={styles.link}>
                        S'inscrire
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default LoginPage;