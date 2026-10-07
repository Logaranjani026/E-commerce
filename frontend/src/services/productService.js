import api from './api';

export const productService = {
  async getProducts(params = {}) {
    const res = await api.get('/products', { params });
    return res.data;
  },

  async getProductById(id) {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  async getProductBySlug(slug) {
    const res = await api.get(`/products/slug/${slug}`);
    return res.data;
  },

  async getCategories() {
    const res = await api.get('/products/categories');
    return res.data;
  },

  async getBrands() {
    const res = await api.get('/products/brands');
    return res.data;
  },

  async getFeatured() {
    const res = await api.get('/products/featured');
    return res.data;
  },

  async getTrending() {
    const res = await api.get('/products/trending');
    return res.data;
  },

  async addReview(productId, reviewData) {
    const res = await api.post(`/products/${productId}/reviews`, reviewData);
    return res.data;
  },
};
