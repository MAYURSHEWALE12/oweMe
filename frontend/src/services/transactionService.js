import api from './api';

export const getCustomerTransactions = async (customerId, params) => {
  const response = await api.get(`/transactions/customer/${customerId}`, { params });
  return response.data;
};

export const giveCredit = async (data) => {
  const response = await api.post('/transactions/credit', data);
  return response.data;
};

export const receivePayment = async (data) => {
  const response = await api.post('/transactions/payment', data);
  return response.data;
};

export const getRecentTransactions = async (params) => {
  const response = await api.get('/transactions/recent', { params });
  return response.data;
};

export const updateTransaction = async (id, data) => {
  const response = await api.put(`/transactions/${id}`, data);
  return response.data;
};

export const deleteTransaction = async (id) => {
  await api.delete(`/transactions/${id}`);
};