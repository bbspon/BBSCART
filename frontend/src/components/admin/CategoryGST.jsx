import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000"; // <-- CHANGE if your backend runs on different port

const CategoryGST = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${API_BASE}/api/categories`);

      console.log("GST Categories Response:", res.data);

      if (Array.isArray(res.data)) {
        setCategories(res.data);
      } else if (res.data?.data) {
        setCategories(res.data.data);
      } else if (res.data?.categories) {
        setCategories(res.data.categories);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("Fetch GST categories error:", err);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (id, field, value) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat._id === id ? { ...cat, [field]: value } : cat
      )
    );
  };
const handleExcelUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await axios.post(
      "/api/category-gst/categories/gst/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    alert(res.data.message);
  } catch (err) {
    console.error(err);
    alert("Excel upload failed");
  }
};
  const handleSave = async (category) => {
    try {
      const res = await axios.put(
        `${API_BASE}/api/category-gst/categories/${category._id}/gst`,
        {
          gstRate: Number(category.gstRate) || 0,
          hsnCode: category.hsnCode || "",
          isTaxInclusive: Boolean(category.isTaxInclusive),
        }
      );

      console.log("Update Response:", res.data);

      alert("GST updated successfully");
    } catch (err) {
      console.error("Update GST error:", err);
      alert("Failed to update GST");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Category GST Management</h2>
<input
  type="file"
  accept=".xlsx,.xls"
  onChange={handleExcelUpload}
/>
      {loading && <p>Loading categories...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && categories.length === 0 && (
        <p>No categories found</p>
      )}

      {!loading && categories.length > 0 && (
        <table className="table table-bordered mt-3">
          <thead>
            <tr>
              <th>Category</th>
              <th>GST %</th>
              <th>HSN Code</th>
              <th>Inclusive?</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id}>
                <td>{cat.name}</td>

                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={cat.gstRate || ""}
                    onChange={(e) =>
                      handleChange(cat._id, "gstRate", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={cat.hsnCode || ""}
                    onChange={(e) =>
                      handleChange(cat._id, "hsnCode", e.target.value)
                    }
                  />
                </td>

                <td style={{ textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={cat.isTaxInclusive || false}
                    onChange={(e) =>
                      handleChange(
                        cat._id,
                        "isTaxInclusive",
                        e.target.checked
                      )
                    }
                  />
                </td>

                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleSave(cat)}
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CategoryGST;