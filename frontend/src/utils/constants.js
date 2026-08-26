export const CONTENT_TYPES = {
  VIDEO: 'video',
  IMAGE: 'image',
  AUDIO: 'audio',
  PDF: 'pdf',
  MANUSCRIPT: 'manuscript',
  STORY: 'story'
};

export const LANGUAGES = {
  EN: 'en',
  MR: 'mr',
  HI: 'hi'
};

export const ROLES = {
  USER: 'user',
  CONTRIBUTOR: 'contributor',
  PRAMUKH: 'pramukh',
  ADMIN: 'admin'
};

export const CHANNEL_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
};

export const CONTENT_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FLAGGED: 'flagged'
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_OTP: '/auth/verify-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me'
  },
  CHANNELS: {
    BASE: '/channels',
    FOLLOW: (id) => `/channels/${id}/follow`
  },
  CONTENT: {
    BASE: '/content',
    UPLOAD: '/content/upload',
    LIKE: (id) => `/content/${id}/like`,
    SAVE: (id) => `/content/${id}/save`,
    COMMENTS: (id) => `/content/${id}/comments`
  },
  SEARCH: {
    BASE: '/search',
    AI: '/search/ai'
  }
};