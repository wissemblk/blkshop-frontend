import React, { createContext, useState, useContext, useCallback } from 'react';
import orderService from '../services/orderService';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export const useOrders = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user, isAuthenticated } = useAuth();

    // Charger les commandes de l'utilisateur
    const loadUserOrders = useCallback(async () => {
        if (!isAuthenticated || !user) {
            console.log('User not authenticated');
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            const data = await orderService.getUserOrders();
            const ordersArray = Array.isArray(data) ? data : data.orders || [];
            setOrders(ordersArray);
            return ordersArray;
        } catch (err) {
            console.error('Erreur chargement commandes:', err);
            setError(err.message || 'Erreur lors du chargement des commandes');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [user, isAuthenticated]);

    // Créer une commande
    const createOrder = async (orderData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await orderService.create(orderData);
            await loadUserOrders(); // Recharger la liste
            return { success: true, order: response.order || response };
        } catch (err) {
            console.error('Error creating order:', err);
            setError(err.message || 'Erreur lors de la création de la commande');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Annuler une commande
    const cancelOrder = async (orderId) => {
        setLoading(true);
        setError(null);
        try {
            await orderService.cancelOrder(orderId);
            await loadUserOrders();
            return { success: true };
        } catch (err) {
            console.error('Error cancelling order:', err);
            setError(err.message || 'Erreur lors de l\'annulation de la commande');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const value = {
        orders,
        currentOrder,
        loading,
        error,
        loadUserOrders,
        createOrder,
        cancelOrder,
        setCurrentOrder
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};