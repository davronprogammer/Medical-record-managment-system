import { API_BASE_URL, API_PREFIX } from "./config/config.js";
import { getStoredToken } from "./storage.js";

export class ApiError extends Error {
  constructor(message, { status, payload } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const buildUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${API_PREFIX}${normalizedPath}`;
};

const normalizePayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "data")) {
    return payload.data;
  }

  return payload;
};

export const apiRequest = async (path, options = {}) => {
  const { body, headers = {}, ...requestOptions } = options;
  const token = getStoredToken();

  const response = await fetch(buildUrl(path), {
    ...requestOptions,
    credentials: "include",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let payload = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { message: text || "Server JSON formatida javob qaytarmadi." };
  }

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent("mrms:unauthorized"));
    }

    throw new ApiError(payload?.message || "Server bilan aloqa vaqtida xatolik yuz berdi.", {
      status: response.status,
      payload,
    });
  }

  return normalizePayload(payload);
};

export const authApi = {
  login: (credentials) => apiRequest("/auth/login", { method: "POST", body: credentials }),
  logout: () => apiRequest("/auth/logout", { method: "POST" }),
  me: () => apiRequest("/auth/me"),
};

export const departmentsApi = {
  list: () => apiRequest("/departments"),
  get: (id) => apiRequest(`/departments/${id}`),
  create: (payload) => apiRequest("/departments", { method: "POST", body: payload }),
  update: (id, payload) => apiRequest(`/departments/${id}`, { method: "PUT", body: payload }),
  remove: (id) => apiRequest(`/departments/${id}`, { method: "DELETE" }),
};

export const doctorsApi = {
  list: () => apiRequest("/doctors"),
  search: (name) => apiRequest(`/doctors/search?name=${encodeURIComponent(name)}`),
  filterByDepartment: (departmentId) => apiRequest(`/doctors/filter?departmentId=${encodeURIComponent(departmentId)}`),
  get: (id) => apiRequest(`/doctors/${id}`),
  create: (payload) => apiRequest("/doctors", { method: "POST", body: payload }),
  update: (id, payload) => apiRequest(`/doctors/${id}`, { method: "PUT", body: payload }),
  remove: (id) => apiRequest(`/doctors/${id}`, { method: "DELETE" }),
};

export const patientsApi = {
  list: () => apiRequest("/patients"),
  search: (name) => apiRequest(`/patients/search?name=${encodeURIComponent(name)}`),
  get: (id) => apiRequest(`/patients/${id}`),
  profile: (id) => apiRequest(`/patients/${id}/profile`),
  create: (payload) => apiRequest("/patients", { method: "POST", body: payload }),
  update: (id, payload) => apiRequest(`/patients/${id}`, { method: "PUT", body: payload }),
  remove: (id) => apiRequest(`/patients/${id}`, { method: "DELETE" }),
};

export const diseasesApi = {
  list: () => apiRequest("/diseases"),
  search: (keyword) => apiRequest(`/diseases/search?keyword=${encodeURIComponent(keyword)}`),
  get: (id) => apiRequest(`/diseases/${id}`),
  create: (payload) => apiRequest("/diseases", { method: "POST", body: payload }),
  update: (id, payload) => apiRequest(`/diseases/${id}`, { method: "PUT", body: payload }),
  remove: (id) => apiRequest(`/diseases/${id}`, { method: "DELETE" }),
};

export const dashboardApi = {
  stats: () => apiRequest("/dashboard/stats"),
  recentPatients: () => apiRequest("/dashboard/recent-patients"),
  recentDiseases: () => apiRequest("/dashboard/recent-diseases"),
};
