import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import { logout } from "../../../services/authService";

const Sidebar = ({ isSidebarHidden, toggleSidebar }) => {
  const location = useLocation();
  const dispatch = useDispatch();

  // ✅ Load role from localStorage instead of query params
  const [currentRole, setCurrentRole] = useState(null);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.role) setCurrentRole(parsed.role.toLowerCase());
      } catch {
        setCurrentRole(localStorage.getItem("role"));
      }
    } else {
      setCurrentRole(localStorage.getItem("role"));
    }
  }, []);

  const isProductSectionActive = [
    "/admin/products",
    "/admin/products/categories",
    "/admin/products/subcategories",
  ].includes(location.pathname);

  const isUserRequestSectionActive =
    location.pathname === "/admin/users-request" &&
    ["seller", "territory_head", "franchise_head", "agent"].includes(
      currentRole
    );

  const [isProductOpen, setIsProductOpen] = useState(isProductSectionActive);
  const [isUserRequestOpen, setIsUserRequestOpen] = useState(
    isUserRequestSectionActive
  );

  useEffect(() => {
    if (isProductSectionActive) setIsProductOpen(true);
  }, [location.pathname]);

  useEffect(() => {
    if (isUserRequestSectionActive) setIsUserRequestOpen(true);
  }, [location]);

  return (
    <section id="sidebar" className={isSidebarHidden ? "hide" : "show"}>
      <NavLink className="brand" to="/">
        <img
          src="/img/logo/favicon.png"
          className="bx bxs-smile bx-lg"
          alt="logo"
        />
        <span className="text">BBSCart</span>
      </NavLink>

      <ul className="side-menu top">
        {/* Dashboard */}
        {currentRole !== "seller" && (
          <li
            className={location.pathname === "/admin/dashboard" ? "active" : ""}
          >
            <NavLink to="/admin/dashboard">
              <i className="bx bxs-dashboard bx-sm" />
              <span className="text">Dashboard</span>
            </NavLink>
          </li>
        )}

        {/* PRODUCTS Section */}
        {(currentRole === "seller" || currentRole !== "seller") && (
          <li className={isProductSectionActive ? "active" : ""}>
            <a
              onClick={() => setIsProductOpen(!isProductOpen)}
              className="flex items-center justify-between rounded-lg hover:bg-blue-500 transition cursor-pointer"
            >
              <div className="flex items-center">
                <i className="bx bxs-shopping-bag-alt bx-sm" />
                <span>Products</span>
              </div>
              <i
                className={`bx ${
                  isProductOpen ? "bx-chevron-up" : "bx-chevron-down"
                }`}
              />
            </a>

            <ul
              className={`mt-2 space-y-1 transition-all ${
                isProductOpen ? "block" : "hidden"
              }`}
            >
              <li>
                <NavLink
                  to="/admin/products"
                  style={
                    location.pathname === "/admin/products"
                      ? { backgroundColor: "#0da89c", color: "#ffffff" }
                      : {}
                  }
                >
                  <i className="bx bxs-shopping-bag-alt bx-sm" />
                  <span>All Products</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/products/categories"
                  style={
                    location.pathname === "/admin/products/categories"
                      ? { backgroundColor: "#0da89c", color: "#ffffff" }
                      : {}
                  }
                >
                  <i className="bx bxs-category bx-sm" />
                  <span>Categories</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/products/subcategories"
                  style={
                    location.pathname === "/admin/products/subcategories"
                      ? { backgroundColor: "#0da89c", color: "#ffffff" }
                      : {}
                  }
                >
                  <i className="bx bxs-layer bx-sm" />
                  <span>SubCategories</span>
                </NavLink>
              </li>
            </ul>
          </li>
        )}

        {/* Orders */}
        <li className={location.pathname === "/admin/orders" ? "active" : ""}>
          <NavLink to="/admin/orders">
            <i className="bx bxs-cart bx-sm" />
            <span className="text">Orders</span>
          </NavLink>
        </li>

        {/* Other sections - hide for seller */}
        {currentRole !== "seller" && (
          <>
            {/* Customers */}
            <li
              className={
                location.pathname === "/admin/customers" ? "active" : ""
              }
            >
              <NavLink to="/admin/customers">
                <i className="bx bxs-user-detail bx-sm" />
                <span className="text">Customers</span>
              </NavLink>
            </li>

            {/* Vendors */}
            <li
              className={location.pathname === "/admin/vendors" ? "active" : ""}
            >
              <NavLink to="/admin/vendors">
                <i className="bx bxs-store bx-sm" />
                <span className="text">Vendors</span>
              </NavLink>
            </li>

            {/* Vendor Credentials */}
            <li
              className={
                location.pathname === "/admin/vendor-credentials"
                  ? "active"
                  : ""
              }
            >
              <NavLink to="/admin/vendor-credentials">
                <i className="bx bxs-id-card bx-sm" />
                <span className="text">Vendor Credentials</span>
              </NavLink>
            </li>

            {/* Franchisees */}
            <li
              className={
                location.pathname === "/admin/franchisees" ? "active" : ""
              }
            >
              <NavLink to="/admin/franchisees">
                <i className="bx bxs-network-chart bx-sm" />
                <span className="text">Franchisees</span>
              </NavLink>
            </li>

            {/* Territory */}
            <li
              className={
                location.pathname === "/admin/territories" ? "active" : ""
              }
            >
              <NavLink to="/admin/territories">
                <i className="bx bxs-map-pin bx-sm" />
                <span className="text">Territory</span>
              </NavLink>
            </li>

            {/* Agents */}
            <li
              className={location.pathname === "/admin/agents" ? "active" : ""}
            >
              <NavLink to="/admin/agents">
                <i className="bx bxs-user-rectangle bx-sm" />
                <span className="text">Agents</span>
              </NavLink>
            </li>

            {/* CustomerBecomeVendor */}
            <li
              className={
                location.pathname === "/admin/customer-vendors" ? "active" : ""
              }
            >
              <NavLink to="/admin/customer-vendors">
                <i className="bx bxs-user-account bx-sm" />
                <span className="text">CustomerBecomeVendor</span>
              </NavLink>
            </li>

            {/* Other Users */}
            <li
              className={
                location.pathname === "/admin/other-users" ? "active" : ""
              }
            >
              <NavLink to="/admin/other-users">
                <i className="bx bxs-group bx-sm" />
                <span className="text">Other User's</span>
              </NavLink>
            </li>

            {/* USER REQUEST SECTION */}
            <li className={isUserRequestSectionActive ? "active" : ""}>
              <a
                onClick={() => setIsUserRequestOpen(!isUserRequestOpen)}
                className="flex items-center justify-between rounded-lg hover:bg-blue-500 transition cursor-pointer"
              >
                <div className="flex items-center">
                  <i className="bx bxs-shopping-bag-alt bx-sm" />
                  <span>User's Request</span>
                </div>
                <i
                  className={`bx ${
                    isUserRequestOpen ? "bx-chevron-up" : "bx-chevron-down"
                  }`}
                />
              </a>

              <ul
                className={`mt-2 space-y-1 transition-all ${
                  isUserRequestOpen ? "block" : "hidden"
                }`}
              >
                <li>
                  <NavLink to="/admin/requests/franchisees">
                    <i className="bx bxs-shopping-bag-alt bx-sm" />
                    <span>Franchisees's Request</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/requests/territories">
                    <i className="bx bxs-shopping-bag-alt bx-sm" />
                    <span>Territory Head’s Request</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/requests/vendors">
                    <i className="bx bxs-shopping-bag-alt bx-sm" />
                    <span>Vendor's Request</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/agent-requests">
                    <i className="bx bxs-category bx-sm" />
                    <span>Agent's Request</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/customer-vendor-requests">
                    <i className="bx bxs-category bx-sm" />
                    <span>CustomerBecomeVendor's Request</span>
                  </NavLink>
                </li>
              </ul>
            </li>
          </>
        )}

        {/* LOGOUT */}
        <li
          onClick={async () => {
            await logout(dispatch);
          }}
        >
          <NavLink className="logout">
            <i className="bx bx-power-off bx-sm bx-burst-hover" />
            <span className="text">Logout</span>
          </NavLink>
        </li>
      </ul>
    </section>
  );
};

export default Sidebar;
