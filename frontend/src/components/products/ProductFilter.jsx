import React, { useState, useEffect } from "react";
import PriceRangeSlider from "./PriceRangeSlider";
import { useDispatch, useSelector } from "react-redux";
import { ProductService } from "../../services/ProductService";

function ProductFilter({filters, setFilters}) {
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [mobileFilter, setMobileFilter] = useState(false);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await ProductService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch categories from API
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const data = await ProductService.getProductTags();
        setTags(data.tags);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchTags();
  }, []);

  console.log('tags',tags);

  // **Update state when category is selected**
  const handleCategoryChange = (categoryId) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      filter: true,
      categories: prevFilters.categories.includes(categoryId)
        ? prevFilters.categories.filter((id) => id !== categoryId)
        : [...prevFilters.categories, categoryId],
    }));
  };

  // **Update state when category is selected**
  const handleSubCategoryChange = (subcategoryId) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      filter: true,
      subcategories: prevFilters.subcategories.includes(subcategoryId)
        ? prevFilters.subcategories.filter((id) => id !== subcategoryId)
        : [...prevFilters.subcategories, subcategoryId],
    }));
  };

  // **Update state when color is selected**
  const handleColorSelect = (color) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      filter: true,
      colors: prevFilters.colors.includes(color)
        ? prevFilters.colors.filter((c) => c !== color)
        : [...prevFilters.colors, color],
    }));
  };

  // **Update state when tag is selected**
  const handleTagSelect = (tag) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      filter: true,
      tags: prevFilters.tags.includes(tag)
        ? prevFilters.tags.filter((t) => t !== tag)
        : [...prevFilters.tags, tag],
    }));
  };

  // **Update state when price range is changed**
  const handlePriceChange = (newRange) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      filter: true,
      priceRange: newRange,
    }));
  };

  // **Get products with selected filters**
  const getProducts = async () => {
    try {
      const products = await ProductService.getProducts(filters);
      console.log("Filtered Products:", products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

//   // **Trigger getProducts when filters change**
  useEffect(() => {
    console.log('filters',filters);
  }, [filters]);

  return (
    <>
      {/* Mobile Filter Button */}
      <div
        className="absolute top-[190px] md:top-[140px] right-8 md:hidden"
        onClick={() => setMobileFilter(!mobileFilter)}
      >
        <i
          className={`text-2xl text-primary ri-filter-${
            mobileFilter ? "off-fill" : "fill"
          }`}
        ></i>
      </div>

      {/* Filter Sidebar */}
      <div
        className={`bb-shop-wrap ${
          mobileFilter
            ? "block absolute top-0 left-0 z-50 overflow-y-auto"
            : "hidden md:block sticky top-0"
        } bg-[#f8f8fb] rounded-[20px] border-[1px] border-solid border-[#eee]`}
      >
        {/* **Category Section** */}
        <div className="bb-sidebar-block p-[20px] border-b-[1px] border-solid border-[#eee]">
          <h3 className="text-[18px] font-bold mb-2">Category</h3>
          <ul>
            {categories?.map((category) => (
                <li key={category?._id} className="relative block mb-[8px]">
                <label className="bb-sidebar-block-item relative flex items-center cursor-pointer">
                    <input
                    type="checkbox"
                    checked={filters?.categories?.includes(category._id)}
                    onChange={() => handleCategoryChange(category._id)}
                    className="hidden" // Hide the default checkbox style
                    />
                    <span className="checked flex-shrink-0 h-[18px] w-[18px] bg-[#fff] border-[1px] border-solid border-[#eee] rounded-[5px] overflow-hidden mr-[12px] flex items-center justify-center">
                    <svg
                    className={`${filters?.categories?.includes(category._id) ? '' : 'hidden'} w-[12px] h-[12px] text-[#424e82]`}
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    >
                        <path d="M13.485 3.657l-7.071 7.071-3.182-3.182-.707.707 3.889 3.889 7.778-7.778z" />
                    </svg>
                    </span>
                    <span className="text-[#777] text-[14px] leading-[20px] font-normal capitalize">
                    {category?.name}
                    </span>
                </label>
                </li>
            ))}
            </ul>
        </div>

        {/* **SubCategory Section** */}
        <div className="bb-sidebar-block p-[20px] border-b-[1px] border-solid border-[#eee]">
          <h3 className="text-[18px] font-bold mb-2">Sub Category</h3>
          <ul>
            {categories?.map((category) =>
              category?.subcategories?.map((subcategory) => (
                <li key={subcategory._id} className="relative block mb-[8px]">
                  <label className="bb-sidebar-block-item relative flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters?.subcategories?.includes(subcategory._id)}
                      onChange={() => handleSubCategoryChange(subcategory._id)}
                      className="hidden" // Hide the default checkbox style
                    />
                    <span className="checked flex-shrink-0 h-[18px] w-[18px] bg-[#fff] border-[1px] border-solid border-[#eee] rounded-[5px] overflow-hidden mr-[12px] flex items-center justify-center">
                      <svg
                        className={`${filters?.subcategories?.includes(subcategory._id) ? '' : 'hidden'} w-[12px] h-[12px] text-[#424e82]`}
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M13.485 3.657l-7.071 7.071-3.182-3.182-.707.707 3.889 3.889 7.778-7.778z" />
                      </svg>
                    </span>
                    <span className="text-[#777] text-[14px] leading-[20px] font-normal capitalize">
                      {subcategory?.name}
                    </span>
                  </label>
                </li>
              ))
            )}
          </ul>
        </div>


        {/* **Price Range Section** */}
        <div className="bb-sidebar-block p-[20px] border-b-[1px] border-solid border-[#eee]">
          <h3 className="text-[18px] font-bold">Price</h3>
          <PriceRangeSlider
            min={0}
            max={100000000}
            step={1}
            value={filters?.priceRange ?? { min: 0, max: 100000000 }}
            onChange={handlePriceChange}
          />
        </div>

        {/* **Tags Section** */}
        <div className="bb-sidebar-block p-[20px]">
          <h3 className="text-[18px] font-bold">Tags</h3>
          <ul className="flex flex-wrap">
            {tags?.map((tag) => (
              <li
                key={tag}
                className={`p-[5px] border rounded-[10px] cursor-pointer m-[5px] ${
                  filters?.tags?.includes(tag) ? "bg-[#6c7fd8] text-white" : ""
                }`}
                onClick={() => handleTagSelect(tag)}
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default ProductFilter;