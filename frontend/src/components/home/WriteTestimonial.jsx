// WriteTestimonial.jsx
import React, { useState, useEffect } from "react";
import instance from "../../services/axiosInstance"; // Adjust your axios instance
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import imageCompression from "browser-image-compression";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function WriteTestimonial() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    productId: "",
    rating: 0,
    title: "",
    comment: "",
    media: [],
    verified: false,
  });
  const [previewMedia, setPreviewMedia] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch product list
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await instance.get(`${API_BASE}/products`);
        setProducts(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load products. Please try later.");
      }
    };
    fetchProducts();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  // Handle star rating
  const handleRating = (value) => setForm({ ...form, rating: value });

  // Handle media upload with compression
  const handleMedia = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 5) {
      toast.error("You can upload a maximum of 5 files.");
      return;
    }

    const validFiles = [];
    for (let file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB and was skipped.`);
        continue;
      }
      if (file.type.startsWith("image/")) {
        try {
          const compressed = await imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1024,
          });
          validFiles.push(compressed);
        } catch (err) {
          console.error(err);
        }
      } else {
        validFiles.push(file); // videos unchanged
      }
    }

    setForm((prev) => ({ ...prev, media: validFiles }));
    const previews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviewMedia(previews);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.comment || form.rating === 0 || !form.productId) {
      toast.error("Please fill all required fields and select a rating.");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(form).forEach((key) => {
        if (key === "media") {
          form.media.forEach((file) => data.append("media", file));
        } else if (key === "verified") {
          data.append(key, form[key] ? "true" : "false");
        } else {
          data.append(key, form[key]);
        }
      });

      const res = await instance.post(`${API_BASE}/testimonials`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 201 || res.status === 200) {
        toast.success("Your testimonial has been submitted successfully!");
        setForm({
          name: "",
          email: "",
          productId: "",
          rating: 0,
          title: "",
          comment: "",
          media: [],
          verified: false,
        });
        setPreviewMedia([]);
      } else {
        toast.error("Submission failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <ToastContainer position="top-center" autoClose={3000} />
      <h2 className="text-3xl font-bold text-center mb-2">
        Share Your Testimonial
      </h2>
      <p className="text-center text-gray-500 mb-8">
        Help others by sharing your experience. Your feedback is valuable!
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name & Email */}
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="flex-1">
            <label className="block font-medium mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex-1 mt-4 md:mt-0">
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your email (optional)"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Product & Verified */}
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="flex-1">
            <label className="block font-medium mb-1">Product *</label>
            <select
              name="productId"
              value={form.productId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center mt-4 md:mt-0">
            <input
              type="checkbox"
              name="verified"
              checked={form.verified}
              onChange={handleChange}
              className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="font-medium">Verified Purchase</label>
          </div>
        </div>

        {/* Star Rating */}
        <div>
          <label className="block font-medium mb-1">Rating *</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => handleRating(star)}
                className={`text-3xl ${
                  form.rating >= star ? "text-yellow-400" : "text-gray-300"
                } focus:outline-none`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Short title for your review"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block font-medium mb-1">Comment *</label>
          <textarea
            name="comment"
            value={form.comment}
            onChange={handleChange}
            placeholder="Write your review here"
            rows={5}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          ></textarea>
        </div>

        {/* Media Upload */}
        <div>
          <label className="block font-medium mb-1">Upload Images / Videos</label>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMedia}
            className="w-full"
          />
          {previewMedia.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {previewMedia.map((url, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={url}
                    alt="preview"
                    className="w-20 h-20 object-cover rounded border"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center"
          >
            {loading && (
              <span className="loader mr-2 border-2 border-white border-t-2 border-t-transparent rounded-full w-5 h-5 animate-spin"></span>
            )}
            {loading ? "Submitting..." : "Submit Testimonial"}
          </button>
        </div>
      </form>

      {/* Loader CSS */}
      <style>
        {`
          .loader {
            border: 2px solid #f3f3f3;
            border-top: 2px solid #fff;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
