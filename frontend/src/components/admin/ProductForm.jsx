import React, { useEffect, useState } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import instance from "../../services/axiosInstance";

const ProductForm = ({ product, categories, subCategories, onSave, setIsAddEditModalOpen, currentUser, selectedSellerId }) => {

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
    product_img: product?.product_img || null,
    gallery_imgs: [],
    is_variant: product?.is_variant || false,
    variants: product?.variants ?? [],
    seller_id: product?.seller_id || "", // Add seller_id field
  });

  // Single Product
  const [productImagePreview, setProductImagePreview] = useState(null);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState([]);

  const [galleryImageFiles, setGalleryImageFiles] = useState([]);       // New File objects
  const [existingGalleryImages, setExistingGalleryImages] = useState([]); // For editing existing

  // Variant Product
  const [variantImagePreview, setVariantImagePreview] = useState('');
  const [variantGalleryPreviews, setVariantGalleryPreviews] = useState([]);

  console.log('productData', productData);

  const [variantData, setVariantData] = useState({
    variant_name: "",
    price: "",
    stock: "",
    SKU: "",
    attributes: [],
    variant_img: "",
    variant_gallery_imgs: [],
    existing_variant_gallery_imgs: []
  });
  const [editIndex, setEditIndex] = useState(null);
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (selectedSellerId) {
      setProductData(prev => ({ ...prev, seller_id: selectedSellerId }));
    }
  }, [selectedSellerId]);
  const validateVendor = () => {
    let formErrors = {};
    // Basic validations
    if (!productData.name) formErrors.name = "Product name is required";
    if (!productData.description) formErrors.description = "Product description is required";
    if (!productData.is_variant === true) {
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

    if (productData.is_variant === true) {
      if (!variantData.variant_name && !productData.variants.length < 1) formErrors.variant_name = "Product Variant name is required";
      if (!variantData.price && !productData.variants.length < 1) formErrors.vprice = "Product Variant price is required";
      if (!variantData.stock && !productData.variants.length < 1) formErrors.vstock = "Product Variant stock is required";
      if (!variantData.SKU && !productData.variants.length < 1) formErrors.VSKU = "Product Variant SKU is required";
      if (!variantData.variant_img && !productData.variants.length < 1) formErrors.variant_img = "Product Variant image is required";
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
    const selectedVariant = productData.variants[index];
    console.log('productData.variants[index]', selectedVariant);

    setVariantData((prev) => {
      const isFileType = selectedVariant.variant_gallery_imgs?.some(
        (item) => item instanceof File
      );

      return {
        ...selectedVariant,
        existing_variant_gallery_imgs: isFileType
          ? [...(selectedVariant.existing_variant_gallery_imgs || []),
          ...(selectedVariant.variant_gallery_imgs || []),]
          : [...(selectedVariant.variant_gallery_imgs || []),],
        variant_gallery_imgs: prev.variant_gallery_imgs || [],
      };
    });



    setEditIndex(index);
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
      variant_gallery_imgs: [],
      existing_variant_gallery_imgs: []
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
  const [vendors, setVendors] = useState([]);

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
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'product') {
      setProductData((prev) => ({
        ...prev,
        product_img: file,
      }));
      setProductImagePreview(URL.createObjectURL(file));
    } else {
      setVariantData((prev) => ({
        ...prev,
        variant_img: file,
      }));
      setVariantImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryImagesChange = (e, type) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map(file => ({
      preview: URL.createObjectURL(file),
      isExisting: false,
      file,
    }));
    if (files.length === 0) return;

    if (type === 'product') {
      setProductData((prev) => ({
        ...prev,
        gallery_imgs: files,
      }));
      setGalleryImagePreviews((prev) => [...prev, ...newPreviews]);
      setGalleryImageFiles((prev) => [...prev, ...files]);
    } else {
      setVariantData((prev) => ({
        ...prev,
        variant_gallery_imgs: [...(prev.variant_gallery_imgs || []), ...files],
      }));
      setVariantGalleryPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveGalleryImage = (index) => {
    const isExisting = index < existingGalleryImages.length;

    if (isExisting) {
      // Remove from both previews and existing image list
      setGalleryImagePreviews((prev) => prev.filter((_, i) => i !== index));
      setExistingGalleryImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Adjust index to remove new file (after existing ones)
      const newIndex = index - existingGalleryImages.length;
      setGalleryImagePreviews((prev) => prev.filter((_, i) => i !== index));
      setGalleryImageFiles((prev) => prev.filter((_, i) => i !== newIndex));
    }
  };

  const removeVariantGalleryImage = (index) => {
    setVariantGalleryPreviews((prevPreviews) => {
      const newPreviews = [...prevPreviews];
      const removed = newPreviews.splice(index, 1)[0];

      if (!removed) return prevPreviews;

      if (!removed.isExisting) {
        URL.revokeObjectURL(removed.preview);
      }

      // Update variantData and productData together
      setVariantData((prevData) => {
        const updatedExisting = [...(prevData.existing_variant_gallery_imgs || [])];
        const updatedNew = [...(prevData.variant_gallery_imgs || [])];

        let newVariantData;

        if (removed.isExisting) {
          const filteredExisting = updatedExisting.filter(
            (img) => import.meta.env.VITE_API_URL + img !== removed.preview
          );
          newVariantData = {
            ...prevData,
            existing_variant_gallery_imgs: filteredExisting,
          };
        } else {
          // Adjust index relative to new uploads
          const relativeIndex = index - updatedExisting.length;
          updatedNew.splice(relativeIndex, 1);
          newVariantData = {
            ...prevData,
            variant_gallery_imgs: updatedNew,
          };
        }

        // Also update inside productData.variants
        setProductData((prevProduct) => {
          const updatedVariants = [...(prevProduct.variants || [])];
          if (editIndex !== null) {
            const currentVariant = updatedVariants[editIndex] || {};
            updatedVariants[editIndex] = {
              ...currentVariant,
              ...newVariantData,
              variant_gallery_imgs: [
                ...(newVariantData.existing_variant_gallery_imgs || []),
                ...(newVariantData.variant_gallery_imgs || []),
              ],
            };
          }
          return {
            ...prevProduct,
            variants: updatedVariants,
          };
        });

        return newVariantData;
      });

      return newPreviews;
    });
  };

  useEffect(() => {
    console.log('✅ variantGalleryPreviews updated:', variantGalleryPreviews);
  }, [variantGalleryPreviews]);

  useEffect(() => {
    console.log('✅ variantData updated:', variantData);
  }, [variantData]);


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

    // NEVER send _id on create:
    if (productData._id) submissionData.append("_id", productData._id); // only on edit

    // basic fields
    submissionData.append("name", productData.name);
    submissionData.append("description", productData.description || "");
    submissionData.append("brand", productData.brand || "");
    submissionData.append("weight", productData.weight || 0);
    submissionData.append("category_id", productData.category_id);
    submissionData.append("subcategory_id", productData.subcategory_id || "");
    submissionData.append("is_variant", productData.is_variant ? "true" : "false");
    // append once, based on role
    // append seller only when we actually have one
    if (currentUser?.role === "admin" || currentUser?.role === "super_admin") {
      // Admin: optional seller from the dropdown bound to productData.seller_id
      if (productData.seller_id) {
        submissionData.append("seller_id", productData.seller_id);
      }
    } else if (productData.seller_id) {
      // Seller user: if we populated seller_id from /api/auth/me, send it
      submissionData.append("seller_id", productData.seller_id);
    }

    // dimensions and tags as JSON strings
    submissionData.append("dimensions", JSON.stringify(productData.dimensions || {}));
    submissionData.append("tags", JSON.stringify(productData.tags || []));

    if (productData.is_variant) {
      // do NOT append raw "[]", send an array of variant objects (no files inside)
      const variantsPayload = (productData.variants || []).map(v => ({
        variant_name: v.variant_name,
        price: Number(v.price || 0),
        stock: Number(v.stock || 0),
        SKU: v.SKU || "",
        attributes: Array.isArray(v.attributes) ? v.attributes : []
      }));
      submissionData.append("variants", JSON.stringify(variantsPayload));

      // images per-variant: variant_img_i, variant_gallery_imgs_i
      (productData.variants || []).forEach((v, i) => {
        if (v.variant_img instanceof File) {
          submissionData.append(`variant_img_${i}`, v.variant_img);
        }
        (v.variant_gallery_imgs || []).forEach(file => {
          if (file instanceof File) {
            submissionData.append(`variant_gallery_imgs_${i}`, file);
          }
        });
      });
    } else {
      // single product fields
      submissionData.append("price", Number(productData.price || 0));
      submissionData.append("stock", Number(productData.stock || 0));
      submissionData.append("SKU", productData.SKU || "");

      // single product images
      if (productData.product_img instanceof File) {
        submissionData.append("product_img", productData.product_img);
      }
      (productData.gallery_imgs || []).forEach(file => {
        if (file instanceof File) submissionData.append("gallery_imgs", file);
      });

      // IMPORTANT: do NOT append 'variants' at all for non-variant product
    }



    // Add static seller_id for submission

    console.log("Submission Data:");
    for (let [key, value] of submissionData.entries()) {
      console.log(key, value);
    }

    onSave(submissionData);
  };


  // TARGET: replace your current handleSelectChange with this version
  const handleSelectChange = (selectedOption, actionMeta) => {
    const name = actionMeta?.name;                  // "category_id" | "subcategory_id" | "seller_id"
    const value = selectedOption ? selectedOption.value : ""; // handle clear (null) from react-select

    setProductData((prev) => {
      const next = { ...prev, [name]: value };

      // when category changes, rebuild subcategory options and reset subcategory
      if (name === "category_id") {
        const filtered = subCategories
          .filter((sc) => {
            // handle both shapes: sc.category_id is either {_id: ...} or just an id
            const cid = sc?.category_id?._id ?? sc?.category_id;
            return String(cid) === String(value);
          })
          .map((sc) => ({ value: sc._id, label: sc.name }));

        setSubcategoriesOptions(filtered);
        next.subcategory_id = ""; // reset subcategory whenever category changes
      }

      // no extra logic needed for seller_id/subcategory_id;
      // the line above already sets next[name] = value
      return next;
    });
  };

  useEffect(() => {
    if (product) {
      // Set product image preview
      if (product.product_img) {
        setProductImagePreview(import.meta.env.VITE_API_URL + product.product_img);
      }

      // Set gallery image previews
      if (Array.isArray(product.gallery_imgs)) {
        const urls = product.gallery_imgs.map((img) => import.meta.env.VITE_API_URL + img);
        setGalleryImagePreviews(urls);
        setExistingGalleryImages(product.gallery_imgs); // raw paths for backend
      }

      // Prepare variants with existing_variant_gallery_imgs
      let updatedVariants = product.variants?.map((variant) => ({
        ...variant,
        existing_variant_gallery_imgs: [...(variant.variant_gallery_imgs || [])],
      })) || [];

      // Set entire productData with updated variants
      setProductData((prev) => ({
        ...prev,
        variants: updatedVariants,
      }));
    }
  }, [product]);


  useEffect(() => {
    // Handle existing images
    const existingPreviews = (variantData.existing_variant_gallery_imgs || []).map((url) => ({
      preview: typeof url === 'string' ? import.meta.env.VITE_API_URL + url : URL.createObjectURL(url),
      isExisting: true,
    }));

    // Handle new uploaded images (Files or URLs)
    const newPreviews = (variantData.variant_gallery_imgs || []).map((file) => ({
      preview: typeof file === 'string' ? import.meta.env.VITE_API_URL + file : URL.createObjectURL(file),
      isExisting: false,
    }));

    setVariantGalleryPreviews([...existingPreviews, ...newPreviews]);

    // Handle variant image preview safely
    if (variantData.variant_img) {
      if (typeof variantData.variant_img === 'string') {
        setVariantImagePreview(import.meta.env.VITE_API_URL + variantData.variant_img);
      } else if (variantData.variant_img instanceof File) {
        const objectUrl = URL.createObjectURL(variantData.variant_img);
        setVariantImagePreview(objectUrl);

        // Clean up object URL to avoid memory leaks
        return () => {
          URL.revokeObjectURL(objectUrl);
        };
      }
    } else {
      setVariantImagePreview('');
    }
  }, [variantData]);

  useEffect(() => {
    (async () => {
      try {
        // 1) Who am I?
        const meRes = await instance.get("/api/auth/me", { withCredentials: true });
        const me = meRes?.data?.user || meRes?.data;

        // If seller, pre-bind own id (optional)
        if (me?.role === "seller" && me?._id) {
          setProductData((prev) => ({ ...prev, seller_id: me._id }));
        }

        // 2) Admin/super_admin → load APPROVED vendors from admin endpoint
        if (me?.role === "admin" || me?.role === "super_admin") {
          const res = await instance.get("/api/vendors/admin/vendors", {
            params: { status: "approved", q: "", page: 1, limit: 1000, _t: Date.now() }, // keep cache-buster
            withCredentials: true,
          });


          // Inspect real shape once
          console.log("[ProductForm] /api/vendors/admin/vendors:", res.data);

          const d = res.data;

          // Robust extraction for common paginated shapes:
          const list =
            (Array.isArray(d?.vendors) && d.vendors) ||
            (Array.isArray(d?.data?.vendors) && d.data.vendors) ||
            (Array.isArray(d?.vendors?.docs) && d.vendors.docs) ||
            (Array.isArray(d?.data?.vendors?.docs) && d.data.vendors.docs) ||
            (Array.isArray(d?.items) && d.items) ||
            (Array.isArray(d?.data?.items) && d.data.items) ||
            (Array.isArray(d?.results) && d.results) ||
            (Array.isArray(d?.data?.results) && d.data.results) ||
            (Array.isArray(d) && d) ||
            [];

          const options = list.map((v) => ({
            value: String(v._id),
            label:
              v.legal_name ||
              v.gst_legal_name ||
              v.display_name ||
              v.storeName ||
              [v.vendor_fname, v.vendor_lname].filter(Boolean).join(" ") ||
              v.name ||
              v.email ||
              String(v._id),
          }));

          setVendors(options);
          console.log("[ProductForm] approved vendors loaded:", options.length);
        }
      } catch (err) {
        console.error("[ProductForm] me/vendors fetch failed:", err);
        setVendors([]);
      }
    })();
  }, []);




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
                  <input type="text" name="name" value={productData.name} onChange={handleChange} placeholder="Product Name" className={`w-full p-2 border rounded-lg ${errors.name ? 'border-red-700' : 'mb-4 '}`} />
                  {errors.name && <div className="text-red-800">{errors.name}</div>}
                </div>
              </div>
              {/* Description (full width) */}
              <div className="col-span-1 md:col-span-2">
                <div className="input-item">
                  <label className="block text-[14px] font-medium text-secondary mb-[4px]"> Description * </label>
                  <textarea name="description" value={productData.description} onChange={handleChange} placeholder="Description" className={`w-full p-2 border rounded-lg ${errors.description ? 'border-red-700' : 'mb-4'}`} />
                  {errors.description && <div className="text-red-800">{errors.description}</div>}
                </div>
              </div>
              {/* Price */}
              <div>
                <div className="input-item">
                  <label className="block text-[14px] font-medium text-secondary mb-[4px]"> Price * </label>
                  <input type="number" name="price" value={productData.price} onChange={handleChange} placeholder="Price" className={`w-full p-2 border rounded-lg ${errors.price ? 'border-red-700' : 'mb-4'}`} />
                  {errors.price && <div className="text-red-800">{errors.price}</div>}
                </div>
              </div>
              {/* Stock */}
              <div>
                <div className="input-item">
                  <label className="block text-[14px] font-medium text-secondary mb-[4px]"> Stock * </label>
                  <input type="number" name="stock" value={productData.stock} onChange={handleChange} placeholder="Stock" className={`w-full p-2 border rounded-lg ${errors.stock ? 'border-red-700' : 'mb-4'}`} />
                  {errors.stock && <div className="text-red-800">{errors.stock}</div>}
                </div>
              </div>
              {/* SKU */}
              <div>
                <div className="input-item">
                  <label className="block text-[14px] font-medium text-secondary mb-[4px]"> SKU * </label>
                  <input type="text" name="SKU" value={productData.SKU} onChange={handleChange} placeholder="SKU" className={`w-full p-2 border rounded-lg ${errors.SKU ? 'border-red-700' : 'mb-4'}`} />
                  {errors.SKU && <div className="text-red-800">{errors.SKU}</div>}
                </div>
              </div>
              {/* Brand */}
              <div>
                <div className="input-item">
                  <label className="block text-[14px] font-medium text-secondary mb-[4px]"> Brand * </label>
                  <input type="text" name="brand" value={productData.brand} onChange={handleChange} placeholder="Brand" className={`w-full p-2 border rounded-lg ${errors.brand ? 'border-red-700' : 'mb-4'}`} />
                  {errors.brand && <div className="text-red-800 ">{errors.brand}</div>}
                </div>
              </div>
              {/* Weight */}
              <div>
                <div className="input-item">
                  <label className="block text-[14px] font-medium text-secondary mb-[4px]"> Weight </label>
                  <input type="number" name="weight" value={productData.weight} onChange={handleChange} placeholder="Weight" className={`w-full p-2 border rounded-lg ${errors.weight ? 'border-red-700' : 'mb-4'}`} />
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
              {/* Seller (Vendor) */}
              <div>
                <div className="input-item">
                  <label className="block text-[14px] font-medium text-secondary mb-[4px]">Select Seller (Vendor) <span className="text-gray-500 text-xs">(optional)</span></label>
                  <Select
                    name="seller_id"
                    options={vendors}
                    value={vendors.find(o => o.value === productData.seller_id) || null}
                    onChange={handleSelectChange}
                    isSearchable
                    isClearable
                    placeholder="Select Seller (leave empty for Global)"
                    noOptionsMessage={() => "No approved vendors found"}
                  />

                  {errors.seller_id && <div className="text-red-800">{errors.seller_id}</div>}
                </div>
              </div>
              {/* Product Image Upload */}
              <div>
                <div className="input-item">
                  <label className="block text-[14px] font-medium text-secondary">Upload Product Image</label>
                  {productImagePreview && (
                    <div className="mb-2 w-16 h-16">
                      <img src={productImagePreview ?? ''} alt="Product Preview" className=" rounded-md w-full h-full object-cover" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleProductImageChange(e, 'product')}
                    className={`w-full p-2 border rounded-lg ${errors.product_img ? 'border-red-700' : 'mb-4'}`}
                  />
                  {errors.product_img && <div className="text-red-800">{errors.product_img}</div>}
                </div>
              </div>

              {/* Product Gallery Upload */}
              <div>
                <div className="input-item">
                  <label className="block text-[14px] font-medium text-secondary">Upload Product Gallery Images</label>
                  {galleryImagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {galleryImagePreviews.map((src, index) => (
                        <div key={index} className="relative w-16 h-16 mb-2">
                          <img src={src} alt={`Gallery ${index}`} className="object-cover w-full h-full rounded-md" />
                          {/* <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(index)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 text-xs"
                          >
                            ✕
                          </button> */}
                          <button className="text-2xl bg-white w-6 h-6 rounded-full flex items-center text-red-700 hover:text-red-500 transition absolute top-1 right-1" onClick={() => handleRemoveGalleryImage(index)} type="button">
                            <i className="ri-close-circle-line"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleGalleryImagesChange(e, 'product')}
                    className="w-full p-2 border rounded-lg"
                  />
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

                {/* Variant Image Upload */}
                <div className="w-full mt-3">
                  <div className="input-item">
                    <label className="block text-[14px] font-medium text-secondary mb-[4px]"> Upload Product Image </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleProductImageChange(e, 'variant')}
                      className={`w-full p-2 border rounded-lg ${errors.variant_img ? 'border-red-700' : 'mb-4'}`}
                    />
                    {errors.variant_img && <div className="text-red-800">{errors.variant_img}</div>}
                    {variantImagePreview && (
                      <div className="mt-2">
                        <img src={variantImagePreview} alt="Variant Preview" className="h-24 rounded" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Variant Gallery Upload */}
                <div className="w-full mt-3">
                  <div className="input-item">
                    <label className="block text-[14px] font-medium text-secondary mb-[4px]"> Upload Product Gallery Images </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleGalleryImagesChange(e, 'variant')}
                      className="w-full p-2 border rounded-lg"
                    />

                    {/* Previews of existing + new gallery images */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {variantGalleryPreviews.map((img, idx) => (
                        <div key={idx} className="relative w-24 h-24">
                          <img src={img.preview} alt="Gallery" className="w-full h-full object-cover rounded" />
                          <button
                            type="button"
                            onClick={() => removeVariantGalleryImage(idx)}
                            className="absolute top-0 right-0 text-white bg-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
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