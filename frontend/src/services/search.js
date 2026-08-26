import api from './api';

export const searchAll = async (query, filters = {}) => {
  const response = await api.get('/search', {
    params: { q: query, ...filters }
  });
  return response.data;
};

export const searchChannels = async (query) => {
  const response = await api.get('/search/channels', { params: { q: query } });
  return response.data;
};

export const searchContent = async (query, filters = {}) => {
  const response = await api.get('/search/content', {
    params: { q: query, ...filters }
  });
  return response.data;
};

export const getAIAnswer = async (question) => {
  const response = await api.post('/search/ai', { question });
  return response.data;
};