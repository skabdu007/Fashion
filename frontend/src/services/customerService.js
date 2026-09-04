import api from "../utils/axios";

export const getBankAccount = async (userId) => {
  const response = await api.get(`/customer/${userId}/bank-account`);
  return response.data.data || {};
};

export const saveBankAccount = async (userId, payload) => {
  const response = await api.put(`/customer/${userId}/bank-account`, payload);
  return response.data.data || {};
};
