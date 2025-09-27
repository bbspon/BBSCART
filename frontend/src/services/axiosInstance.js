// axiosInstance.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") + "/api";

const instance = axios.create({
  baseURL: API_URL,
  timeout: 45000,
  withCredentials: true, // needed if backend uses cookies
});

// If you use token-based auth, attach it here:
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token"); // adjust your key
  if (token && !config.headers?.Authorization) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Always attach X-Pincode (prefer LocalStorage, fallback to cookie) + X-Guest-Key
instance.interceptors.request.use((config) => {
  // --- Pincode: LS first (deliveryPincode -> bbs_pincode -> pincode), then cookie fallback ---
  let pin = "";
  try {
    pin =
      localStorage.getItem("deliveryPincode") ||
      localStorage.getItem("bbs_pincode") ||
      localStorage.getItem("pincode") ||
      "";
  } catch {
    // ignore
  }
  if (!pin && typeof document !== "undefined") {
    const m = document.cookie.match(/(?:^|;\s*)pincode=([^;]+)/);
    if (m) pin = decodeURIComponent(m[1]);
  }

  // Ensure headers object exists
  config.headers = config.headers || {};

  if (pin) {
    // Header is the single source of truth for the backend
    config.headers["X-Pincode"] = pin;
  }

  // Never leak ?pincode=... in query params (header should drive vendor assignment)
  if (
    config.params &&
    Object.prototype.hasOwnProperty.call(config.params, "pincode")
  ) {
    delete config.params.pincode;
  }

  // --- Guest key to de-duplicate anonymous sessions ---
  let gk = "";
  try {
    gk = localStorage.getItem("guestKey") || "";
    if (!gk) {
      gk =
        (crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) +
        Date.now().toString(36);
      localStorage.setItem("guestKey", gk);
    }
  } catch {
    // ignore
  }
  config.headers["X-Guest-Key"] = gk;

  return config;
});

export default instance;
