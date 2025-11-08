// src/pages/AdminSettingsPage.jsx
import React, { useState, useEffect } from "react";
import {
  FaCog,
  FaUsers,
  FaMoneyBillWave,
  FaBox,
  FaBell,
  FaLock,
  FaPlug,
  FaPalette,
  FaTools,
  FaQuestionCircle,
  FaUser,
  FaMoneyBill,
  FaTruck,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { TfiBackLeft } from "react-icons/tfi";
import { TbPasswordUser } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { NavLink } from "react-router-dom";
export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    developerMode: false,
    autoCacheRefresh: false,
    logsRetention: "30",
    experimental: [],
  });

  const handleClearCache = () => {
    // your cache-clearing logic here
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };
  const [theme, setTheme] = useState("Light");
  const [layout, setLayout] = useState("Compact");
  const [accentColor, setAccentColor] = useState("#2563eb"); // Default Blue
  const [fontStyle, setFontStyle] = useState("Inter");
  // --- State Hooks ---
  const [keyRotation, setKeyRotation] = useState("Every 90 Days");
  const [maskSensitive, setMaskSensitive] = useState(true);
  const [encryptBackups, setEncryptBackups] = useState(false);
  const [enableGDPR, setEnableGDPR] = useState(false);
  const [enablePCI, setEnablePCI] = useState(false);

  // --- Toast Handler (replace with your toast lib if needed) ---

  const [activeSection, setActiveSection] = useState("general");
  const [platformName, setPlatformName] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata (GMT+5:30)");
  const [currency, setCurrency] = useState("INR");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [logo, setLogo] = useState(null);
  const [favicon, setFavicon] = useState(null);
  const [users, setUsers] = useState(
    JSON.parse(localStorage.getItem("adminUsers")) || []
  );
  const [showAddUser, setShowAddUser] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Seller");
  const [notificationSettings, setNotificationSettings] = useState({
    globalEnable: true,
    channels: ["Email", "Push"],
    frequency: "Instant",
    templateType: "Order Updates",
    testRecipient: "",
    broadcastMessage: "",
  });
  const [apiAccess, setApiAccess] = useState("Enabled");
  const [webhookDelivery, setWebhookDelivery] = useState("Active");
  const [cloudSync, setCloudSync] = useState(false);
  const [auditLogging, setAuditLogging] = useState(true);
  const [kmsProvider, setKmsProvider] = useState("AWS KMS");
  const [showAlert, setShowAlert] = useState(false);

  const handleSave = () => {
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2500);
  };
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("adminNotificationSettings")
      );
      if (saved) setNotificationSettings((s) => ({ ...s, ...saved }));
    } catch (err) {
      // ignore parse errors
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem(
      "adminNotificationSettings",
      JSON.stringify(notificationSettings)
    );
    // debugging helpers
    console.log("Saved notificationSettings:", notificationSettings);
    alert("Notification settings saved!");
  };
  // --- React State Logic ---
  const [authSettings, setAuthSettings] = useState({
    twoFA: false,
    auditLogs: false,
    blockIPs: false,
    restrictLogin: false,
  });

  const [backupFrequency, setBackupFrequency] = useState("Daily");
  const [compliance, setCompliance] = useState({
    gdpr: false,
    retention: false,
    autoDelete: false,
  });

  const [toast, setToast] = useState(null);
  const [sessions, setSessions] = useState([
    {
      id: 1,
      user: "John Doe",
      device: "Windows / Chrome",
      location: "Delhi, IN",
      lastActive: "5 mins ago",
    },
    {
      id: 2,
      user: "Alice Smith",
      device: "Mac / Safari",
      location: "Mumbai, IN",
      lastActive: "20 mins ago",
    },
  ]);

  // --- Helper to show toast messages ---
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Button Handlers ---
  const handleSaveAuth = () => showToast("Authentication settings saved!");
  const handleSaveData = () => showToast("Data protection settings saved!");
  const handleRunScan = () => showToast("Security scan initiated...");
  const handleViewThreats = () => showToast("Redirecting to threat logs...");
  const handleSaveCompliance = () =>
    showToast("Compliance settings saved successfully!");
  const handleRevokeSession = (id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    showToast("Session revoked successfully!");
  };

  const [supportMessage, setSupportMessage] = useState("");
  const [showSupportToast, setShowSupportToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleSupportSubmit = (message) => {
    if (!message.trim()) return;
    console.log("Support message submitted:", message);

    // ✅ Show toast message
    setToastMessage("✅ Report submitted successfully!");
    setShowSupportToast(true);

    // Auto-hide toast after 2.5s
    setTimeout(() => setShowSupportToast(false), 2500);

    // Reset textarea
    setSupportMessage("");
  };

  const openLiveChat = () => {
    // Placeholder for chat system integration
    setToastMessage("💬 Live chat opening soon...");
    setShowSupportToast(true);
    setTimeout(() => setShowSupportToast(false), 2500);
  };

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // ✅ Password strength calculation
  useEffect(() => {
    const { new: newPass } = passwordData;
    let strength = 0;
    if (newPass.length >= 8) strength += 25;
    if (/[A-Z]/.test(newPass)) strength += 25;
    if (/[0-9]/.test(newPass)) strength += 25;
    if (/[^A-Za-z0-9]/.test(newPass)) strength += 25;
    setPasswordStrength(strength);
  }, [passwordData.new]);

  // ✅ SweetAlert integrated function
  const handleChangePassword = () => {
    const { current, new: newPass, confirm } = passwordData;

    if (newPass !== confirm) {
      Swal.fire({
        icon: "error",
        title: "Passwords do not match!",
        text: "Please ensure both new password fields match.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (passwordStrength < 70) {
      Swal.fire({
        icon: "warning",
        title: "Weak Password",
        text: "Please choose a stronger password before saving.",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    if (current === newPass) {
      Swal.fire({
        icon: "info",
        title: "No Change Detected",
        text: "Your new password must be different from the current one.",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    // ✅ API logic placeholder
    console.log("Password updated successfully:", passwordData);

    Swal.fire({
      icon: "success",
      title: "Password Changed Successfully!",
      text: "Your admin password has been updated securely.",
      confirmButtonColor: "#16a34a",
      background: "#ffffff",
      customClass: {
        popup: "rounded-2xl p-6 shadow-lg border border-gray-200",
        title: "text-lg font-semibold text-gray-800",
        htmlContainer: "text-gray-600 text-sm",
        confirmButton: "px-5 py-2 rounded-md font-medium",
      },
    });

    setPasswordData({ current: "", new: "", confirm: "" });
    setPasswordStrength(0);
  };

  const sections = [
    { id: "general", label: "General", icon: <FaCog /> },
    { id: "users", label: "User Management", icon: <FaUsers /> },
    { id: "payments", label: "Payments & Finance", icon: <FaMoneyBillWave /> },
    { id: "orders", label: "Orders & Logistics", icon: <FaBox /> },
    { id: "notifications", label: "Notifications", icon: <FaBell /> },
    { id: "security", label: "Security & Compliance", icon: <FaLock /> },
    { id: "integrations", label: "Integrations", icon: <FaPlug /> },
    { id: "appearance", label: "Appearance & UI", icon: <FaPalette /> },
    { id: "advanced", label: "Advanced", icon: <FaTools /> },
    { id: "support", label: "Support", icon: <FaQuestionCircle /> },
    {
      id: "changePassword",
      label: "Change Password",
      icon: <TbPasswordUser />,
    },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "general":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-3">General Settings</h2>
            <p className="text-gray-600 mb-5">
              Configure platform name, branding, timezone, and base currency.
            </p>

            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                const settings = {
                  platformName,
                  timezone,
                  currency,
                  maintenanceMode,
                  contactEmail,
                  contactPhone,
                };
                localStorage.setItem(
                  "adminGeneralSettings",
                  JSON.stringify(settings)
                );
                alert("Settings saved successfully!");
              }}
            >
              {/* Platform Name */}
              <div>
                <label className="block font-medium mb-1">Platform Name</label>
                <input
                  type="text"
                  placeholder="Enter platform name"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring focus:ring-blue-200"
                />
              </div>

              {/* Upload Logo */}
              <div>
                <label className="block font-medium mb-1">Upload Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogo(e.target.files[0])}
                  className="w-full border p-2 rounded-md"
                />
                {logo && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(logo)}
                      alt="Logo Preview"
                      className="w-20 h-20 object-contain border rounded-md"
                    />
                  </div>
                )}
              </div>

              {/* Favicon */}
              <div>
                <label className="block font-medium mb-1">Upload Favicon</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFavicon(e.target.files[0])}
                  className="w-full border p-2 rounded-md"
                />
                {favicon && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(favicon)}
                      alt="Favicon Preview"
                      className="w-10 h-10 object-contain border rounded-md"
                    />
                  </div>
                )}
              </div>

              {/* Timezone */}
              <div>
                <label className="block font-medium mb-1">Timezone</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option>Asia/Kolkata (GMT+5:30)</option>
                  <option>UTC</option>
                  <option>America/New_York</option>
                  <option>Europe/London</option>
                </select>
              </div>

              {/* Base Currency */}
              <div>
                <label className="block font-medium mb-1">Base Currency</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              {/* Maintenance Mode */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={() => setMaintenanceMode(!maintenanceMode)}
                  className="h-4 w-4"
                />
                <label className="text-gray-700">Enable Maintenance Mode</label>
              </div>

              {/* Contact Email */}
              <div>
                <label className="block font-medium mb-1">Contact Email</label>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring focus:ring-blue-200"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block font-medium mb-1">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring focus:ring-blue-200"
                />
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
              >
                Save Changes
              </button>
            </form>
          </div>
        );

      case "users":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-3">User Management</h2>
            <p className="text-gray-600 mb-4">
              Manage user accounts, roles, and access permissions.
            </p>

            {/* Add User Form Toggle */}
            <button
              onClick={() => setShowAddUser(!showAddUser)}
              className="px-4 py-2 bg-green-600 text-white rounded-md mb-4 hover:bg-green-700"
            >
              {showAddUser ? "Close Form" : "Add New User"}
            </button>

            {/* Add User Form */}
            {showAddUser && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const newUser = {
                    id: Date.now(),
                    name,
                    email,
                    role,
                    status: "Active",
                  };
                  setUsers([...users, newUser]);
                  setName("");
                  setEmail("");
                  setRole("Seller");
                  setShowAddUser(false);
                  localStorage.setItem(
                    "adminUsers",
                    JSON.stringify([...users, newUser])
                  );
                }}
                className="bg-white p-4 rounded-md border mb-5 grid gap-3 md:grid-cols-2"
              >
                <div>
                  <label className="block font-medium">Name</label>
                  <input
                    type="text"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium">Email</label>
                  <input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option>Admin</option>
                    <option>Seller</option>
                    <option>Staff</option>
                    <option>Support</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="col-span-full px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
                >
                  Save User
                </button>
              </form>
            )}

            {/* User Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded-md shadow-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="px-4 py-2 border-b">Name</th>
                    <th className="px-4 py-2 border-b">Email</th>
                    <th className="px-4 py-2 border-b">Role</th>
                    <th className="px-4 py-2 border-b">Status</th>
                    <th className="px-4 py-2 border-b text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b">{u.name}</td>
                        <td className="px-4 py-2 border-b">{u.email}</td>
                        <td className="px-4 py-2 border-b">{u.role}</td>
                        <td className="px-4 py-2 border-b">
                          <span
                            className={`px-2 py-1 rounded-full text-sm ${
                              u.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 border-b text-center space-x-3">
                          <button
                            onClick={() =>
                              setUsers(
                                users.map((user) =>
                                  user.id === u.id
                                    ? {
                                        ...user,
                                        status:
                                          user.status === "Active"
                                            ? "Suspended"
                                            : "Active",
                                      }
                                    : user
                                )
                              )
                            }
                            className="text-blue-600 hover:underline"
                          >
                            {u.status === "Active" ? "Suspend" : "Activate"}
                          </button>
                          <button
                            onClick={() =>
                              setUsers(users.filter((user) => user.id !== u.id))
                            }
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-5 text-gray-500 italic"
                      >
                        No users found. Add a new user to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "payments":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-3">Payments & Finance</h2>
            <p className="text-gray-600 mb-4">
              Manage payment gateways, settlements, taxes, refunds, and finance
              settings.
            </p>

            {/* Default Gateway */}
            <div className="mb-6">
              <label className="block font-medium mb-1">Default Gateway</label>
              <select className="w-full p-2 border rounded-md">
                <option>Razorpay</option>
                <option>Stripe</option>
                <option>PayPal</option>
                <option>Cashfree</option>
                <option>Paytm</option>
              </select>
            </div>

            {/* Enable/Disable Gateways */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Active Gateways</h3>
              <div className="space-y-2">
                {["Razorpay", "Stripe", "PayPal"].map((gateway) => (
                  <div
                    key={gateway}
                    className="flex items-center justify-between border p-3 rounded-md"
                  >
                    <span>{gateway}</span>
                    <label className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Enabled</span>
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        defaultChecked
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Settlement Settings */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Settlement Settings</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Settlement Frequency
                  </label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Settlement Mode
                  </label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Bank Transfer</option>
                    <option>UPI</option>
                    <option>Wallet</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tax Settings */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Tax Settings</h3>
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    GST (%)
                  </label>
                  <input
                    type="number"
                    placeholder="18"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    TDS (%)
                  </label>
                  <input
                    type="number"
                    placeholder="1"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Default Currency
                  </label>
                  <select className="w-full p-2 border rounded-md">
                    <option>INR</option>
                    <option>USD</option>
                    <option>EUR</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Refunds and Fraud Control */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Refund & Fraud Control</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" />
                  Enable Auto-Refund for Failed Payments
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" />
                  Enable Payment Retry for Declined Transactions
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" defaultChecked />
                  Fraud Detection & Transaction Risk Scoring
                </label>
              </div>
            </div>

            {/* Payout Settings */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Payout Rules</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Minimum Payout Amount
                  </label>
                  <input
                    type="number"
                    placeholder="1000"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Auto-Payout Threshold
                  </label>
                  <input
                    type="number"
                    placeholder="5000"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button className="px-5 py-2 bg-blue-600 text-white rounded-md">
                Save Settings
              </button>
              <button className="px-5 py-2 bg-gray-200 rounded-md">
                Export Finance Data
              </button>
              <button className="px-5 py-2 bg-green-600 text-white rounded-md">
                Reconcile Now
              </button>
            </div>

            {/* Future Hooks */}
            <div className="mt-8 border-t pt-4 text-sm text-gray-500">
              <p>
                🔮 Coming Soon: BNPL, Wallet Top-Ups, Multi-Currency Conversion,
                and Crypto Payments.
              </p>
            </div>
          </div>
        );

      case "orders & logistics":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-3">Orders & Logistics</h2>
            <p className="text-gray-600 mb-4">
              Configure how orders are processed, shipped, tracked, and managed
              across couriers and warehouses.
            </p>

            {/* ---- Order Processing Settings ---- */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Order Processing</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" defaultChecked />
                  Auto-confirm prepaid orders
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" />
                  Manual approval for COD orders
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" />
                  Enable bulk order processing
                </label>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Default Order Priority
                  </label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Normal</option>
                    <option>High</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ---- Shipping & Courier Settings ---- */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Shipping & Courier Partners</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Default Courier
                  </label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Delhivery</option>
                    <option>BlueDart</option>
                    <option>Shiprocket</option>
                    <option>Ecom Express</option>
                    <option>Self-Ship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Shipping Zone Management
                  </label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Auto Assign by Pincode</option>
                    <option>Manual Zone Control</option>
                    <option>Courier API Sync</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-3 mt-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" />
                  Enable COD Availability Check
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" defaultChecked />
                  Auto Assign Cheapest Courier
                </label>
              </div>
            </div>

            {/* ---- Warehouse & Inventory ---- */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Warehouse & Inventory Sync</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Default Warehouse
                  </label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Mumbai Central</option>
                    <option>Delhi Hub</option>
                    <option>Bangalore Fulfillment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Inventory Sync Mode
                  </label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Auto on Order Events</option>
                    <option>Manual Sync</option>
                    <option>API via ERP</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 mt-3">
                <input type="checkbox" className="h-4 w-4" defaultChecked />
                Reserve stock for high-demand SKUs
              </label>
            </div>

            {/* ---- Returns & Refunds ---- */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Returns & Refund Policy</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" defaultChecked />
                  Enable returns for eligible products
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" />
                  Auto-approve low-value return requests
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" />
                  Enable reverse logistics pickup
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Refund Processing Timeline (days)
                    </label>
                    <input
                      type="number"
                      placeholder="7"
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Return Window (days)
                    </label>
                    <input
                      type="number"
                      placeholder="10"
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ---- SLA & Delivery Tracking ---- */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">SLA & Tracking Settings</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Expected Delivery SLA (days)
                  </label>
                  <input
                    type="number"
                    placeholder="3"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tracking Provider
                  </label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Courier API</option>
                    <option>Manual Updates</option>
                    <option>3rd-Party Integration</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 mt-3">
                <input type="checkbox" className="h-4 w-4" defaultChecked />
                Notify customers via SMS & Email when shipment status updates
              </label>
            </div>

            {/* ---- Analytics Preview ---- */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Analytics Overview</h3>
              <div className="grid md:grid-cols-3 gap-3 text-center">
                <div className="p-4 border rounded-md bg-gray-50">
                  <p className="text-gray-500 text-sm">Avg. Delivery Time</p>
                  <p className="text-lg font-semibold">2.8 days</p>
                </div>
                <div className="p-4 border rounded-md bg-gray-50">
                  <p className="text-gray-500 text-sm">Return Rate</p>
                  <p className="text-lg font-semibold">3.2%</p>
                </div>
                <div className="p-4 border rounded-md bg-gray-50">
                  <p className="text-gray-500 text-sm">Courier Success Rate</p>
                  <p className="text-lg font-semibold">98.7%</p>
                </div>
              </div>
            </div>

            {/* ---- Buttons ---- */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button className="px-5 py-2 bg-blue-600 text-white rounded-md">
                Save Settings
              </button>
              <button className="px-5 py-2 bg-gray-200 rounded-md">
                Export Logistics Report
              </button>
              <button className="px-5 py-2 bg-green-600 text-white rounded-md">
                Run Reconciliation
              </button>
            </div>

            {/* ---- Future Enhancements ---- */}
            <div className="mt-8 border-t pt-4 text-sm text-gray-500">
              <p>
                🔮 Coming Soon: AI courier optimization, drone delivery API,
                real-time warehouse heatmap, and predictive delay alerts.
              </p>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-8">
            <header>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Notification Settings
              </h2>
              <p className="text-gray-500">
                Control how alerts, emails, and push notifications are sent to
                users and staff.
              </p>
            </header>

            {/* --- Global Toggle --- */}
            <section className="p-6 bg-white rounded-2xl shadow-sm border">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-semibold text-gray-700">
                    Global Notifications
                  </h3>
                  <p className="text-sm text-gray-500">
                    Turn all notifications on or off for the entire platform.
                  </p>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.globalEnable}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        globalEnable: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </section>

            {/* --- Channels --- */}
            <section className="p-6 bg-white rounded-2xl shadow-sm border">
              <h3 className="font-semibold text-gray-700 mb-3">
                Notification Channels
              </h3>
              <div className="flex flex-nowrap gap-2 items-center">
                {["Email", "SMS", "Push", "In-App"].map((ch) => (
                  <label
                    key={ch}
                    className={`flex items-center  gap-0 px-4  border  rounded-xl cursor-pointer hover:shadow-sm transition ${
                      notificationSettings.channels.includes(ch)
                        ? "bg-blue-50 border-blue-400"
                        : "bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={notificationSettings.channels.includes(ch)}
                      onChange={(e) => {
                        const newChannels = e.target.checked
                          ? [...notificationSettings.channels, ch]
                          : notificationSettings.channels.filter(
                              (c) => c !== ch
                            );
                        setNotificationSettings({
                          ...notificationSettings,
                          channels: newChannels,
                        });
                      }}
                    />
                    <span className="font-medium w-[110px]">{ch}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* --- Frequency + Template --- */}
            <section className="p-6 bg-white rounded-2xl shadow-sm border grid md:grid-cols-2 gap-6">
              {/* Delivery Frequency */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600">
                  Delivery Frequency
                </label>
                <select
                  value={notificationSettings.frequency}
                  onChange={(e) =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      frequency: e.target.value,
                    }))
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Instant">Instant</option>
                  <option value="Daily Digest">Daily Digest</option>
                  <option value="Weekly Summary">Weekly Summary</option>
                </select>
              </div>

              {/* Default Template */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600">
                  Default Template
                </label>
                <select
                  value={notificationSettings.templateType}
                  onChange={(e) =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      templateType: e.target.value,
                    }))
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Order Updates">Order Updates</option>
                  <option value="Promotional Offers">Promotional Offers</option>
                  <option value="Payment Receipts">Payment Receipts</option>
                  <option value="System Alerts">System Alerts</option>
                </select>
              </div>

              {/* Save button (type="button" avoids accidental form submit) */}
              <div className="md:col-span-2 mt-4">
                <button
                  type="button"
                  onClick={saveSettings}
                  className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </section>

            {/* --- Test Notification --- */}
            <section className="p-6 bg-white rounded-2xl shadow-sm border">
              <h3 className="font-semibold text-gray-700 mb-3">
                Test Notification
              </h3>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Enter test email or phone number"
                  value={notificationSettings.testRecipient}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      testRecipient: e.target.value,
                    })
                  }
                  className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!notificationSettings.testRecipient.trim()) {
                      toast.error("Please enter a valid recipient!");
                    } else {
                      toast.success(
                        `Test notification sent to ${notificationSettings.testRecipient}`
                      );
                    }
                  }}
                  className="px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Send Test
                </button>
              </div>
            </section>

            {/* --- Emergency Broadcast --- */}
            <section className="p-6 bg-white rounded-2xl shadow-sm border">
              <h3 className="font-semibold text-gray-700 mb-3">
                Emergency Broadcast
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                Instantly alert all users in case of downtime or critical
                updates.
              </p>
              <textarea
                placeholder="Type urgent system message..."
                value={notificationSettings.broadcastMessage}
                onChange={(e) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    broadcastMessage: e.target.value,
                  })
                }
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
              ></textarea>
              <button
                type="button"
                onClick={() => {
                  if (!notificationSettings.broadcastMessage.trim()) {
                    toast.error("Please enter a broadcast message first!");
                  } else {
                    toast.success("Emergency broadcast sent to all users!");
                  }
                }}
                className="mt-3 px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Send Broadcast
              </button>
            </section>

            {/* --- Save Button --- */}
            <div className="flex justify-end">
              <button
                onClick={() => handleSave("Notifications")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition"
              >
                💾 Save All Changes
              </button>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6 relative">
            {/* Toast Notification */}
            {toast && (
              <div
                className={`fixed top-5 right-5 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm ${
                  toast.type === "success" ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {toast.msg}
              </div>
            )}

            {/* Page Header */}
            <div>
              <h2 className="text-2xl font-semibold mb-2">
                Security & Compliance
              </h2>
              <p className="text-gray-600">
                Manage authentication, data protection, and audit trails for
                system security.
              </p>
            </div>

            {/* Authentication Section */}
            <div className="bg-white shadow rounded-xl p-5 space-y-4 border">
              <h3 className="text-lg font-semibold">
                Authentication & Monitoring
              </h3>

              <div className="grid md:grid-cols-2 gap-3">
                {[
                  {
                    key: "twoFA",
                    label: "Enforce Two-Factor Authentication (2FA)",
                  },
                  { key: "auditLogs", label: "Enable Audit Logging" },
                  {
                    key: "blockIPs",
                    label: "Block Suspicious IPs Automatically",
                  },
                  {
                    key: "restrictLogin",
                    label: "Restrict Multiple Logins per User",
                  },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={authSettings[item.key]}
                      onChange={(e) =>
                        setAuthSettings({
                          ...authSettings,
                          [item.key]: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleSaveAuth}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Save Authentication Settings
              </button>
            </div>

            {/* Data Protection Section */}
            <div className="bg-white shadow rounded-xl p-5 space-y-4 border">
              <h3 className="text-lg font-semibold">
                Encryption & Data Protection
              </h3>
              <p className="text-gray-600 mb-3">
                Manage system-wide encryption, key rotation, and masking of
                sensitive data.
              </p>

              {/* Encryption Status */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Encryption Status
                  </label>
                  <div className="flex items-center justify-between border rounded-md p-3 bg-gray-50">
                    <span>AES-256 Encryption</span>
                    <span className="text-green-600 font-medium cursor-pointer">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Management */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    showToast("New encryption key generated successfully!")
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Generate New Key
                </button>
                <button
                  onClick={() =>
                    showToast("Encryption keys rotated successfully!")
                  }
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition"
                >
                  Rotate Keys
                </button>
              </div>

              {/* Masking & Compliance */}
              <div className="grid md:grid-cols-2 gap-3 mt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={maskSensitive}
                    onChange={(e) => setMaskSensitive(e.target.checked)}
                    className="h-4 w-4 text-blue-600"
                  />
                  Mask Sensitive User Data (Emails, PAN, Phone)
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={encryptBackups}
                    onChange={(e) => setEncryptBackups(e.target.checked)}
                    className="h-4 w-4 text-blue-600"
                  />
                  Encrypt Backups Separately
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableGDPR}
                    onChange={(e) => setEnableGDPR(e.target.checked)}
                    className="h-4 w-4 text-blue-600"
                  />
                  Enforce GDPR Masking Rules
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enablePCI}
                    onChange={(e) => setEnablePCI(e.target.checked)}
                    className="h-4 w-4 text-blue-600"
                  />
                  Enable PCI-DSS Compliance
                </label>
              </div>

              {/* Backup Controls */}
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={() => showToast("Manual encrypted backup created!")}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  Run Encrypted Backup
                </button>
                <button
                  onClick={() =>
                    showToast("Data restore started (secured mode)!")
                  }
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                >
                  Restore Encrypted Data
                </button>
              </div>

              <div className="mt-4">
                <button
                  onClick={() =>
                    showToast("Encryption settings saved successfully!")
                  }
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Save Encryption Settings
                </button>
              </div>
            </div>

            {/* Security Insights */}
            <div className="bg-white shadow rounded-xl p-5 space-y-4 border">
              <h3 className="text-lg font-semibold">Security Insights</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>
                  Last security scan:{" "}
                  <span className="text-gray-500">2 hours ago</span>
                </li>
                <li>
                  Active user sessions:{" "}
                  <span className="text-blue-600 font-semibold">
                    {sessions.length}
                  </span>
                </li>
                <li>
                  Detected threats (past week):{" "}
                  <span className="text-red-600 font-semibold">3</span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleRunScan}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                >
                  Run Security Scan
                </button>
                <button
                  onClick={handleViewThreats}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  View Threat Logs
                </button>
              </div>
            </div>

            {/* Compliance Section */}
            <div className="bg-white shadow rounded-xl p-5 space-y-4 border">
              <h3 className="text-lg font-semibold">Compliance & Audit</h3>
              {[
                { key: "gdpr", label: "Enable GDPR Compliance Mode" },
                { key: "retention", label: "Enable Data Retention Policy" },
                { key: "autoDelete", label: "Auto-delete Logs after 90 Days" },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={compliance[item.key]}
                    onChange={(e) =>
                      setCompliance({
                        ...compliance,
                        [item.key]: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
              <button
                onClick={handleSaveCompliance}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Save Compliance Settings
              </button>
            </div>

            {/* Active Sessions */}
            <div className="bg-white shadow rounded-xl p-5 border overflow-x-auto">
              <h3 className="text-lg font-semibold mb-3">Active Sessions</h3>
              <table className="w-full border text-sm text-left">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="p-2">User</th>
                    <th className="p-2">Device</th>
                    <th className="p-2">Location</th>
                    <th className="p-2">Last Active</th>
                    <th className="p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{s.user}</td>
                      <td className="p-2">{s.device}</td>
                      <td className="p-2">{s.location}</td>
                      <td className="p-2">{s.lastActive}</td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleRevokeSession(s.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                  {sessions.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center p-3 text-gray-500">
                        No active sessions.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "integrations":
        return (
          <div className="relative bg-white shadow rounded-xl p-5 border space-y-4 overflow-visible">
            <h3 className="text-lg font-semibold">Integrations</h3>
            <p className="text-gray-600 mb-3">
              Manage API, webhooks, external KMS, and logging integrations
              securely.
            </p>

            {/* --- API Access --- */}
            <div className="flex items-center justify-between border rounded-md p-3 bg-gray-50 relative z-50">
              <span className="text-gray-700">API Access</span>
              <select
                value={apiAccess}
                onChange={(e) => setApiAccess(e.target.value)}
                style={{ pointerEvents: "auto" }}
                className={`border rounded-md p-2 min-w-[160px] text-sm bg-white cursor-pointer relative z-50 ${
                  apiAccess === "Enabled"
                    ? "text-green-600 bg-green-50"
                    : apiAccess === "Restricted"
                    ? "text-yellow-600 bg-yellow-50"
                    : "text-red-600 bg-red-50"
                }`}
              >
                <option value="Enabled">Enabled</option>
                <option value="Disabled">Disabled</option>
                <option value="Restricted">Restricted</option>
              </select>
            </div>

            {/* --- Webhook Delivery --- */}
            <div className="flex items-center justify-between border rounded-md p-3 bg-gray-50 relative z-50">
              <span className="text-gray-700">Webhook Delivery</span>
              <select
                value={webhookDelivery}
                onChange={(e) => setWebhookDelivery(e.target.value)}
                style={{ pointerEvents: "auto" }}
                className={`border rounded-md p-2 min-w-[160px] text-sm bg-white cursor-pointer relative z-50 ${
                  webhookDelivery === "Active"
                    ? "text-green-600 bg-green-50"
                    : webhookDelivery === "Paused"
                    ? "text-yellow-600 bg-yellow-50"
                    : "text-red-600 bg-red-50"
                }`}
              >
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>

            {/* --- Cloud Sync --- */}
            <div className="flex items-center justify-between border rounded-md p-3 bg-gray-50 relative z-40">
              <label className="text-gray-700 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={cloudSync}
                  onChange={(e) => setCloudSync(e.target.checked)}
                  className="h-4 w-4 text-blue-600 cursor-pointer"
                />
                Enable Cloud Sync (Auto Backup)
              </label>
            </div>

            {/* --- Audit Logging --- */}
            <div className="flex items-center justify-between border rounded-md p-3 bg-gray-50 relative z-40">
              <label className="text-gray-700 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={auditLogging}
                  onChange={(e) => setAuditLogging(e.target.checked)}
                  className="h-4 w-4 text-blue-600 cursor-pointer"
                />
                Enable Audit Logging (Security Events)
              </label>
            </div>

            {/* --- KMS Provider --- */}
            <div className="flex items-center justify-between border rounded-md p-3 bg-gray-50 relative z-50">
              <span className="text-gray-700">KMS Provider</span>
              <select
                value={kmsProvider}
                onChange={(e) => setKmsProvider(e.target.value)}
                style={{ pointerEvents: "auto" }}
                className="border rounded-md p-2 min-w-[180px] bg-white text-sm cursor-pointer relative z-50"
              >
                <option value="AWS KMS">AWS KMS</option>
                <option value="Google Cloud KMS">Google Cloud KMS</option>
                <option value="Azure Key Vault">Azure Key Vault</option>
                <option value="HashiCorp Vault">HashiCorp Vault</option>
                <option value="On-Premise">On-Premise (Custom)</option>
              </select>
            </div>

            {/* --- Save Button --- */}
            <div className="pt-3">
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Save Integration Settings
              </button>
            </div>

            {/* --- Toast Alert --- */}
            <AnimatePresence>
              {showAlert && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ duration: 0.4 }}
                  className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2"
                >
                  ✅ <span>Settings saved successfully!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case "appearance":
        return (
          <div>
            <div className="relative bg-white shadow rounded-xl p-5 border space-y-4 overflow-visible">
              <h3 className="text-lg font-semibold">Appearance Settings</h3>
              <p className="text-gray-600 mb-3">
                Customize the look and feel of your admin dashboard — choose
                themes, colors, and layout styles.
              </p>

              {/* --- Theme Mode --- */}
              <div className="flex items-center justify-between border rounded-md p-3 bg-gray-50 relative z-50">
                <span className="text-gray-700">Theme Mode</span>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  style={{ pointerEvents: "auto" }}
                  className="border rounded-md p-2 min-w-[150px] text-sm bg-white cursor-pointer relative z-50"
                >
                  <option value="Light">Light</option>
                  <option value="Dark">Dark</option>
                  <option value="System">System Default</option>
                </select>
              </div>

              {/* --- Layout Density --- */}
              <div className="flex items-center justify-between border rounded-md p-3 bg-gray-50 relative z-50">
                <span className="text-gray-700">Layout Density</span>
                <select
                  value={layout}
                  onChange={(e) => setLayout(e.target.value)}
                  style={{ pointerEvents: "auto" }}
                  className="border rounded-md p-2 min-w-[150px] text-sm bg-white cursor-pointer relative z-50"
                >
                  <option value="Compact">Compact</option>
                  <option value="Comfortable">Comfortable</option>
                  <option value="Spacious">Spacious</option>
                </select>
              </div>

              {/* --- Accent Color --- */}
              <div className="flex items-center justify-between border rounded-md p-3 bg-gray-50">
                <span className="text-gray-700">Accent Color</span>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-8 w-16 rounded cursor-pointer border"
                />
              </div>

              {/* --- Font Style --- */}
              <div className="flex items-center justify-between border rounded-md p-3 bg-gray-50 relative z-50">
                <span className="text-gray-700">Font Style</span>
                <select
                  value={fontStyle}
                  onChange={(e) => setFontStyle(e.target.value)}
                  style={{ pointerEvents: "auto" }}
                  className="border rounded-md p-2 min-w-[180px] text-sm bg-white cursor-pointer relative z-50"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Montserrat">Montserrat</option>
                </select>
              </div>

              {/* --- Live Preview --- */}
              <div className="border rounded-md p-4 bg-gray-50">
                <h4 className="text-gray-700 text-sm font-medium mb-2">
                  Preview
                </h4>
                <div
                  className={`p-4 rounded-lg border shadow-sm ${
                    theme === "Dark"
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-700"
                  }`}
                  style={{
                    fontFamily: fontStyle,
                    borderColor: accentColor,
                  }}
                >
                  <h5
                    className="text-base font-semibold mb-1"
                    style={{ color: accentColor }}
                  >
                    Dashboard Title
                  </h5>
                  <p className="text-sm">
                    This is a preview of how your dashboard will look with your
                    selected theme and style.
                  </p>
                </div>
              </div>

              {/* --- Save Button --- */}
              <div className="pt-3">
                <button
                  onClick={handleSave}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Save Appearance Settings
                </button>
              </div>

              {/* --- Toast Alert --- */}
              <AnimatePresence>
                {showAlert && (
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 40 }}
                    transition={{ duration: 0.4 }}
                    className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2"
                  >
                    🎨 <span>Appearance settings saved successfully!</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );

      case "advanced":
        return (
          <section className="p-6 bg-white rounded-2xl shadow-sm border relative">
            <h3 className="font-semibold text-gray-800 mb-3">
              Advanced Settings
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Manage developer tools, performance options, and experimental
              features.
            </p>

            <div className="space-y-6">
              {/* --- Developer Mode --- */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between border rounded-xl p-4 gap-3">
                <div>
                  <h4 className="font-medium text-gray-800 flex items-center gap-2">
                    Developer Mode
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        settings.developerMode
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {settings.developerMode ? "ON" : "OFF"}
                    </span>
                  </h4>
                  <p className="text-sm text-gray-500">
                    Enable debug logs and developer features.
                  </p>
                </div>

                {/* Toggle Switch */}
                <label className="inline-flex items-center cursor-pointer self-start md:self-auto">
                  <input
                    type="checkbox"
                    checked={!!settings.developerMode}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        developerMode: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full relative transition-colors peer-checked:bg-green-500">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                  </div>
                </label>
              </div>

              {/* --- Cache Management --- */}
              <div className="border rounded-xl p-4 flex flex-col gap-3">
                <div>
                  <h4 className="font-medium text-gray-800">
                    Cache Management
                  </h4>
                  <p className="text-sm text-gray-500">
                    Clear cache or toggle auto-refresh.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleClearCache}
                    className="w-full sm:w-auto px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Clear Cache
                  </button>

                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        autoCacheRefresh: !settings.autoCacheRefresh,
                      })
                    }
                    className={`w-full sm:w-auto px-4 py-2 text-sm rounded-md transition ${
                      settings.autoCacheRefresh
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {settings.autoCacheRefresh
                      ? "Auto-Refresh: ON"
                      : "Auto-Refresh: OFF"}
                  </button>
                </div>
              </div>

              {/* --- Logs Retention --- */}
              <div className="border rounded-xl p-4 flex flex-col gap-3">
                <h4 className="font-medium text-gray-800">Logs Retention</h4>
                <p className="text-sm text-gray-500">
                  Choose how long to keep system logs.
                </p>
                <select
                  value={settings.logsRetention}
                  onChange={(e) =>
                    setSettings({ ...settings, logsRetention: e.target.value })
                  }
                  className="border rounded-md p-2 text-sm bg-white w-full sm:w-64 cursor-pointer"
                >
                  <option value="7">7 Days</option>
                  <option value="30">30 Days</option>
                  <option value="90">90 Days</option>
                  <option value="365">1 Year</option>
                </select>
              </div>

              {/* --- Experimental Features --- */}
              <div className="border rounded-xl p-4 flex flex-col gap-3">
                <h4 className="font-medium text-gray-800">
                  Experimental Features
                </h4>
                <p className="text-sm text-gray-500">
                  Try out new beta functionalities before public release.
                </p>
                <div className="flex flex-wrap gap-3">
                  {["AI Insights", "Auto Optimization", "Dark Mode v2"].map(
                    (feature) => (
                      <label
                        key={feature}
                        className="flex items-center gap-2 cursor-pointer px-3 py-2 border rounded-md hover:bg-gray-50 transition"
                      >
                        <input
                          type="checkbox"
                          checked={settings.experimental?.includes(feature)}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...settings.experimental, feature]
                              : settings.experimental.filter(
                                  (f) => f !== feature
                                );
                            setSettings({ ...settings, experimental: updated });
                          }}
                          className="accent-blue-600"
                        />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </label>
                    )
                  )}
                </div>
              </div>
            </div>
          </section>
        );

      case "support":
        return (
          <section className="p-6 bg-white rounded-2xl shadow-sm border relative overflow-hidden">
            <h3 className="font-semibold text-gray-800 mb-3">
              Support & Assistance
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Find help, contact our team, or report issues directly to the
              administrators.
            </p>

            <div className="space-y-6">
              {/* --- Help Center --- */}
              <div className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h4 className="font-medium text-gray-800">Help Center</h4>
                  <p className="text-sm text-gray-500">
                    Browse FAQs, guides, and troubleshooting tips.
                  </p>
                </div>
                <a
                  href="/help-center"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Open Help Center
                </a>
              </div>

              {/* --- Report an Issue --- */}
              <div className="border rounded-xl p-4 flex flex-col gap-3 relative">
                <h4 className="font-medium text-gray-800">Report an Issue</h4>
                <p className="text-sm text-gray-500">
                  Encountered a problem? Describe it below so our team can
                  assist you.
                </p>

                <textarea
                  placeholder="Describe your issue or feedback..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  rows={4}
                  className="border rounded-md p-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                ></textarea>

                <button
                  onClick={() => handleSupportSubmit(supportMessage)}
                  className="self-start px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  Submit Report
                </button>
              </div>

              {/* --- Contact Channels --- */}
              <div className="border rounded-xl p-4 flex flex-col gap-3">
                <h4 className="font-medium text-gray-800">Contact Channels</h4>
                <p className="text-sm text-gray-500">
                  Reach out directly for admin or technical support.
                </p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>
                    📧 Email:{" "}
                    <a
                      href="mailto:support@bbscart.com"
                      className="text-blue-600 hover:underline"
                    >
                      support@bbscart.com
                    </a>
                  </li>
                  <li>
                    💬 Chat:{" "}
                    <button
                      onClick={openLiveChat}
                      className="text-blue-600 hover:underline"
                    >
                      Start Live Chat
                    </button>
                  </li>
                  <li>
                    📞 Phone:{" "}
                    <span className="font-medium text-gray-800">
                      +91 98765 43210
                    </span>
                  </li>
                </ul>
              </div>

              {/* --- System Status --- */}
              <div className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h4 className="font-medium text-gray-800">System Status</h4>
                  <p className="text-sm text-gray-500">
                    Check for outages or maintenance updates.
                  </p>
                </div>
                <a
                  href="/status"
                  className="px-4 py-2 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                >
                  View Status Page
                </a>
              </div>
            </div>

            {/* ✅ Toast Notification */}
            <AnimatePresence>
              {showSupportToast && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="fixed bottom-6 right-6 bg-green-600 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50"
                >
                  {toastMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        );

      case "changePassword":
        return (
          <div className="flex justify-center items-start  min-h-screen bg-gray-50 my-5 ">
            <section className=" bg-white rounded-2xl shadow-md border max-w-xl border-black p-11 space-y-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 justify-center border-b pb-2">
                <FaLock className="text-orange-500" />
                Change Password
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Update your admin password to keep your account secure.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleChangePassword();
                }}
                className="space-y-5"
              >
                {/* --- Current Password --- */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={passwordData.current}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          current: e.target.value,
                        })
                      }
                      placeholder="Enter current password"
                      className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrent ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* --- New Password --- */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={passwordData.new}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          new: e.target.value,
                        })
                      }
                      placeholder="Enter new password"
                      className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                    >
                      {showNew ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 8 characters, including a number and
                    symbol.
                  </p>
                </div>

                {/* --- Confirm Password --- */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={passwordData.confirm}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirm: e.target.value,
                        })
                      }
                      placeholder="Re-enter new password"
                      className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* --- Password Strength Bar --- */}
                <div className="w-full bg-gray-200 h-2 rounded-md overflow-hidden">
                  <div
                    className={`h-2 rounded-md transition-all duration-300 ${
                      passwordStrength < 40
                        ? "bg-red-500 w-1/4"
                        : passwordStrength < 70
                        ? "bg-yellow-500 w-2/4"
                        : "bg-green-500 w-3/4"
                    }`}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  Password Strength:{" "}
                  <span
                    className={
                      passwordStrength < 40
                        ? "text-red-500"
                        : passwordStrength < 70
                        ? "text-yellow-500"
                        : "text-green-600"
                    }
                  >
                    {passwordStrength < 40
                      ? "Weak"
                      : passwordStrength < 70
                      ? "Medium"
                      : "Strong"}
                  </span>
                </p>

                {/* --- Submit --- */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-all font-medium"
                >
                  Update Password
                </button>
              </form>
            </section>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-gray-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r shadow-sm">
        <div className="p-4 border-b flex items-center flex-row justify-between">
          <h1 className="text-lg font-semibold">Admin Settings</h1>
          <a
            href="/admin/dashboard"
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
          >
            <TfiBackLeft className="text-xl" />
          </a>
        </div>
        <nav className="flex flex-col">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-3 px-5 py-3 text-left hover:bg-blue-50 ${
                activeSection === s.id ? "bg-blue-100 font-semibold" : ""
              }`}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">{renderSection()}</main>
    </div>
  );
}
