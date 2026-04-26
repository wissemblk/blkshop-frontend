import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';
import orderService from '../services/orderService';
import userService from '../services/userService';
import api from '../services/api';

const AdminPage = () => {
    const { isAdmin, user, token } = useAuth();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [updatingStock, setUpdatingStock] = useState({});
    
    // Form states
    const [productForm, setProductForm] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        image: '',
        stock: 0
    });

    useEffect(() => {
        if (!isAdmin()) {
            navigate('/');
        } else {
            loadData();
        }
    }, [isAdmin, navigate]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Charger tous les produits
            const productsData = await productService.getAll();
            setProducts(productsData);
            
            // Charger toutes les commandes
            await loadAllOrders();
            
            // Charger tous les utilisateurs
            await loadAllUsers();
            
        } catch (error) {
            console.error('Erreur chargement données:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAllOrders = async () => {
        try {
            // Si vous avez une route admin pour les commandes
            const response = await api.get('/admin/orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Erreur chargement commandes:', error);
            // Données mockées pour tester
            setOrders([]);
        }
    };

    const loadAllUsers = async () => {
        try {
            // Si vous avez une route admin pour les utilisateurs
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Erreur chargement utilisateurs:', error);
            // Données mockées pour tester
            setUsers([]);
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            const productData = {
                ...productForm,
                price: parseFloat(productForm.price),
                stock: parseInt(productForm.stock)
            };
            
            if (editingProduct) {
                await productService.update(editingProduct.id, productData);
            } else {
                await productService.create(productData);
            }
            resetForm();
            await loadData();
            alert(editingProduct ? 'Produit modifié avec succès!' : 'Produit ajouté avec succès!');
        } catch (error) {
            console.error('Erreur sauvegarde produit:', error);
            alert('Erreur lors de la sauvegarde du produit');
        }
    };

    const handleUpdateStock = async (productId, newStock) => {
        if (newStock < 0) {
            alert('Le stock ne peut pas être négatif');
            return;
        }
        
        setUpdatingStock(prev => ({ ...prev, [productId]: true }));
        try {
            const product = products.find(p => p.id === productId);
            await productService.update(productId, { ...product, stock: newStock });
            await loadData();
            alert('Stock mis à jour avec succès!');
        } catch (error) {
            console.error('Erreur mise à jour stock:', error);
            alert('Erreur lors de la mise à jour du stock');
        } finally {
            setUpdatingStock(prev => ({ ...prev, [productId]: false }));
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            price: product.price,
            description: product.description || '',
            category: product.category,
            image: product.image || '',
            stock: product.stock || 0
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce produit ?')) {
            try {
                await productService.delete(productId);
                await loadData();
                alert('Produit supprimé avec succès!');
            } catch (error) {
                console.error('Erreur suppression produit:', error);
                alert('Erreur lors de la suppression du produit');
            }
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
            await loadAllOrders();
            alert('Statut de la commande mis à jour!');
        } catch (error) {
            console.error('Erreur mise à jour statut:', error);
            alert('Erreur lors de la mise à jour du statut');
        }
    };

    const handleUpdateUserRole = async (userId, newRole) => {
        try {
            await api.put(`/admin/users/${userId}/role`, { role: newRole });
            await loadAllUsers();
            alert('Rôle utilisateur mis à jour!');
        } catch (error) {
            console.error('Erreur mise à jour rôle:', error);
            alert('Erreur lors de la mise à jour du rôle');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
            try {
                await api.delete(`/admin/users/${userId}`);
                await loadAllUsers();
                alert('Utilisateur supprimé avec succès!');
            } catch (error) {
                console.error('Erreur suppression utilisateur:', error);
                alert('Erreur lors de la suppression de l\'utilisateur');
            }
        }
    };

    const resetForm = () => {
        setEditingProduct(null);
        setProductForm({
            name: '',
            price: '',
            description: '',
            category: '',
            image: '',
            stock: 0
        });
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Livré': return '#28a745';
            case 'En preparation': return '#ffc107';
            case 'Expedié': return '#17a2b8';
            case 'Annulé': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch(status) {
            case 'Payé': return '#28a745';
            case 'En attente': return '#ffc107';
            case 'Echoué': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const styles = {
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '20px'
        },
        title: {
            fontSize: '2em',
            marginBottom: '30px',
            color: '#333'
        },
        tabs: {
            display: 'flex',
            gap: '10px',
            marginBottom: '30px',
            borderBottom: '2px solid #ddd',
            paddingBottom: '10px',
            flexWrap: 'wrap'
        },
        tab: {
            padding: '10px 20px',
            cursor: 'pointer',
            borderRadius: '4px 4px 0 0',
            backgroundColor: '#f8f9fa',
            border: 'none',
            fontSize: '16px'
        },
        tabActive: {
            backgroundColor: '#007bff',
            color: 'white'
        },
        formContainer: {
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '30px'
        },
        formTitle: {
            fontSize: '1.3em',
            marginBottom: '20px',
            color: '#333'
        },
        formGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
        },
        formGroup: {
            marginBottom: '15px'
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
            fontSize: '14px'
        },
        textarea: {
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            minHeight: '80px',
            fontSize: '14px'
        },
        buttonGroup: {
            display: 'flex',
            gap: '10px',
            marginTop: '20px'
        },
        button: {
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
        },
        submitButton: {
            backgroundColor: '#28a745',
            color: 'white'
        },
        cancelButton: {
            backgroundColor: '#6c757d',
            color: 'white'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            overflowX: 'auto',
            display: 'block'
        },
        th: {
            backgroundColor: '#f8f9fa',
            padding: '12px',
            textAlign: 'left',
            borderBottom: '2px solid #ddd',
            fontWeight: '600'
        },
        td: {
            padding: '12px',
            borderBottom: '1px solid #eee'
        },
        editButton: {
            padding: '5px 10px',
            backgroundColor: '#ffc107',
            color: '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '5px'
        },
        deleteButton: {
            padding: '5px 10px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
        },
        stockInput: {
            width: '80px',
            padding: '5px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            textAlign: 'center'
        },
        updateStockButton: {
            padding: '5px 10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginLeft: '5px'
        },
        statusSelect: {
            padding: '5px',
            borderRadius: '4px',
            border: '1px solid #ddd'
        },
        viewButton: {
            padding: '5px 10px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
        },
        badge: {
            padding: '5px 10px',
            borderRadius: '4px',
            color: 'white',
            fontSize: '12px',
            fontWeight: '500',
            display: 'inline-block'
        },
        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        },
        modal: {
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
        },
        loading: {
            textAlign: 'center',
            padding: '50px',
            fontSize: '18px'
        },
        statsCard: {
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
        },
        statItem: {
            textAlign: 'center',
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },
        statValue: {
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#007bff'
        },
        statLabel: {
            color: '#666',
            marginTop: '5px'
        }
    };

    if (loading) {
        return <div style={styles.loading}>Chargement des données admin...</div>;
    }

    // Statistiques
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalUsers = users.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'En preparation').length;

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Administration</h1>

            {/* Statistiques */}
            <div style={styles.statsCard}>
                <div style={styles.statItem}>
                    <div style={styles.statValue}>{totalProducts}</div>
                    <div style={styles.statLabel}>Produits</div>
                </div>
                <div style={styles.statItem}>
                    <div style={styles.statValue}>{totalOrders}</div>
                    <div style={styles.statLabel}>Commandes</div>
                </div>
                <div style={styles.statItem}>
                    <div style={styles.statValue}>{totalUsers}</div>
                    <div style={styles.statLabel}>Utilisateurs</div>
                </div>
                <div style={styles.statItem}>
                    <div style={styles.statValue}>{totalRevenue.toFixed(2)} €</div>
                    <div style={styles.statLabel}>CA Total</div>
                </div>
                <div style={styles.statItem}>
                    <div style={styles.statValue}>{pendingOrders}</div>
                    <div style={styles.statLabel}>Commandes en cours</div>
                </div>
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
                <button 
                    style={{...styles.tab, ...(activeTab === 'products' && styles.tabActive)}}
                    onClick={() => setActiveTab('products')}
                >
                    📦 Gestion des Produits
                </button>
                <button 
                    style={{...styles.tab, ...(activeTab === 'orders' && styles.tabActive)}}
                    onClick={() => setActiveTab('orders')}
                >
                    📋 Gestion des Commandes
                </button>
                <button 
                    style={{...styles.tab, ...(activeTab === 'users' && styles.tabActive)}}
                    onClick={() => setActiveTab('users')}
                >
                    👥 Gestion des Utilisateurs
                </button>
            </div>

            {/* Onglet Produits */}
            {activeTab === 'products' && (
                <>
                    <div style={styles.formContainer}>
                        <h3 style={styles.formTitle}>
                            {editingProduct ? '✏️ Modifier le produit' : '➕ Ajouter un nouveau produit'}
                        </h3>
                        <form onSubmit={handleProductSubmit}>
                            <div style={styles.formGrid}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Nom du produit *</label>
                                    <input
                                        type="text"
                                        value={productForm.name}
                                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                                        required
                                        style={styles.input}
                                        placeholder="Ex: iPhone 15"
                                    />
                                </div>
                                
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Prix (€) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={productForm.price}
                                        onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                                        required
                                        style={styles.input}
                                        placeholder="Ex: 999.99"
                                    />
                                </div>
                                
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Stock *</label>
                                    <input
                                        type="number"
                                        step="1"
                                        value={productForm.stock}
                                        onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                                        required
                                        style={styles.input}
                                        placeholder="Quantité en stock"
                                    />
                                </div>
                                
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Catégorie *</label>
                                    <input
                                        type="text"
                                        value={productForm.category}
                                        onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                                        required
                                        style={styles.input}
                                        placeholder="Ex: Électronique"
                                    />
                                </div>
                                
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Image URL</label>
                                    <input
                                        type="text"
                                        value={productForm.image}
                                        onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                                        style={styles.input}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                                
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Description</label>
                                    <textarea
                                        value={productForm.description}
                                        onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                                        style={styles.textarea}
                                        placeholder="Description détaillée du produit..."
                                    />
                                </div>
                            </div>
                            
                            <div style={styles.buttonGroup}>
                                <button 
                                    type="submit" 
                                    style={{...styles.button, ...styles.submitButton}}
                                >
                                    {editingProduct ? 'Mettre à jour' : 'Ajouter le produit'}
                                </button>
                                {editingProduct && (
                                    <button 
                                        type="button" 
                                        onClick={resetForm}
                                        style={{...styles.button, ...styles.cancelButton}}
                                    >
                                        Annuler
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div style={{overflowX: 'auto'}}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>Nom</th>
                                    <th style={styles.th}>Prix</th>
                                    <th style={styles.th}>Stock</th>
                                    <th style={styles.th}>Catégorie</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id}>
                                        <td style={styles.td}>{product.id}</td>
                                        <td style={styles.td}>
                                            <strong>{product.name}</strong>
                                            {product.description && (
                                                <div style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>
                                                    {product.description.substring(0, 50)}...
                                                </div>
                                            )}
                                        </td>
                                        <td style={styles.td}>
                                            <strong>{product.price.toFixed(2)} €</strong>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                                <input
                                                    type="number"
                                                    defaultValue={product.stock}
                                                    id={`stock-${product.id}`}
                                                    style={styles.stockInput}
                                                    min="0"
                                                />
                                                <button
                                                    onClick={() => {
                                                        const newStock = document.getElementById(`stock-${product.id}`).value;
                                                        handleUpdateStock(product.id, parseInt(newStock));
                                                    }}
                                                    disabled={updatingStock[product.id]}
                                                    style={styles.updateStockButton}
                                                >
                                                    {updatingStock[product.id] ? '...' : 'Mettre à jour'}
                                                </button>
                                            </div>
                                            {product.stock === 0 && (
                                                <div style={{color: '#dc3545', fontSize: '12px', marginTop: '5px'}}>
                                                    ⚠️ Rupture de stock
                                                </div>
                                            )}
                                            {product.stock < 5 && product.stock > 0 && (
                                                <div style={{color: '#ffc107', fontSize: '12px', marginTop: '5px'}}>
                                                    ⚠️ Stock faible ({product.stock} restants)
                                                </div>
                                            )}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.badge,
                                                backgroundColor: '#17a2b8'
                                            }}>
                                                {product.category}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <button 
                                                onClick={() => handleEditProduct(product)}
                                                style={styles.editButton}
                                            >
                                                ✏️ Modifier
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteProduct(product.id)}
                                                style={styles.deleteButton}
                                            >
                                                🗑️ Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {products.length === 0 && (
                        <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
                            Aucun produit. Commencez par en ajouter un !
                        </div>
                    )}
                </>
            )}

            {/* Onglet Commandes */}
            {activeTab === 'orders' && (
                <div style={{overflowX: 'auto'}}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Commande #</th>
                                <th style={styles.th}>Client</th>
                                <th style={styles.th}>Date</th>
                                <th style={styles.th}>Total</th>
                                <th style={styles.th}>Statut</th>
                                <th style={styles.th}>Paiement</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td style={styles.td}>#{order.id}</td>
                                    <td style={styles.td}>
                                        {order.user?.email || order.email || 'N/A'}
                                    </td>
                                    <td style={styles.td}>
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={styles.td}>
                                        <strong>{order.total?.toFixed(2) || 0} €</strong>
                                    </td>
                                    <td style={styles.td}>
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                            style={{
                                                ...styles.statusSelect,
                                                backgroundColor: getStatusColor(order.status) + '20',
                                                color: getStatusColor(order.status)
                                            }}
                                        >
                                            <option value="En preparation">En préparation</option>
                                            <option value="Expedié">Expédié</option>
                                            <option value="Livré">Livré</option>
                                            <option value="Annulé">Annulé</option>
                                        </select>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.badge,
                                            backgroundColor: getPaymentStatusColor(order.paymentStatus)
                                        }}>
                                            {order.paymentStatus}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <button 
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setShowOrderDetails(true);
                                            }}
                                            style={styles.viewButton}
                                        >
                                            📋 Voir détails
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {orders.length === 0 && (
                        <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
                            Aucune commande pour le moment.
                        </div>
                    )}
                </div>
            )}

            {/* Onglet Utilisateurs */}
            {activeTab === 'users' && (
                <div style={{overflowX: 'auto'}}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>Email</th>
                                <th style={styles.th}>Rôle</th>
                                <th style={styles.th}>Date d'inscription</th>
                                <th style={styles.th}>Commandes</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td style={styles.td}>{user.id}</td>
                                    <td style={styles.td}>{user.email}</td>
                                    <td style={styles.td}>
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                                            style={styles.statusSelect}
                                        >
                                            <option value="user">Utilisateur</option>
                                            <option value="admin">Administrateur</option>
                                        </select>
                                    </td>
                                    <td style={styles.td}>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={styles.td}>
                                        {user.orderCount || 0} commandes
                                    </td>
                                    <td style={styles.td}>
                                        <button 
                                            onClick={() => handleDeleteUser(user.id)}
                                            style={styles.deleteButton}
                                            disabled={user.email === 'admin@example.com'}
                                        >
                                            🗑️ Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {users.length === 0 && (
                        <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
                            Aucun utilisateur inscrit.
                        </div>
                    )}
                </div>
            )}

            {/* Modal Détails Commande */}
            {showOrderDetails && selectedOrder && (
                <div style={styles.modalOverlay} onClick={() => setShowOrderDetails(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3>Détails de la commande #{selectedOrder.id}</h3>
                        <div style={{marginTop: '20px'}}>
                            <p><strong>Client:</strong> {selectedOrder.user?.email || selectedOrder.email}</p>
                            <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                            <p><strong>Adresse de livraison:</strong> {selectedOrder.shippingAddress}</p>
                            <p><strong>Méthode de paiement:</strong> {selectedOrder.paymentMethod}</p>
                            <p><strong>Statut paiement:</strong> {selectedOrder.paymentStatus}</p>
                            
                            <h4>Articles :</h4>
                            <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                <thead>
                                    <tr style={{backgroundColor: '#f8f9fa'}}>
                                        <th style={{padding: '8px', textAlign: 'left'}}>Produit</th>
                                        <th style={{padding: '8px', textAlign: 'left'}}>Quantité</th>
                                        <th style={{padding: '8px', textAlign: 'left'}}>Prix unitaire</th>
                                        <th style={{padding: '8px', textAlign: 'left'}}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items?.map((item, idx) => (
                                        <tr key={idx}>
                                            <td style={{padding: '8px'}}>{item.productName}</td>
                                            <td style={{padding: '8px'}}>{item.quantity}</td>
                                            <td style={{padding: '8px'}}>{item.price?.toFixed(2)} €</td>
                                            <td style={{padding: '8px'}}>{item.total?.toFixed(2)} €</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr style={{backgroundColor: '#f8f9fa', fontWeight: 'bold'}}>
                                        <td colSpan="3" style={{padding: '8px', textAlign: 'right'}}>Total :</td>
                                        <td style={{padding: '8px'}}>{selectedOrder.total?.toFixed(2)} €</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <button 
                            onClick={() => setShowOrderDetails(false)}
                            style={{...styles.button, ...styles.submitButton, marginTop: '20px'}}
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;