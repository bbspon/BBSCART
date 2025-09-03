import React, { useEffect, useState } from "react";
import Select from "react-select";
import toast from "react-hot-toast";

const ProductForm = ({ product, categories, subCategories, onSave, setIsAddEditModalOpen }) => {

  const [productData, setProductData] = useState({
    _id: product?._id || "",
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    stock: product?.stock || "",
    SKU: product?.SKU || "",
    brand: product?.brand || "",
    weight: product?.weight || "",
    dimensions: {
      length: product?.dimensions?.length || "",
      width: product?.dimensions?.width || "",
      height: product?.dimensions?.height || "",
    },
    tags: Array.isArray(product?.tags) ? product.tags : (product?.tags ? JSON.parse(product.tags) : []),
    category_id: product?.category_id?._id || "",
    subcategory_id: product?.subcategory_id?._id || "",
    product_img: null,
    gallery_imgs: [],
    is_variant: product?.is_variant || false,
    variants: product?.variants ?? [],
  });

  console.log('productData', productData);

  const [variantData, setVariantData] = useState({
    variant_name: "",
    price: "",
    stock: "",
    SKU: "",
    attributes: [],
    variant_img: "",
    variant_gallery_imgs: []
  });
  const [editIndex, setEditIndex] = useState(null); 
  const [errors, setErrors] = useState({});

  const validateVendor = () => {
    let formErrors = {};
    // Basic validations
    if (!productData.name) formErrors.name = "Product name is required";
    if (!productData.description) formErrors.description = "Product description is required";
    if(!productData.is_variant === true){
      if (!productData.price) formErrors.price = "Product price is required";
      if (!productData.stock) formErrors.stock = "Product stock is required";
      if (!productData.SKU) formErrors.SKU = "Product SKU is required";
      if (!productData.product_img) formErrors.product_img = "Product image is required";
    }
    if (!productData.brand) formErrors.brand = "Product brand is required";
    if (!productData.weight) formErrors.weight = "Product weight is required";
    if (!productData.weight) formErrors.weight = "Product weight is required";
    if (!productData.category_id) formErrors.category_id = "Product Category is required";
    if (!productData.subcategory_id) formErrors.subcategory_id = "Product Subcategory is required";
    if(productData.is_variant === true){      
      if (!variantData.variant_name) formErrors.variant_name = "Product Variant name is required";
      if (!variantData.price) formErrors.vprice = "Product Variant price is required";
      if (!variantData.stock) formErrors.vstock = "Product Variant stock is required";
      if (!variantData.SKU) formErrors.VSKU = "Product Variant SKU is required";
      if (!variantData.variant_img) formErrors.variant_img = "Product Variant image is required";
    }
    return formErrors;
  };  

  const handleVariantChange = (e) => {
    const { name, value } = e.target;
    setVariantData((prev) => ({ ...prev, [name]: value }));
  };

  // Add or update variant
  const addVariant = () => {
    setProductData((prev) => {
      const updatedVariants = [...prev.variants];

      const newVariant = {
        ...variantData,
        variant_img: variantData.variant_img || null, // Preserve file reference
        variant_gallery_imgs: variantData.variant_gallery_imgs ? [...variantData.variant_gallery_imgs] : [], // Preserve files
      };

      if (editIndex !== null) {
        updatedVariants[editIndex] = newVariant;
      } else {
        updatedVariants.push(newVariant);
      }

      return { ...prev, variants: updatedVariants };
    });

    resetVariantForm();
  };

  // Remove a variant
  const removeVariant = (index) => {
    setProductData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  // Edit a variant
  const editVariant = (index) => {
    console.log('productData.variants[index]', productData.variants[index]);
    setVariantData(productData.variants[index]); // Load variant data into the form
    console.log('editVariant', variantData);
    setEditIndex(index); // Set the index to track the variant being edited
  };

  // Reset variant form
  const resetVariantForm = () => {
    setVariantData({
      variant_name: "",
      price: "",
      stock: "",
      SKU: "",
      attributes: [],
      variant_img: "",
      variant_gallery_imgs: []
    });
    setEditIndex(null);
  };

  const handleAttributeChange = (attrIndex, field, value) => {
    setVariantData((prev) => {
      // Ensure attributes exist as an array
      const updatedAttributes = Array.isArray(prev.attributes) ? [...prev.attributes] : [];

      // Ensure the attribute at attrIndex exists, otherwise initialize it
      if (!updatedAttributes[attrIndex]) {
        updatedAttributes[attrIndex] = {}; // Initialize as an empty object
      }

      // Update attribute field
      updatedAttributes[attrIndex] = { ...updatedAttributes[attrIndex], [field]: value };

      return { ...prev, attributes: updatedAttributes };
    });
  };

  const addAttribute = () => {
    setVariantData((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { key: "", value: "" }],
    }));
  };

  const removeAttribute = (attrIndex) => {
    setVariantData((prev) => {
      const updatedAttributes = prev.attributes.filter((_, index) => index !== attrIndex);
      return { ...prev, attributes: updatedAttributes };
    });
  };


  const [tagInput, setTagInput] = useState("");
  const [categoriesOptions, setCategoriesOptions] = useState([]);
  const [subcategoriesOptions, setSubcategoriesOptions] = useState([]);

  useEffect(() => {
    if (categories.length > 0) {
      const formattedCatOptions = categories.map((category) => ({
        value: category._id,
        label: category.name,
      }));
      setCategoriesOptions(formattedCatOptions);
    }

    if (subCategories.length > 0) {
      const formattedSubCatOptions = subCategories.map((subcategory) => ({
        value: subcategory._id,
        label: subcategory.name,
      }));
      setSubcategoriesOptions(formattedSubCatOptions);
    }
  }, [categories, subCategories]); // ✅ Add dependencies

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDimensionChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [name]: value,
      },
    }));
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleAddTag = () => {
    if (tagInput.trim() !== "" && !productData.tags.includes(tagInput.trim())) {
      setProductData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput(""); // Clear input after adding tag
    }
  };

  const handleRemoveTag = (index) => {
    setProductData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleProductImageChange = (e, type) => {
    if (e.target.files.length > 0) {
      if (type === 'product') {
        setProductData((prev) => ({
          ...prev,
          product_img: e.target.files[0],
        }));
      } else {
        setVariantData((prev) => ({
          ...prev,
          variant_img: e.target.files[0], // Ensure file is stored correctly
        }));
      }
    }
  };

  const handleGalleryImagesChange = (e, type) => {
    if (e.target.files.length > 0) {
      if (type === 'product') {
        setProductData((prev) => ({
          ...prev,
          gallery_imgs: Array.from(e.target.files),
        }));
      } else {
        setVariantData((prev) => ({
          ...prev,
          variant_gallery_imgs: Array.from(e.target.files), // Ensure file array is stored
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate form
    const validationErrors = validateVendor();
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        toast.error("Please fix the errors and try again.");
        return;
    }
    const submissionData = new FormData();

    console.log('variantsJSON', JSON.stringify(productData.variants));

    Object.keys(productData).forEach((key) => {
      if (key === "gallery_imgs") {
        productData.gallery_imgs.forEach((image) => submissionData.append("gallery_imgs", image));
      } else if (key === "dimensions" || key === "variants" || key === "tags") {
        submissionData.append(key, JSON.stringify(productData[key]));
      } else {
        submissionData.append(key, productData[key]);
      }
    });

    // Append each variant separately
    productData.variants.forEach((variant, index) => {

      // Ensure variant_img is properly appended
      if (variant.variant_img) {
        submissionData.append("variant_img_" + index, variant.variant_img);
      }

      if (variant.variant_gallery_imgs && variant.variant_gallery_imgs.length > 0) {
        variant.variant_gallery_imgs.forEach((image) => {
          submissionData.append("variant_gallery_imgs_" + index, image);
        });
      }
    });

    console.log("Submission Data:");
    for (let [key, value] of submissionData.entries()) {
      console.log(key, value);
    }

    onSave(submissionData);
  };


  const handleSelectChange = (selectedOption, actionMeta) => {
    const { name } = actionMeta; // Extract name
    console.log("Selected:", selectedOption);

    setProductData((prevData) => {
      const updatedData = {
        ...prevData,
        [name]: selectedOption.value,
      };

      // If category is selected, filter subcategories
      if (name === "category_id") {
        const filteredSubcategories = subCategories.filter(
          (subcategory) => subcategory.category_id._id === selectedOption.value
        ).map((subcategory) => ({
          value: subcategory._id,
          label: subcategory.name,
        }));

        setSubcategoriesOptions(filteredSubcategories);
        updatedData.subcategory_id = ""; // Reset subcategory when category changes
      }

      console.log("Updated Form Data:", updatedData);
      return updatedData;
    });
  };



  return (
    <div className="formSec bg-white shadow-md rounded-2xl h-[85%] relative flex items-center justify-center z-50 fixed inset-0 bg-black">
      <div className="input-box-form p-3 overflow-y-auto h-full w-full rounded-2xl max-w-2xl mx-auto shadow-2xl border border-gray-200 relative flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 rounded-t-2xl bg-gradient-to-r from-blue-50 to-white sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{product ? "Edit Product" : "Add Product"}</h2>
          <button className="text-2xl text-gray-400 hover:text-red-500 transition popup-close" onClick={() => setIsAddEditModalOpen(false)} type="button">
            <i className="ri-close-circle-line"></i>
          </button>
        </div>
        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-4" style={{ maxHeight: '70vh' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Main product fields grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Product Name (full width) */}
              <div className="col-span-1 md:col-span-2">
                <div className="input-item">
                  <label className="block text-[14px] font-medium text-secondary mb-[4px]"> Product Name * </label>
                  <input type="text" name="name" value={productData.name} onChange={handleChange} placeholder="Product Name"  className={`w-full p-2 border rounded-lg ${errors.name ? 'border-red-700' : 'mb-4 '}`} />
                  {errors.name && <div className="text-red-800">{errors.name}</div>}
                </div>
              </div>
              {/* Description (full width) */}
              <div className="col-span-1 md:col-span-2">
                <div className="input-item">
                  <label className="block text-[14px] font-medium text-secondary mb-[4px]"> Description * </label>
                  <textarea name="description" value={productData.description} onChange={handleChange} placeholder="Description"  className={`w-full p-2 border rounded-lg ${errors.description ? 'border-red-700' : 'mb-4'}`} />
                  {errors.description && <div className="text-red-800">{errors.description}</div>}
                </div>
              </div>
              {/* Price */}
              <div>
                <div className="input-item">
                  <label className="block text-[14px] font-medium text-secondary mb-[4px]"> Price * </label>
                  <input type="number" name="price" value={productData.price} onChange={handleChange} placeholder="Price"  className={`w-full p-2 border rounded-lg ${errors.price ? 'border-red-700' : 'mb-4'}`} />
                  {errors.price && <div className="text-red-800">{errors.price}</div>}
                </div>
              </div>
              {/* Stock */}
              <div>
                <div className="input-item">
                  <label className="block text-[14px] font-medium text-secondary mb-[4px]"> Stock * </label>
                  <input type="number" name="stock" value={productData.stock} onChange={handleChange} placeholder="Stock"  className={`w-full p-2 border rounded-lg ${errors.stock ? 'border-red-700' : 'mb-4'}`} />
                  {errors.stock && <div className="text-red-800">{errors.stock}</div>}
                </div>
              </div>
              {/* SKU */}
              <div>
                <div className="input-item">
                  <label className="block text-[14px] font-medium text-secondary mb-[4px]"> SKU * </label>
                  <input type="text" name="SKU" value={productData.SKU} onChange={handleChange} placeholder="SKU"  className={`w-full p-2 border rounded-lg ${errors.SKU ? 'border-red-700' : 'mb-4'}`} />
                  {errors.SKU && <div className="text-red-800">{errors.SKU}</div>}
                </div>
              </div>
              {/* Brand */}
              <div>
                <div className="input-item">
                  <label className="block text-[14px] font-medium text-secondary mb-[4px]"> Brand * </label>
                  <input type="text" name="brand" value={productData.brand} onChange={handleChange} placeholder="Brand"  className={`w-full p-2 border rounded-lg ${errors.brand ? 'border-red-700' : 'mb-4'}`}  />
                  {errors.brand && <div className="text-red-800 ">{errors.brand}</div>}
                </div>
              </div>
              {/* Weight */}
              <div>
                <div className="input-item">
                  <label className="block text-[14px] font-medium text-secondary mb-[4px]"> Weight </label>
                  <input type="number" name="weight" value={productData.weight} onChange={handleChange} placeholder="Weight" className={`w-full p-2 border rounded-lg ${errors.weight ? 'border-red-700' : 'mb-4'}`}/>
                  {errors.weight && <div className="text-red-800">{errors.weight}</div>}
                </div>
              </div>
              {/* Dimensions (row of 3) */}
              <div className="col-span-1 md:col-span-2">
                <div className="grid grid-cols-3 gap-2">
                  <div className="input-item">
                    <label className="block text-[14px] font-medium text-secondary mb-[4px]">Length</label>
                    <input type="number" name="length" value={productData.dimensions.length} onChange={handleDimensionChange} placeholder="Length" className="w-full p-2 border rounded-lg" />
                  </div>
                  <div className="input-item">
                    <label className="block text-[14px] font-medium text-secondary mb-[4px]">Width</label>
                    <input type="number" name="width" value={productData.dimensions.width} onChange={handleDimensionChange} placeholder="Width" className="w-full p-2 border rounded-lg" />
                  </div>
                  <div className="input-item">
                    <label className="block text-[14px] font-medium text-secondary mb-[4px]">Height</label>
                    <input type="number" name="height" value={productData.dimensions.height} onChange={handleDimensionChange} placeholder="Height" className="w-full p-2 border rounded-lg" />
                  </div>
                </div>
              </div>
              {/* Tags (full width) */}
              <div className="col-span-1 md:col-span-2">
                <div className="input-item">
                  <label className="block text-[14px] font-medium text-secondary mb-[4px]">Tags</label>
                  <div className="flex max-w-full gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={handleTagInputChange}
                      placeholder="Enter Tag"
                      className="w-[85%] px-2 py-[8px] border rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-2 py-1 bg-blue-500 text-sm text-white w-[15%] rounded-lg"
                    >
                      Add Tag
                    </button>
                  </div>
                  <div className="my-3 flex flex-wrap gap-2">
                    {productData.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-gray-200 px-3 pt-1 pb-[6px] rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(index)}
                          className="ml-2 text-red-500 font-bold"
                        >
                          ✖
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Category */}
              <div>
                <div className="input-item">
                  <label className="block text-[14px] font-medium text-secondary mb-[4px]">Select Category</label>
                  <Select
                    options={categoriesOptions}
                    value={categoriesOptions.find(option => option.value === productData.category_id) || null}
                    onChange={handleSelectChange}
                    placeholder="Select Category"
                    isSearchable
                    className={`w-full border rounded-lg ${errors.category_id ? 'border-red-700' : ''}`}
                    name="category_id"
                  />
                  {errors.category_id && <div className="text-red-800">{errors.category_id}</div>}
                </div>
              </div>
              {/* Subcategory */}
              <div>
                <div className="input-item">
                  <label className="block text-[14px] font-medium text-secondary mb-[4px]">Select Subcategory</label>
                  <Select
                      options={subcategoriesOptions}
                      value={subcategoriesOptions.find(option => option.value === productData.subcategory_id) || null}
                      onChange={handleSelectChange}
                      placeholder="Select Subcategories"
                      isSearchable
                      className={`w-full border rounded-lg ${errors.subcategory_id ? 'border-red-700' : ''}`}
                      name="subcategory_id"
                  />
                  {errors.subcategory_id && <div className="text-red-800">{errors.subcategory_id}</div>}
                </div>
              </div>
              {/* Product Image */}
              <div>
                <div className="input-item">
                  <label className="block text-[14px] font-medium text-secondary"> Upload Product Image </label>
                  <input type="file" accept="image/*" onChange={(e) => handleProductImageChange(e,'product')} className={`w-full p-2 border rounded-lg ${errors.product_img ? 'border-red-700' : 'mb-4'}`} />
                  {errors.product_img && <div className="text-red-800">{errors.product_img}</div>}
                </div>
              </div>
              {/* Gallery Images */}
              <div>
                <div className="input-item">
                  <label className="block text-[14px] font-medium text-secondary">Upload Product Gallery Images</label>
                  <input type="file" accept="image/*" multiple onChange={(e) => handleGalleryImagesChange(e, 'product')} className="w-full p-2 mb-2 border rounded-lg" />
                </div>
              </div>
            </div>

            {/* Variant Toggle Checkbox */}
            <div className="w-full">
              <div className="input-item flex flex-wrap gap-3 items-center">
                <input type="checkbox" className="w-[15px] h-[15px]" id="is_variant" name="is_variant" checked={productData.is_variant} onChange={handleChange} />
                <label htmlFor="is_variant" className="block text-[14px] font-medium text-secondary"> This product has variants </label>
              </div>
            </div>
              
              {/* Variant Manager Section (Shown only if is_variant is true) */}
              {productData.is_variant && (
                <div className="variant-manager-sec mt-5 w-full">
                    <h3 className="text-xl font-semibold text-center mb-4">Add Variants</h3>
                    
                    <div className="w-full">
                      <input type="text" name="variant_name" placeholder="Variant Name" className={`w-full p-2 border rounded-lg ${errors.variant_name ? 'border-red-700' : 'mb-4'}`} value={variantData.variant_name} onChange={handleVariantChange} />
                      {errors.variant_name && <div className="text-red-800">{errors.variant_name}</div>}
                    </div>
                    
                    <div className="w-full mt-2">
                      <input type="number" name="price" placeholder="Variant Price" className={`w-full p-2 border rounded-lg ${errors.vprice ? 'border-red-700' : 'mb-4'}`} value={variantData.price} onChange={handleVariantChange} />
                      {errors.vprice && <div className="text-red-800">{errors.vprice}</div>}
                    </div>
                    
                    <div className="w-full mt-2">
                      <input type="number" name="stock" placeholder="Stock" className={`w-full p-2 border rounded-lg ${errors.vstock ? 'border-red-700' : 'mb-4'}`} value={variantData.stock} onChange={handleVariantChange} />
                      {errors.vstock && <div className="text-red-800">{errors.vstock}</div>}
                    </div>
                    
                    <div className="w-full mt-2">
                      <input type="text" name="SKU" placeholder="SKU" className={`w-full p-2 border rounded-lg ${errors.VSKU ? 'border-red-700' : 'mb-4'}`} value={variantData.SKU} onChange={handleVariantChange} />
                      {errors.VSKU && <div className="text-red-800">{errors.VSKU}</div>}
                    </div>

                    <div className="w-full mt-3">
                      <div className="input-item">
                        <label className="block text-[14px] font-medium text-secondary mb-[4px]"> Upload Product Image </label>
                        <input type="file" accept="image/*" onChange={(e) => handleProductImageChange(e,'variant')} className={`w-full p-2 border rounded-lg ${errors.variant_img ? 'border-red-700' : 'mb-4'}`} />
                        {errors.variant_img && <div className="text-red-800">{errors.variant_img}</div>}
                      </div>
                    </div>
                    
                    <div className="w-full mt-3">
                      <div className="input-item">
                        <label className="block text-[14px] font-medium text-secondary mb-[4px]"> Upload Product Gallery Images </label>
                        <input type="file" accept="image/*" multiple onChange={(e) => handleGalleryImagesChange(e, 'variant')} className="w-full p-2 border rounded-lg" />
                      </div>
                    </div>

                    <div className="variant-attributes-sec my-3">
                      <fieldset>
                        <legend className="mb-2">Variant Attributes:</legend>

                        {variantData.attributes && variantData.attributes.length > 0 ? (
                          variantData.attributes.map((attr, attrIndex) => (
                            <div key={attrIndex} className="flex space-x-2 mb-2">
                              <input
                                type="text"
                                placeholder="Attribute Name (e.g., Color)"
                                value={attr.key}
                                onChange={(e) => handleAttributeChange(attrIndex, "key", e.target.value)}
                                className="w-1/2 p-2 border border-gray-300 rounded"
                              />
                              <input
                                type="text"
                                placeholder="Value (e.g., Red)"
                                value={attr.value}
                                onChange={(e) => handleAttributeChange(attrIndex, "value", e.target.value)}
                                className="w-1/2 p-2 border border-gray-300 rounded"
                              />
                              <button
                                type="button"
                                onClick={() => removeAttribute(attrIndex)}
                                className="px-3 py-1 bg-red-500 text-white rounded"
                              >
                                Remove
                              </button>
                            </div>
                          ))
                        ) : (
                          // Show an empty attribute input if there are no attributes
                          <div className="flex space-x-2 mb-2">
                            <input
                              type="text"
                              placeholder="Attribute Name (e.g., Color)"
                              value=""
                              onChange={(e) => handleAttributeChange(0, "key", e.target.value)}
                              className="w-1/2 p-2 border border-gray-300 rounded"
                            />
                            <input
                              type="text"
                              placeholder="Value (e.g., Red)"
                              value=""
                              onChange={(e) => handleAttributeChange(0, "value", e.target.value)}
                              className="w-1/2 p-2 border border-gray-300 rounded"
                            />
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={addAttribute}
                          className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
                        >
                          Add Attribute
                        </button>
                      </fieldset>
                    </div>

                  <button type="button" className="px-4 py-2 bg-blue-500 text-white mt-3 rounded-lg mb-5" onClick={addVariant}>{editIndex !== null ? 'Update Variant' : 'Add Variant'}</button>
                  {
                    productData.variants.length > 0 && (
                      <div className="bb-table border-none border-[1px] md:border-solid border-[#eee] rounded-none md:rounded-[20px] overflow-hidden max-[1399px]:overflow-y-auto aos-init aos-animate" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="400">
                        <table className="w-full table-auto border-collapse">
                          <thead className="hidden md:table-header-group">
                            <tr className="border-b-[1px] border-solid border-[#eee]">
                              <th
                                className="font-Poppins p-[12px] text-left text-[16px] font-medium text-secondary leading-[26px] tracking-[0.02rem] capitalize"
                                onClick={() => handleSort("_id")}
                              >
                                Variant Name
                              </th>
                              <th
                                className="font-Poppins p-[12px] text-left text-[16px] font-medium text-secondary leading-[26px] tracking-[0.02rem] capitalize"
                                onClick={() => handleSort("name")}
                              >
                                Stock
                              </th>
                              <th
                                className="font-Poppins p-[12px] text-left text-[16px] font-medium text-secondary leading-[26px] tracking-[0.02rem] capitalize"
                                onClick={() => handleSort("price")}
                              >
                                Price
                              </th>
                              <th className="font-Poppins p-[12px] text-left text-[16px] font-medium text-secondary leading-[26px] tracking-[0.02rem] capitalize">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {productData.variants.map((variant, index) => (
                              <tr key={index} className="border-b-[1px] border-solid border-[#eee]">
                                <td data-label="Product ID" className="p-[12px]">
                                  <div className="Product flex justify-end md:justify-normal md:items-center">
                                    <div>
                                      <span className="ml-[10px] block font-Poppins text-[14px] font-semibold leading-[24px] tracking-[0.03rem] text-secondary">{variant.variant_name ?? ''}</span>
                                      <span className="ml-[10px] block font-Poppins text-[12px] font-normal leading-[16px] tracking-[0.03rem] text-secondary">SKU - {variant.SKU ?? ''}</span>
                                    </div>
                                  </div>
                                </td>
                                <td data-label="Name" className="p-[12px]">
                                  <span className="price font-Poppins text-[15px] font-medium leading-[26px] tracking-[0.02rem] text-secondary">{variant.stock ?? ''}</span>
                                </td>
                                <td data-label="Price" className="p-[12px]">₹{variant.price}</td>
                                <td data-label="Action" className="p-[12px]">
                                  <button className="text-blue-500 mr-3" type="button" onClick={() => editVariant(index)}>Edit</button>
                                  <button className="text-red-500 mr-3" type="button" onClick={() => removeVariant(index)}>Remove</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  }
                </div>
              )}

            {/* Place Order Button */}
            <div className="w-full px-[12px]">
              <div className="input-button">
                <button type="submit" className="block px-6 py-3 bg-blue-500 text-sm text-white mt-6 mx-auto w-auto rounded-lg hover:bg-transparent hover:border-[#3d4750] hover:text-secondary border">
                  {product ? "Update Product" : "Add Product"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;