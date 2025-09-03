import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import { logout } from "../../../services/authService";

const Sidebar = ({ isSidebarHidden, toggleSidebar }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const currentRole = params.get("role");
  const dispatch = useDispatch();
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
  // Ensure dropdown stays open when navigating within product links
  useEffect(() => {
    if (isProductSectionActive) {
      setIsProductOpen(true);
    }
  }, [location.pathname]);

  const [isUserRequestOpen, setIsUserRequestOpen] = useState(
    isUserRequestSectionActive
  );

  useEffect(() => {
    if (isUserRequestSectionActive) {
      setIsUserRequestOpen(true);
    }
  }, [location]);
  return (
    <>
      <section id="sidebar" className={isSidebarHidden ? "hide" : "show"}>
        <NavLink className="brand" to="/">
          <img src="/img/logo/favicon.png" className="bx bxs-smile bx-lg" />
          <span className="text">BBSCart</span>
        </NavLink>
        <ul className="side-menu top">
          <li
            className={location.pathname === "/admin/dashboard" ? "active" : ""}
          >
            <NavLink to="/admin/dashboard">
              <i className="bx bxs-dashboard bx-sm" />
              <span className="text">Dashboard</span>
            </NavLink>
          </li>
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

            {/* Submenu */}
            <ul
              className={`mt-2 space-y-1 transition-all ${
                isProductOpen ? "block" : "hidden"
              }`}
            >
              <li>
                <NavLink
                  to="/admin/products"
                  className=""
                  style={
                    location.pathname === "/admin/products"
                      ? { backgroundColor: "#0da89c", color: "#ffffff" }
                      : { backgroundColor: "transparent", color: "#000000" }
                  }
                >
                  <i className="bx bxs-shopping-bag-alt bx-sm" />
                  <span>All Products</span>
                </NavLink>
              </li>
              <li
                className={
                  location.pathname === "/admin/products/categories"
                    ? "bg-blue-600 rounded-lg"
                    : ""
                }
              >
                <NavLink
                  to="/admin/products/categories"
                  className=""
                  style={
                    location.pathname === "/admin/products/categories"
                      ? { backgroundColor: "#0da89c", color: "#ffffff" }
                      : { backgroundColor: "transparent", color: "#000000" }
                  }
                >
                  <i className="bx bxs-category bx-sm" />
                  <span>Categories</span>
                </NavLink>
              </li>
              <li
                className={
                  location.pathname === "/admin/products/subcategories"
                    ? "bg-blue-600 rounded-lg"
                    : ""
                }
              >
                <NavLink
                  to="/admin/products/subcategories"
                  className=""
                  style={
                    location.pathname === "/admin/products/subcategories"
                      ? { backgroundColor: "#0da89c", color: "#ffffff" }
                      : { backgroundColor: "transparent", color: "#000000" }
                  }
                >
                  <i className="bx bxs-layer bx-sm" />
                  <span>SubCategories</span>
                </NavLink>
              </li>
            </ul>
          </li>
          <li className={location.pathname === "/admin/orders" ? "active" : ""}>
            <NavLink to="/admin/orders">
              <i className="bx bxs-message-dots bx-sm" />
              <span className="text">Orders</span>
            </NavLink>
          </li>
          <li
            className={location.pathname === "/admin/customers" ? "active" : ""}
          >
            <NavLink to="/admin/customers">
              <i className="bx bxs-doughnut-chart bx-sm" />
              <span className="text">Customers</span>
            </NavLink>
          </li>
          <li
            className={location.pathname === "/admin/vendors" ? "active" : ""}
          >
            <NavLink to="/admin/vendors">
              <i className="bx bxs-group bx-sm" />
              <span className="text">Vendors</span>
            </NavLink>
          </li>
          <li
            className={location.pathname === "/admin/vendors" ? "active" : ""}
          >
            <li
              className={location.pathname === "/admin/vendors" ? "active" : ""}
            >
              <NavLink to="/admin/vendor-credentials">
                <i className="bx bxs-group bx-sm" />
                <span className="text">Vendor Credentials</span>
              </NavLink>
            </li>
            <li
              className={location.pathname === "/admin/vendors" ? "active" : ""}
            ></li>
            <NavLink to="/admin/franchisees">
              <i className="bx bxs-group bx-sm" />
              <span className="text">Franchisees</span>
            </NavLink>
          </li>
          <li
            className={location.pathname === "/admin/vendors" ? "active" : ""}
          >
            <NavLink to="/admin/territories">
              <i className="bx bxs-group bx-sm" />
              <span className="text">Territory</span>
            </NavLink>
          </li>
          <li
            className={location.pathname === "/admin/vendors" ? "active" : ""}
          >
            <NavLink to="/admin/agents">
              <i className="bx bxs-group bx-sm" />
              <span className="text">Agent</span>
            </NavLink>
          </li>
          <li
            className={location.pathname === "/admin/vendors" ? "active" : ""}
          >
            <NavLink to="/admin/customer-vendors">
              <i className="bx bxs-group bx-sm" />
              <span className="text">CustomerBecomeVendor</span>
            </NavLink>
          </li>
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

          {/* <li className={location.pathname === "/admin/users-request" ? "active" : ""}>
                        <NavLink to="/admin/users-request">
                            <i className="bx bxs-group bx-sm" />
                            <span className="text">User's Request</span>
                        </NavLink>
                    </li>   */}
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

            {/* Submenu */}
            <ul
              className={`mt-2 space-y-1 transition-all ${
                isUserRequestOpen ? "block" : "hidden"
              }`}
            >
              <li>
                <NavLink
                  to="/admin/requests/franchisees"
                  className=""
                  style={
                    currentRole === "seller"
                      ? { backgroundColor: "#0da89c", color: "#ffffff" }
                      : { backgroundColor: "transparent", color: "#000000" }
                  }
                >
                  <i className="bx bxs-shopping-bag-alt bx-sm" />
                  <span>Franchisees's Request</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/requests/territories"
                  className=""
                  style={
                    currentRole === "seller"
                      ? { backgroundColor: "#0da89c", color: "#ffffff" }
                      : { backgroundColor: "transparent", color: "#000000" }
                  }
                >
                  <i className="bx bxs-shopping-bag-alt bx-sm" />
                  <span>Territory Head’s Request</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/requests/vendors"
                  className=""
                  style={
                    currentRole === "seller"
                      ? { backgroundColor: "#0da89c", color: "#ffffff" }
                      : { backgroundColor: "transparent", color: "#000000" }
                  }
                >
                  <i className="bx bxs-shopping-bag-alt bx-sm" />
                  <span>Vendor's Request</span>
                </NavLink>
              </li>
              <li
                className={
                  location.pathname === "/admin/users-request?role=agent"
                    ? "bg-blue-600 rounded-lg"
                    : ""
                }
              >
                <NavLink
                  to="/admin/agent-requests"
                  className=""
                  style={
                    currentRole === "agent"
                      ? { backgroundColor: "#0da89c", color: "#ffffff" }
                      : { backgroundColor: "transparent", color: "#000000" }
                  }
                >
                  <i className="bx bxs-category bx-sm" />
                  <span>Agent's Request</span>
                </NavLink>
              </li>
              <li
                className={
                  location.pathname === "/admin/users-request?role=agent"
                    ? "bg-blue-600 rounded-lg"
                    : ""
                }
              >
                <NavLink
                  to="/admin/customer-vendor-requests"
                  className=""
                  style={
                    currentRole === "agent"
                      ? { backgroundColor: "#0da89c", color: "#ffffff" }
                      : { backgroundColor: "transparent", color: "#000000" }
                  }
                >
                  <i className="bx bxs-category bx-sm" />
                  <span>CustomerBecomeVendor's Request</span>
                </NavLink>
              </li>
            </ul>
          </li>
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
        <ul className="side-menu bottom"></ul>
      </section>
    </>
  );
};

export default Sidebar;
