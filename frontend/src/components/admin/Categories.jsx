
import React, { useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import "./assets/dashboard.css";
import Sidebar from "./layout/sidebar";
import Navbar from "./layout/Navbar";
import useDashboardLogic from "./hooks/useDashboardLogic";
import Modal from "react-modal";
import CategoryForm from "./CategoryForm";
import toast from "react-hot-toast";
import { saveAs } from "file-saver";

import {
  importCategoriesCSV,
  exportCategoriesCSV,
  downloadCategoryRowCSV,
} from "../../services/categoryAPI";
import instance from "../../services/axiosInstance";
const Categories = () => {
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
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [editCategory, setEditCategory] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const fileRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);
  const handleClickImport = () => fileRef.current?.click();

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await instance.get("/categories");
        setCategories(data || []);
        setFilteredCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setErrorMessage(
          error?.response?.data?.message ||
            error.message ||
            "Failed to fetch categories."
        );
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const filterAndSortCategories = () => {
      let filtered = categories.filter((category) =>
        (category.name || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (sortConfig.key) {
        filtered.sort((a, b) => {
          if (a[sortConfig.key] < b[sortConfig.key])
            return sortConfig.direction === "ascending" ? -1 : 1;
          if (a[sortConfig.key] > b[sortConfig.key])
            return sortConfig.direction === "ascending" ? 1 : -1;
          return 0;
        });
      }
      setFilteredCategories(filtered);
    };
    filterAndSortCategories();
  }, [searchQuery, sortConfig, categories]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleFileChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      setIsImporting(true);
      const result = await importCategoriesCSV(f);
      alert(
        `Import done. Created: ${result.created}, Updated: ${result.updated}.`
      );
      // TODO: refresh table list if needed
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Import failed");
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  };

  const handleExport = async () => {
    try {
      const res = await exportCategoriesCSV();
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
      saveAs(blob, "categories.csv");
    } catch (err) {
      console.error(err);
      alert("Export failed");
    }
  };

  const handleDownloadRow = async (idOrSlug) => {
    try {
      const res = await downloadCategoryRowCSV(idOrSlug);
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
      saveAs(blob, `category-${idOrSlug}.csv`);
    } catch (err) {
      console.error(err);
      alert("Download failed");
    }
  };
  const handleAddCategory = async (categoryData) => {
    try {
      if (editCategory) {
        const { data } = await instance.put(
          `/categories/${editCategory._id}`,
          categoryData
        );
        setCategories((prev) =>
          prev.map((c) => (c._id === data._id ? data : c))
        );
        setEditCategory(null);
        toast.success("Category updated successfully!");
      } else {
        const { data } = await instance.post("/categories", categoryData);
        setCategories((prev) => [...prev, data]);
        toast.success("Category created successfully!");
      }
      setIsAddEditModalOpen(false);
      setErrorMessage("");
    } catch (error) {
      console.error("Error saving category:", error);
      setErrorMessage(
        error?.response?.data?.message ||
          error.message ||
          "Failed to save the category."
      );
      toast.error("Failed to save the category.");
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await instance.delete(`/categories/${categoryToDelete._id}`);
      setCategories((prev) =>
        prev.filter((c) => c._id !== categoryToDelete._id)
      );
      setCategoryToDelete(null);
      setIsDeleteModalOpen(false);
      setErrorMessage("");
    } catch (error) {
      console.error("Error deleting category:", error);
      setErrorMessage(
        error?.response?.data?.message ||
          error.message ||
          "Failed to delete the category."
      );
    }
  };

  const handleEditCategory = (category) => {
    setEditCategory(category);
    setIsAddEditModalOpen(true);
  };

  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const openAddCategoryModal = () => {
    setEditCategory(null);
    setIsAddEditModalOpen(true);
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending")
      direction = "descending";
    setSortConfig({ key, direction });
  };

  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

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
                <h1>Categories</h1>
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
                    <a> Categories </a>
                  </li>
                </ul>
              </div>
              <button className="btn-download" onClick={openAddCategoryModal}>
                <i className="bx bx-plus bx-fade-down-hover" />
                <span className="text">Add New Category</span>
              </button>
            </div>
            <div
              className="actions"
              style={{ display: "flex", gap: 8, marginBottom: 12 }}
            >
              <button onClick={handleClickImport} disabled={isImporting}>
                {isImporting ? "Importing…" : "Import CSV/XLSX"}
              </button>
              <button onClick={handleExport}>Export CSV</button>
              <input
                type="file"
                accept=".csv, .xlsx"
                style={{ display: "none" }}
                ref={fileRef}
                onChange={handleFileChange}
              />
            </div>
            <div className="container mx-auto p-4">
              {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <strong>Error:</strong> {errorMessage}
                </div>
              )}

              <Modal
                isOpen={isAddEditModalOpen}
                onRequestClose={() => setIsAddEditModalOpen(false)}
                contentLabel="Category Form"
                className="modal-content"
                overlayClassName="modal-overlay"
              >
                <CategoryForm
                  category={editCategory}
                  setIsAddEditModalOpen={setIsAddEditModalOpen}
                  onSave={handleAddCategory}
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
                      Delete Category?
                    </h3>
                    <p className="text-gray-600 text-center mb-6">
                      Are you sure you want to delete this category?
                      <br />
                      This action cannot be undone.
                    </p>
                    <div className="flex gap-3 w-full justify-center">
                      <button
                        onClick={handleDeleteCategory}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold shadow"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </Modal>

              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Category List</h2>
                <div className="overflow-x-auto rounded-xl shadow border border-gray-200 bg-white">
                  {paginatedCategories.length === 0 ? (
                    <p className="text-gray-500 p-4 text-center text-sm">
                      No categories available.
                    </p>
                  ) : (
                    <table className="w-full table-auto border-collapse text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 pl-6 text-left font-semibold">
                            Category Name
                          </th>
                          <th className="p-2 text-left font-semibold">
                            Description
                          </th>
                          <th className="p-2 text-right font-semibold pr-6">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCategories.map((category) => (
                          <tr
                            key={category._id}
                            className="border-b hover:bg-blue-50"
                          >
                            <td className="p-3 pl-6">{category.name ?? ""}</td>
                            <td className="p-3">
                              {category.description ?? ""}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  className="rounded-full bg-yellow-100 text-yellow-900 border border-yellow-200"
                                  onClick={() => handleEditCategory(category)}
                                  title="Edit"
                                  style={{ width: 30, height: 30 }}
                                >
                                  <i className="bx bxs-pencil text-lg"></i>
                                </button>
                                <button
                                  className="rounded-full bg-red-100 text-red-800 border border-red-200"
                                  onClick={() => {
                                    setCategoryToDelete(category);
                                    setIsDeleteModalOpen(true);
                                  }}
                                  title="Delete"
                                  style={{ width: 30, height: 30 }}
                                >
                                  <i className="bx bxs-trash-alt text-lg"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap justify-between items-center gap-4">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={currentPage === idx + 1 ? "font-bold" : ""}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
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

export default Categories;
