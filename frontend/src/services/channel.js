import { api } from './api';

export const getChannels = async () => {
  return api.channels();
};

export const getChannel = async (id) => {
  return api.channel(id);
};

export const createChannel = async (channelData) => {
  return api.createChannel(channelData);
};

export const updateChannel = async (id, channelData) => {
  return api.updateChannel(id, channelData);
};

export const getChannelContributors = async (id) => {
  return api.channelContributors(id);
};

export const addChannelContributor = async (id, userId) => {
  return api.addChannelContributor(id, userId);
};

export const removeChannelContributor = async (channelId, userId) => {
  return api.removeChannelContributor(channelId, userId);
};