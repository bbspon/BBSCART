import React, { useState, useEffect } from "react";
import Select from "react-select";

const SubCategoryForm = ({ categories, subcategory, onSave, setIsAddEditModalOpen }) => {
  const [categoriesOptions, setCategoriesOptions] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
  });

  useEffect(() => {
    const formattedOptions = categories.map((category) => ({
      value: category._id,
      label: category.name,
    }));
    setCategoriesOptions(formattedOptions);
  }, [categories]);

  // Update formData when subcategory prop changes
  useEffect(() => {
    if (subcategory) {
      setFormData({
        name: subcategory?.name || "",
        description: subcategory?.description || "",
        category_id: subcategory?.category_id?._id || "",
      });
    }
    console.log(formData);
  }, [subcategory,categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submissionData = new FormData();

    if (subcategory?._id) {
      submissionData.append("_id", subcategory._id);
    }
    submissionData.append("name", formData.name);
    submissionData.append("description", formData.description);
    submissionData.append("category_id", formData.category_id);

    console.log("Submitting SubCategory Data:", formData);
    onSave(submissionData);

    // Reset form after submission
    setFormData({
      name: "",
      description: "",
      category_id: "",
    });
  };

  const handleSelectChange = (selectedOption) => {
    console.log(selectedOption);
    setFormData((prevData) => ({
      ...prevData,
      category_id: selectedOption.value,
    }));
  };

  return (
    <div className="max-w-[50vw] w-full mx-auto bg-white border border-gray-400 p-8 shadow-md rounded-md relative">
    <span className="popup-close" onClick={() => setIsAddEditModalOpen(false)}><i className="ri-close-circle-line"></i></span>
      <h2 className="text-2xl font-semibold text-center mb-6">
        {subcategory ? "Edit SubCategory" : "Add SubCategory"}
      </h2>
      <div className="input-box-form mt-[20px]">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-wrap mx-[-12px]">

            {/* Category */}
            <div className="w-full px-[12px]">
              <div className="input-item mb-[24px]">
                <label className="block text-[14px] font-medium text-secondary mb-[8px]">
                  Select Category*
                </label>
                <Select
                  options={categoriesOptions}
                  value={categoriesOptions.find(option => option.value === formData.category_id) || null}
                  onChange={handleSelectChange}
                  placeholder="Select Category"
                  isSearchable
                  className="w-full border rounded-lg"
                  name="category_id"
                />
              </div>
            </div>

            {/* SubCategory Name */}
            <div className="w-full px-[12px]">
              <div className="input-item mb-[24px]">
                <label className="block text-[14px] font-medium text-secondary mb-[8px]">
                  Sub Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your Sub Category Name"
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
                  {subcategory ? "Update SubCategory" : "Create SubCategory"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubCategoryForm;
