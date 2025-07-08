// @/utils/api.ts
import axios, { AxiosError, AxiosRequestHeaders, InternalAxiosRequestConfig } from "axios";
import { getAuthCookies } from "./cookies";

const api = axios.create({
  baseURL: "https://apizenomiotp.zenomihealth.com/api/v1",
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

export default api;
