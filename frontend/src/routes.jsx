import React from 'react';

export const ROUTES = {
  HOME: '/',
  EXPLORE: '/explore',
  SEARCH: '/search',
  CHANNELS: '/channels',
  CHANNEL_DETAIL: '/channel/:id',
  CONTENT_DETAIL: '/content/:id',
  CREATE_CHANNEL: '/channel/create',
  AI_ASSISTANT: '/ai-assistant',
  SHORTS: '/shorts',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_OTP: '/verify-otp',
  PROFILE: '/profile',
  PROFILE_USER: '/profile/:id',
  SETTINGS: '/settings',
  CONTRIBUTE: '/contribute',
  APPLY_CONTRIBUTOR: '/apply-contributor',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_CHANNELS: '/admin/channels',
  ADMIN_MODERATION: '/admin/moderation'
};

export const PROTECTED_ROUTES = [
  ROUTES.PROFILE,
  ROUTES.SETTINGS,
  ROUTES.CONTRIBUTE
];

export const ADMIN_ROUTES = [
  ROUTES.ADMIN,
  ROUTES.ADMIN_USERS,
  ROUTES.ADMIN_CHANNELS,
  ROUTES.ADMIN_MODERATION
];