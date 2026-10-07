import api from './api';

export const adminService = {
  async getAnalytics() {
    const res = await api.get('/admin/analytics');
    return res.data;
  },

  async getAdminProducts(params = {}) {
    const res = await api.get('/admin/products', { params });
    return res.data;
  },

  async createProduct(productData) {
    const res = await api.post('/admin/products', productData);
    return res.data;
  },

  async updateProduct(productId, productData) {
    const res = await api.put(`/admin/products/${productId}`, productData);
    return res.data;
  },

  async deleteProduct(productId) {
    const res = await api.delete(`/admin/products/${productId}`);
    return res.data;
  },

  async getAdminOrders(status = '') {
    const res = await api.get('/admin/orders', { params: { status } });
    return res.data;
  },

  async updateOrderStatus(orderId, status) {
    const res = await api.put(`/admin/orders/${orderId}/status`, { status });
    return res.data;
  },

  async getAdminUsers() {
    const res = await api.get('/admin/users');
    return res.data;
  },

  async createCategory(categoryData) {
    const res = await api.post('/admin/categories', categoryData);
    return res.data;
  },

  async deleteCategory(categoryId) {
    const res = await api.delete(`/admin/categories/${categoryId}`);
    return res.data;
  },
};
