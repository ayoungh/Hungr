import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

axios.defaults.baseURL = baseURL;
axios.defaults.headers.common["Content-Type"] = "application/json";

export const apiBaseUrl = baseURL;

export const authHeader = (token?: string | null) =>
  token ? { Authorization: `Bearer ${token}` } : {};
