import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../slice/authSlice"; // adjust path as needed
import { toast } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    profile_pic: "",
  });
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data;

        setForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          profile_pic: data.profile_pic || "",
        });

        // Set image preview if profile pic exists
        if (data.profile_pic) {
          const imageUrl = data.profile_pic.startsWith("http")
            ? data.profile_pic
            : `${API_BASE}${data.profile_pic}`;
          setImagePreview(imageUrl);
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to load user:", error);
        toast.error("Failed to load profile");
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image (JPG, PNG, or WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!form.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!form.phone.trim()) {
      toast.error("Phone is required");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);

      // Add image if selected
      if (selectedFile) {
        formData.append("profile_pic", selectedFile);
      }

      const res = await axios.put(
        `${API_BASE}/api/auth/me`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedUser = res.data.user;

      // Merge with existing stored auth_user so we don't lose token or other session fields
      let existing = {};
      try {
        existing = JSON.parse(localStorage.getItem("auth_user") || "{}");
      } catch (e) {
        existing = {};
      }

      const merged = { ...existing, ...updatedUser };
      if (token) merged.token = token;

      localStorage.setItem("auth_user", JSON.stringify(merged));
      localStorage.setItem("userData", JSON.stringify(merged));

      dispatch(setUser(merged));
      toast.success("Profile updated successfully!");

      navigate("/user-setting");
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center">
        <p>Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f6f6f6] p-5">
      <h2 className="text-2xl font-semibold mb-5">Edit Profile</h2>

      <div className="bg-white p-5 rounded shadow space-y-5 max-w-md">
        {/* Profile Image Section */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Profile Picture
          </label>
          
          <div className="flex flex-col items-center space-y-3">
            {/* Image Preview */}
            <div className="w-32 h-32 rounded-full border-4 border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 text-center">
                  <p className="text-3xl">📷</p>
                  <p className="text-xs">No image</p>
                </div>
              )}
            </div>

            {/* File Input */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border rounded text-sm"
              id="profile-pic"
            />
            <p className="text-xs text-gray-500">
              Max 5MB • JPG, PNG, or WebP
            </p>
          </div>
        </div>

        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        {/* Phone Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="text"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-black text-white rounded font-medium hover:bg-gray-800 disabled:opacity-50 transition"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>

        {/* Cancel Button */}
        <button
          onClick={() => navigate("/user-setting")}
          className="w-full py-3 bg-gray-300 text-black rounded font-medium hover:bg-gray-400 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
