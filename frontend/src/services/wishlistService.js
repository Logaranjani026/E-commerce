import api from './api';

export const wishlistService = {
  async getWishlist() {
    const res = await api.get('/wishlist');
    return res.data;
  },

  async toggleWishlist(productId) {
    const res = await api.post('/wishlist/toggle', { product_id: productId });
    return res.data;
  },

  async removeItem(productId) {
    const res = await api.delete(`/wishlist/${productId}`);
    return res.data;
  },

  async moveToCart(productId) {
    const res = await api.post(`/wishlist/${productId}/move-to-cart`);
    return res.data;
  },
};
