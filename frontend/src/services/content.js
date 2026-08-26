import api from './api';

export const getContent = async (id) => {
  const response = await api.get(`/content/${id}`);
  return response.data;
};

export const getContentList = async (filters = {}) => {
  const response = await api.get('/content', { params: filters });
  return response.data;
};

export const uploadContent = async (formData) => {
  const response = await api.post('/content/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateContent = async (id, contentData) => {
  const response = await api.put(`/content/${id}`, contentData);
  return response.data;
};

export const deleteContent = async (id) => {
  const response = await api.delete(`/content/${id}`);
  return response.data;
};

export const likeContent = async (id) => {
  const response = await api.post(`/content/${id}/like`);
  return response.data;
};

export const saveContent = async (id) => {
  const response = await api.post(`/content/${id}/save`);
  return response.data;
};

export const addComment = async (id, comment) => {
  const response = await api.post(`/content/${id}/comments`, { comment });
  return response.data;
};