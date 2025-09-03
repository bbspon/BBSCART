// import { getOrders, updateOrderStatus } from '../../services/adminService';
import React, { useEffect, useState } from "react";
import { NavLink } from 'react-router-dom';
import './../admin/assets/dashboard.css';
import Sidebar from './layout/sidebar';
import Navbar from './layout/Navbar';
import useDashboardLogic from "./../admin/hooks/useDashboardLogic"; 
import { getOrderBySellerId } from "../../slice/orderSlice";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";

const Orders = () => {

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

    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const { orders, loading, error } = useSelector((state) => state.order);

    useEffect(() => {
        if(user !== null){
            dispatch(getOrderBySellerId(user._id));
        }
    }, [user]);

    console.log('Vendor Orders - ',orders);

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="m-auto pt-8 font-medium text-center text-red-600">Error: {error}</p>;

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
                                <h1>Orders</h1>
                                <ul className="breadcrumb">
                                    <li>
                                        <NavLink className="active" to="/admin/dashboard">Dashboard</NavLink>
                                    </li>
                                    <li>
                                        <i className="bx bx-chevron-right" />
                                    </li>
                                    <li>
                                        <a> Orders </a>
                                    </li>
                                </ul>
                            </div>
                            <NavLink className="btn-download" to="#">
                                <i className="bx bxs-cloud-download bx-fade-down-hover" />
                                <span className="text">Download PDF</span>
                            </NavLink>
                        </div>
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
                                    {
                                        orders.length > 0 ? (
                                            orders.map((order) => (
                                                <tr key={order._id}>
                                                    <td>
                                                        <img 
                                                            src={order.orderItems?.[0]?.product?.image || "https://placehold.co/600x400/png"} 
                                                            alt="Product Image"
                                                            width="100"
                                                        />
                                                        <p>{order.user_id?.name || "Unknown User"}</p>
                                                    </td>
                                                    <td>{moment(order.created_at).format("DD-MM-YYYY")}</td>
                                                    <td>
                                                        <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3}>
                                                    {error ? <p>{error}</p> : <p>No orders found.</p>}
                                                </td>
                                            </tr>
                                        )
                                    }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </main>
                </section>
            </div>


        </>
    );
};

export default Orders;