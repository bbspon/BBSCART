import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FiPackage,
  FiTruck,
  FiRefreshCw,
  FiXCircle,
  FiMessageCircle,
  FiStar,
  FiCheckCircle,
  FiRepeat,
  FiSearch,
} from "react-icons/fi";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth || {});
  const token =
    (typeof window !== "undefined" && localStorage.getItem("auth_user")) ||
    (useSelector((s) => s.auth?.token) ?? "");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("orders");
  const [searchQuery, setSearchQuery] = useState("");

  // ---- Fetch orders for this user ----
  useEffect(() => {
    if (!user?._id) return;
    const run = async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch(`${apiBase}/api/orders/user/${user._id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
        });
        const json = await res.json();
        if (!json?.success) {
          throw new Error(json?.message || "Failed to load orders");
        }
        setOrders(Array.isArray(json.orders) ? json.orders : []);
      } catch (e) {
        console.error("[OrdersPage] load failed:", e);
        setErr(e.message || "Could not load orders");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user?._id, token]);

  // ---- Simple search + tabs ----
  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const passSearch = (o) => {
      if (!q) return true;
      const dateStr = formatDate(o.created_at);
      const names =
        (o.orderItems || [])
          .map((it) => it?.product?.name || "")
          .join(" ")
          .toLowerCase() || "";
      return (
        names.includes(q) ||
        String(o.status || "")
          .toLowerCase()
          .includes(q) ||
        dateStr.toLowerCase().includes(q) ||
        String(o.order_id || "")
          .toLowerCase()
          .includes(q)
      );
    };

    const list = (orders || []).filter(passSearch);
    if (activeTab === "buyAgain") {
      return list.filter((o) => String(o.status).toLowerCase() === "delivered");
    }
    if (activeTab === "notYetShipped") {
      return list.filter((o) => String(o.status).toLowerCase() !== "delivered");
    }
    return list;
  }, [orders, searchQuery, activeTab]);

  // ---- UI helpers ----
  const handleRefund = (order) => navigate(`/returnRequest/${order?._id}`);

  const handleCancel = (order) =>
    Swal.fire({
      title: "Cancel Order?",
      text: `Are you sure you want to cancel ${displayName(order)}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel It",
      cancelButtonText: "No",
      confirmButtonColor: "#ef4444",
    }).then(() =>
      Swal.fire("Requested", "We received your cancel request.", "success")
    );

  const handleFeedback = () =>
    Swal.fire({
      title: "Leave Seller Feedback",
      input: "textarea",
      inputLabel: "Share your experience with the seller:",
      inputPlaceholder: "Type your feedback here...",
      showCancelButton: true,
      confirmButtonText: "Submit",
      confirmButtonColor: "#9333ea",
    }).then(
      (r) => r.isConfirmed && Swal.fire("Thanks!", "Submitted.", "success")
    );

  const handleReview = (order) =>
    Swal.fire({
      title: `Review ${displayName(order)}`,
      input: "textarea",
      inputPlaceholder: "Write your review...",
      showCancelButton: true,
      confirmButtonText: "Submit Review",
      confirmButtonColor: "#ec4899",
    }).then((r) => r.isConfirmed && Swal.fire("Thanks!", "Posted.", "success"));

  const handleTrack = (order) => {
    const tid = order?.trackingId;
    if (!tid) {
      Swal.fire("No tracking yet", "Tracking ID not available.", "info");
      return;
    }
    navigate(`/customertracking/${tid}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800">My Orders</h1>

        <div className="flex items-center bg-white rounded-full shadow-md border px-3 py-2 w-full md:w-[400px] focus-within:ring-2 focus-within:ring-blue-400">
          <FiSearch className="text-gray-400 text-xl mr-2" />
          <input
            type="text"
            placeholder="Search orders by product, date, or status"
            className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          onClick={() => {}}
          className="px-5 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition shadow-md"
        >
          Search Orders
        </button>
      </div>

      <div className="flex justify-center gap-3 mb-6 flex-wrap">
        {[
          { id: "orders", label: "Orders" },
          { id: "buyAgain", label: "Buy Again" },
          { id: "notYetShipped", label: "Not Yet Shipped" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition shadow-sm ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-md scale-105"
                : "bg-white text-gray-700 border hover:bg-blue-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-4xl mx-auto">
        {loading && (
          <div className="text-center text-gray-500 py-10">Loading orders…</div>
        )}
        {err && !loading && (
          <div className="text-center text-red-600 py-10">{err}</div>
        )}
        {!loading && !err && (
          <div className="space-y-5">
            {filteredOrders.length ? (
              filteredOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onTrack={() => handleTrack(order)}
                  onRefund={() => handleRefund(order)}
                  onCancel={() => handleCancel(order)}
                  onFeedback={handleFeedback}
                  onReview={() => handleReview(order)}
                />
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                No matching orders found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onTrack,
  onRefund,
  onCancel,
  onFeedback,
  onReview,
}) {
  const firstItem = (order.orderItems || [])[0] || {};
  const img =
    firstItem?.product?.image || "https://via.placeholder.com/80?text=Item";
  const name = displayName(order);
  const dateTxt = formatDate(order.created_at);
  const status = String(order.status || "pending");

  return (
    <div className="bg-white border rounded-2xl shadow-sm hover:shadow-lg transition p-5">
      <div className="flex items-center gap-5">
        <img
          src={img}
          alt={name}
          className="w-24 h-24 object-cover rounded-xl border"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
          <p className="text-sm text-gray-500">
            Ordered on {dateTxt} • Order ID: {order.order_id || order._id}
          </p>
          <span
            className={`inline-block mt-1 text-xs px-3 py-1 rounded-full font-medium ${badgeClass(
              status
            )}`}
          >
            {status}
          </span>
          {order.trackingId && (
            <span className="ml-2 inline-block text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">
              Track: {order.trackingId}
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <ActionButton
          icon={<FiTruck />}
          text="Track"
          color="blue"
          onClick={onTrack}
        />
        <ActionButton
          icon={<FiRefreshCw />}
          text="Refund"
          color="yellow"
          onClick={onRefund}
        />
        <ActionButton
          icon={<FiXCircle />}
          text="Cancel"
          color="red"
          onClick={onCancel}
        />
        <ActionButton icon={<FiCheckCircle />} text="Delivered" color="green" />
        <ActionButton
          icon={<FiMessageCircle />}
          text="Ask"
          color="gray"
          onClick={onFeedback}
        />
        <ActionButton
          icon={<FiStar />}
          text="Feedback"
          color="purple"
          onClick={onFeedback}
        />
        <ActionButton
          icon={<FiPackage />}
          text="Review"
          color="pink"
          onClick={onReview}
        />
        <ActionButton icon={<FiRepeat />} text="Buy Again" color="indigo" />
      </div>
    </div>
  );
}

function ActionButton({ icon, text, color, onClick }) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    yellow: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
    red: "bg-red-100 text-red-700 hover:bg-red-200",
    green: "bg-green-100 text-green-700 hover:bg-green-200",
    gray: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    purple: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    pink: "bg-pink-100 text-pink-700 hover:bg-pink-200",
    indigo: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 text-sm px-3 py-1 rounded-md font-medium transition ${colorMap[color]}`}
    >
      {icon} {text}
    </button>
  );
}

function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function displayName(order) {
  const first = (order?.orderItems || [])[0];
  const base = first?.product?.name || "Order";
  const extra = Math.max(0, (order?.orderItems?.length || 1) - 1);
  return extra ? `${base} + ${extra} more` : base;
}

function badgeClass(status) {
  const s = String(status).toLowerCase();
  if (s === "delivered") return "bg-green-100 text-green-700";
  if (s === "shipped" || s === "processing") return "bg-blue-100 text-blue-700";
  return "bg-yellow-100 text-yellow-700";
}
