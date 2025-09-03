import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { NavLink, useLocation } from 'react-router-dom';
import { logout } from "../../../services/authService";

const Sidebar = ({ isSidebarHidden, toggleSidebar }) => {
    const location = useLocation();
    const dispatch = useDispatch();
    const isProductSectionActive = ["/seller/products", "/seller/products/categories", "/seller/products/subcategories"]
        .includes(location.pathname);

    const [isProductOpen, setIsProductOpen] = useState(isProductSectionActive);

    // Ensure dropdown stays open when navigating within product links
    useEffect(() => {
        if (isProductSectionActive) {
            setIsProductOpen(true);
        }
    }, [location.pathname]);
    return (
        <>
            <section id="sidebar" className={isSidebarHidden ? 'hide' : 'show'}>
                <NavLink className="brand" to="/">
                    <img src="/img/logo/favicon.png" className="bx bxs-smile bx-lg" />
                    <span className="text">BBSCart</span>
                </NavLink>
                <ul className="side-menu top">
                    <li className={location.pathname === "/seller/dashboard" ? "active" : ""}>
                        <NavLink to="/seller/dashboard">
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
                            <i className={`bx ${isProductOpen ? "bx-chevron-up" : "bx-chevron-down"}`} />
                        </a>

                        {/* Submenu */}
                        <ul className={`mt-2 space-y-1 transition-all ${isProductOpen ? "block" : "hidden"}`}>
                            <li>
                                <NavLink to="/seller/products" className="" style={location.pathname === "/seller/products" ? { backgroundColor: "#0da89c", color: "#ffffff" } : {backgroundColor: "transparent", color: "#000000"}} >
                                    <i className="bx bxs-shopping-bag-alt bx-sm" />
                                    <span>All Products</span>
                                </NavLink>
                            </li>
                            <li className={location.pathname === "/seller/products/categories" ? "bg-blue-600 rounded-lg" : ""}>
                                <NavLink to="/seller/products/categories" className="" style={location.pathname === "/seller/products/categories" ? { backgroundColor: "#0da89c", color: "#ffffff" } : {backgroundColor: "transparent", color: "#000000"}}>
                                    <i className="bx bxs-category bx-sm" />
                                    <span>Categories</span>
                                </NavLink>
                            </li>
                            <li className={location.pathname === "/seller/products/subcategories" ? "bg-blue-600 rounded-lg" : ""}>
                                <NavLink to="/seller/products/subcategories" className="" style={location.pathname === "/seller/products/subcategories" ? { backgroundColor: "#0da89c", color: "#ffffff" } : {backgroundColor: "transparent", color: "#000000"}}>
                                    <i className="bx bxs-layer bx-sm" />
                                    <span>SubCategories</span>
                                </NavLink>
                            </li>
                        </ul>
                    </li>
                    <li className={location.pathname === "/seller/orders" ? "active" : ""}>
                        <NavLink to="/seller/orders">
                            <i className="bx bxs-message-dots bx-sm" />
                            <span className="text">Orders</span>
                        </NavLink>
                    </li>                
                </ul>
                <ul className="side-menu bottom">
                    <li onClick={async () => { await logout(dispatch); window.location.reload(); }}>
                        <NavLink className="logout">
                            <i className="bx bx-power-off bx-sm bx-burst-hover" />
                            <span className="text">Logout</span>
                        </NavLink>
                    </li>
                </ul>
            </section>
        </>
    );
};

export default Sidebar;