import api from "../utils/axios";

export const getUserOrders = async (userId) => {
  const response = await api.get(`/order/user/${userId}`);
  return response.data.data || [];
};
