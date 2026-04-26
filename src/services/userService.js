import api from './api';

class UserService {
    async getAllUsers() {
        const response = await api.get('/admin/users');
        return response.data;
    }

    async updateUserRole(userId, role) {
        const response = await api.put(`/admin/users/${userId}/role`, { role });
        return response.data;
    }

    async deleteUser(userId) {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data;
    }
}

export default new UserService();