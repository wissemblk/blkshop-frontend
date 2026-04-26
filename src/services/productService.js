// frontend/src/services/productService.js
import api from './api';

class ProductService {
    // Récupérer tous les produits
    async getAll() {
        try {
            console.log('🔍 Récupération des produits...');
            const response = await api.get('/products');
            console.log('✅ Produits reçus:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur détaillée:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config
            });
            throw error;
        }
    }

    // Récupérer un produit par ID
    async getById(id) {
        try {
            const response = await api.get(`/products/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Erreur récupération produit ${id}:`, error);
            throw error;
        }
    }

    // Créer un produit (admin)
    async create(productData) {
        try {
            const response = await api.post('/products', productData);
            return response.data;
        } catch (error) {
            console.error('Erreur création produit:', error);
            throw error;
        }
    }

    // Mettre à jour un produit (admin)
    async update(id, productData) {
        try {
            const response = await api.put(`/products/${id}`, productData);
            return response.data;
        } catch (error) {
            console.error('Erreur mise à jour produit:', error);
            throw error;
        }
    }

    // Supprimer un produit (admin)
    async delete(id) {
        try {
            const response = await api.delete(`/products/${id}`);
            return response.data;
        } catch (error) {
            console.error('Erreur suppression produit:', error);
            throw error;
        }
    }
}

export default new ProductService();