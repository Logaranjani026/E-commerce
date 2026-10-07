import api from './api';

export const orderService = {
  async createOrder(orderData) {
    const res = await api.post('/orders', orderData);
    return res.data;
  },

  async getOrders() {
    const res = await api.get('/orders');
    return res.data;
  },

  async getOrderDetail(orderIdOrNumber) {
    const res = await api.get(`/orders/${orderIdOrNumber}`);
    return res.data;
  },

  async cancelOrder(orderId) {
    const res = await api.put(`/orders/${orderId}/cancel`);
    return res.data;
  },

  async getAddresses() {
    const res = await api.get('/orders/addresses');
    return res.data;
  },

  async addAddress(addressData) {
    const res = await api.post('/orders/addresses', addressData);
    return res.data;
  },

  async deleteAddress(addressId) {
    const res = await api.delete(`/orders/addresses/${addressId}`);
    return res.data;
  },
};
