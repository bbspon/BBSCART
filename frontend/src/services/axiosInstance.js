import axios from "axios";
import { getGuestKey, ensureGuestKey } from "../utils/guestKey";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/",
  withCredentials: true,
});
// If you use token-based auth, attach it here:
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token"); // adjust your key
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// axiosInstance.js (interceptor)
instance.interceptors.request.use((config) => {
  const pin =
    localStorage.getItem("deliveryPincode") ||
    localStorage.getItem("bbs_pincode") ||
    localStorage.getItem("pincode") ||
    "";

  if (pin) {
    config.headers["X-Pincode"] = pin;
    config.params = { ...(config.params || {}), pincode: config.params?.pincode ?? pin };
  }

  let gk = localStorage.getItem("guestKey");
  if (!gk) {
    gk = (crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) + Date.now().toString(36);
    localStorage.setItem("guestKey", gk);
  }
  config.headers["X-Guest-Key"] = gk;

  return config;
});


export default instance;
