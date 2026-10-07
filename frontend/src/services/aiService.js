import api from './api';

export const aiService = {
  async askAIAssistant(query, limit = 6) {
    const res = await api.post('/ai/recommend', { query, limit });
    return res.data;
  },

  async compareProductsAI(productIds) {
    const res = await api.post('/ai/compare', { product_ids: productIds });
    return res.data;
  },

  async getWhyThisProduct(productId) {
    const res = await api.get(`/ai/why-this/${productId}`);
    return res.data;
  },

  async getPersonalizedRecommendations(limit = 8) {
    const res = await api.get('/ai/personalized', { params: { limit } });
    return res.data;
  },

  async trackActivity(activityData) {
    try {
      const res = await api.post('/ai/activity', activityData);
      return res.data;
    } catch {
      // Activity logging is non-blocking
      return null;
    }
  },
};
