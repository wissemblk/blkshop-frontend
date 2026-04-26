// frontend/src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';

const HomePage = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFeaturedProducts();
    }, []);

    const loadFeaturedProducts = async () => {
        try {
            const products = await productService.getAll();
            // Prendre les 4 premiers produits comme "vedettes"
            setFeaturedProducts(products.slice(0, 4));
        } catch (error) {
            console.error('Erreur chargement produits:', error);
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px'
        },
        hero: {
            backgroundColor: '#f8f9fa',
            padding: '60px 20px',
            textAlign: 'center',
            borderRadius: '10px',
            marginBottom: '40px'
        },
        heroTitle: {
            fontSize: '2.5em',
            color: '#333',
            marginBottom: '20px'
        },
        heroSubtitle: {
            fontSize: '1.2em',
            color: '#666',
            marginBottom: '30px'
        },
        ctaButton: {
            backgroundColor: '#007bff',
            color: 'white',
            padding: '12px 30px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '1.1em',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-block'
        },
        sectionTitle: {
            fontSize: '2em',
            color: '#333',
            marginBottom: '30px',
            textAlign: 'center'
        },
        productsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
        },
        productCard: {
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            textAlign: 'center',
            transition: 'transform 0.3s, box-shadow 0.3s',
            cursor: 'pointer'
        },
        productImage: {
            width: '100%',
            height: '200px',
            objectFit: 'cover',
            borderRadius: '5px',
            marginBottom: '15px'
        },
        productName: {
            fontSize: '1.2em',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#333'
        },
        productPrice: {
            fontSize: '1.1em',
            color: '#007bff',
            fontWeight: 'bold',
            marginBottom: '15px'
        },
        productLink: {
            textDecoration: 'none'
        },
        categoriesSection: {
            marginBottom: '40px'
        },
        categoriesGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
        },
        categoryCard: {
            backgroundColor: '#f8f9fa',
            padding: '30px',
            textAlign: 'center',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Chargement...</h2>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Section Héro */}
            <div style={styles.hero}>
                <h1 style={styles.heroTitle}>Welcome to BLKShop</h1>
                <p style={styles.heroSubtitle}>
                    Discover our product and be up to date with our offers!
                </p>
                <Link to="/products" style={styles.ctaButton}>
                    all products
                </Link>
            </div>

            {/* Produits vedettes */}
            <h2 style={styles.sectionTitle}>featured products</h2>
            <div style={styles.productsGrid}>
                {featuredProducts.map(product => (
                    <Link to={`/products/${product.id}`} key={product.id} style={styles.productLink}>
                        <div style={styles.productCard}>
                            <img 
                                src={product.image || 'https://via.placeholder.com/200'} 
                                alt={product.name}
                                style={styles.productImage}
                            />
                            <h3 style={styles.productName}>{product.name}</h3>
                            <p style={styles.productPrice}>{product.price.toFixed(2)} €</p>
                            <button style={styles.ctaButton}>details</button>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Catégories populaires */}
            <h2 style={styles.sectionTitle}>Catégories populaires</h2>
            <div style={styles.categoriesGrid}>
                {['Informatique', 'Téléphonie', 'Audio', 'Électroménager'].map(category => (
                    <Link to={`/products?category=${category}`} key={category} style={styles.productLink}>
                        <div style={styles.categoryCard}>
                            <h3>{category}</h3>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default HomePage;