// frontend/src/services/cartService.js
import api from './api';

class CartService {
    async getCart() {
        try {
            console.log('🔍 Fetching cart...');
            const response = await api.get('/cart');
            console.log('✅ Cart fetched:', response.data);
            
            // Normalize response structure
            if (response.data) {
                return response.data;
            }
            return { items: [], total: 0 };
        } catch (error) {
            console.error('❌ Error fetching cart:', error);
            throw error;
        }
    }

    async addItem(productId, quantity = 1) {
        try {
            console.log('📤 Adding item to cart:', { productId, quantity });
            const response = await api.post('/cart/items', { productId, quantity });
            console.log('✅ Item added:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error adding item:', error);
            throw error;
        }
    }

    async updateItem(productId, quantity) {
        try {
            console.log('🔄 Updating cart item:', { productId, quantity });
            const response = await api.put('/cart/items', { productId, quantity });
            console.log('✅ Item updated:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error updating item:', error);
            throw error;
        }
    }

    async removeItem(productId) {
        try {
            console.log('🗑️ Removing item from cart:', productId);
            const response = await api.delete(`/cart/items/${productId}`);
            console.log('✅ Item removed:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error removing item:', error);
            throw error;
        }
    }

    async clearCart() {
        try {
            console.log('🧹 Clearing cart...');
            const response = await api.delete('/cart');
            console.log('✅ Cart cleared:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error clearing cart:', error);
            throw error;
        }
    }
}

export default new CartService();