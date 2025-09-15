import instance from "../services/axiosInstance"; // or correct path

export const importSubcategoriesCSV = async (file) => {
  const form = new FormData();
  form.append("file", file);
  const res = await instance.post(
    `${import.meta.env.VITE_API_URL}/api/subcategories/import`,
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return res.data;
};

export const exportSubcategoriesCSV = () => {
  return instance.get(
    `${import.meta.env.VITE_API_URL}/api/subcategories/export`,
    { responseType: "blob" }
  );
};

export const downloadSubcategoryRowCSV = (idOrKey) => {
  return instance.get(
    `${import.meta.env.VITE_API_URL}/api/subcategories/download/${idOrKey}`,
    {
      responseType: "blob",
    }
  );
};
