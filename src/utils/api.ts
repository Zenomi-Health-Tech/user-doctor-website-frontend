// @/utils/api.ts
import axios, { AxiosError, AxiosRequestHeaders, InternalAxiosRequestConfig } from "axios";
import { getAuthCookies, clearAuthCookies } from "./cookies";

const api = axios.create({
  baseURL: "https://zenomi.elitceler.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add the bearer token to headers
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const user = getAuthCookies();
    const token = user?.token;

    if (token) {
      (config.headers as AxiosRequestHeaders)["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle expired tokens
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAuthCookies();
      window.location.href = "/chooserole";
    }
    return Promise.reject(error);
  }
);

export default api;
