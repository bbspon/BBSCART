// src/services/geoApi.js
import instance from "./axiosInstance";
export async function assignVendor(pincode, customerId) {
  const { data } = await instance.post(
    `/geo/assign`,
    { pincode, customerId }
  );
  return data; // { vendorId, pincode, dateKey, expiresAt }
}
