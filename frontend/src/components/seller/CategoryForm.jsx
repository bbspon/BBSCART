import React, { useState, useEffect } from "react";

const CategoryForm = ({ category, onSave, setIsAddEditModalOpen }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Update formData when category prop changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category?.name || "",
        description: category?.description || "",
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || "", // Ensuring empty string instead of undefined
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submissionData = new FormData();

    if (category?._id) {
      submissionData.append("_id", category._id);
    }
    submissionData.append("name", formData.name);
    submissionData.append("description", formData.description);

    console.log("Submitting Category Data:", formData);
    onSave(submissionData);

    // Reset form after submission
    setFormData({
      name: "",
      description: "",
    });
  };

  return (
    <div className="max-w-[50vw] w-full mx-auto bg-white border border-gray-400 p-8 shadow-md rounded-md relative">
      <span className="popup-close" onClick={() => setIsAddEditModalOpen(false)}><i className="ri-close-circle-line"></i></span>
      <h2 className="text-2xl font-semibold text-center mb-6">
        {category ? "Edit Category" : "Add Category"}
      </h2>
      <div className="input-box-form mt-[20px]">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-wrap mx-[-12px]">
            {/* Category Name */}
            <div className="w-full px-[12px]">
              <div className="input-item mb-[24px]">
                <label className="block text-[14px] font-medium text-secondary mb-[8px]">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your Category Name"
                  className="w-full p-[10px] text-[14px] border border-[#eee] rounded-[10px]"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="w-full px-[12px]">
              <div className="input-item mb-[24px]">
                <label className="block text-[14px] font-medium text-secondary mb-[8px]">
                  Description *
                </label>
                <textarea
                  name="description"
                  placeholder="Enter your Description"
                  className="w-full p-[10px] text-[14px] border border-[#eee] rounded-[10px]"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="w-full px-[12px]">
              <div className="input-button">
                <button
                  type="submit"
                  className="bb-btn-2 inline-block py-[10px] px-[25px] text-[14px] font-medium text-white bg-[#6c7fd8] rounded-[10px] hover:bg-transparent hover:border-[#3d4750] hover:text-secondary border"
                >
                  {category ? "Update Category" : "Create Category"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;