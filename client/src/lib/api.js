import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/auth/login";
    }
    return Promise.reject(err);
  },
);

export const authAPI = {
  login: (nicId, password) => api.post("/auth/login", { nicId, password }),
  verifyOTP: (tempToken, otp) =>
    api.post("/auth/verify-otp", { tempToken, otp }),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  sendOTP: (purpose) => api.post("/auth/send-otp", { purpose }),
};

export const billsAPI = {
  getAll: (params) => api.get("/bills", { params }),
  getById: (id) => api.get(`/bills/${id}`),
  create: (data) => api.post("/bills", data),
  review: (id, data) => api.patch(`/bills/${id}/review`, data),
  sign: (id, data) => api.post(`/bills/${id}/sign`, data),
  disburse: (id) => api.post(`/bills/${id}/disburse`),
};

export const entitiesAPI = {
  getAll: (params) => api.get("/entities", { params }),
  getById: (id) => api.get(`/entities/${id}`),
  create: (data) => api.post("/entities", data),
  updateStatus: (id, isActive) =>
    api.patch(`/entities/${id}/status`, { isActive }),
};

export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
  getByState: () => api.get("/dashboard/by-state"),
};

export const auditAPI = {
  getLogs: (params) => api.get("/audit/logs", { params }),
  verifyChain: () => api.get("/audit/verify-chain"),
};

export const publicAPI = {
  getProjects: (params) => api.get("/public/projects", { params }),
};
