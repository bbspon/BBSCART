import React, { useEffect, useState } from "react";
import { NavLink } from 'react-router-dom';
import './assets/dashboard.css';
import Sidebar from './layout/sidebar';
import Navbar from './layout/Navbar';
import useDashboardLogic from "./hooks/useDashboardLogic"; 
import Modal from "react-modal";
import toast from "react-hot-toast";
import UserForm from "./UserForm";
import { UserService } from "../../services/UserService";
import moment from "moment";

const OtherUser = () => {

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

  const [vendors, setVendors] = useState([]);
  const [filteredvendors, setFilteredvendors] = useState([]);
  const [editVendor, setEditVendor] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vendorToDelete, setvendorToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const [roleFilter, setRoleFilter] = useState("all");

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
  
// Update the filter logic to show only selected roles
const filterAndSortUsers = () => {
    let filtered = vendors.filter((vendor) => 
        vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (roleFilter !== "all") {
        filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredvendors(filtered);
};

  // Fetch vendors
  const roles = ["customer", "agent", "territory_head", "franchise_head"];

  const fetchUsers = async (roles) => {
    try {
      const data = await UserService.getUserRole(roles);
      // const data = await Promise.all(roles.map((role) => UserService.getUserRole(role)));
      setVendors(data);
      setFilteredvendors(data);
      console.log("Fetching vendors:", data); // Fixed stale state issue
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setErrorMessage(error.message || "Failed to fetch vendors.");
    }
  };

  useEffect(() => {
    fetchUsers(roles);
  }, []);

  useEffect(() => {
    const filterAndSortUsers = () => {
      let filtered = vendors.filter((vendor) =>
        vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Sorting logic
      if (sortConfig.key) {
        const sortedUsers = [...filtered].sort((a, b) => {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === "ascending" ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === "ascending" ? 1 : -1;
          }
          return 0;
        });
        setFilteredvendors(sortedUsers);
      } else {
        setFilteredvendors(filtered);
      }
    };

    filterAndSortUsers();
  }, [searchQuery, sortConfig, vendors]); // Optimized dependencies

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value || ""); // Ensures controlled input
  };

  const handleAddUser = async (vendorData) => {
  
    try {
      if (editVendor) {
        // Update existing vendor
        const updatedVendor = await UserService.updateUser(editVendor._id, vendorData);

        // Update state with the edited vendor
        setVendors((prev) =>
          prev.map((vendor) => (vendor._id === updatedVendor._id ? updatedVendor : vendor))
        );

        setEditVendor(null);
        toast.success("User updated successfully!");
      } else {
        // Create a new vendor
        const newVendor = await UserService.createVendor(vendorData);

        // Update state with the new vendor
        setVendors((prev) => [...prev, newVendor]);
        toast.success("User created successfully!");
      }

      setErrorMessage("");
      setIsAddEditModalOpen(false);
      fetchUsers(roles);
    } catch (error) {
      console.error("Error saving vendor:", error);
      
      setErrorMessage(error.message || "An error occurred while saving the vendor.");
      toast.error("Failed to save the vendor. Please try again.");
    }
  };

  const handleDeleteUser = async () => {
    try {
      await UserService.deleteUser(vendorToDelete._id);
      setvendors((prev) =>
        prev.filter((vendor) => vendor._id !== vendorToDelete._id)
      );
      setvendorToDelete(null);
      setErrorMessage("");
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting vendor:", error);
      setErrorMessage(error.message || "Failed to delete the vendor.");
    }
  };

  const handleEditUser = (vendor) => {
    setEditVendor(vendor);
    setIsAddEditModalOpen(true);
  };

  const openDeleteModal = (vendor) => {
    setvendorToDelete(vendor);
    setIsDeleteModalOpen(true);
  };

  const openAddUserModal = () => {
    setEditVendor(null);
    setIsAddEditModalOpen(true);
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const paginatedUsers = filteredvendors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredvendors.length / itemsPerPage);

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
                                <h1>User</h1>
                                <ul className="breadcrumb">
                                    <li>
                                        <NavLink className="active" to="/admin/dashboard">Dashboard</NavLink>
                                    </li>
                                    <li>
                                        <i className="bx bx-chevron-right" />
                                    </li>
                                    <li>
                                        <a> User </a>
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
                            contentLabel="vendor Form"
                            className="modal-content"
                            overlayClassName="modal-overlay"
                        >
                            <UserForm vendor={editVendor} onSave={handleAddUser} setIsAddEditModalOpen={setIsAddEditModalOpen}/>
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
                                <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">Delete User?</h3>
                                <p className="text-gray-600 text-center mb-6">Are you sure you want to delete this user? <br/>This action cannot be undone.</p>
                                <div className="flex gap-3 w-full justify-center">
                                  <button
                                    onClick={handleDeleteUser}
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

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                              onClick={openAddUserModal}
                              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-semibold px-6 py-2 rounded-lg shadow transition-all duration-200 text-base"
                            >
                              <i className="bx bx-plus text-xl"></i>
                              Add New User
                            </button>
                          </div>
                          <div className="flex-1 flex items-center justify-end">
                            <div className="relative w-full md:w-80">
                              <input
                                type="text"
                                placeholder="Search users..."
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
                          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 tracking-tight">User List</h2>
                          <div className="flex flex-wrap w-full mb-[-16px]">
                            <div className="w-full px-2 mb-4">
                              <div className="overflow-x-auto rounded-xl shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                                {paginatedUsers.length === 0 ? (
                                  <p className="text-gray-500 p-4 text-center text-sm">No users available.</p>
                                ) : (
                                  <table className="w-full table-auto border-collapse text-sm">
                                    <thead className="bg-gray-100 dark:bg-gray-800">
                                      <tr>
                                        <th className="font-Poppins p-2 pl-6 text-left font-semibold text-gray-700 dark:text-gray-200 tracking-wide">Name</th>
                                        <th className="font-Poppins p-2 text-left font-semibold text-gray-700 dark:text-gray-200 tracking-wide">Email</th>
                                        <th className="font-Poppins p-2 text-left font-semibold text-gray-700 dark:text-gray-200 tracking-wide">Phone</th>
                                        <th className="font-Poppins p-2 text-left font-semibold text-gray-700 dark:text-gray-200 tracking-wide">Role</th>
                                        <th className="font-Poppins p-2 text-left font-semibold text-gray-700 dark:text-gray-200 tracking-wide">Date & Time</th>
                                        <th className="font-Poppins p-2 text-right font-semibold text-gray-700 dark:text-gray-200 tracking-wide pr-6">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {paginatedUsers.map((user) => (
                                        <tr key={user._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-gray-800/60 transition">
                                          <td className="p-3 pl-6 align-middle font-medium text-gray-900 dark:text-gray-100">
                                            {user?.name ?? "-"}
                                          </td>
                                          <td className="p-3 align-middle text-gray-700 dark:text-gray-300">
                                            {user?.email ?? "-"}
                                          </td>
                                          <td className="p-3 align-middle text-gray-700 dark:text-gray-300">
                                            {user?.userdetails?.phone || "-"}
                                          </td>
                                          <td className="p-3 align-middle text-gray-700 dark:text-gray-300 capitalize">
                                            {user?.role ? user.role.replace(/_/g, " ") : "-"}
                                          </td>
                                          <td className="p-3 align-middle text-gray-600 dark:text-gray-400 max-w-xs truncate">
                                            {moment(user?.created_at).format("DD-MM-YYYY h:mm A") || "-"}
                                          </td>
                                          <td className="p-3 align-middle text-right">
                                            <div className="flex justify-end gap-2">
                                              <button
                                                className="rounded-full bg-yellow-50 hover:bg-yellow-200 text-yellow-700 hover:text-yellow-900 transition shadow border border-yellow-200 hover:border-yellow-300"
                                                onClick={() => handleEditUser(user)}
                                                title="Edit"
                                                style={{ width: '30px', height: '30px', lineHeight: '35px' }}
                                              >
                                                <i className="bx bxs-pencil text-lg"></i>
                                              </button>
                                              <button
                                                className="rounded-full bg-red-50 hover:bg-red-200 text-red-600 hover:text-red-800 transition shadow border border-red-200 hover:border-red-300"
                                                onClick={() => openDeleteModal(user)}
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

                            {/* Pagination UI */}
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

export default OtherUser;