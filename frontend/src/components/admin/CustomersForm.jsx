import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const CustomersForm = ({ customer, onSave, setIsAddEditModalOpen }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    phone: "",
  });
    
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer?.name || "",
        email: customer?.email || "",
        password: customer?.password || "",
        confirmPassword: customer?.password || "",
        role: "user",
        phone: customer?.userdetails?.phone || "",
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Allow only digits and max length of 10
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
      if (!formData.name.trim()) {
        toast.error('Name is required.');
        return false;
      }
  
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        toast.error('Please enter a valid email address.');
        return false;
      }
  
      if (!/^\d{10}$/.test(formData.phone)) {
        toast.error('Phone number must be exactly 10 digits.');
        return false;
      }
  
      if (!customer) {
        const passwordRegex = /^.*(?=.{6,})(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/;
        if (!passwordRegex.test(formData.password)) {
          toast.error('Password must be at least 6 characters, include 1 uppercase, 1 lowercase, and 1 special character.');
          return false;
        }
  
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match.");
          return false;
        }
      }
  
      return true;
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const submissionData = new FormData();
    if (customer?._id) {
      submissionData.append("_id", customer._id);
    }
    submissionData.append("name", formData.name);
    submissionData.append("email", formData.email);
    submissionData.append("phone", formData.phone);
    submissionData.append("role", formData.role);
    submissionData.append("password", formData.password);
    onSave(submissionData);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
      phone: "",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="relative w-full max-w-md mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col" style={{ maxHeight: '90vh' }}>
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-2xl transition z-10"
          onClick={() => setIsAddEditModalOpen(false)}
          aria-label="Close"
        >
          <i className="ri-close-circle-line"></i>
        </button>
        {/* Header */}
        <div className="px-4 pt-4 pb-2 border-b border-gray-100 dark:border-gray-800 rounded-t-3xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900">
          <h2 className="text-xl font-bold text-center text-blue-800 dark:text-blue-300 tracking-tight">
            {customer ? "Edit Customer" : "Add Customer"}
          </h2>
        </div>
        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: 'thin', msOverflowStyle: 'none' }}>
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 flex flex-col min-h-0">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter Full Name"
                className="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter Email"
                className="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                placeholder="88888 88888"
                className="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            {/* Password */}
            {!customer && (
              <>
                <div className="relative">
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-10 cursor-pointer text-gray-500 dark:text-gray-300"
                  >
                    <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
                  </span>
                </div>
                {/* Confirm Password */}
                <div className="relative">
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400"
                  />
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-10 cursor-pointer text-gray-500 dark:text-gray-300"
                  >
                    <i className={showConfirmPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
                  </span>
                </div>
              </>
            )}
          </form>
        </div>
        {/* Static Footer */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 rounded-b-3xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900">
          <button
            type="submit"
            form="customer-form"
            onClick={handleSubmit}
            className="w-full py-2 px-4 text-base font-bold rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white shadow-lg transition-all duration-200 border-0 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {customer ? "Update Customer" : "Create Customer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomersForm;