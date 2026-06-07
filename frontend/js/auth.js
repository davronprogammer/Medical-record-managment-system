import { authApi, ApiError } from "./api.js";
import { clearSession, getStoredUser, readSession, writeSession } from "./storage.js";

const getAppRootUrl = () => {
  const url = new URL(window.location.href);
  const pagesIndex = url.pathname.lastIndexOf("/pages/");

  if (pagesIndex !== -1) {
    url.pathname = url.pathname.slice(0, pagesIndex + 1);
  } else {
    url.pathname = url.pathname.slice(0, url.pathname.lastIndexOf("/") + 1);
  }

  url.search = "";
  url.hash = "";

  return url;
};

export const getLoginUrl = () => new URL("index.html", getAppRootUrl()).href;

export const getDashboardUrl = () => new URL("pages/dashboard.html", getAppRootUrl()).href;

export const getCurrentUser = () => getStoredUser();

export const isAuthenticated = () => Boolean(readSession()?.user);

const normalizeUser = (payload, username) => {
  if (payload?.user) {
    return payload.user;
  }

  if (payload?.id || payload?.username || payload?.role) {
    return payload;
  }

  return {
    username,
    role: payload?.role || "",
  };
};

const saveAuthPayload = (payload, username) => {
  const user = normalizeUser(payload, username);

  writeSession({
    token: payload?.token || "",
    user,
  });

  return user;
};

export const login = async (username, password) => {
  const payload = await authApi.login({ username, password });
  return saveAuthPayload(payload, username);
};

export const refreshSession = async () => {
  try {
    const payload = await authApi.me();
    const user = normalizeUser(payload);
    const current = readSession() || {};

    writeSession({
      ...current,
      user,
    });

    return user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearSession();
      return null;
    }

    throw error;
  }
};

export const requireAuth = async () => {
  const cachedUser = getCurrentUser();

  if (cachedUser) {
    return cachedUser;
  }

  const user = await refreshSession();

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  return user;
};

export const redirectIfAuthenticated = async () => {
  if (getCurrentUser()) {
    window.location.href = getDashboardUrl();
    return;
  }

  const user = await refreshSession();

  if (user) {
    window.location.href = getDashboardUrl();
  }
};

export const logout = async () => {
  try {
    await authApi.logout();
  } catch {
    // Local session is cleared even if the backend is temporarily unavailable.
  } finally {
    clearSession();
    window.location.href = getLoginUrl();
  }
};

window.addEventListener("mrms:logout", () => {
  logout();
});

window.addEventListener("mrms:unauthorized", () => {
  clearSession();

  if (!document.querySelector("#loginForm")) {
    window.location.href = getLoginUrl();
  }
});

const loginForm = document.querySelector("#loginForm");
const authMessage = document.querySelector("#authMessage");

const showInlineMessage = (message, type = "error") => {
  if (!authMessage) {
    return;
  }

  authMessage.textContent = message;
  authMessage.classList.toggle("is-success", type === "success");
};

const setButtonLoading = (button, isLoading) => {
  if (!button) {
    return;
  }

  const label = button.querySelector("span");
  button.disabled = isLoading;

  if (isLoading) {
    button.dataset.originalText = label.textContent;
    label.textContent = "Tekshirilmoqda...";
    return;
  }

  label.textContent = button.dataset.originalText || "Kirish";
};

if (loginForm) {
  redirectIfAuthenticated();

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = loginForm.querySelector(".auth-submit");
    const formData = new FormData(loginForm);
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "").trim();

    if (!username || !password) {
      showInlineMessage("Foydalanuvchi nomi va parolni kiriting.");
      return;
    }

    setButtonLoading(submitButton, true);
    showInlineMessage("");

    try {
      await login(username, password);
      showInlineMessage("Kirish muvaffaqiyatli bajarildi.", "success");
      window.location.href = getDashboardUrl();
    } catch (error) {
      showInlineMessage(error.message || "Foydalanuvchi nomi yoki parol noto'g'ri.");
    } finally {
      setButtonLoading(submitButton, false);
    }
  });
}
