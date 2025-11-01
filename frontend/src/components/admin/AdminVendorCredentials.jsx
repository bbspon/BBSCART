import { useEffect, useState } from "react";
import instance from "../../services/axiosInstance";
import { RiAdminLine } from "react-icons/ri";
import Sidebar from "./layout/sidebar";
import Navbar from "./layout/Navbar";
import useDashboardLogic from "./hooks/useDashboardLogic";
export default function AdminVendorCredentials() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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
  // 👇 add these two lines
  const vendorsPerPage = 10;
  const totalPages = Math.ceil(vendors.length / vendorsPerPage) || 1;
  async function load() {
    setLoading(true);
    setMsg("");
    try {
      const { data } = await instance.get(
        `${import.meta.env.VITE_API_URL}/api/admin/vendors`,
        {
          params: { status: "approved" },
        }
      );
      if (data?.success) {
        setVendors(data.vendors || []);
      } else {
        setMsg(data?.message || "Failed to load vendors");
      }
    } catch (err) {
      setMsg(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createCreds(id) {
    const ok = window.confirm("Send set-password link to this vendor?");
    if (!ok) return;
    try {
      const { data } = await instance.post(
        `/admin/vendors/${id}/create-credentials`
      );
      if (data?.success) {
        setMsg("Link sent successfully");
        await load();
      } else setMsg(data?.message || "Error creating credentials");
    } catch (err) {
      setMsg(err?.response?.data?.message || err.message);
    }
  }

  function copyLink(token) {
    const link = `${
      import.meta.env.VITE_VENDOR_PORTAL_URL
    }/vendor/set-password/${token}`;
    navigator.clipboard.writeText(link);
    alert("Link copied to clipboard:\n" + link);
  }

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
          className="h-[calc(50vh-10px)] overflow-y-auto"
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
          <div className=" m-8  rounded-lg">
            <div className="bg-slate-300 pt-3 rounded-t-lg border-0 border-black border-b-0">
              <h2 className="text-2xl font-semibold text-gray-700 flex items-center justify-center gap-2 border-b border-black pb-2">
                <RiAdminLine className="" />
                Vendor Credentials
              </h2>
            </div>
            {msg && <div style={{ margin: "8px 0", color: "red" }}>{msg}</div>}
            {loading ? (
              <div>Loading…</div>
            ) : vendors.length === 0 ? (
              <div>No approved vendors</div>
            ) : (
              <div class="overflow-x-auto border border-black rounded-b-lg shadow-sm">
                <table
                  className="my-6  min-w-full border-collapse"
                  border="1"
                  cellPadding="6"
                  style={{ width: "100%", borderCollapse: "collapse" }}
                >
                  <thead class="bg-gray-100 text-gray-700">
                    <tr>
                      <th class="px-4 py-3 text-left w-1/5">Name</th>
                      <th class="px-4 py-3 text-left w-1/5">Email</th>
                      <th class="px-4 py-3 text-left w-1/5">Status</th>
                      <th class="px-4 py-3 text-left w-1/5">User Linked</th>
                      <th class="px-4 py-3 text-left w-1/5">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {vendors.map((v) => {
                      let statusColor = "bg-red-300 text-gray-700";
                      if (v.application_status === "Approved")
                        statusColor = "bg-green-100 text-green-700";
                      else if (v.application_status === "Pending")
                        statusColor = "bg-yellow-100 text-yellow-700";
                      else if (v.application_status === "Rejected")
                        statusColor = "bg-red-100 text-red-700";
                      else if (v.application_status === "In Review")
                        statusColor = "bg-blue-100 text-blue-700";
                      return (
                        <tr key={v._id} className="hover:bg-gray-50 transition">
                          <td class="px-4 py-3">
                            {v.display_name || v.legal_name}
                          </td>
                          <td class="px-4 py-3">{v.email}</td>
                          <td class="px-4 py-3">
                            <span
                              className={`px-3 py-1 text-sm font-medium rounded-full ${statusColor}`}
                            >
                              {v.application_status}
                            </span>
                          </td>
                          <td class="px-4 py-3">{v.user_id ? "Yes" : "No"}</td>
                          <td class="flex flex-col py-4 items-center justify-center gap-2">
                            <button
                              onClick={() => createCreds(v._id)}
                              disabled={!v._id}
                              className="text-sm px-3 py-1 bg-blue-600 text-white rounded-md 
                        hover:bg-blue-700 hover:scale-105 active:scale-95 
                        transition-all duration-200 ease-in-out 
                        disabled:opacity-50 shadow-sm hover:shadow-md"
                            >
                              Create
                            </button>
                            <button
                              onClick={() => createCreds(v._id)}
                              disabled={!v._id}
                              className="text-sm px-3 py-1 bg-green-600 text-white rounded-md 
                         hover:bg-green-700 hover:scale-105 active:scale-95 
                         transition-all duration-200 ease-in-out 
                         disabled:opacity-50 shadow-sm hover:shadow-md "
                            >
                              Resend Link
                            </button>

                            {v.passwordResetToken && (
                              <button
                                onClick={() => copyLink(v.passwordResetToken)}
                                className="text-sm px-3 py-1 bg-green-100 text-blue-600 rounded-md hover:bg-gray-200 border border-blue-200 transition"
                              >
                                Copy Link
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-between items-center m-5">
              <button
                onClick={() =>
                  currentPage > 1 && setCurrentPage(currentPage - 1)
                }
                disabled={currentPage === 1}
                aria-label="Previous page"
                className={`px-4 py-2 rounded-2xl text-white transition ${
                  currentPage === 1
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-600 hover:bg-gray-800"
                }`}
              >
                Prev
              </button>

              {/* <- PAGE INDICATOR -> */}
              <div className="text-sm text-gray-700 font-medium">
                Page <span className="font-semibold">{currentPage}</span> /{" "}
                <span className="font-semibold">{totalPages}</span>
              </div>

              <button
                onClick={() =>
                  currentPage < totalPages && setCurrentPage(currentPage + 1)
                }
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className={`px-4 py-2 rounded-2xl text-white transition ${
                  currentPage === totalPages
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-600 hover:bg-gray-800"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
