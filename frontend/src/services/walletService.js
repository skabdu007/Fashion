import api from "../utils/axios";

export const getWallet = async (userId) => {
  const response = await api.get(`/wallet/${userId}`);
  return response.data.data;
};

export const getWalletHistory = async (userId) => {
  const response = await api.get(`/wallet/history/${userId}`);
  return response.data.data || [];
};

export const addMoneyToWallet = async (payload) => {
  const response = await api.post("/wallet/add-money", payload);
  return response.data.data;
};

export const buyWalletChips = async (payload) => {
  const response = await api.post("/wallet/buy-chips", payload);
  return response.data.data;
};
