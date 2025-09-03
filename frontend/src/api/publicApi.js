// src/api/publicApi.js
import axios from "axios";
export const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  withCredentials: false,
});
