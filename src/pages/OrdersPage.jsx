import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';
import { useAuth } from '../context/AuthContext';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        loadOrders();
    }, [isAuthenticated, navigate]);

    const loadOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await orderService.getUserOrders();
            // Ensure data is an array
            const ordersArray = Array.isArray(data) ? data : data.orders || [];
            setOrders(ordersArray);
            console.log('Orders set:', ordersArray); // Debug log
        } catch (error) {
            console.error('Erreur chargement commandes:', error);
            setError('Impossible de charger vos commandes. Veuillez réessayer plus tard.');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Livré':
                return '#28a745';
            case 'En preparation':
                return '#ffc107';
            case 'Expedié':
                return '#17a2b8';
            case 'Annulé':
                return '#dc3545';
            default:
                return '#6c757d';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch(status) {
            case 'Payé':
                return '#28a745';
            case 'En attente':
                return '#ffc107';
            case 'Echoué':
                return '#dc3545';
            case 'Remboursé':
                return '#17a2b8';
            default:
                return '#6c757d';
        }
    };

    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px'
        },
        title: {
            fontSize: '2em',
            marginBottom: '30px',
            color: '#333'
        },
        loading: {
            textAlign: 'center',
            padding: '50px'
        },
        error: {
            color: '#dc3545',
            padding: '10px',
            backgroundColor: '#f8d7da',
            borderRadius: '4px',
            marginBottom: '20px',
            textAlign: 'center'
        },
        noOrders: {
            textAlign: 'center',
            padding: '50px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
        },
        shopButton: {
            display: 'inline-block',
            padding: '12px 30px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            marginTop: '20px'
        },
        ordersList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        orderCard: {
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#fff'
        },
        orderHeader: {
            backgroundColor: '#f8f9fa',
            padding: '15px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #ddd',
            flexWrap: 'wrap',
            gap: '10px'
        },
        orderNumber: {
            fontSize: '1.1em',
            fontWeight: 'bold',
            color: '#007bff'
        },
        orderDate: {
            color: '#666'
        },
        orderStatus: {
            padding: '5px 10px',
            borderRadius: '4px',
            color: 'white',
            fontSize: '0.9em',
            fontWeight: '500'
        },
        orderBody: {
            padding: '20px'
        },
        orderItems: {
            marginBottom: '20px'
        },
        orderItem: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 0',
            borderBottom: '1px solid #eee',
            flexWrap: 'wrap',
            gap: '10px'
        },
        itemName: {
            textDecoration: 'none',
            color: '#333',
            flex: '1'
        },
        itemQuantity: {
            color: '#666'
        },
        orderTotal: {
            textAlign: 'right',
            fontSize: '1.2em',
            fontWeight: 'bold',
            marginTop: '15px',
            paddingTop: '15px',
            borderTop: '2px solid #ddd'
        },
        orderFooter: {
            backgroundColor: '#f8f9fa',
            padding: '15px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #ddd',
            flexWrap: 'wrap',
            gap: '10px'
        },
        viewButton: {
            padding: '8px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer'
        },
        paymentStatus: {
            padding: '5px 10px',
            borderRadius: '4px',
            color: 'white',
            fontSize: '0.9em'
        }
    };

    if (loading) {
        return <div style={styles.loading}>Chargement de vos commandes...</div>;
    }

    if (error) {
        return (
            <div style={styles.container}>
                <h1 style={styles.title}>Mes commandes</h1>
                <div style={styles.error}>{error}</div>
                <button onClick={loadOrders} style={styles.viewButton}>
                    Réessayer
                </button>
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <div style={styles.container}>
                <h1 style={styles.title}>Mes commandes</h1>
                <div style={styles.noOrders}>
                    <h3>Vous n'avez pas encore passé de commande</h3>
                    <p>Découvrez nos produits et passez votre première commande !</p>
                    <Link to="/products" style={styles.shopButton}>
                        Voir les produits
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Mes commandes</h1>
            
            <div style={styles.ordersList}>
                {orders.map(order => (
                    <div key={order.id || order._id} style={styles.orderCard}>
                        <div style={styles.orderHeader}>
                            <div>
                                <span style={styles.orderNumber}>Commande #{order.id || order._id}</span>
                                <span style={styles.orderDate}>
                                    {' '}- {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div style={{...styles.orderStatus, backgroundColor: getStatusColor(order.status)}}>
                                {order.status}
                            </div>
                        </div>
                        
                        <div style={styles.orderBody}>
                            <div style={styles.orderItems}>
                                {order.items && order.items.map((item, index) => (
                                    <div key={item.id || index} style={styles.orderItem}>
                                        <Link to={`/products/${item.productId}`} style={styles.itemName}>
                                            {item.productName}
                                        </Link>
                                        <span>
                                            {item.quantity} x {parseFloat(item.price).toFixed(2)} € = {parseFloat(item.total).toFixed(2)} €
                                        </span>
                                    </div>
                                ))}
                            </div>
                            
                            <div style={styles.orderTotal}>
                                Total: {parseFloat(order.total).toFixed(2)} €
                            </div>
                        </div>
                        
                        <div style={styles.orderFooter}>
                            <div>
                                <span style={{...styles.paymentStatus, backgroundColor: getPaymentStatusColor(order.paymentStatus)}}>
                                    Paiement: {order.paymentStatus}
                                </span>
                                <span style={{marginLeft: '15px', color: '#666'}}>
                                    {order.paymentMethod}
                                </span>
                            </div>
                            <Link to={`/orders/${order.id || order._id}`} style={styles.viewButton}>
                                Voir détails
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrdersPage;