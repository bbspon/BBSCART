// frontend/src/services/categoryAPI.js
import instance from "../services/axiosInstance";

export const importCategoriesCSV = async (file) => {
  const form = new FormData();
  form.append("file", file);
  const res = await instance.post(`${import.meta.env.VITE_API_URL}/api/categories/import`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const exportCategoriesCSV = () => {
  return instance.get(`${import.meta.env.VITE_API_URL}/api/categories/export`, { responseType: "blob" });
};

export const downloadCategoryRowCSV = (idOrSlug) => {
  return instance.get(
    `${import.meta.env.VITE_API_URL}/categories/download/${idOrSlug}`,
    {
      responseType: "blob",
    }
  );
};
