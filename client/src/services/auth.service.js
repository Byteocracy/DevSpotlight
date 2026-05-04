const TOKEN_KEY = "devspotlight_token";
const USER_KEY = "devspotlight_user";

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = () => {
  const rawUser = localStorage.getItem(USER_KEY);
  return rawUser ? JSON.parse(rawUser) : null;
};

export const persistSession = ({ token, user }) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
