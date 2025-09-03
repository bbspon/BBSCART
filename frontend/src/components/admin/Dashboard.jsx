import React, { useEffect, useState } from "react";
import { getMetrics } from "../../services/adminService";
import { NavLink } from "react-router-dom";
import "./assets/dashboard.css";
import Sidebar from "./layout/sidebar";
import Navbar from "./layout/Navbar";
import useDashboardLogic from "./hooks/useDashboardLogic";
import { getAllOrders } from "../../slice/orderSlice";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import axios from "axios";

const Dashboard = () => {
  // existing logic (unchanged)
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

  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(getAllOrders());
  }, [dispatch]);

  // ------------- NEW: Admin Vendor Request states -------------
  const [vendorRequests, setVendorRequests] = useState([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [decisionLoading, setDecisionLoading] = useState(false);
  // ADD inside Dashboard component, with other hooks
  const [franchiseReviewId, setFranchiseReviewId] = useState(null);

  const apiBase = import.meta?.env?.VITE_API_URL || "";

  const fetchVendorRequests = async () => {
    try {
      const r = await axios.get(`${apiBase}/api/vendors/admin/requests`);
      if (r?.data?.ok && Array.isArray(r.data.data)) {
        setVendorRequests(r.data.data);
      }
    } catch (e) {
      // silent fail to avoid breaking dashboard
      console.error(
        "fetchVendorRequests error:",
        e?.response?.data || e.message
      );
    }
  };

  useEffect(() => {
    fetchVendorRequests();
    const id = setInterval(fetchVendorRequests, 10000); // poll every 10s
    return () => clearInterval(id);
  }, []);
  // ------------------------------------------------------------

  // ------------- NEW: open one request for review -------------
  const openFirstRequest = () => {
    if (!vendorRequests.length) return;
    const v = vendorRequests[0];
    setSelectedVendorId(v._id || v.id || v.vendorId || v._id);
    setReviewOpen(true);
  };

  const openRequestById = (id) => {
    if (!id) return;
    setSelectedVendorId(id);
    setReviewOpen(true);
  };

  const closeReview = () => {
    setReviewOpen(false);
    setSelectedVendorId(null);
    setSelectedVendor(null);
  };
  // ------------------------------------------------------------

  // ------------- NEW: load full vendor in modal ---------------
  useEffect(() => {
    const load = async () => {
      if (!reviewOpen || !selectedVendorId) return;
      setReviewLoading(true);
      try {
        const r = await axios.get(
          `${apiBase}/api/vendors/admin/${selectedVendorId}`
        );
        if (r?.data?.ok) setSelectedVendor(r.data.data);
      } catch (e) {
        console.error("getVendorFull error:", e?.response?.data || e.message);
      } finally {
        setReviewLoading(false);
      }
    };
    load();
  }, [reviewOpen, selectedVendorId, apiBase]);
  // ------------------------------------------------------------

  // ------------- NEW: approve / reject actions ----------------
  const decide = async (decision) => {
    if (!selectedVendorId) return;
    const body = { decision };
    if (decision === "reject") {
      const reason = window.prompt("Reason for rejection:");
      if (!reason) return; // require a reason
      body.reason = reason;
    }
    setDecisionLoading(true);
    try {
      const r = await axios.post(
        `${apiBase}/api/vendors/admin/${selectedVendorId}/decision`,
        body
      );
      if (!r?.data?.ok) throw new Error(r?.data?.message || "Failed");
      // refresh list and close modal
      await fetchVendorRequests();
      alert(`Application ${decision}`);
      closeReview();
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Failed");
    } finally {
      setDecisionLoading(false);
    }
  };
  // ------------------------------------------------------------

  // ------------- NEW: small helpers for safe rendering --------
  const safe = (v) => (v === undefined || v === null ? "" : String(v));
  const pretty = (obj) => (
    <pre style={{ background: "#f7f7f7", padding: 8, whiteSpace: "pre-wrap" }}>
      {JSON.stringify(obj || {}, null, 2)}
    </pre>
  );
  const fileUrl = (f) => {
    if (!f) return null;
    // your files are usually saved as filenames under /uploads
    return f.startsWith("/uploads")
      ? `${apiBase}${f}`
      : `${apiBase}/uploads/${f}`;
  };
  // ------------------------------------------------------------

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
           

            <ul className="box-info">
              <li>
                <i className="bx bxs-calendar-check" />
                <span className="text">
                  <h3>1020</h3>
                  <p>New Order</p>
                </span>
              </li>
              <li>
                <i className="bx bxs-group" />
                <span className="text">
                  <h3>2834</h3>
                  <p>Visitors</p>
                </span>
              </li>
              <li>
                <i className="bx bxs-dollar-circle" />
                <span className="text">
                  <h3>2543.00</h3>
                  <p>Total Sales</p>
                </span>
              </li>
            </ul>

            <div className="table-data">
              <div className="order">
                <div className="head">
                  <h3>Recent Orders</h3>
                  <i className="bx bx-search" />
                  <i className="bx bx-filter" />
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Date Order</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <img src="https://placehold.co/600x400/png" />
                          <p>{order.user_id.name}</p>
                        </td>
                        <td>{moment(order.created_at).format("DD-MM-YYYY")}</td>
                        <td>
                          <span className="status completed">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="todo">
                <div className="head">
                  <h3>Todos</h3>
                  <i className="bx bx-plus icon" />
                  <i className="bx bx-filter" />
                </div>
                <ul className="todo-list">
                  <li className="completed">
                    <p>Check Inventory</p>
                    <i className="bx bx-dots-vertical-rounded" />
                  </li>
                  <li className="completed">
                    <p>Manage Delivery Team</p>
                    <i className="bx bx-dots-vertical-rounded" />
                  </li>
                  <li className="not-completed">
                    <p>Contact Selma: Confirm Delivery</p>
                    <i className="bx bx-dots-vertical-rounded" />
                  </li>
                  <li className="completed">
                    <p>Update Shop Catalogue</p>
                    <i className="bx bx-dots-vertical-rounded" />
                  </li>
                  <li className="not-completed">
                    <p>Count Profit Analytics</p>
                    <i className="bx bx-dots-vertical-rounded" />
                  </li>
                </ul>
              </div>
            </div>
          </main>
        </section>
      </div>

      {/* NEW: Review Modal (simple, no library) */}
      {reviewOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeReview();
          }}
        >
          <div
            style={{
              width: "min(1000px, 95vw)",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: 12,
              padding: 16,
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0 }}>Vendor Review</h3>
              <button onClick={closeReview} className="btn btn-sm">
                ✕
              </button>
            </div>

            {reviewLoading ? (
              <div style={{ padding: 16 }}>Loading…</div>
            ) : !selectedVendor ? (
              <div style={{ padding: 16 }}>Not found.</div>
            ) : (
              <div style={{ paddingTop: 8 }}>
                <section style={{ marginBottom: 12 }}>
                  <h4 style={{ margin: "8px 0" }}>Identity</h4>
                  <div>
                    Name: {safe(selectedVendor.vendor_fname)}{" "}
                    {safe(selectedVendor.vendor_lname)}
                  </div>
                  <div>
                    DOB:{" "}
                    {selectedVendor.dob
                      ? new Date(selectedVendor.dob).toLocaleDateString()
                      : ""}
                  </div>
                  <div>Email: {safe(selectedVendor.email)}</div>

                  <div>PAN: {safe(selectedVendor.pan_number)}</div>
                  {selectedVendor.pan_pic && (
                    <div>
                      <a
                        href={fileUrl(selectedVendor.pan_pic)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View PAN file
                      </a>
                    </div>
                  )}
                </section>

                <section style={{ marginBottom: 12 }}>
                  <h4 style={{ margin: "8px 0" }}>Aadhaar</h4>
                  <div>Number: {safe(selectedVendor.aadhar_number)}</div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {selectedVendor.aadhar_pic_front && (
                      <img
                        src={fileUrl(selectedVendor.aadhar_pic_front)}
                        alt="Aadhaar Front"
                        style={{ maxWidth: 240 }}
                      />
                    )}
                    {selectedVendor.aadhar_pic_back && (
                      <img
                        src={fileUrl(selectedVendor.aadhar_pic_back)}
                        alt="Aadhaar Back"
                        style={{ maxWidth: 240 }}
                      />
                    )}
                  </div>
                </section>

                <section style={{ marginBottom: 12 }}>
                  <h4 style={{ margin: "8px 0" }}>Registered Address</h4>
                  {pretty(selectedVendor.register_business_address)}
                </section>

                <section style={{ marginBottom: 12 }}>
                  <h4 style={{ margin: "8px 0" }}>GST</h4>
                  <div>GSTIN: {safe(selectedVendor.gst_number)}</div>
                  <div>Legal Name: {safe(selectedVendor.gst_legal_name)}</div>
                  <div>
                    Constitution: {safe(selectedVendor.gst_constitution)}
                  </div>
                  {pretty(selectedVendor.gst_address)}
                  {selectedVendor.gst_cert_pic && (
                    <div>
                      <a
                        href={fileUrl(selectedVendor.gst_cert_pic)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View GST Certificate
                      </a>
                    </div>
                  )}
                </section>

                <section style={{ marginBottom: 12 }}>
                  <h4 style={{ margin: "8px 0" }}>Bank</h4>
                  <div>
                    Account Holder: {safe(selectedVendor.account_holder_name)}
                  </div>
                  <div>Account No: {safe(selectedVendor.account_no)}</div>
                  <div>IFSC: {safe(selectedVendor.ifcs_code)}</div>
                  <div>
                    Bank: {safe(selectedVendor.bank_name)} | Branch:{" "}
                    {safe(selectedVendor.branch_name)}
                  </div>
                  <div>Address: {safe(selectedVendor.bank_address)}</div>
                  {selectedVendor.cancel_cheque_passbook && (
                    <div>
                      <a
                        href={fileUrl(selectedVendor.cancel_cheque_passbook)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Bank Proof
                      </a>
                    </div>
                  )}
                </section>

                <section style={{ marginBottom: 12 }}>
                  <h4 style={{ margin: "8px 0" }}>Outlet</h4>
                  <div>
                    Manager: {safe(selectedVendor.outlet_manager_name)} | Phone:{" "}
                    {safe(selectedVendor.outlet_contact_no)}
                  </div>
                  {pretty(selectedVendor.outlet_location)}
                  {selectedVendor.outlet_nameboard_image && (
                    <img
                      src={fileUrl(selectedVendor.outlet_nameboard_image)}
                      alt="Outlet Nameboard"
                      style={{ maxWidth: 320 }}
                    />
                  )}
                </section>

                <section style={{ marginBottom: 12 }}>
                  <h4 style={{ margin: "8px 0" }}>Status</h4>
                  <div>
                    Application: {safe(selectedVendor.application_status)}
                  </div>
                  <div>
                    Submitted:{" "}
                    {selectedVendor.submitted_at
                      ? new Date(selectedVendor.submitted_at).toLocaleString()
                      : "-"}
                  </div>
                  <div>
                    Active: {String(selectedVendor.is_active)} | Declined:{" "}
                    {String(selectedVendor.is_decline)}
                  </div>
                  {selectedVendor.decline_reason && (
                    <div>
                      Decline Reason: {safe(selectedVendor.decline_reason)}
                    </div>
                  )}
                </section>

                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button
                    onClick={() => decide("approve")}
                    disabled={decisionLoading}
                    className="btn btn-success"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => decide("reject")}
                    disabled={decisionLoading}
                    className="btn btn-danger"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

   
    </>
  );
};

export default Dashboard;
