// frontend/src/context/CartContext.jsx
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';

// Create the context
const CartContext = createContext();

// Initial state
const initialState = {
    items: [],
    loading: true,
    error: null,
    initialized: false
};

// Cart reducer for managing cart state
const cartReducer = (state, action) => {
    switch (action.type) {
        case 'SET_CART':
            return {
                ...state,
                items: action.payload,
                loading: false,
                error: null,
                initialized: true
            };
        
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload
            };
        
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                loading: false
            };
        
        case 'CLEAR_CART':
            return {
                ...state,
                items: [],
                loading: false,
                initialized: true
            };
        
        default:
            return state;
    }
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    // Load cart from backend when user is authenticated
    const loadCartFromBackend = useCallback(async () => {
        console.log('🔄 Loading cart from backend...');
        dispatch({ type: 'SET_LOADING', payload: true });
        
        try {
            const response = await cartService.getCart();
            console.log('📦 Cart loaded:', response);
            
            // Handle different response structures
            let cartItems = [];
            if (response && response.items) {
                cartItems = response.items;
            } else if (Array.isArray(response)) {
                cartItems = response;
            } else if (response && response.cart && response.cart.items) {
                cartItems = response.cart.items;
            } else if (response && response.data && response.data.items) {
                cartItems = response.data.items;
            }
            
            // Ensure each item has required fields
            const normalizedItems = cartItems.map(item => ({
                productId: item.productId || item.product_id || item.id,
                name: item.name,
                price: parseFloat(item.price) || 0,
                quantity: parseInt(item.quantity) || 1,
                total: parseFloat(item.total) || (parseFloat(item.price) * parseInt(item.quantity)),
                image: item.image || null
            }));
            
            dispatch({ type: 'SET_CART', payload: normalizedItems });
        } catch (error) {
            console.error('❌ Error loading cart:', error);
            dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to load cart' });
            dispatch({ type: 'SET_CART', payload: [] });
        }
    }, []);

    // Load cart when auth state changes
    useEffect(() => {
        const initCart = async () => {
            if (!authLoading) {
                if (isAuthenticated() && user) {
                    await loadCartFromBackend();
                } else if (!isAuthenticated()) {
                    dispatch({ type: 'CLEAR_CART' });
                }
            }
        };
        
        initCart();
    }, [isAuthenticated, user, authLoading, loadCartFromBackend]);

    // Get total number of items in cart
    const getCartItemCount = useCallback(() => {
        return state.items.reduce((total, item) => total + (item.quantity || 0), 0);
    }, [state.items]);
    
    // Get total price of all items in cart
    const getCartTotal = useCallback(() => {
        return state.items.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);
    }, [state.items]);
    
    // Add item to cart
    const addToCart = useCallback(async (product, quantity = 1) => {
        console.log('➕ Adding to cart:', { product, quantity });
        
        if (!product || (!product._id && !product.id)) {
            console.error('❌ Invalid product:', product);
            return false;
        }
        
        const productId = product._id || product.id;
        
        dispatch({ type: 'SET_LOADING', payload: true });
        
        try {
            const response = await cartService.addItem(productId, quantity);
            console.log('✅ Add to cart response:', response);
            
            // Reload cart from backend to ensure consistency
            await loadCartFromBackend();
            
            return true;
        } catch (error) {
            console.error('❌ Error adding to cart:', error);
            dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to add item' });
            dispatch({ type: 'SET_LOADING', payload: false });
            return false;
        }
    }, [loadCartFromBackend]);
    
    // Update item quantity
    const updateCartItem = useCallback(async (productId, quantity) => {
        console.log('🔄 Updating cart item:', { productId, quantity });
        dispatch({ type: 'SET_LOADING', payload: true });
        
        try {
            if (quantity <= 0) {
                await cartService.removeItem(productId);
            } else {
                await cartService.updateItem(productId, quantity);
            }
            
            // Reload cart from backend
            await loadCartFromBackend();
            
            return true;
        } catch (error) {
            console.error('❌ Error updating cart:', error);
            dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to update item' });
            dispatch({ type: 'SET_LOADING', payload: false });
            return false;
        }
    }, [loadCartFromBackend]);
    
    // Remove item from cart
    const removeFromCart = useCallback(async (productId) => {
        console.log('🗑️ Removing from cart:', productId);
        dispatch({ type: 'SET_LOADING', payload: true });
        
        try {
            await cartService.removeItem(productId);
            await loadCartFromBackend();
            return true;
        } catch (error) {
            console.error('❌ Error removing from cart:', error);
            dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to remove item' });
            dispatch({ type: 'SET_LOADING', payload: false });
            return false;
        }
    }, [loadCartFromBackend]);
    
    // Clear entire cart
    const clearCart = useCallback(async () => {
        console.log('🧹 Clearing cart...');
        dispatch({ type: 'SET_LOADING', payload: true });
        
        try {
            await cartService.clearCart();
            await loadCartFromBackend();
            return true;
        } catch (error) {
            console.error('❌ Error clearing cart:', error);
            dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to clear cart' });
            dispatch({ type: 'SET_LOADING', payload: false });
            return false;
        }
    }, [loadCartFromBackend]);
    
    // Check if item is in cart
    const isInCart = useCallback((productId) => {
        return state.items.some(item => item.productId === productId);
    }, [state.items]);
    
    // Get item quantity in cart
    const getItemQuantity = useCallback((productId) => {
        const item = state.items.find(item => item.productId === productId);
        return item ? item.quantity : 0;
    }, [state.items]);
    
    const value = {
        cart: { items: state.items },
        loading: state.loading,
        error: state.error,
        initialized: state.initialized,
        getCartItemCount,
        getCartTotal,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        isInCart,
        getItemQuantity,
        loadCartFromBackend
    };
    
    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};