import React, { useState } from "react";
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

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const [searchQuery, setSearchQuery] = useState("");

  const orders = [
    {
      id: 1,
      name: "Wireless Headphones",
      status: "Delivered",
      date: "Oct 29, 2025",
      image: "https://via.placeholder.com/80",
    },
    {
      id: 2,
      name: "Smartwatch Pro 2",
      status: "Shipped",
      date: "Oct 30, 2025",
      image: "https://via.placeholder.com/80",
    },
    {
      id: 3,
      name: "Gaming Mouse RGB",
      status: "Processing",
      date: "Nov 1, 2025",
      image: "https://via.placeholder.com/80",
    },
  ];

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.date.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "orders") return matchesSearch;
    if (activeTab === "buyAgain") return o.status === "Delivered" && matchesSearch;
    if (activeTab === "notYetShipped") return o.status !== "Delivered" && matchesSearch;
    return matchesSearch;
  });

  const handleRefund = (order) =>
    Swal.fire({
      title: "Request Refund?",
      text: `Do you want to request a refund for ${order.name}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Refund",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3b82f6",
    }).then((r) => r.isConfirmed && Swal.fire("Refund Requested", "We have initiated your refund.", "success"));

  const handleCancel = (order) =>
    Swal.fire({
      title: "Cancel Order?",
      text: `Are you sure you want to cancel ${order.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel It",
      cancelButtonText: "No",
      confirmButtonColor: "#ef4444",
    }).then((r) => r.isConfirmed && Swal.fire("Cancelled", `${order.name} has been cancelled.`, "success"));

  const handleFeedback = () =>
    Swal.fire({
      title: "Leave Seller Feedback",
      input: "textarea",
      inputLabel: "Share your experience with the seller:",
      inputPlaceholder: "Type your feedback here...",
      showCancelButton: true,
      confirmButtonText: "Submit",
      confirmButtonColor: "#9333ea",
    }).then((r) => r.isConfirmed && Swal.fire("Thanks!", "Your feedback has been submitted.", "success"));

  const handleReview = (order) =>
    Swal.fire({
      title: `Review ${order.name}`,
      html: `
        <div style="display:flex;justify-content:center;gap:5px;margin:10px 0;">
          <i class="bx bx-star" style="font-size:24px;color:#ddd" id="star1"></i>
          <i class="bx bx-star" style="font-size:24px;color:#ddd" id="star2"></i>
          <i class="bx bx-star" style="font-size:24px;color:#ddd" id="star3"></i>
          <i class="bx bx-star" style="font-size:24px;color:#ddd" id="star4"></i>
          <i class="bx bx-star" style="font-size:24px;color:#ddd" id="star5"></i>
        </div>
        <textarea id="reviewText" class="swal2-textarea" placeholder="Write your review..."></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: "Submit Review",
      confirmButtonColor: "#ec4899",
      didOpen: () => {
        const stars = [...Array(5)].map((_, i) => document.getElementById(`star${i + 1}`));
        stars.forEach((star, i) =>
          star.addEventListener("click", () => {
            stars.forEach((s, idx) => (s.style.color = idx <= i ? "#facc15" : "#ddd"));
          })
        );
      },
      preConfirm: () => {
        const reviewText = document.getElementById("reviewText").value;
        if (!reviewText) Swal.showValidationMessage("Please enter a review text!");
        return reviewText;
      },
    }).then((r) => r.isConfirmed && Swal.fire("Thanks!", "Your review has been posted.", "success"));

  const handleTrack = () =>
    Swal.fire({
      title: "Tracking Package",
      text: "Your package is on the way! Expected delivery: Nov 4, 2025",
      icon: "info",
      confirmButtonColor: "#3b82f6",
    });

  const handleAskQuestion = () =>
    Swal.fire({
      title: "Ask Seller a Question",
      input: "textarea",
      inputLabel: "Enter your question below:",
      inputPlaceholder: "Example: Is this product under warranty?",
      showCancelButton: true,
      confirmButtonText: "Send",
      confirmButtonColor: "#6b7280",
    }).then((r) => r.isConfirmed && Swal.fire("Sent!", "Your question has been sent to the seller.", "success"));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      {/* 🔍 Header with Search Centered */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800">My Orders</h1>

        <div className="flex items-center bg-white rounded-full shadow-md border px-3 py-2 w-full md:w-[400px] focus-within:ring-2 focus-within:ring-blue-400">
          <FiSearch className="text-gray-400 text-xl mr-2" />
          <input
            type="text"
            placeholder="Search orders by name, date, or status..."
            className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          onClick={() =>
            Swal.fire("Searching...", "Fetching results for your query.", "info")
          }
          className="px-5 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition shadow-md"
        >
          Search Orders
        </button>
      </div>

      {/* 🧭 Tabs */}
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

      {/* 📦 Orders */}
      <div className="max-w-4xl mx-auto space-y-5">
        {filteredOrders.length ? (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border rounded-2xl shadow-sm hover:shadow-lg transition p-5"
            >
              <div className="flex items-center gap-5">
                <img
                  src={order.image}
                  alt={order.name}
                  className="w-24 h-24 object-cover rounded-xl border"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{order.name}</h3>
                  <p className="text-sm text-gray-500">Ordered on {order.date}</p>
                  <span
                    className={`inline-block mt-1 text-xs px-3 py-1 rounded-full font-medium ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Shipped"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              {/* ⚙️ Action Buttons */}
              <div className="mt-5 flex flex-wrap gap-2">
                <ActionButton icon={<FiTruck />} text="Track" color="blue" onClick={() => handleTrack(order)} />
                <ActionButton icon={<FiRefreshCw />} text="Refund" color="yellow" onClick={() => handleRefund(order)} />
                <ActionButton icon={<FiXCircle />} text="Cancel" color="red" onClick={() => handleCancel(order)} />
                <ActionButton icon={<FiCheckCircle />} text="Delivered" color="green" />
                <ActionButton icon={<FiMessageCircle />} text="Ask" color="gray" onClick={handleAskQuestion} />
                <ActionButton icon={<FiStar />} text="Feedback" color="purple" onClick={handleFeedback} />
                <ActionButton icon={<FiPackage />} text="Review" color="pink" onClick={() => handleReview(order)} />
                <ActionButton icon={<FiRepeat />} text="Buy Again" color="indigo" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">No matching orders found.</div>
        )}
      </div>
    </div>
  );
};

const ActionButton = ({ icon, text, color, onClick }) => {
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
};

export default OrdersPage;
