// frontend/src/services/categoryAPI.js
import instance from "../services/axiosInstance";

export const importCategoriesCSV = async (file) => {
  const form = new FormData();
  form.append("file", file);
  const res = await instance.post(`/api/categories/import`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const exportCategoriesCSV = () => {
  return instance.get(`/api/categories/export`, { responseType: "blob" });
};

export const downloadCategoryRowCSV = (idOrSlug) => {
  return instance.get(
    `/categories/download/${idOrSlug}`,
    {
      responseType: "blob",
    }
  );
};
