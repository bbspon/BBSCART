import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ProductlistItem from "./ProductlistItem";
import { ProductService } from "../../services/ProductService";
import { useSelector } from "react-redux";

// Custom Previous Arrow
const CustomPrevArrow = ({ onClick }) => (
  <button className="custom-prev absolute -top-12 right-16 rounded z-10" onClick={onClick}>
    <i className="ri-arrow-left-circle-fill text-blue-400 text-3xl lg:text-4xl"></i>
  </button>
);

// Custom Next Arrow
const CustomNextArrow = ({ onClick }) => (
  <button className="custom-next absolute -top-12 right-5 rounded z-10" onClick={onClick}>
    <i className="ri-arrow-right-circle-fill text-blue-400 text-3xl lg:text-4xl"></i>
  </button>
);

function ProductList({ heading, type, category, subcategory, filter, filters }) {
  const [products, setProducts] = useState([]); // Ensure products is always an array
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  console.log(type, category, subcategory, filter, filters);
  
  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
          let data = [];
  
          if (filters?.filter  && filters !== undefined) {
              console.log("Fetching products with filters:", filters);
              data = await ProductService.getProductFilter(filters);
          } else if(category !== null && category !== undefined) {
              console.log("Fetching products by Category ID:", category);
              data = await ProductService.getProductCategoryID(category);
          } else if(subcategory !== null && subcategory !== undefined) {
              console.log("Fetching products by Category ID:", subcategory);
              data = await ProductService.getProductSubCategoryID(subcategory);
          } else if(user && user?.role === 'user'){
              console.log("Fetching products by NearBySeller:", user);
              data = await ProductService.getProductsNearbySeller();
          } else if(user && user?.role === 'seller'){
            console.log("Fetching products by NearBySeller:", user);
            data = await ProductService.getProductsSellerID(user._id);
          } else{
            console.log("Fetching all products");
            data = await ProductService.getProducts();
          }
  
          console.log("API Response:", data);
  
          // ✅ Ensure `data` is an array before setting state
          if (Array.isArray(data)) {
              setProducts(data);
          } else {
              console.error("API response is not an array:", data);
              setProducts([]); // Ensure products is always an array
          }
      } catch (error) {
          console.error("Error fetching products:", error);
          setProducts([]); // Fallback to an empty array on error
      }
    };
    fetchProducts();
  }, [category, subcategory, filters,user]); // Added filters to the dependency array

  // Slider Settings
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    responsive: [
      { breakpoint: 1124, settings: { slidesToShow: 4, slidesToScroll: 1 } },
      { breakpoint: 880, settings: { slidesToShow: 3, slidesToScroll: 1 } },
      { breakpoint: 680, settings: { slidesToShow: 2, slidesToScroll: 1 } },
    ],
    className: "custom-slider-spacing",
  };

  return (
    <div className="pb-6 md:pb-12 mt-10 md:mt-0 relative">
      {heading && (
        <h3 className="font-quicksand font-bold text-lg md:text-2xl absolute -top-[45px] left-[15px] capitalize">{heading}</h3>
      )}
      {type === "Slider" ? (
        <Slider {...settings}>
          {products?.map((product) => (
            <ProductlistItem key={product?._id} product={product} />
          ))}
        </Slider>
      ) : (
        <div
          className={`grid grid-cols-2 ${
            filter ? "md:grid-cols-3 lg:grid-cols-4" : "sm:grid-cols-3 w-881:grid-cols-4 w-1125:grid-cols-5"
          } gap-2 sm:gap-5 px-4`}
        >
          {products?.length > 0 ? (
            products.map((product) => (
              <ProductlistItem key={product?._id} product={product} />
            ))
          ) : (
            <p>No products found matching your filters.</p> // Display message when no products are found
          )}

        </div>
      )}
    </div>
  );
}

export default ProductList;