// import { getOrders, updateOrderStatus } from '../../services/adminService';
import React, { useEffect } from "react";
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { getOrdersByUserId, syncDeliveryStatus } from "../../slice/orderSlice";
const RECENT_ORDER_IDS_KEY = "bbscart_recent_order_ids";

function getStatusStyle(status) {
    const s = String(status || "pending").toLowerCase();
    if (s === "delivered") return { background: "#22c55e", color: "#fff", padding: "6px 14px", borderRadius: "20px", fontWeight: 700, fontSize: "12px" };
    if (s === "shipped") return { background: "#3b82f6", color: "#fff", padding: "6px 14px", borderRadius: "20px", fontWeight: 700, fontSize: "12px" };
    if (s === "canceled") return { background: "#6b7280", color: "#fff", padding: "6px 14px", borderRadius: "20px", fontWeight: 700, fontSize: "12px" };
    return { background: "#dc2626", color: "#fff", padding: "6px 14px", borderRadius: "20px", fontWeight: 700, fontSize: "12px" };
}

const Orders = () => {

    const dispatch = useDispatch();
    const { orders, loading, error } = useSelector((state) => state.order);
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!user?._id) return;
        (async () => {
            await dispatch(syncDeliveryStatus()).unwrap().catch(() => {});
            const recentIds = (() => {
                try {
                    const raw = localStorage.getItem(RECENT_ORDER_IDS_KEY);
                    return raw ? JSON.parse(raw) : [];
                } catch { return []; }
            })();
            dispatch(getOrdersByUserId({ userId: user._id, orderIds: recentIds }));
        })();
    }, [dispatch, user?._id]);    

    console.log(orders);

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="m-auto pt-8 font-medium text-center text-red-600">Error: {error}</p>;

    return (

        <>

            <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet' />

            <div className="p-8">
                <div className="head-title">
                    <div className="left">
                        <h1 className="font-bold text-2xl">Orders</h1>
                        <ul className="breadcrumb">
                            <li>
                                <NavLink className="active" to="/">Home</NavLink>
                            </li>
                            <li>
                                <i className="bx bx-chevron-right" />
                            </li>
                            <li>
                                <a> Orders </a>
                            </li>
                        </ul>
                    </div>
                    {/* <NavLink className="btn-download" to="#">
                        <i className="bx bxs-cloud-download bx-fade-down-hover" />
                        <span className="text">Download PDF</span>
                    </NavLink> */}
                </div>
                <div className="bbs table-data">
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
                                    {/* <p>Order #{order._id}</p> */}
                                    <p>{order.user_id?.name ?? "Guest"}</p>
                                </td>
                                <td>{moment(order.created_at).format("DD-MM-YYYY")}</td>
                                <td>
                                    <span
                                        className={`status ${(order.status || "pending").toLowerCase().replace(/\s+/g, "")}`}
                                        style={getStatusStyle(order.status)}
                                    >
                                        {order.status || "pending"}
                                    </span>
                                </td>
                            </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>


        </>
    );
};

export default Orders;