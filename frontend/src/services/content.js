import { api } from './api';


export const getContent = async (id) => {
  return api.content(id);
};

export const getContentList = async (filters = {}) => {
  return api.contentList(filters);
};

// ✅ With progress callback
export const uploadContent = async (formData, onProgress) => {
  if (onProgress) onProgress(0);
  const result = await api.uploadContent(formData);
  if (onProgress) onProgress(100);
  return result;
};

export const updateContent = async (id, contentData) => {
  return api.updateContent(id, contentData);
};

export const deleteContent = async (id) => {
  return api.deleteContent(id);
};

export const likeContent = async (id) => {
  return api.likeContent(id);
};

export const saveContent = async (id) => {
  return api.saveContent(id);
};

export const addComment = async (id, comment) => {
  return api.addComment(id, comment);
};

export const getComments = async (id, skip = 0, limit = 20) => api.getComments(id, skip, limit);
export const deleteComment = async (commentId) => api.deleteComment(commentId);
export const trackShare = async (id, platform = null) => api.trackShare(id, platform);
export const trackDownload = async (id) => api.trackDownload(id);
