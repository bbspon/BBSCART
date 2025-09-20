// src/services/geoApi.js
import axios from "./axiosInstance"; // your configured Axios

export async function assignVendor(pincode, customerId) {
  const { data } = await axios.post(
    `${import.meta.env.VITE_API_URL}/api/geo/assign`,
    { pincode, customerId }
  );
  return data; // { vendorId, pincode, dateKey, expiresAt }
}
