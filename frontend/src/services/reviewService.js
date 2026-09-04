import api from "../utils/axios";

export const getProductReviews = async (productId) => {
  const response = await api.get(`/reviews/${productId}`);
  return response.data.data || [];
};

export const createProductReview = async (payload) => {
  const response = await api.post("/reviews", payload);
  return response.data.data;
};
