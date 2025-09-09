import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from '../../../services/axiosInstance'
import toast from "react-hot-toast";

export default function AcceptInvite() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", token: "", name: "", phone: "", password: "", confirmPassword: "" });

  useEffect(() => {
    setForm(f => ({
      ...f,
      email: sp.get("email") || "",
      token: sp.get("token") || ""
    }));
  }, [sp]);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    if (!form.password || form.password !== form.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    try {
      await axios.post("/auth/admin-invites/accept", {
        email: form.email,
        token: form.token,
        name: form.name,
        phone: form.phone,
        password: form.password
      });
      toast.success("Admin account activated");
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to activate invite");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Accept Admin Invite</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="border p-2 w-full" name="email" value={form.email} onChange={onChange} disabled />
        <input className="border p-2 w-full" name="name" placeholder="Full name" onChange={onChange} />
        <input className="border p-2 w-full" name="phone" placeholder="Phone" onChange={onChange} />
        <input className="border p-2 w-full" type="password" name="password" placeholder="Set password" onChange={onChange} />
        <input className="border p-2 w-full" type="password" name="confirmPassword" placeholder="Confirm password" onChange={onChange} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Activate</button>
      </form>
    </div>
  );
}
