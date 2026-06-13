import axios from "axios";

// Default to localhost:8080 for development, or the injected env var.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptors if needed (e.g. attaching ZK identity headers)
api.interceptors.request.use((config) => {
  return config;
});
