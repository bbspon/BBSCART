import React, { useEffect, useState, useMemo, useRef } from "react";
import { NavLink } from "react-router-dom";
import "./assets/dashboard.css";
import Sidebar from "./layout/sidebar";
import Navbar from "./layout/Navbar";
import useDashboardLogic from "./hooks/useDashboardLogic";
import Modal from "react-modal";
import ProductForm from "./ProductForm";
import ImportProduct from "../layout/ImportProduct";
import toast from "react-hot-toast";

// Use the admin axios that does NOT add pincode, and adds Authorization if admin_token exists
import instance from "../../services/axiosInstance";

const Products = () => {
  const {
    isSidebarHidden,
    toggleSidebar,
    isSearchFormShown,
    toggleSearchForm,
    isDarkMode,
    toggleDarkMode,
    isNotificationMenuOpen,
    toggleNotificationMenu,
    isProfileMenuOpen,
    toggleProfileMenu,
  } = useDashboardLogic();

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // ---------- NEW: Import-All CSV UI state ----------
  const [iaDryRun, setIaDryRun] = useState(true); // dry run toggle
  const [iaMode, setIaMode] = useState("lenient"); // 'lenient' | 'strict'
  const [iaLoading, setIaLoading] = useState(false);
  const [iaResult, setIaResult] = useState(null);
  const importAllInputRef = useRef(null);
  // --------------------------------------------------

  // ---------- NEW: Import Products with Category Match UI state ----------
  const [cmDryRun, setCmDryRun] = useState(true);
  const [cmLoading, setCmLoading] = useState(false);
  const [cmResult, setCmResult] = useState(null);
  const categoryMatchInputRef = useRef(null);
  // --------------------------------------------------

  const catMap = useMemo(
    () => new Map(categories.map((c) => [String(c._id), c.name])),
    [categories]
  );
  const subMap = useMemo(
    () => new Map(subCategories.map((s) => [String(s._id), s.name])),
    [subCategories]
  );

  // helper to resolve either an object {_id, name} or a raw id
  const resolveName = (map, idOrObj) => {
    const id = idOrObj && typeof idOrObj === "object" ? idOrObj._id : idOrObj;
    return id ? map.get(String(id)) || "" : "";
  };

  // keep URL ?page=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get("page")) || 1;
    setCurrentPage(page);
  }, []);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", currentPage);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params}`
    );
  }, [currentPage]);

  const is24hex = (v) => /^[0-9a-fA-F]{24}$/.test(String(v || "").trim());

  const getSellerId = (p) => {
    const s = p?.seller_id;
    if (s && typeof s === "object" && s._id) return String(s._id); // populated
    if (is24hex(s)) return String(s); // raw ObjectId string
    if (is24hex(p?.vendor_id)) return String(p.vendor_id); // fallback, if present
    if (is24hex(p?.seller_user_id)) return String(p.seller_user_id); // fallback, if present
    return "";
  };

  // ------------ Data fetchers (admin, /api/..., no pincode) ------------
  const fetchCategories = async () => {
    try {
      const { data } = await instance.get("/categories");
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
      setErrorMessage("Failed to fetch categories.");
    }
  };

  const fetchSubCategories = async () => {
    try {
      const { data } = await instance.get("/subcategories");
      setSubCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching subCategories:", err);
      setSubCategories([]);
      setErrorMessage(
        err?.response?.data?.message || "Failed to fetch subCategories."
      );
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await instance.get("/products");
      // controller returns { products, filteredByVendor }
      const list = Array.isArray(data) ? data : data?.products || [];
      setProducts(list);
      setFilteredProducts(list);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
      setFilteredProducts([]);
      setErrorMessage(
        err?.response?.data?.message || "Failed to fetch products."
      );
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    const filterAndSort = () => {
      let filtered = products.filter((p) =>
        (p.name || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (sortConfig.key) {
        filtered.sort((a, b) => {
          const av = (a[sortConfig.key] ?? "").toString();
          const bv = (b[sortConfig.key] ?? "").toString();
          if (av < bv) return sortConfig.direction === "ascending" ? -1 : 1;
          if (av > bv) return sortConfig.direction === "ascending" ? 1 : -1;
          return 0;
        });
      }
      setFilteredProducts(filtered);
    };
    filterAndSort();
  }, [searchQuery, sortConfig, products]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  // real CSV export (text/csv)
  const handleExportCsv = async () => {
    try {
      const res = await instance.get(
        `${import.meta.env.VITE_API_URL}/api/products/export-csv`,
        {
          responseType: "blob",
        }
      );
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "products.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("CSV export failed");
    }
  };

  // CSV import (no images)
  const handleImportCsv = async (file) => {
    if (!file) {
      toast.error("Pick a CSV file");
      return;
    }
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await instance.post(
        `${import.meta.env.VITE_API_URL}/api/products/import-csv`,
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success(
        `Import done. Created: ${res.data.created}, Updated: ${res.data.updated}, Skipped: ${res.data.skipped}`
      );
      fetchProducts();
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "CSV import failed");
    }
  };

  // ------------ Import-All CSV (NEW) ------------
const handleImportAllCsv = async (file) => {
  if (!file) {
    toast.error("Pick a CSV file");
    return;
  }

  setIaResult(null);
  setIaLoading(true);

  const form = new FormData();
  form.append("file", file); // MUST MATCH multer field name

  try {
    const url = `${
      import.meta.env.VITE_API_URL
    }/api/products/import-all?dryRun=${
      iaDryRun ? "true" : "false"
    }&mode=${iaMode}`;

    const res = await instance.post(url, form); // <-- FIXED HERE

    setIaResult(res?.data || null);

    if (iaDryRun) {
      toast.success("Dry run OK. Review the stats below.");
    } else {
      toast.success("Import-all completed");
      fetchCategories();
      fetchSubCategories();
      fetchProducts();
    }
  } catch (e) {
    const msg = e?.response?.data?.error || e?.message || "Import-all failed";
    setIaResult(e?.response?.data || null);
    toast.error(msg);
  } finally {
    setIaLoading(false);
    if (importAllInputRef.current) importAllInputRef.current.value = "";
  }
};

  // ------------ Bulk Set is_global=true (NEW) ------------
  const [bulkUpdateLoading, setBulkUpdateLoading] = useState(false);
  const [bulkUpdateResult, setBulkUpdateResult] = useState(null);

  const handleBulkSetIsGlobal = async () => {
    setBulkUpdateLoading(true);
    setBulkUpdateResult(null);
    try {
      const response = await instance.post("/products/bulk-set-is-global");
      setBulkUpdateResult(response.data);
      toast.success(`Updated ${response.data.modified || 0} products to set is_global=true`);
    } catch (error) {
      const errorMsg = error?.response?.data?.error || error.message || "Failed to update products";
      setBulkUpdateResult({ ok: false, error: errorMsg });
      toast.error(errorMsg);
    } finally {
      setBulkUpdateLoading(false);
    }
  };

  // ------------ Import Products with Category Match (NEW) ------------
const handleImportWithCategoryMatch = async (file) => {
    if (!file) {
      toast.error("Pick a CSV file");
      return;
    }

    setCmResult(null);
    setCmLoading(true);

    const form = new FormData();
    form.append("file", file);

    try {
      const url = `${import.meta.env.VITE_API_URL}/api/products/import-with-category-match?dryRun=${
        cmDryRun ? "true" : "false"
      }`;

      const res = await instance.post(url, form);

      setCmResult(res?.data || null);

      if (cmDryRun) {
        toast.success("Dry run OK. Review the stats below.");
      } else {
        toast.success(`Updated ${res?.data?.updated || 0} products with category/subcategory IDs`);
        fetchProducts();
      }
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || "Import with category match failed";
      setCmResult(e?.response?.data || null);
      toast.error(msg);
    } finally {
      setCmLoading(false);
      if (categoryMatchInputRef.current) categoryMatchInputRef.current.value = "";
    }
  };
  // ----------------------------------------------

  // ------------ CRUD ------------
  const handleAddProduct = async (payload /* FormData from ProductForm */) => {
    try {
      if (editProduct) {
        const { data } = await instance.put(
          `${import.meta.env.VITE_API_URL}/api/products/${editProduct._id}`,
          payload,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        const updated = data?.product || data; // controller returns {message, product}
        setProducts((prev) =>
          prev.map((p) => (p._id === updated._id ? updated : p))
        );
        toast.success("Product updated successfully!");
      } else {
        // Products.jsx
        // create branch
        const { data } = await instance.post("/products", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setProducts((prev) => [...prev, data]); // ok if controller returns the product doc
        toast.success("Product created successfully!");
      }
      setIsAddEditModalOpen(false);
      setEditProduct(null);
      setErrorMessage("");
    } catch (err) {
      console.error("Error saving product:", err);
      setErrorMessage(
        err?.response?.data?.message ||
          err.message ||
          "Failed to save the product."
      );
      toast.error("Failed to save the product.");
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await instance.delete(`/products/${productToDelete._id}`);
      setProducts((prev) => prev.filter((p) => p._id !== productToDelete._id));
      setProductToDelete(null);
      setIsDeleteModalOpen(false);
      setErrorMessage("");
    } catch (err) {
      console.error("Error deleting product:", err);
      setErrorMessage(
        err?.response?.data?.message ||
          err.message ||
          "Failed to delete the product."
      );
    }
  };

  const handleEditProduct = (product) => {
    setEditProduct(product);
    setIsAddEditModalOpen(true);
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending")
      direction = "descending";
    setSortConfig({ key, direction });
  };

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleImport = async (file) => {
    if (!file) {
      toast.error("Please select a ZIP file first.");
      return false;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await instance.post("/products/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res?.status === 200) {
        toast.success("Import completed");
        fetchProducts();
        return res;
      }
      toast.error("Import failed");
      return res;
    } catch (e) {
      console.error("Import Error:", e);
      toast.error("Import failed");
      return false;
    }
  };

  const openAddProductModal = () => {
    setEditProduct(null);
    setIsAddEditModalOpen(true);
  };
  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };
  const openImportProductModal = () => setIsImportModalOpen(true);

  return (
    <>
      <link
        href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
        rel="stylesheet"
      />
      <div className={isDarkMode ? "dark" : ""}>
        <Sidebar
          isSidebarHidden={isSidebarHidden}
          toggleSidebar={toggleSidebar}
        />
        <section id="content">
          <Navbar
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            toggleSidebar={toggleSidebar}
            isSidebarHidden={isSidebarHidden}
            isNotificationMenuOpen={isNotificationMenuOpen}
            toggleNotificationMenu={toggleNotificationMenu}
            isProfileMenuOpen={isProfileMenuOpen}
            toggleProfileMenu={toggleProfileMenu}
            isSearchFormShown={isSearchFormShown}
            toggleSearchForm={toggleSearchForm}
          />
          <main>
            <div className="head-title">
              <div className="left">
                <h1>Products</h1>
                <ul className="breadcrumb">
                  <li>
                    <NavLink className="active" to="/admin/dashboard">
                      Dashboard
                    </NavLink>
                  </li>
                  <li>
                    <i className="bx bx-chevron-right" />
                  </li>
                  <li>
                    <a> Products </a>
                  </li>
                </ul>
              </div>

              {/* existing Export CSV */}
              <button onClick={handleExportCsv} className="btn-download">
                <i className="bx bxs-cloud-download bx-fade-down-hover" />
                <span className="text">Export CSV (no images)</span>
              </button>

              {/* existing Import CSV */}
              <label className="btn-import" style={{ cursor: "pointer" }}>
                <i className="bx bxs-cloud-upload bx-fade-down-hover" />
                <span className="text">Import CSV</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImportCsv(f);
                    e.target.value = "";
                  }}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            {/* NEW: Import-All CSV controls */}
            <div className="flex flex-col md:flex-row md:items-end gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
              <div className="flex-1">
                <div className="text-sm font-semibold mb-2">
                  Import CSV (All-in-One: Categories + Subcategories + Products)
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={iaMode}
                    onChange={(e) => setIaMode(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    title="Mode"
                  >
                    <option value="lenient">Lenient (skip bad rows)</option>
                    <option value="strict">
                      Strict (abort on first error)
                    </option>
                  </select>

                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={iaDryRun}
                      onChange={(e) => setIaDryRun(e.target.checked)}
                    />
                    Dry run (validate only)
                  </label>

                  <label
                    className={`btn-import ${
                      iaLoading ? "opacity-60 pointer-events-none" : ""
                    }`}
                    style={{ cursor: "pointer" }}
                    title="Choose CSV for Import-All"
                  >
                    <i className="bx bxs-cloud-upload bx-fade-down-hover" />
                    <span className="text">
                      {iaLoading ? "Uploading..." : "Import-All CSV"}
                    </span>
                    <input
                      ref={importAllInputRef}
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImportAllCsv(f);
                      }}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* NEW: Import Products with Category Match */}
            <div className="flex flex-col md:flex-row md:items-end gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
              <div className="flex-1">
                <div className="text-sm font-semibold mb-2">
                  Import Products CSV (Match to Existing Categories/Subcategories)
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Matches products to existing categories/subcategories by name from tags[0] column or categoryName/subcategoryName columns
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={cmDryRun}
                      onChange={(e) => setCmDryRun(e.target.checked)}
                    />
                    Dry run (validate only)
                  </label>

                  <label
                    className={`btn-import ${
                      cmLoading ? "opacity-60 pointer-events-none" : ""
                    }`}
                    style={{ cursor: "pointer" }}
                    title="Choose Products CSV for Category Match Import"
                  >
                    <i className="bx bxs-cloud-upload bx-fade-down-hover" />
                    <span className="text">
                      {cmLoading ? "Uploading..." : "Import Products (Category Match)"}
                    </span>
                    <input
                      ref={categoryMatchInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImportWithCategoryMatch(f);
                      }}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* NEW: Bulk Set is_global=true */}
            <div className="flex flex-col md:flex-row md:items-end gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 mb-4">
              <div className="flex-1">
                <div className="text-sm font-semibold mb-2 text-yellow-800 dark:text-yellow-200">
                  ⚠️ Fix: Set is_global=true for Products
                </div>
                <div className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
                  Sets is_global=true for all products that have subcategory_id set. This makes products visible in public listings.
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleBulkSetIsGlobal}
                    disabled={bulkUpdateLoading}
                    className={`btn-import ${
                      bulkUpdateLoading ? "opacity-60 pointer-events-none" : ""
                    }`}
                    style={{ cursor: bulkUpdateLoading ? "not-allowed" : "pointer" }}
                    title="Set is_global=true for all products with subcategory_id"
                  >
                    <i className="bx bx-check-circle bx-fade-down-hover" />
                    <span className="text">
                      {bulkUpdateLoading ? "Updating..." : "Set is_global=true for Products"}
                    </span>
                  </button>
                  {bulkUpdateResult && (
                    <div className={`text-sm ${bulkUpdateResult.ok ? "text-green-600" : "text-red-600"}`}>
                      {bulkUpdateResult.ok ? (
                        <>✅ Updated {bulkUpdateResult.modified || 0} products</>
                      ) : (
                        <>❌ Error: {bulkUpdateResult.error}</>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* NEW: Import-All result preview */}
            {iaResult && (
              <div className="mb-4">
                <div className="overflow-auto rounded-xl shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontSize: 12,
                      margin: 0,
                    }}
                  >
                    {JSON.stringify(iaResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* NEW: Category Match result preview */}
            {cmResult && (
              <div className="mb-4">
                <div className="overflow-auto rounded-xl shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontSize: 12,
                      margin: 0,
                    }}
                  >
                    {JSON.stringify(cmResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="container mx-auto p-4">
              {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <strong>Error:</strong> {errorMessage}
                </div>
              )}

              <Modal
                isOpen={isAddEditModalOpen}
                onRequestClose={() => setIsAddEditModalOpen(false)}
                contentLabel="Product Form"
                className="modal-content"
                overlayClassName="modal-overlay"
              >
                <ProductForm
                  product={editProduct}
                  categories={categories}
                  subCategories={subCategories}
                  setIsAddEditModalOpen={setIsAddEditModalOpen}
                  onSave={handleAddProduct}
                />
              </Modal>

              <Modal
                isOpen={isDeleteModalOpen}
                onRequestClose={() => setIsDeleteModalOpen(false)}
                contentLabel="Confirm Deletion"
                className="modal-content"
                overlayClassName="modal-overlay"
              >
                <div className="p-0 bg-transparent flex items-center justify-center min-h-[300px]">
                  <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full p-8 flex flex-col items-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                      <i className="bx bx-trash text-4xl text-red-500"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                      Delete Product?
                    </h3>
                    <p className="text-gray-600 text-center mb-6">
                      Are you sure you want to delete this product?
                      <br />
                      This action cannot be undone.
                    </p>
                    <div className="flex gap-3 w-full justify-center">
                      <button
                        onClick={handleDeleteProduct}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition-all"
                      >
                        <i className="bx bx-trash mr-2"></i> Yes, Delete
                      </button>
                      <button
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold shadow transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </Modal>

              <Modal
                isOpen={isImportModalOpen}
                onRequestClose={() => setIsImportModalOpen(false)}
                contentLabel="Import Products"
                className="modal-content"
                overlayClassName="modal-overlay"
              >
                <ImportProduct
                  onClose={() => setIsImportModalOpen(false)}
                  onImport={handleImport}
                />
              </Modal>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={openAddProductModal}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-semibold px-6 py-2 rounded-lg shadow transition-all duration-200 text-base"
                  >
                    <i className="bx bx-plus text-xl"></i>
                    Add New Product
                  </button>
                </div>
                <div className="flex-1 flex items-center justify-end">
                  <div className="relative w-full md:w-80">
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm transition-all"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                      <i className="bx bx-search text-lg"></i>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 tracking-tight">
                  Product List
                </h2>
                <div className="overflow-x-auto rounded-xl shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                  {paginatedProducts.length === 0 ? (
                    <p className="text-gray-500 p-4 text-center text-sm">
                      No products available.
                    </p>
                  ) : (
                    <table className="w-full table-auto border-collapse text-sm">
                      <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                          <th className="p-2 pl-6 text-left font-semibold">
                            Name
                          </th>
                          <th className="p-2 text-left font-semibold">Brand</th>
                          <th className="p-2 text-left font-semibold">Price</th>
                          <th className="p-2 text-left font-semibold">Stock</th>
                          <th className="p-2 text-left font-semibold">
                            Category
                          </th>
                          <th className="p-2 text-left font-semibold">
                            Subcategory
                          </th>
                          <th className="p-2 text-left font-semibold">
                            Seller ID
                          </th>

                          <th className="p-2 pr-6 text-right font-semibold">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProducts.map((p) => (
                          <tr
                            key={p._id}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-gray-800/60 transition"
                          >
                            <td className="p-3 pl-6">{p.name}</td>
                            <td className="p-3">{p.brand}</td>
                            <td className="p-3">{p.price}</td>
                            <td className="p-3">{p.stock}</td>

                            <td className="p-3">
                              {resolveName(catMap, p.category_id || p.category)}
                            </td>
                            <td className="p-3">
                              {resolveName(
                                subMap,
                                p.subcategory_id || p.subcategory
                              )}
                            </td>
                            <td className="p-3">{getSellerId(p) || "—"}</td>

                            <td className="p-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  className="rounded-full bg-yellow-50 hover:bg-yellow-200 text-yellow-700 transition shadow border border-yellow-200"
                                  onClick={() => handleEditProduct(p)}
                                  title="Edit"
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    lineHeight: "35px",
                                  }}
                                >
                                  <i className="bx bxs-pencil text-lg"></i>
                                </button>
                                <button
                                  className="rounded-full bg-red-50 hover:bg-red-200 text-red-600 transition shadow border border-red-200"
                                  onClick={() => openDeleteModal(p)}
                                  title="Delete"
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    lineHeight: "35px",
                                  }}
                                >
                                  <i className="bx bxs-trash-alt text-lg"></i>
                                </button>
                                <button
                                  className="rounded-full bg-green-50 hover:bg-yellow-200 text-yellow-700 transition shadow border border-yellow-200"
                                  onClick={() => undoDelete(p)}
                                  title="Undo Delete"
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    lineHeight: "35px",
                                  }}
                                >
                                  <i className="bx bx-undo text-lg"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap justify-center md:justify-between items-center gap-4">
                  <button
                    className="flex items-center gap-1 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg font-medium shadow transition disabled:opacity-50"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <i className="bx bx-chevron-left"></i> Previous
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`w-9 h-9 rounded-full font-semibold transition border-2 ${
                          currentPage === idx + 1
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    className="flex items-center gap-1 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg font-medium shadow transition disabled:opacity-50"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next <i className="bx bx-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </main>
        </section>
      </div>
    </>
  );
};

export default Products;
