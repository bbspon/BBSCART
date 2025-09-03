import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-hot-toast";

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

  useEffect(() => {
    if (subcategory) {
      setFormData({
        name: subcategory?.name || "",
        description: subcategory?.description || "",
        category_id: subcategory?.category_id?._id || "",
      });
    }
  }, [subcategory, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || "",
    }));
  };

  const handleSelectChange = (selectedOption) => {
    setFormData((prevData) => ({
      ...prevData,
      category_id: selectedOption ? selectedOption.value : "",
    }));
  };

  const validateForm = () => {
    if (!formData.category_id) {
      toast.error("Category is required.");
      return false;
    }
    if (!formData.name.trim()) {
      toast.error("Sub Category name is required.");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const submissionData = new FormData();
    if (subcategory?._id) {
      submissionData.append("_id", subcategory._id);
    }
    submissionData.append("name", formData.name);
    submissionData.append("description", formData.description);
    submissionData.append("category_id", formData.category_id);
    onSave(submissionData);
    setFormData({
      name: "",
      description: "",
      category_id: "",
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
            {subcategory ? "Edit SubCategory" : "Add SubCategory"}
          </h2>
        </div>
        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: 'thin', msOverflowStyle: 'none' }}>
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 flex flex-col min-h-0">
            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Select Category <span className="text-red-500">*</span>
              </label>
              <Select
                options={categoriesOptions}
                value={categoriesOptions.find(option => option.value === formData.category_id) || null}
                onChange={handleSelectChange}
                placeholder="Select Category"
                isSearchable
                className="w-full border rounded-xl z-50"
                classNamePrefix="react-select"
                name="category_id"
                menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                styles={{
                  menuPortal: base => ({ ...base, zIndex: 9999 }),
                  menu: base => ({ ...base, zIndex: 9999, width: '100%' }),
                  control: base => ({ ...base, minHeight: 44, borderRadius: 12, borderColor: '#d1d5db', boxShadow: 'none' }),
                  option: base => ({ ...base, fontSize: 15 }),
                }}
              />
            </div>
            {/* SubCategory Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Sub Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your Sub Category Name"
                className="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                placeholder="Enter your Description"
                className="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition min-h-[80px]"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </form>
        </div>
        {/* Static Footer */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 rounded-b-3xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900">
          <button
            type="submit"
            form="subcategory-form"
            onClick={handleSubmit}
            className="w-full py-2 px-4 text-base font-bold rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white shadow-lg transition-all duration-200 border-0 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {subcategory ? "Update SubCategory" : "Create SubCategory"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubCategoryForm;
