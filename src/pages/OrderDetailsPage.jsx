import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import orderService from '../services/orderService';
import { useAuth } from '../context/AuthContext';

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    
    const [order, setOrder] = useState(null);
    const [invoice, setInvoice] = useState(null);
    const [shipping, setShipping] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        loadOrderDetails();
    }, [id]);

    const loadOrderDetails = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await orderService.getById(id);
            console.log('Order details:', data); // Debug log
            setOrder(data.order || data);
            setInvoice(data.invoice || null);
            setShipping(data.shipping || null);
        } catch (error) {
            console.error('Error loading order:', error);
            setError('Impossible de charger les détails de la commande');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (window.confirm('Voulez-vous vraiment annuler cette commande ?')) {
            setCancelling(true);
            try {
                await orderService.cancelOrder(id);
                await loadOrderDetails();
            } catch (error) {
                console.error('Error cancelling order:', error);
                setError('Erreur lors de l\'annulation de la commande');
            } finally {
                setCancelling(false);
            }
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

    const styles = {
        container: {
            maxWidth: '1000px',
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
            marginBottom: '20px'
        },
        orderHeader: {
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px'
        },
        orderStatus: {
            padding: '8px 15px',
            borderRadius: '4px',
            color: 'white',
            fontSize: '1.1em',
            fontWeight: 'bold'
        },
        section: {
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            marginBottom: '20px'
        },
        sectionTitle: {
            fontSize: '1.3em',
            marginBottom: '20px',
            color: '#333'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
        },
        infoRow: {
            marginBottom: '10px'
        },
        infoLabel: {
            fontWeight: 'bold',
            color: '#555',
            marginRight: '10px'
        },
        itemsTable: {
            width: '100%',
            borderCollapse: 'collapse'
        },
        tableHeader: {
            backgroundColor: '#f8f9fa',
            padding: '10px',
            textAlign: 'left',
            borderBottom: '2px solid #ddd'
        },
        tableRow: {
            borderBottom: '1px solid #eee'
        },
        tableCell: {
            padding: '10px'
        },
        totalRow: {
            backgroundColor: '#f8f9fa',
            fontWeight: 'bold'
        },
        cancelButton: {
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px'
        },
        cancelButtonDisabled: {
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'not-allowed',
            marginTop: '20px'
        },
        trackingInfo: {
            backgroundColor: '#e7f3ff',
            padding: '15px',
            borderRadius: '4px',
            marginTop: '15px'
        }
    };

    if (loading) {
        return <div style={styles.loading}>Chargement des détails...</div>;
    }

    if (error || !order) {
        return (
            <div style={styles.container}>
                <button onClick={() => navigate('/orders')} style={styles.backButton}>
                    ← Retour aux commandes
                </button>
                <div style={styles.error}>{error || 'Commande non trouvée'}</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <button onClick={() => navigate('/orders')} style={styles.backButton}>
                ← Retour aux commandes
            </button>

            <h1 style={styles.title}>Commande #{order.id || order._id}</h1>

            <div style={styles.orderHeader}>
                <div>
                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Date:</span>
                        {new Date(order.createdAt).toLocaleDateString()} à {new Date(order.createdAt).toLocaleTimeString()}
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Statut paiement:</span>
                        {order.paymentStatus}
                    </div>
                </div>
                <div style={{...styles.orderStatus, backgroundColor: getStatusColor(order.status)}}>
                    {order.status}
                </div>
            </div>

            <div style={styles.grid}>
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Adresse de livraison</h3>
                    <p>{order.shippingAddress || 'Adresse non spécifiée'}</p>
                </div>

                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Paiement</h3>
                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Méthode:</span> {order.paymentMethod}
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Statut:</span> {order.paymentStatus}
                    </div>
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Articles commandés</h3>
                <table style={styles.itemsTable}>
                    <thead>
                        <tr>
                            <th style={styles.tableHeader}>Produit</th>
                            <th style={styles.tableHeader}>Prix unitaire</th>
                            <th style={styles.tableHeader}>Quantité</th>
                            <th style={styles.tableHeader}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items && order.items.map((item, index) => (
                            <tr key={item.id || index} style={styles.tableRow}>
                                <td style={styles.tableCell}>
                                    <Link to={`/products/${item.productId}`}>
                                        {item.productName}
                                    </Link>
                                </td>
                                <td style={styles.tableCell}>{parseFloat(item.price).toFixed(2)} €</td>
                                <td style={styles.tableCell}>{item.quantity}</td>
                                <td style={styles.tableCell}>{parseFloat(item.total).toFixed(2)} €</td>
                            </tr>
                        ))}
                        <tr style={styles.totalRow}>
                            <td colSpan="3" style={{...styles.tableCell, textAlign: 'right'}}>
                                <strong>Total TTC</strong>
                            </td>
                            <td style={styles.tableCell}>
                                <strong>{parseFloat(order.total).toFixed(2)} €</strong>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {invoice && (
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Facture</h3>
                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Numéro:</span> {invoice.invoiceNumber}
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Date:</span> {new Date(invoice.createdAt).toLocaleDateString()}
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Sous-total:</span> {parseFloat(invoice.subtotal).toFixed(2)} €
                    </div>
                    {invoice.discount > 0 && (
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Réduction:</span> -{parseFloat(invoice.discount).toFixed(2)} €
                        </div>
                    )}
                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Total:</span> <strong>{parseFloat(invoice.total).toFixed(2)} €</strong>
                    </div>
                </div>
            )}

            {shipping && (
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Suivi de livraison</h3>
                    <div style={styles.trackingInfo}>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Statut:</span> {shipping.status}
                        </div>
                        {shipping.trackingNumber && (
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Numéro de suivi:</span> {shipping.trackingNumber}
                            </div>
                        )}
                        {shipping.carrier && (
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Transporteur:</span> {shipping.carrier}
                            </div>
                        )}
                        {shipping.estimatedDelivery && (
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Livraison estimée:</span> 
                                {new Date(shipping.estimatedDelivery).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {order.status === 'En preparation' && (
                <button 
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    style={cancelling ? styles.cancelButtonDisabled : styles.cancelButton}
                >
                    {cancelling ? 'Annulation...' : 'Annuler la commande'}
                </button>
            )}
        </div>
    );
};

export default OrderDetailPage;