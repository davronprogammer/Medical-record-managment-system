const SESSION_KEY = "mrms.session";

export const readSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
};

export const writeSession = (session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getStoredToken = () => {
  return readSession()?.token || "";
};

export const getStoredUser = () => {
  return readSession()?.user || null;
};
