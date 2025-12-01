import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../slice/authSlice"; // adjust path as needed

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
const token = localStorage.getItem("token");
      

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data;

        setForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        });

     

        setLoading(false);
      } catch (error) {
        console.error("Failed to load user:", error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

const handleSave = async () => {
  setSaving(true);

  try {
    const token = localStorage.getItem("token");

    const res = await axios.put(
      `${import.meta.env.VITE_API_URL}/api/auth/me`,
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
const updatedUser = res.data.user;

   localStorage.setItem("auth_user", JSON.stringify(updatedUser));
   localStorage.setItem("userData", JSON.stringify(updatedUser));

dispatch(setUser(updatedUser));
    alert("Profile updated successfully!");

    navigate("/user-setting");
  } catch (error) {
    console.error("Update error:", error);
    alert("Something went wrong");
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

      <div className="bg-white p-5 rounded shadow space-y-4">
        <input
          type="text"
          className="w-full p-3 border rounded"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="email"
          className="w-full p-3 border rounded"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="text"
          className="w-full p-3 border rounded"
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-black text-white rounded mt-4"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>

        <button
          onClick={() => navigate("/user-setting")}
          className="w-full py-3 bg-gray-300 text-black rounded mt-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
