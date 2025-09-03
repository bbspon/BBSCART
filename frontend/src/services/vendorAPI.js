// src/services/vendorAPI.js
import API from "../utils/api";
import axios from "axios";
// side: "aadhaar_front" | "aadhaar_back"
export const ocrDocument = (file, side) => {
  const fd = new FormData();
  fd.append("document", file);
  return axios.post(
    `${import.meta.env.VITE_API_URL}/api/vendors/ocr?side=${encodeURIComponent(side || "")}`,
    fd,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
};

export const saveVendorStep = (vendorId, payload) =>
  axios.patch(`${import.meta.env.VITE_API_URL}/api/vendors/${vendorId}/step`, payload);
