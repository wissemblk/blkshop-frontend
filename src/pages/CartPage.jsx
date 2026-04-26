// frontend/src/pages/CartPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
    const { 
        cart, 
        loading, 
        updateCartItem, 
        removeFromCart, 
        clearCart,
        getCartTotal,
        getCartItemCount,
        initialized
    } = useCart();
    
    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [updatingItemId, setUpdatingItemId] = useState(null);
    const [error, setError] = useState('');

    const styles = {
        container: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
        title: { fontSize: '2em', marginBottom: '30px', color: '#333' },
        cartContainer: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' },
        cartItems: { backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd' },
        cartItem: { display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: '20px', padding: '20px', borderBottom: '1px solid #eee' },
        itemImage: { width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' },
        itemDetails: { display: 'flex', flexDirection: 'column', gap: '10px' },
        itemName: { fontSize: '1.2em', fontWeight: 'bold', color: '#333', textDecoration: 'none' },
        itemPrice: { color: '#007bff', fontWeight: 'bold', fontSize: '1.1em' },
        itemQuantity: { display: 'flex', alignItems: 'center', gap: '10px' },
        quantityButton: { 
            padding: '5px 10px', 
            backgroundColor: '#f8f9fa', 
            border: '1px solid #ddd', 
            borderRadius: '4px', 
            cursor: 'pointer',
            minWidth: '30px'
        },
        quantityButtonDisabled: {
            opacity: 0.5,
            cursor: 'not-allowed'
        },
        quantityInput: { width: '50px', padding: '5px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '4px' },
        itemTotal: { fontWeight: 'bold', fontSize: '1.1em' },
        itemActions: { display: 'flex', flexDirection: 'column', gap: '10px' },
        removeButton: { 
            padding: '5px 10px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
        },
        cartSummary: { backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', height: 'fit-content' },
        summaryTitle: { fontSize: '1.3em', marginBottom: '20px', color: '#333' },
        summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #ddd' },
        summaryTotal: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.2em', fontWeight: 'bold' },
        checkoutButton: { 
            width: '100%', 
            padding: '15px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            fontSize: '1.2em', 
            cursor: 'pointer', 
            marginBottom: '10px' 
        },
        checkoutButtonDisabled: {
            backgroundColor: '#6c757d',
            cursor: 'not-allowed'
        },
        clearCartButton: { 
            width: '100%', 
            padding: '10px', 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
        },
        error: { color: '#dc3545', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '4px', marginBottom: '20px' },
        emptyCart: { textAlign: 'center', padding: '50px' },
        shopButton: { display: 'inline-block', padding: '12px 30px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px', marginTop: '20px' },
        loading: { textAlign: 'center', padding: '50px' }
    };

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated()) {
            navigate('/login');
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Debug logging
    useEffect(() => {
        console.log('🛒 CartPage Debug Info:', {
            isAuthenticated: isAuthenticated(),
            authLoading,
            cartLoading: loading,
            initialized,
            cartItems: cart?.items,
            itemsCount: cart?.items?.length,
            totalItems: getCartItemCount(),
            totalPrice: getCartTotal()
        });
    }, [cart, loading, initialized, isAuthenticated, authLoading, getCartItemCount, getCartTotal]);

    const handleQuantityChange = async (productId, newQuantity) => {
        if (newQuantity < 1) return;
        setUpdatingItemId(productId);
        try {
            await updateCartItem(productId, newQuantity);
        } catch (err) {
            setError('Failed to update quantity');
        } finally {
            setUpdatingItemId(null);
        }
    };

    const handleRemoveItem = async (productId) => {
        if (window.confirm('Voulez-vous vraiment retirer cet article ?')) {
            setUpdatingItemId(productId);
            try {
                await removeFromCart(productId);
            } catch (err) {
                setError('Failed to remove item');
            } finally {
                setUpdatingItemId(null);
            }
        }
    };

    const handleClearCart = async () => {
        if (window.confirm('Vider le panier ?')) {
            try {
                await clearCart();
            } catch (err) {
                setError('Failed to clear cart');
            }
        }
    };

    // Show loading states
    if (authLoading || (loading && !initialized)) {
        return (
            <div style={styles.loading}>
                <h2>Chargement du panier...</h2>
            </div>
        );
    }

    // Check if cart is empty
    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div style={styles.emptyCart}>
                <h2>Votre panier est vide</h2>
                <p>Découvrez nos produits !</p>
                <Link to="/products" style={styles.shopButton}>Voir les produits</Link>
            </div>
        );
    }

    // Main render with cart items
    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Mon Panier ({getCartItemCount()} articles)</h1>
            
            {error && <div style={styles.error}>{error}</div>}
            
            <div style={styles.cartContainer}>
                <div style={styles.cartItems}>
                    {cart.items.map((item) => (
                        <div key={item.productId} style={styles.cartItem}>
                            <img 
                                src={item.image || '/api/placeholder/100/100'} 
                                alt={item.name} 
                                style={styles.itemImage}
                                onError={(e) => {
                                    e.target.src = '/api/placeholder/100/100';
                                }}
                            />
                            <div style={styles.itemDetails}>
                                <Link to={`/product/${item.productId}`} style={styles.itemName}>
                                    {item.name}
                                </Link>
                                <div style={styles.itemPrice}>
                                    {typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price).toFixed(2)} €
                                </div>
                                <div style={styles.itemQuantity}>
                                    <button 
                                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                        style={{
                                            ...styles.quantityButton,
                                            ...(updatingItemId === item.productId ? styles.quantityButtonDisabled : {})
                                        }}
                                        disabled={updatingItemId === item.productId}
                                    >
                                        -
                                    </button>
                                    <span style={{ minWidth: '30px', textAlign: 'center' }}>
                                        {item.quantity}
                                    </span>
                                    <button 
                                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                        style={{
                                            ...styles.quantityButton,
                                            ...(updatingItemId === item.productId ? styles.quantityButtonDisabled : {})
                                        }}
                                        disabled={updatingItemId === item.productId}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <div style={styles.itemActions}>
                                <div style={styles.itemTotal}>
                                    {(item.price * item.quantity).toFixed(2)} €
                                </div>
                                <button 
                                    onClick={() => handleRemoveItem(item.productId)}
                                    style={styles.removeButton}
                                    disabled={updatingItemId === item.productId}
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div style={styles.cartSummary}>
                    <h3 style={styles.summaryTitle}>Résumé de la commande</h3>
                    <div style={styles.summaryRow}>
                        <span>Sous-total ({getCartItemCount()} articles)</span>
                        <span>{getCartTotal().toFixed(2)} €</span>
                    </div>
                    <div style={styles.summaryRow}>
                        <span>Livraison</span>
                        <span>Gratuite</span>
                    </div>
                    <div style={styles.summaryTotal}>
                        <span>Total</span>
                        <span>{getCartTotal().toFixed(2)} €</span>
                    </div>
                    <button 
                        onClick={() => navigate('/checkout')}
                        style={{
                            ...styles.checkoutButton,
                            ...(loading ? styles.checkoutButtonDisabled : {})
                        }}
                        disabled={loading}
                    >
                        Procéder au paiement
                    </button>
                    <button 
                        onClick={handleClearCart}
                        style={styles.clearCartButton}
                        disabled={loading}
                    >
                        Vider le panier
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;