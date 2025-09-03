import React, { useEffect, useState } from "react";
import { NavLink } from 'react-router-dom';
import './assets/dashboard.css';
import Sidebar from './layout/sidebar';
import Navbar from './layout/Navbar';
import useDashboardLogic from "./hooks/useDashboardLogic"; 
import Modal from "react-modal";
import CategoryForm from "./CategoryForm";
import { ProductService } from "../../services/ProductService";
import toast from "react-hot-toast";

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get("page")) || 1;
    setCurrentPage(page);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", currentPage);
    window.history.replaceState({}, "", `${window.location.pathname}?${params}`);
  }, [currentPage]);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await ProductService.getCategories();
        setCategories(data);
        setFilteredCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setErrorMessage(error.message || "Failed to fetch categories.");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const filterAndSortCategories = () => {
      let filtered = categories.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
      // Sorting logic
      if (sortConfig.key) {
        filtered.sort((a, b) => {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === "ascending" ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === "ascending" ? 1 : -1;
          }
          return 0;
        });
      }
      console.log(filtered); // Log the filtered categories
      setFilteredCategories(filtered);
    };
  
    filterAndSortCategories();
  }, [searchQuery, sortConfig, categories]); // Run when these values change

  // Update this in the search input handler:
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAddCategory = async (categoryData) => {
    console.log('categoryData',categoryData);
    try {
        if (editCategory) {
            const updatedCategory = await ProductService.updateCategory(
                editCategory._id,
                categoryData
            );
            setCategories((prev) =>
                prev.map((category) =>
                    category._id === updatedCategory._id
                        ? updatedCategory
                        : category
                )
            );
            setEditCategory(null);
            toast.success("Category updated successfully!");
        } else {
            const newCategory = await ProductService.createCategory(categoryData);
            setCategories((prev) => [...prev, newCategory]);
            toast.success("Category created successfully!");
        }
        setErrorMessage("");
        setIsAddEditModalOpen(false);
    } catch (error) {
        console.error("Error saving category:", error);
        setErrorMessage(
            error.message || "An error occurred while saving the category."
        );
        toast.error("Failed to save the category. Please try again.");
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await ProductService.deleteCategory(categoryToDelete._id);
      setCategories((prev) =>
        prev.filter(
          (category) => category._id !== categoryToDelete._id
        )
      );
      setCategoryToDelete(null);
      setErrorMessage("");
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting category:", error);
      setErrorMessage(error.message || "Failed to delete the category.");
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
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

    return (
        <>

            <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet' />

            <div className={isDarkMode ? 'dark' : ''}>

                <Sidebar isSidebarHidden={isSidebarHidden} toggleSidebar={toggleSidebar} />

                <section id="content">

                    <Navbar isDarkMode={isDarkMode}
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
                                        <NavLink className="active" to="/admin/dashboard">Dashboard</NavLink>
                                    </li>
                                    <li>
                                        <i className="bx bx-chevron-right" />
                                    </li>
                                    <li>
                                        <a> Categories </a>
                                    </li>
                                </ul>
                            </div>
                            <NavLink className="btn-download" to="#">
                                <i className="bx bxs-cloud-download bx-fade-down-hover" />
                                <span className="text">Download PDF</span>
                            </NavLink>
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
                            <CategoryForm category={editCategory} setIsAddEditModalOpen={setIsAddEditModalOpen} onSave={handleAddCategory} />
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
                                <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">Delete Category?</h3>
                                <p className="text-gray-600 text-center mb-6">Are you sure you want to delete this category? <br/>This action cannot be undone.</p>
                                <div className="flex gap-3 w-full justify-center">
                                  <button
                                    onClick={handleDeleteCategory}
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

                        {/* Enhanced Add Category & Search Bar UI */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                              onClick={openAddCategoryModal}
                              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-semibold px-6 py-2 rounded-lg shadow transition-all duration-200 text-base"
                            >
                              <i className="bx bx-plus text-xl"></i>
                              Add New Category
                            </button>
                          </div>
                          <div className="flex-1 flex items-center justify-end">
                            <div className="relative w-full md:w-80">
                              <input
                                type="text"
                                placeholder="Search categories..."
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
                          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 tracking-tight">Category List</h2>
                          <div className="flex flex-wrap w-full mb-[-16px]">
                            <div className="w-full px-2 mb-4">
                              <div className="overflow-x-auto rounded-xl shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                                {paginatedCategories.length === 0 ? (
                                  <p className="text-gray-500 p-4 text-center text-sm">No categories available.</p>
                                ) : (
                                  <table className="w-full table-auto border-collapse text-sm">
                                    <thead className="bg-gray-100 dark:bg-gray-800">
                                      <tr>
                                        <th className="font-Poppins p-2 pl-6 text-left font-semibold text-gray-700 dark:text-gray-200 tracking-wide">Category Name</th>
                                        <th className="font-Poppins p-2 text-left font-semibold text-gray-700 dark:text-gray-200 tracking-wide">Description</th>
                                        <th className="font-Poppins p-2 text-right font-semibold text-gray-700 dark:text-gray-200 tracking-wide pr-6">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {paginatedCategories.map((category) => (
                                        <tr key={category._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-gray-800/60 transition">
                                          <td className="p-3 pl-6 align-middle font-medium text-gray-900 dark:text-gray-100">
                                            {category.name ?? ''}
                                          </td>
                                          <td className="p-3 align-middle text-gray-600 dark:text-gray-400 max-w-xs truncate">
                                            {category.description ?? ''}
                                          </td>
                                          <td className="p-3 align-middle text-right">
                                            <div className="flex justify-end gap-2">
                                              <button
                                                className="rounded-full bg-yellow-50 hover:bg-yellow-200 text-yellow-700 hover:text-yellow-900 transition shadow border border-yellow-200 hover:border-yellow-300"
                                                onClick={() => handleEditCategory(category)}
                                                title="Edit"
                                                style={{ width: '30px', height: '30px', lineHeight: '35px' }}
                                              >
                                                <i className="bx bxs-pencil text-lg"></i>
                                              </button>
                                              <button
                                                className="rounded-full bg-red-50 hover:bg-red-200 text-red-600 hover:text-red-800 transition shadow border border-red-200 hover:border-red-300"
                                                onClick={() => openDeleteModal(category)}
                                                title="Delete"
                                                style={{ width: '30px', height: '30px', lineHeight: '35px' }}
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
                            </div>
                          </div>

                          {/* Super UI Pagination */}
                          <div className="mt-6 flex flex-wrap justify-center md:justify-between items-center gap-4">
                            <button
                              className="flex items-center gap-1 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg font-medium shadow disabled:opacity-50"
                              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                            >
                              <i className="bx bx-chevron-left"></i> Previous
                            </button>
                            <div className="flex gap-1">
                              {Array.from({ length: totalPages }).map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setCurrentPage(idx + 1)}
                                  className={`w-9 h-9 rounded-full font-semibold transition border-2 ${currentPage === idx + 1 ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700'}`}
                                >
                                  {idx + 1}
                                </button>
                              ))}
                            </div>
                            <button
                              className="flex items-center gap-1 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg font-medium shadow disabled:opacity-50"
                              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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

export default Categories;