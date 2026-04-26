import api from './api';

class OrderService {
    async create(orderData) {
        try {
            const response = await api.post('/orders', orderData);
            return response.data;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    async getUserOrders() {
        try {
            const response = await api.get('/orders');
            console.log('Orders received:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }

    async getById(id) {
        try {
            const response = await api.get(`/orders/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching order details:', error);
            throw error;
        }
    }

    async cancelOrder(id) {
        try {
            const response = await api.post(`/orders/${id}/cancel`);
            return response.data;
        } catch (error) {
            console.error('Error cancelling order:', error);
            throw error;
        }
    }
}

export default new OrderService();