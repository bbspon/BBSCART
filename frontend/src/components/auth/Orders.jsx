import React, { useEffect, useState, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { getOrdersByUserId, syncDeliveryStatus } from "../../slice/orderSlice";
import { IoIosSearch } from "react-icons/io";
import { IoFilterOutline } from "react-icons/io5";
const RECENT_ORDER_IDS_KEY = "bbscart_recent_order_ids";

function getStatusStyle(status) {
  const s = String(status || "pending").toLowerCase();

  if (s === "delivered")
    return { background: "#22c55e", color: "#fff", padding: "6px 14px", borderRadius: "20px", fontWeight: 700, fontSize: "12px" };

  if (s === "shipped")
    return { background: "#3b82f6", color: "#fff", padding: "6px 14px", borderRadius: "20px", fontWeight: 700, fontSize: "12px" };

  if (s === "canceled" || s === "cancelled")
    return { background: "#6b7280", color: "#fff", padding: "6px 14px", borderRadius: "20px", fontWeight: 700, fontSize: "12px" };

  return { background: "#dc2626", color: "#fff", padding: "6px 14px", borderRadius: "20px", fontWeight: 700, fontSize: "12px" };
}

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.auth);

  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState("");   // ✅ FIXED
  const [filters, setFilters] = useState({
    status: "",
    date: "",
  });

  useEffect(() => {
    if (!user?._id) return;

    (async () => {
      await dispatch(syncDeliveryStatus()).unwrap().catch(() => {});

      const recentIds = (() => {
        try {
          const raw = localStorage.getItem(RECENT_ORDER_IDS_KEY);
          return raw ? JSON.parse(raw) : [];
        } catch {
          return [];
        }
      })();

      dispatch(getOrdersByUserId({ userId: user._id, orderIds: recentIds }));
    })();
  }, [dispatch, user?._id]);

  // ✅ Combined Search + Filters
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        !searchValue ||
        order.user_id?.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        order._id?.toLowerCase().includes(searchValue.toLowerCase());

      const matchesStatus =
        !filters.status ||
        (order.status || "pending").toLowerCase() === filters.status.toLowerCase();

      const matchesDate =
        !filters.date ||
        moment(order.created_at).format("YYYY-MM-DD") === filters.date;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchValue, filters]);

  const applyFilters = () => {
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({ status: "", date: "" });
  };

  if (loading) return <p>Loading...</p>;
  if (error)
    return (
      <p className="m-auto pt-8 font-medium text-center text-red-600">
        Error: {error}
      </p>
    );

  return (
    <div className="p-8">
      <div className="head-title">
        <div className="left">
          <h1 className="font-bold text-2xl">Orders</h1>
        </div>
      </div>

      <div className="bbs table-data">
        <div className="order">
          <div className="head flex items-center gap-4">
            <h3>Recent Orders</h3>

            {/* ✅ Search */}
            <div className="relative w-40">
          
              <input
                type="text"
                placeholder="Search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-11 py-1 border rounded outline-none"
              />   
              <IoIosSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 " />
            </div>

            {/* ✅ Filter Button */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-1 border rounded-lg bg-white hover:bg-gray-50"
              >
                <IoFilterOutline />
                <span>Filter</span>
              </button>

              {/* ✅ Dropdown */}
              {showFilters && (
                <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg p-4 space-y-4 z-[9999]">

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Order Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                      className="w-full border rounded-lg px-3 py-2 bg-white"
                    >
                      <option value="">All Orders</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Order Date
                    </label>
                    <input
                      type="date"
                      value={filters.date}
                      onChange={(e) =>
                        setFilters({ ...filters, date: e.target.value })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={applyFilters}
                      className="flex-1 px-3 py-2 bg-black text-white rounded-lg"
                    >
                      Apply
                    </button>
                    <button
                      onClick={resetFilters}
                      className="flex-1 px-3 py-2 border rounded-lg"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ✅ Table */}
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Date Order</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <p>{order.user_id?.name ?? "Guest"}</p>
                    </td>
                    <td>
                      {moment(order.created_at).format("DD-MM-YYYY")}
                    </td>
                    <td>
                      <span
                        style={getStatusStyle(order.status)}
                      >
                        {order.status || "pending"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;