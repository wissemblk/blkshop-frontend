// frontend/src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import productService from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { addToCart, loading: cartLoading } = useCart(); // Use CartContext
    
    const [productData, setProductData] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px'
        },
        backButton: {
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '20px'
        },
        productContainer: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px'
        },
        imageContainer: {
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px'
        },
        productImage: {
            width: '100%',
            height: 'auto',
            maxHeight: '500px',
            objectFit: 'contain'
        },
        productInfo: {
            padding: '20px'
        },
        productName: {
            fontSize: '2em',
            marginBottom: '10px',
            color: '#333'
        },
        productPrice: {
            fontSize: '2.5em',
            color: '#007bff',
            fontWeight: 'bold',
            marginBottom: '20px'
        },
        productCategory: {
            color: '#6c757d',
            marginBottom: '10px'
        },
        productStock: {
            fontSize: '1.1em',
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px'
        },
        inStock: {
            color: '#28a745'
        },
        outOfStock: {
            color: '#dc3545'
        },
        productDescription: {
            marginBottom: '30px',
            lineHeight: '1.6',
            color: '#666'
        },
        quantityContainer: {
            marginBottom: '20px'
        },
        quantityLabel: {
            display: 'block',
            marginBottom: '10px',
            fontWeight: '500'
        },
        quantityInput: {
            width: '80px',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px'
        },
        addToCartButton: {
            width: '100%',
            padding: '15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1.2em',
            cursor: 'pointer',
            marginBottom: '10px'
        },
        addToCartButtonDisabled: {
            backgroundColor: '#6c757d',
            cursor: 'not-allowed'
        },
        error: {
            color: '#dc3545',
            padding: '10px',
            backgroundColor: '#f8d7da',
            borderRadius: '4px',
            marginBottom: '10px'
        },
        success: {
            color: '#28a745',
            padding: '10px',
            backgroundColor: '#d4edda',
            borderRadius: '4px',
            marginBottom: '10px'
        },
        loading: {
            textAlign: 'center',
            padding: '50px',
            fontSize: '1.2em'
        }
    };

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            console.log('🔍 Chargement produit ID:', id);
            
            const data = await productService.getById(id);
            console.log('📦 Données reçues:', data);
            
            setProductData(data);
            setError('');
        } catch (error) {
            console.error('❌ Erreur chargement produit:', error);
            setError('Produit non trouvé');
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (value > 0 && productData?.stock && value <= productData.stock) {
            setQuantity(value);
        }
    };

    const handleAddToCart = async () => {
        // Check if user is authenticated
        if (!isAuthenticated()) {
            // Save intended destination for after login
            sessionStorage.setItem('redirectAfterLogin', `/product/${id}`);
            navigate('/login');
            return;
        }

        setAddingToCart(true);
        setError('');
        setSuccess('');

        try {
            // Prepare product object for cart context
            const productToAdd = {
                _id: productData.product.id || productData.product._id,
                id: productData.product.id || productData.product._id,
                name: productData.product.name,
                price: productData.product.price,
                image: productData.product.image,
                stock: productData.stock
            };
            
            console.log('🛒 Adding to cart:', productToAdd, quantity);
            
            // Use CartContext's addToCart function
            const success = await addToCart(productToAdd, quantity);
            
            if (success) {
                setSuccess('Produit ajouté au panier !');
                setTimeout(() => {
                    navigate('/cart');
                }, 2000);
            } else {
                setError('Erreur lors de l\'ajout au panier');
            }
        } catch (error) {
            console.error('❌ Error adding to cart:', error);
            setError(error.response?.data?.error || error.message || 'Erreur lors de l\'ajout au panier');
        } finally {
            setAddingToCart(false);
        }
    };

    // Rendu conditionnel
    if (loading) {
        return <div style={styles.loading}>Chargement du produit...</div>;
    }

    if (error || !productData) {
        return (
            <div style={styles.container}>
                <button onClick={() => navigate('/products')} style={styles.backButton}>
                    ← Retour aux produits
                </button>
                <div style={styles.error}>{error || 'Produit non trouvé'}</div>
            </div>
        );
    }

    // Extraire les données avec des valeurs par défaut
    const product = productData.product || productData;
    const stock = productData.stock || 0;

    if (!product) {
        return (
            <div style={styles.container}>
                <div style={styles.error}>Format de données incorrect</div>
            </div>
        );
    }

    // Rendu principal
    return (
        <div style={styles.container}>
            <button onClick={() => navigate('/products')} style={styles.backButton}>
                ← Retour aux produits
            </button>

            <div style={styles.productContainer}>
                {/* Image */}
                <div style={styles.imageContainer}>
                    <img 
                        src={product.image || 'https://via.placeholder.com/500'} 
                        alt={product.name}
                        style={styles.productImage}
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/500';
                        }}
                    />
                </div>

                {/* Informations */}
                <div style={styles.productInfo}>
                    <h1 style={styles.productName}>{product.name || 'Sans nom'}</h1>
                    <p style={styles.productCategory}>
                        Catégorie: {product.category || 'Non catégorisé'}
                    </p>
                    <p style={styles.productPrice}>
                        {product.price ? product.price.toFixed(2) : '0.00'} €
                    </p>

                    <div style={styles.productStock}>
                        <strong>Disponibilité: </strong>
                        <span style={stock > 0 ? styles.inStock : styles.outOfStock}>
                            {stock > 0 ? `En stock (${stock} unités)` : 'Rupture de stock'}
                        </span>
                    </div>

                    <div style={styles.productDescription}>
                        <h3>Description</h3>
                        <p>{product.description || 'Aucune description disponible.'}</p>
                    </div>

                    {stock > 0 && (
                        <>
                            <div style={styles.quantityContainer}>
                                <label style={styles.quantityLabel}>Quantité:</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={stock}
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    style={styles.quantityInput}
                                />
                            </div>

                            {error && <div style={styles.error}>{error}</div>}
                            {success && <div style={styles.success}>{success}</div>}

                            <button
                                onClick={handleAddToCart}
                                disabled={addingToCart || cartLoading}
                                style={{
                                    ...styles.addToCartButton,
                                    ...((addingToCart || cartLoading) && styles.addToCartButtonDisabled)
                                }}
                            >
                                {addingToCart ? 'Ajout en cours...' : 'Ajouter au panier'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;