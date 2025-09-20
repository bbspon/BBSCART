// src/services/geoApi.js
import axios from "./axiosInstance"; // your configured Axios
import instance from "./axiosInstance";
export async function assignVendor(pincode, customerId) {
  const { data } = await instance.post(
    `/api/geo/assign`,
    { pincode, customerId }
  );
  return data; // { vendorId, pincode, dateKey, expiresAt }
}
