import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const UserSetting = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    tier: "",
    profile_pic: "",
  });

  const [loading, setLoading] = useState(true);

  // -------------------------
  // Helper → Extract phone safely
  // -------------------------
  const extractPhone = (data) => {
    return (
      data?.phone ||
      data?.details?.phone || // if phone is inside "details"
      data?.user?.phone || // if backend returns nested user object
      ""
    );
  };

  // -------------------------
  // Helper → Get profile image URL
  // -------------------------
  const getProfileImageUrl = (profilePic) => {
    if (!profilePic) return null;
    if (profilePic.startsWith("http")) return profilePic;
    return `${API_BASE}${profilePic}`;
  };

  // ----------------------------------------------------
  // Load from localStorage
  // ----------------------------------------------------
  useEffect(() => {
    // Initialize user either from API (preferred) or from localStorage fallback
    const init = async () => {
      const storedRaw = localStorage.getItem("auth_user");
      let parsed = null;
      try {
        parsed = storedRaw ? JSON.parse(storedRaw) : null;
      } catch (e) {
        parsed = null;
      }

      const token = localStorage.getItem("token") || (parsed && parsed.token) || null;

      if (token) {
        try {
          const res = await axios.get(`${API_BASE}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = res.data;
          setUser({
            name: data?.name,
            email: data?.email,
            phone: extractPhone(data),
            tier: data?.tier || "",
            profile_pic: data?.profile_pic || "",
          });

          // persist a helpful auth_user snapshot
          const storeObj = parsed || {};
          storeObj.token = token;
          storeObj.name = data?.name;
          storeObj.email = data?.email;
          storeObj.phone = extractPhone(data);
          storeObj.profile_pic = data?.profile_pic;
          localStorage.setItem("auth_user", JSON.stringify(storeObj));
        } catch (err) {
          console.log("Failed to load profile from API:", err);
          // fallback to parsed localStorage if available
          if (parsed) {
            setUser({
              name: parsed?.name,
              email: parsed?.email,
              phone: extractPhone(parsed),
              profile_pic: parsed?.profile_pic || "",
            });
          } else {
            navigate("/login");
          }
        }
      } else {
        if (parsed) {
          setUser({
            name: parsed?.name,
            email: parsed?.email,
            phone: extractPhone(parsed),
            profile_pic: parsed?.profile_pic || "",
          });
        } else {
          navigate("/login");
        }
      }

      setLoading(false);
    };

    init();
  }, [navigate]);

  // ----------------------------------------------------
  // Refresh latest data from backend
  // ----------------------------------------------------
  useEffect(() => {
    const refreshFromDB = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem("auth_user"));
        if (!stored || !stored.token) return;

        const res = await axios.get(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${stored.token}` },
        });

        const data = res.data;

        setUser({
          name: data?.name,
          email: data?.email,
          phone: extractPhone(data), // ← UPDATED
          tier: data?.tier || "Gold Tier",
          profile_pic: data?.profile_pic || "",
        });

        // Update profile_pic inside localStorage
        stored.phone = extractPhone(data);
        stored.profile_pic = data?.profile_pic;
        stored.user = data;

        localStorage.setItem("auth_user", JSON.stringify(stored));
      } catch (err) {
        console.log("DB refresh failed:", err);
      }
    };

    refreshFromDB();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f6f6f6]">
      <div className="w-full bg-[#f4c542] p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-gray-500 font-bold overflow-hidden">
          {getProfileImageUrl(user?.profile_pic) ? (
            <img
              src={getProfileImageUrl(user?.profile_pic)}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            user?.name?.charAt(0) || "J"
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-sm text-gray-700">{user.tier}</p>
        </div>

        <button
          onClick={() => navigate("/edit-profile")}
          className="ml-auto px-4 py-2 bg-black text-white rounded-md"
        >
          Edit Profile
        </button>
      </div>

      <div className="p-5 space-y-5">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Account</h3>
          <p>Email: {user.email}</p>
          <p>Phone: {user.phone || "Not added"}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-3">Preferences</h3>

          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked /> Push Notifications
            </label>

            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked /> Email Notifications
            </label>

            <label className="flex items-center gap-3">
              <input type="checkbox" /> SMS Notifications
            </label>

            <label className="flex items-center gap-3">
              <input type="checkbox" /> Dark Theme
            </label>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Support</h3>

          <div className="mt-3 space-y-2">
            <button className="block text-blue-600">Help & FAQ</button>
            <Link to="/contact">
              <button className="block text-blue-600">Contact Support</button>
            </Link>
            <button className="block text-blue-600">Feedback / Rate App</button>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Account Actions</h3>

          <button onClick={handleLogout} className="block text-red-600 mt-3">
            Logout
          </button>

          <button className="block text-red-600 mt-2">Delete Account</button>
        </div>
      </div>
    </div>
  );
};

export default UserSetting;
