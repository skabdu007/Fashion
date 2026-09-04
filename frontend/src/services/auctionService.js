import api from "../utils/axios";

export const getAuctionProducts = async () => {
  const response = await api.get("/product");
  return response.data.data || [];
};

export const createAuctionRoom = async (payload) => {
  const response = await api.post("/auction/create-room", payload);
  return response.data;
};

export const getAuctionRooms = async () => {
  const response = await api.get("/auction/rooms");
  return response.data.data || [];
};
