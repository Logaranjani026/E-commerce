import api from './api';

export const cartService = {
  async getCart() {
    const res = await api.get('/cart');
    return res.data;
  },

  async addToCart(productId, quantity = 1) {
    const res = await api.post('/cart/items', { product_id: productId, quantity });
    return res.data;
  },

  async updateItem(itemId, quantity) {
    const res = await api.put(`/cart/items/${itemId}`, { quantity });
    return res.data;
  },

  async removeItem(itemId) {
    const res = await api.delete(`/cart/items/${itemId}`);
    return res.data;
  },

  async clearCart() {
    const res = await api.delete('/cart/clear');
    return res.data;
  },
};
