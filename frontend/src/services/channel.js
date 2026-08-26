import api from './api';

export const getChannels = async (filters = {}) => {
  const response = await api.get('/channels', { params: filters });
  return response.data;
};

export const getChannel = async (id) => {
  const response = await api.get(`/channels/${id}`);
  return response.data;
};

export const createChannel = async (channelData) => {
  const response = await api.post('/channels', channelData);
  return response.data;
};

export const updateChannel = async (id, channelData) => {
  const response = await api.put(`/channels/${id}`, channelData);
  return response.data;
};

export const deleteChannel = async (id) => {
  const response = await api.delete(`/channels/${id}`);
  return response.data;
};

export const followChannel = async (id) => {
  const response = await api.post(`/channels/${id}/follow`);
  return response.data;
};

export const unfollowChannel = async (id) => {
  const response = await api.delete(`/channels/${id}/follow`);
  return response.data;
};