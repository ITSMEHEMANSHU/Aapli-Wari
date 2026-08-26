export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateName = (name) => {
  return name.trim().length >= 2;
};

export const validatePhone = (phone) => {
  const regex = /^[0-9]{10}$/;
  return regex.test(phone);
};

export const validateOTP = (otp) => {
  const regex = /^[0-9]{6}$/;
  return regex.test(otp);
};

export const validateContentTitle = (title) => {
  return title.trim().length >= 3 && title.trim().length <= 100;
};

export const validateContentDescription = (description) => {
  return description.trim().length >= 10 && description.trim().length <= 1000;
};

export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};