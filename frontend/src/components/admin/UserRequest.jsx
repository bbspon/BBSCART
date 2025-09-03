import React, { useEffect, useState } from "react";
import {  NavLink, useNavigate } from 'react-router-dom';
import './assets/dashboard.css';
import Sidebar from './layout/sidebar';
import Navbar from './layout/Navbar';
import useDashboardLogic from "./hooks/useDashboardLogic"; 
import Modal from "react-modal";
import { vendoDecline, vendorApprove, vendorRequest } from "../../services/vendorService";
import ViewUserRequest from "./ViewUserRequest";
import moment from "moment";
import { toast } from "react-hot-toast";
import { useLocation } from 'react-router-dom';

const UserRequest = () => {
  const location = useLocation();
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

  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [role, setRole] = useState('');
  const [filteredvendors, setFilteredvendors] = useState([]);
  const [editVendor, setEditVendor] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vendorToDelete, setvendorToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const [roleFilter, setRoleFilter] = useState("all");

  const [isDeclineModalOpen, setIsDeclinModalOpen] = useState(false);
  const [declineData, setDeclineData] = useState({
      user_id: '', decline_reason: ''
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role') || 'seller';
    setRole(roleParam); // this sets the role
  }, [location.search]);

  useEffect(() => {
    if (!role) return; // prevent calling with empty role
    fetchRequest(role); // only run after role is set
  }, [role]);

  const fetchRequest = async (role) => {
    try {
      const data = await vendorRequest(role);
      setVendors(data);
      setFilteredvendors(data);
      console.log("Fetching vendors:", data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setErrorMessage(error.message || "Failed to fetch vendors.");
    }
  };

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
          vendor?.vendor_fname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vendor?.vendor_lname?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setFilteredvendors(filtered);
  };

  useEffect(() => {
    const filterAndSortUsers = () => {
      let filtered = vendors.filter((vendor) =>
        vendor?.vendor_fname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor?.vendor_lname?.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleApproveOpen = (vendor) => {
    setEditVendor(prevState => {
        console.log('Previous State:', prevState);
        console.log('New State:', vendor);
        return vendor;
    });

    setIsApproveModalOpen(true);
  };

  const handleApproveUser = async () => {
    try {
      const data = await vendorApprove(editVendor._id);
      setVendors((prev) =>
        prev.filter((vendor) => vendor._id !== editVendor._id)
      );
      console.log("Vendor Approved:", data);
      setEditVendor(null);
      setIsApproveModalOpen(false);
    } catch (error) {
      console.error("Error approve vendor:", error);
      setErrorMessage(error.message || "Failed to approve the vendor.");
    }
  }

  const handleDeclineOpen = (vendor) => {
      setDeclineData((prevData) => ({
          ...prevData,
          user_id: vendor._id,
      }));
      setIsDeclinModalOpen(true);
  };
  const handleChange = (e) => {
      const { name, value } = e.target;
      setDeclineData((prev) => ({
      ...prev,
      [name]: value || "", // Ensuring empty string instead of undefined
      }));
      console.log('declineData handleChange',declineData);
  };

  const handleDeclineSubmit = async (e) => {
    e.preventDefault();
    console.log('declineData',declineData);
    try {
        const res = await vendoDecline(declineData);
        if(res.success === true){
            console.log('handleDeclineSubmit',res.message);
            toast.success("Decline Done");
            navigate("/");
        }
    } catch (error) {
        toast.error(error.message || "Decline failed. Try again.");
    }
}

  const paginatedUsers = filteredvendors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatRole = (role) => {
    if (!role || typeof role !== "string") return "";

    if (role === "seller") role = "vendor";

    return role
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

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
                              <h1>User Request</h1>
                              <ul className="breadcrumb">
                                  <li>
                                      <NavLink className="active" to="/admin/dashboard">Dashboard</NavLink>
                                  </li>
                                  <li>
                                      <i className="bx bx-chevron-right" />
                                  </li>
                                  <li>
                                      <a> User Request </a>
                                  </li><li>
                                      <i className="bx bx-chevron-right" />
                                  </li>
                                  <li>
                                      <a className="capitalize"> {formatRole(role)}'s Request </a>
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
                      {/* Approve Request */}
                      <Modal
                        isOpen={isApproveModalOpen}
                        onRequestClose={() => setIsApproveModalOpen(false)}
                        shouldCloseOnOverlayClick={true}
                        shouldCloseOnEsc={true}
                        className="modal-content"
                        overlayClassName="modal-overlay"
                      >
                        <ViewUserRequest vendorData={editVendor} onApprove={handleApproveUser} setIsApproveModalOpen={setIsApproveModalOpen} />
                      </Modal>
                      {/* Decline Request */}
                      <Modal
                        isOpen={isDeclineModalOpen}
                        onRequestClose={() => setIsDeclinModalOpen(false)}
                        contentLabel="Decline User Request"
                        className="modal-content"
                        overlayClassName="modal-overlay"
                      >
                      <div className="p-0 bg-transparent flex items-center justify-center min-h-[300px]">
                        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full p-8 flex flex-col items-center">
                          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                            <i className="bx bxs-x-circle text-4xl text-red-500"></i>
                          </div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">Decline User Request</h3>
                          <p className="text-gray-600 text-center mb-6">Please provide a reason for declining this user request.<br/>This action cannot be undone.</p>
                          <form className="w-full" onSubmit={handleDeclineSubmit}>
                            <textarea
                              name="decline_reason"
                              placeholder="Enter Decline Reason"
                              className="w-full p-3 text-sm border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-red-400 focus:outline-none resize-none min-h-[80px]"
                              value={declineData.decline_reason}
                              onChange={handleChange}
                              required
                            />
                            <div className="flex gap-3 w-full justify-center">
                              <button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition-all"
                              >
                                <i className="bx bxs-x-circle mr-2"></i> Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsDeclinModalOpen(false)}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold shadow transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                      </Modal>

                      {/* Enhanced Search Bar UI */}
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                        <div className="flex-1 flex items-center justify-end">
                          <div className="relative w-full md:w-80">
                            <input
                              type="text"
                              placeholder="Search user requests..."
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
                          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 tracking-tight">{formatRole(role)}'s Request List</h2>
                          <div className="flex flex-wrap w-full mb-[-16px]">
                          <div className="w-full px-2 mb-4">
                              <div className="overflow-x-auto rounded-xl shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                                {paginatedUsers.length === 0 ? (
                                  <p className="text-gray-500 p-4 text-center text-sm">No {formatRole(role)}'s requests available.</p>
                                ) : (
                                  <table className="w-full table-auto border-collapse text-sm">
                                    <thead className="bg-gray-100 dark:bg-gray-800">
                                      <tr>
                                        <th className="font-Poppins p-2 pl-6 text-left font-semibold text-gray-700 dark:text-gray-200 tracking-wide">{formatRole(role)} Name</th>
                                        <th className="font-Poppins p-2 text-left font-semibold text-gray-700 dark:text-gray-200 tracking-wide">Email</th>
                                        <th className="font-Poppins p-2 text-left font-semibold text-gray-700 dark:text-gray-200 tracking-wide">Phone</th>
                                        <th className="font-Poppins p-2 text-left font-semibold text-gray-700 dark:text-gray-200 tracking-wide">Date & Time</th>
                                        <th className="font-Poppins p-2 text-right font-semibold text-gray-700 dark:text-gray-200 tracking-wide pr-6">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {paginatedUsers.map((vendor) => (
                                        <tr key={vendor._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-gray-800/60 transition">
                                          <td className="p-3 pl-6 align-middle font-medium text-gray-900 dark:text-gray-100">
                                            {vendor?.vendor_fname ? vendor?.vendor_fname + ' ' + vendor?.vendor_lname :  "-"}
                                          </td>
                                          <td className="p-3 align-middle text-gray-700 dark:text-gray-300">
                                            {vendor?.email ?? "-"}
                                          </td>
                                          <td className="p-3 align-middle text-gray-700 dark:text-gray-300">
                                            {vendor?.mobile || "-"}
                                          </td>
                                          <td className="p-3 align-middle text-gray-600 dark:text-gray-400 max-w-xs truncate">
                                            {moment(vendor?.created_at).format("DD-MM-YYYY h:mm A") || "-"}
                                          </td>
                                          <td className="p-3 align-middle text-right">
                                            <div className="flex justify-end gap-2">
                                              <button
                                                className="rounded-full bg-yellow-50 hover:bg-yellow-200 text-yellow-700 hover:text-yellow-900 transition shadow border border-yellow-200 hover:border-yellow-300"
                                                onClick={() => handleApproveOpen(vendor)}
                                                title="View"
                                                style={{ width: '30px', height: '30px', lineHeight: '35px' }}
                                              >
                                                <i className="bx bx-show text-lg"></i>
                                              </button>
                                              {!vendor.is_decline && (
                                                <button
                                                  className="rounded-full bg-red-50 hover:bg-red-200 text-red-600 hover:text-red-800 transition shadow border border-red-200 hover:border-red-300"
                                                  onClick={() => handleDeclineOpen(vendor)}
                                                  title="Decline"
                                                  style={{ width: '30px', height: '30px', lineHeight: '35px' }}
                                                >
                                                  <i className="bx bxs-x-circle text-lg"></i>
                                                </button>
                                              )}
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

                            {/* Modern Pagination */}
                            <div className="mt-6 flex flex-wrap justify-center md:justify-between items-center gap-4">
                              <button
                                className="flex items-center gap-1 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg font-medium shadow transition disabled:opacity-50"
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
                                className="flex items-center gap-1 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg font-medium shadow transition disabled:opacity-50"
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

export default UserRequest;