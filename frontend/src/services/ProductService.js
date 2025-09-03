import api from "../utils/api";
const BASE_PRODUCTS_URL = "/products";
const BASE_CATEGORIES_URL = "/categories";
const BASE_SUBCATEGORIES_URL = "/subcategories";
const BASE_VARIANTS_URL = "/variants";
const PAYMENT_VERIFY_URL = "/verify-payment";

export const ProductService = {
  // Products
  async getProducts() {
    try {
      const response = await api.get(BASE_PRODUCTS_URL);
      console.log("Fetched Products:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getProducts:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch products.");
    }
  },

  async getProductsNearbySeller() {
    try {
      const response = await api.get(`${BASE_PRODUCTS_URL}/nearbyseller`);
      console.log("Fetched Products:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getProductsNearbySeller:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch products.");
    }
  },

  async getProductID(id) {
      try {
        const response = await api.get(`${BASE_PRODUCTS_URL}/${id}`);
        console.log("Fetched Product:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error in getProductID:", error);
        throw new Error(error.response?.data?.message || "Failed to fetch product.");
      }
  },

  async getProductsSellerID(id) {
    try {
      const response = await api.get(`${BASE_PRODUCTS_URL}/seller/${id}`);
      console.log("Fetched Product:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getProductID:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch product.");
    }
  },

  async getProductCategoryID(id) {
    try {
      const response = await api.get(`${BASE_PRODUCTS_URL}/category/${id}`);
      console.log("Fetched Product:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getProductID:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch product.");
    }
  },

  async getProductSubCategoryID(id) {
    try {
      const response = await api.get(`${BASE_PRODUCTS_URL}/subcategory/${id}`);
      console.log("Fetched SubCategory Product:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getProductSubCategoryID:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch product.");
    }
  },

  async getProductTags() {
    try {
      const response = await api.get(`${BASE_PRODUCTS_URL}/tags`);
      console.log("Fetched Product Based Tags:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getProductID:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch product.");
    }
  },

  async getProductFilter(filters) {
    try {
      const queryParams = new URLSearchParams();

      if (filters.categories.length) {
        queryParams.append("categories", filters.categories.join(","));
      }
      if (filters.subcategories.length) {
        queryParams.append("subcategories", filters.subcategories.join(","));
      }
      if (filters.colors.length) {
        queryParams.append("colors", filters.colors.join(","));
      }
      if (filters.tags.length) {
        queryParams.append("tags", filters.tags.join(","));
      }
      if (filters.priceRange) {
        queryParams.append("minPrice", filters.priceRange.min);
        queryParams.append("maxPrice", filters.priceRange.max);
      }
  
      const response = await api.get(`${BASE_PRODUCTS_URL}/filter?${queryParams.toString()}`);
      console.log("Filtered Products:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch products.");
    }
  },

  async createProduct(product) {
    try {
      const response = await api.post(BASE_PRODUCTS_URL, product, {
        headers: {
          "Content-Type": "multipart/form-data", // Required for file uploads
        },
      });

      console.log("Created Product:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in createProduct:", error);
      throw new Error(error.response?.data?.message || "Failed to create product.");
    }
  },

  async updateProduct(productId, productData) {
    try {
      const response = await api.put(`${BASE_PRODUCTS_URL}/${productId}`, productData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Updated Product:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in updateProduct:", error);
      throw new Error(error.response?.data?.message || "Failed to update product.");
    }
  },

  async deleteProduct(productId) {
    try {
      const response = await api.delete(`${BASE_PRODUCTS_URL}/${productId}`);
      console.log("Deleted Product:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in deleteProduct:", error);
      throw new Error(error.response?.data?.message || "Failed to delete product.");
    }
  },

  async exportProducts() {
    try {
      const response = await api.get(`${BASE_PRODUCTS_URL}/export`, {
        responseType: "blob",
      });
  
      const blob = new Blob([response.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "products_export.zip"); // Updated to .zip
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      // Optional: Revoke the object URL to free up memory
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  },  

  async importProducts(formData) {
    try {
      const response = await api.post(`${BASE_PRODUCTS_URL}/import`, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Required for file uploads
        },
      });
      console.log("importProducts", response);
      return response;
    } catch (error) {
      console.error("Error in importProducts:", error);
    }
  },

  // Categories
  async getCategories() {
    try {
      const response = await api.get(BASE_CATEGORIES_URL);
      console.log("Fetched Categorys:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getCategorys:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch Categorys.");
    }
  },

  async getCategoriesNearbySeller() {
    try {
      const response = await api.get(`${BASE_CATEGORIES_URL}/nearbyseller`);
      console.log("Fetched Categories:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getCategoriesNearbySeller:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch Categorys.");
    }
  },

  async getCategoryID(id) {
      try {
        const response = await api.get(`${BASE_CATEGORIES_URL}/${id}`);
        console.log("Fetched category:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error in getCategoryID:", error);
        throw new Error(error.response?.data?.message || "Failed to fetch category.");
      }
  },

  async getCategorySellerID(id) {
    try {
      const response = await api.get(`${BASE_CATEGORIES_URL}/seller/${id}`);
      console.log("Fetched Product:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getProductID:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch product.");
    }
  },

  async createCategory(category) {
    try {
      const response = await api.post(BASE_CATEGORIES_URL, category, {
        headers: {
          "Content-Type": "application/json", // Required for file uploads
        },
      });

      console.log("Created category:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in createCategory:", error);
      throw new Error(error.response?.data?.message || "Failed to create category.");
    }
  },

  async updateCategory(categoryId, categoryData) {
    try {
      const response = await api.put(`${BASE_CATEGORIES_URL}/${categoryId}`, categoryData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Updated category:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in updateCategory:", error);
      throw new Error(error.response?.data?.message || "Failed to update category.");
    }
  },

  async deleteCategory(categoryId) {
    try {
      const response = await api.delete(`${BASE_CATEGORIES_URL}/${categoryId}`);
      console.log("Deleted category:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in deleteCategory:", error);
      throw new Error(error.response?.data?.message || "Failed to delete category.");
    }
  },
  // SubCategories
  async getSubCategories() {
    try {
      const response = await api.get(BASE_SUBCATEGORIES_URL);
      console.log("Fetched SubCategorys:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getCategorys:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch Categorys.");
    }
  },

  async getSubCategoryID(id) {
      try {
        const response = await api.get(`${BASE_SUBCATEGORIES_URL}/${id}`);
        console.log("Fetched SubCategory:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error in getSubCategoryID:", error);
        throw new Error(error.response?.data?.message || "Failed to fetch SubCategory.");
      }
  },  

  async getSubCategorySellerID(id) {
    try {
      const response = await api.get(`${BASE_SUBCATEGORIES_URL}/seller/${id}`);
      console.log("Fetched SubCategory By SellerId:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getSubCategorySellerID:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch getSubCategorySellerID.");
    }
  },

  async createSubCategory(subcategory) {
    try {
      const response = await api.post(BASE_SUBCATEGORIES_URL, subcategory, {
        headers: {
          "Content-Type": "application/json", // Required for file uploads
        },
      });

      console.log("Created SubCategory:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in createSubCategory:", error);
      throw new Error(error.response?.data?.message || "Failed to create subcategory.");
    }
  },

  async updateSubCategory(subcategoryId, subcategoryData) {
    try {
      const response = await api.put(`${BASE_SUBCATEGORIES_URL}/${subcategoryId}`, subcategoryData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Updated SubCategory:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in updateSubCategory:", error);
      throw new Error(error.response?.data?.message || "Failed to update SubCategory.");
    }
  },

  async deleteSubCategory(subcategoryId) {
    try {
      const response = await api.delete(`${BASE_SUBCATEGORIES_URL}/${subcategoryId}`);
      console.log("Deleted SubCategory:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in deleteSubCategory:", error);
      throw new Error(error.response?.data?.message || "Failed to delete SubCategory.");
    }
  },
  // Variants
  // SubCategories
  async getVariants() {
    try {
      const response = await api.get(BASE_VARIANTS_URL);
      console.log("Fetched Variant:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getVariants:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch Variant.");
    }
  },

  async getVariantID(id) {
      try {
        const response = await api.get(`${BASE_VARIANTS_URL}/${id}`);
        console.log("Fetched Variant:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error in getVariantID:", error);
        throw new Error(error.response?.data?.message || "Failed to fetch Variant.");
      }
  },

  async getVariantByProductID(id) {
    try {
      const response = await api.get(`${BASE_VARIANTS_URL}/product/${id}`);
      console.log("Fetched Variant:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in VariantByProductID:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch SubCategory.");
    }
  },
  // Verify Payment
  async verifyPayment(paymentData) {
    try {
      const response = await api.post(PAYMENT_VERIFY_URL, paymentData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Created Product:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in createProduct:", error);
      throw new Error(error.response?.data?.message || "Failed to create product.");
    }
  },
};
