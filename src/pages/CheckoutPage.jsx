// frontend/src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';

const CheckoutPage = () => {
    const { cart, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [shippingAddress, setShippingAddress] = useState({
        street: user?.address?.split(',')[0]?.trim() || '',
        city: user?.address?.split(',')[1]?.trim() || '',
        zipCode: user?.address?.split(',')[2]?.trim() || '',
        country: 'France'
    });
    
    const [paymentMethod, setPaymentMethod] = useState('Carte');
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    });

    useEffect(() => {
        if (!cart || !cart.items || cart.items.length === 0) {
            navigate('/cart');
        }
    }, [cart, navigate]);

    const handleAddressChange = (e) => {
        setShippingAddress({
            ...shippingAddress,
            [e.target.name]: e.target.value
        });
    };

    const handleCardChange = (e) => {
        setCardDetails({
            ...cardDetails,
            [e.target.name]: e.target.value
        });
    };

    const validateAddress = () => {
        return shippingAddress.street && shippingAddress.city && shippingAddress.zipCode;
    };

    const validateCard = () => {
        if (paymentMethod === 'Carte') {
            return cardDetails.cardNumber && cardDetails.cardName && 
                   cardDetails.expiryDate && cardDetails.cvv;
        }
        return true; // PayPal pas besoin de validation de carte
    };

    const handlePlaceOrder = async () => {
        setLoading(true);
        setError('');

        try {
            const orderData = {
                shippingAddress: `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.zipCode}, ${shippingAddress.country}`,
                paymentMethod
            };

            const response = await orderService.create(orderData);
            
            if (response.order) {
                await clearCart();
                navigate(`/orders/${response.order.id}`);
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Erreur lors de la commande');
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '20px'
        },
        title: {
            fontSize: '2em',
            marginBottom: '30px',
            color: '#333'
        },
        steps: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '40px',
            position: 'relative'
        },
        stepLine: {
            position: 'absolute',
            top: '15px',
            left: '0',
            right: '0',
            height: '2px',
            backgroundColor: '#ddd',
            zIndex: '1'
        },
        stepItem: {
            position: 'relative',
            zIndex: '2',
            backgroundColor: '#fff',
            padding: '0 20px',
            textAlign: 'center'
        },
        stepNumber: {
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: '#007bff',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px'
        },
        stepNumberInactive: {
            backgroundColor: '#ddd'
        },
        stepTitle: {
            fontWeight: '500'
        },
        stepTitleActive: {
            color: '#007bff',
            fontWeight: 'bold'
        },
        content: {
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            marginBottom: '20px'
        },
        sectionTitle: {
            fontSize: '1.3em',
            marginBottom: '20px',
            color: '#333'
        },
        formGroup: {
            marginBottom: '20px'
        },
        label: {
            display: 'block',
            marginBottom: '5px',
            fontWeight: '500',
            color: '#555'
        },
        input: {
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px'
        },
        row: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
        },
        paymentMethods: {
            display: 'flex',
            gap: '20px',
            marginBottom: '20px'
        },
        paymentMethod: {
            flex: '1',
            padding: '15px',
            border: '2px solid #ddd',
            borderRadius: '4px',
            textAlign: 'center',
            cursor: 'pointer'
        },
        paymentMethodSelected: {
            borderColor: '#007bff',
            backgroundColor: '#f0f7ff'
        },
        cardDetails: {
            marginTop: '20px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px'
        },
        orderSummary: {
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '20px'
        },
        summaryRow: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '15px',
            paddingBottom: '15px',
            borderBottom: '1px solid #ddd'
        },
        summaryTotal: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '1.2em',
            fontWeight: 'bold',
            marginTop: '15px'
        },
        buttons: {
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '30px'
        },
        button: {
            padding: '12px 30px',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1.1em',
            cursor: 'pointer'
        },
        backButton: {
            backgroundColor: '#6c757d',
            color: 'white'
        },
        nextButton: {
            backgroundColor: '#007bff',
            color: 'white'
        },
        placeOrderButton: {
            backgroundColor: '#28a745',
            color: 'white',
            width: '100%',
            padding: '15px',
            fontSize: '1.2em'
        },
        buttonDisabled: {
            opacity: 0.7,
            cursor: 'not-allowed'
        },
        error: {
            color: '#dc3545',
            padding: '10px',
            backgroundColor: '#f8d7da',
            borderRadius: '4px',
            marginBottom: '20px'
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Finaliser la commande</h1>

            {/* Steps */}
            <div style={styles.steps}>
                <div style={styles.stepLine}></div>
                <div style={styles.stepItem}>
                    <div style={styles.stepNumber}>1</div>
                    <div style={step === 1 ? styles.stepTitleActive : styles.stepTitle}>
                        Adresse
                    </div>
                </div>
                <div style={styles.stepItem}>
                    <div style={step >= 2 ? styles.stepNumber : {...styles.stepNumber, ...styles.stepNumberInactive}}>
                        2
                    </div>
                    <div style={step === 2 ? styles.stepTitleActive : styles.stepTitle}>
                        Paiement
                    </div>
                </div>
                <div style={styles.stepItem}>
                    <div style={step === 3 ? styles.stepNumber : {...styles.stepNumber, ...styles.stepNumberInactive}}>
                        3
                    </div>
                    <div style={step === 3 ? styles.stepTitleActive : styles.stepTitle}>
                        Confirmation
                    </div>
                </div>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            {/* Step 1: Adresse */}
            {step === 1 && (
                <div style={styles.content}>
                    <h3 style={styles.sectionTitle}>Adresse de livraison</h3>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Rue</label>
                        <input
                            type="text"
                            name="street"
                            value={shippingAddress.street}
                            onChange={handleAddressChange}
                            style={styles.input}
                            placeholder="Numéro et nom de rue"
                        />
                    </div>
                    
                    <div style={styles.row}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Ville</label>
                            <input
                                type="text"
                                name="city"
                                value={shippingAddress.city}
                                onChange={handleAddressChange}
                                style={styles.input}
                            />
                        </div>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Code postal</label>
                            <input
                                type="text"
                                name="zipCode"
                                value={shippingAddress.zipCode}
                                onChange={handleAddressChange}
                                style={styles.input}
                            />
                        </div>
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Pays</label>
                        <input
                            type="text"
                            name="country"
                            value={shippingAddress.country}
                            onChange={handleAddressChange}
                            style={styles.input}
                        />
                    </div>
                </div>
            )}

            {/* Step 2: Paiement */}
            {step === 2 && (
                <div style={styles.content}>
                    <h3 style={styles.sectionTitle}>Mode de paiement</h3>
                    
                    <div style={styles.paymentMethods}>
                        <div 
                            style={{
                                ...styles.paymentMethod,
                                ...(paymentMethod === 'Carte' && styles.paymentMethodSelected)
                            }}
                            onClick={() => setPaymentMethod('Carte')}
                        >
                            💳 Carte bancaire
                        </div>
                        <div 
                            style={{
                                ...styles.paymentMethod,
                                ...(paymentMethod === 'PayPal' && styles.paymentMethodSelected)
                            }}
                            onClick={() => setPaymentMethod('PayPal')}
                        >
                            📱 PayPal
                        </div>
                    </div>

                    {paymentMethod === 'Carte' && (
                        <div style={styles.cardDetails}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Numéro de carte</label>
                                <input
                                    type="text"
                                    name="cardNumber"
                                    value={cardDetails.cardNumber}
                                    onChange={handleCardChange}
                                    placeholder="1234 5678 9012 3456"
                                    style={styles.input}
                                />
                            </div>
                            
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Nom sur la carte</label>
                                <input
                                    type="text"
                                    name="cardName"
                                    value={cardDetails.cardName}
                                    onChange={handleCardChange}
                                    placeholder="JEAN DUPONT"
                                    style={styles.input}
                                />
                            </div>
                            
                            <div style={styles.row}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Date d'expiration</label>
                                    <input
                                        type="text"
                                        name="expiryDate"
                                        value={cardDetails.expiryDate}
                                        onChange={handleCardChange}
                                        placeholder="MM/AA"
                                        style={styles.input}
                                    />
                                </div>
                                
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>CVV</label>
                                    <input
                                        type="text"
                                        name="cvv"
                                        value={cardDetails.cvv}
                                        onChange={handleCardChange}
                                        placeholder="123"
                                        style={styles.input}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
                <div style={styles.content}>
                    <h3 style={styles.sectionTitle}>Confirmation de commande</h3>
                    
                    <div style={styles.orderSummary}>
                        <h4>Articles commandés</h4>
                        {cart?.items?.map(item => (
                            <div key={item.productId} style={styles.summaryRow}>
                                <span>{item.name} x {item.quantity}</span>
                                <span>{(item.price * item.quantity).toFixed(2)} €</span>
                            </div>
                        ))}
                        
                        <div style={styles.summaryRow}>
                            <span>Sous-total</span>
                            <span>{getCartTotal().toFixed(2)} €</span>
                        </div>
                        
                        <div style={styles.summaryRow}>
                            <span>Livraison</span>
                            <span>Gratuite</span>
                        </div>
                        
                        <div style={styles.summaryTotal}>
                            <span>Total TTC</span>
                            <span>{getCartTotal().toFixed(2)} €</span>
                        </div>
                    </div>

                    <div style={styles.orderSummary}>
                        <h4>Adresse de livraison</h4>
                        <p>{shippingAddress.street}</p>
                        <p>{shippingAddress.zipCode} {shippingAddress.city}</p>
                        <p>{shippingAddress.country}</p>
                    </div>

                    <div style={styles.orderSummary}>
                        <h4>Mode de paiement</h4>
                        <p>{paymentMethod === 'Carte' ? 'Carte bancaire' : 'PayPal'}</p>
                    </div>
                </div>
            )}

            {/* Navigation buttons */}
            <div style={styles.buttons}>
                {step > 1 && (
                    <button 
                        onClick={() => setStep(step - 1)}
                        style={{...styles.button, ...styles.backButton}}
                    >
                        ← Retour
                    </button>
                )}
                
                {step < 3 ? (
                    <button 
                        onClick={() => setStep(step + 1)}
                        disabled={(step === 1 && !validateAddress()) || 
                                 (step === 2 && !validateCard())}
                        style={{
                            ...styles.button,
                            ...styles.nextButton,
                            ...(((step === 1 && !validateAddress()) || 
                                (step === 2 && !validateCard())) && styles.buttonDisabled)
                        }}
                    >
                        Suivant →
                    </button>
                ) : (
                    <button 
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        style={{
                            ...styles.button,
                            ...styles.placeOrderButton,
                            ...(loading && styles.buttonDisabled)
                        }}
                    >
                        {loading ? 'Traitement...' : 'Confirmer la commande'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default CheckoutPage;