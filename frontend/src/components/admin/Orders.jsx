// import { getOrders, updateOrderStatus } from '../../services/adminService';
import React, { useEffect, useState } from "react";
import { getMetrics } from '../../services/adminService';
import { NavLink } from 'react-router-dom';
import './assets/dashboard.css';
import Sidebar from './layout/sidebar';
import Navbar from './layout/Navbar';
import useDashboardLogic from "./hooks/useDashboardLogic";
import { getAllOrders } from "../../slice/orderSlice";
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

    const dispatch = useDispatch();
    const { orders, loading, error } = useSelector((state) => state.order);
    const [searchValue, setSearchValue] = React.useState("");

    useEffect(() => {
        dispatch(getAllOrders());
    }, [dispatch]);

    console.log(orders);

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="m-auto pt-8 font-medium text-center text-red-600">Error: {error}</p>;

    // Filter orders by user name
    const filteredOrders = orders.filter(order =>
        order.user_id?.name?.toLowerCase().includes(searchValue.toLowerCase())
    );

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
                        <div className="order bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mt-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                                <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300 tracking-tight">Recent Orders</h3>
                                <div className="flex gap-2 w-full md:w-auto justify-end">
                                    <div className="relative w-full md:w-80">
                                        <input
                                            type="text"
                                            placeholder="Search by user name..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm transition-all"
                                            value={searchValue || ''}
                                            onChange={e => setSearchValue(e.target.value)}
                                        />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                                            <i className="bx bx-search text-lg"></i>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                                <table className="w-full table-auto border-collapse text-sm">
                                    <thead className="bg-blue-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="font-Poppins p-3 pl-6 text-left font-semibold text-blue-700 dark:text-blue-200 tracking-wide">User</th>
                                            <th className="font-Poppins p-3 text-left font-semibold text-blue-700 dark:text-blue-200 tracking-wide">Date Order</th>
                                            <th className="font-Poppins p-3 text-left font-semibold text-blue-700 dark:text-blue-200 tracking-wide">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {filteredOrders.map((order) => (
                                    <tr key={order._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-gray-800/60 transition">
                                        <td className="p-3 pl-6 align-middle font-medium text-gray-900 dark:text-gray-100 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-bold text-lg uppercase border border-gray-200 dark:border-gray-700">
                                                {order.user_id.name ? order.user_id.name.charAt(0) : '?'}
                                            </div>
                                            <span>{order.user_id.name}</span>
                                        </td>
                                        <td className="p-3 align-middle text-gray-700 dark:text-gray-300">{moment(order.created_at).format("DD-MM-YYYY h:mm A")}</td>
                                        <td className="p-3 align-middle">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'completed' ? 'bg-green-100 text-green-700' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-700'} dark:${order.status === 'completed' ? 'bg-green-900 text-green-200' : order.status === 'pending' ? 'bg-yellow-900 text-yellow-200' : 'bg-gray-800 text-gray-200'}`}>{order.status}</span>
                                        </td>
                                    </tr>
                                    ))}
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