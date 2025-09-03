import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"; // Import Redux hooks
import { Link } from "react-router-dom"; // Import Link for navigation
import { addToCart, removeFromCart, updateQuantity, fetchCartItems } from "../../slice/cartSlice";
import toast from 'react-hot-toast';
import { addToWishlist, removeFromWishlist,fetchWishlistItems } from "../../slice/wishlistSlice";

function ProductlistItem({ type, product, filter }) {
  const [quantities, setQuantities] = useState({}); // State to manage product quantities
  const dispatch = useDispatch(); // Redux dispatch function
  const cartItems = useSelector((state) => state.cart.items); // Get cart items from Redux state
  const wishlistItems = useSelector((state) => state.wishlist.items); // Get wishlist items from Redux state

  // useEffect(() => {
  //   dispatch(fetchCartItems());  
  //   dispatch(fetchWishlistItems());
  // }, []);

  // useEffect(() => {
  //     console.log("wishlistItems:", wishlistItems); // Debugging
  // }, [wishlistItems]);

  // Handle increment
  const handleIncrement = () => {
    const newQuantity = (quantities[product._id] || 1) + 1;

    setQuantities((prev) => ({
      ...prev,
      [product._id]: newQuantity,
    }));

    // dispatch(updateQuantity({ productId: product._id, quantity: newQuantity }));
  };

  // Handle decrement
  const handleDecrement = () => {
    const newQuantity = Math.max((quantities[product._id] || 1) - 1, 1);

    setQuantities((prev) => ({
      ...prev,
      [product._id]: newQuantity,
    }));

    // dispatch(updateQuantity({ productId: product._id, quantity: newQuantity }));
  };

  // Handle input change
  const handleInputChange = (value) => {
    if (/^\d*$/.test(value)) {
      const newQuantity = value === "" ? 1 : parseInt(value, 10);

      setQuantities((prev) => ({
        ...prev,
        [product._id]: newQuantity,
      }));

      // dispatch(updateQuantity({ productId: product._id, quantity: newQuantity }));
    }
  };

  // Handle adding to cart
  const handleAddToCart = () => {
    const initialQuantity = quantities[product._id] || 1;
    console.log("Adding product to cart:", product._id);
    dispatch(addToCart({ productId:product._id, quantity: initialQuantity })).then(() => {
        dispatch(fetchCartItems());
    });

    setQuantities((prev) => ({
      ...prev,
      [product._id]: initialQuantity,
    }));
    // Display toast notification
    toast.success(`${product.name} added to cart!`);
  };

  // Handle adding to cart
  const handleToggleWishlist = (productId) => {
    const existingCartItem = Object.values(wishlistItems).find(
        (item) => item?.product?._id === productId
    );
    
    if (existingCartItem) {
        dispatch(removeFromWishlist(productId)).then(() => {
            dispatch(fetchWishlistItems());
        });
        toast.error(`${product.name} Removed from Wishlist!`);
    } else {
        dispatch(addToWishlist({ productId })).then(() => {
            dispatch(fetchWishlistItems());
        });
        toast.success(`${product.name} added to Wishlist!`);
    }
  };


  return (
    <div
      key={product._id}
      className="product-list-item border rounded-xl shadow-md border-gray-400 hover:border-blue-800 transition ease-in-out p-2 font-Poppins mx-auto"
    >
      <div className="product-img bg-gray-100 rounded-lg mb-1 relative">
        <img
          src={import.meta.env.VITE_API_URL+''+product.product_img ?? ''}
          alt={product.name}
          className="w-[200px] h-[200px] object-cover mx-auto w-full rounded-sm"
        />
        <div onClick={()=> handleToggleWishlist(product?._id)} className={`wishlist-sec w-[30px] h-[30px] group absolute top-0 right-0 rounded-full flex items-center justify-center border-[1.5px] border-red-600 ${Object.values(wishlistItems).find(
      (item) => item?.product?._id === product?._id
    ) ? 'bg-red-600 hover:bg-white' : 'bg-white hover:bg-red-600'}`}>
          <i className={`ri-heart-line  ${Object.values(wishlistItems).find(
      (item) => item?.product?._id === product?._id
    ) ? 'text-white group-hover:text-red-600' : 'text-red-600 group-hover:text-white'}`}></i>
        </div>
      </div>
      <Link to={`/product/${product?._id}`} className="no-underline text-black">
        <h5
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
          }}
          className="product-name font-quicksand text-sm leading-4 font-semibold mt-1 text-secondary hover:text-primary"
        >
          {product?.name}
        </h5>
      </Link>
      { product?.is_variant !== true ? (
      <div className="product-price text-secondary text-sm font-bold">Rs {product?.price}</div>
      ) :
      (
        <div className="product-price text-secondary text-xs font-bold">Price Start Rs {product?.variants[0]?.price}</div>
      )
      }
      { product?.is_review === true && (
      <div className="product-rating text-secondary text-xs font-medium mb-1">
      {
        Array.from({ length: 5 }).map((_, index) => (
          <i
            key={index}
            className={`ri-star-fill float-left text-[15px] mr-[3px] ${
              index < product.rating ? 'text-[#e7d52e]' : 'text-[#777]'
            }`}
          ></i>
        ))
      }
       / {product.rating || "N/A"}
      </div>
      )}
      { product.is_variant !== true ? (
      <div className="product-cart flex flex-row">
        <div className="product-cart-qtysec flex flex-row w-[75%] md:w-[50%]">
          <button className="w-1/3" onClick={handleIncrement}>
            +
          </button>
          <input
            className="w-1/3 appearance-none p-0 text-center"
            type="text"
            value={quantities[product._id] || 1}
            onChange={(e) => handleInputChange(e.target.value)}
          />
          <button className="w-1/3" onClick={handleDecrement}>
            -
          </button>
        </div>
        <div className="cart-btn w-[25%] md:w-[50%]">
          {filter ? (
            // Mobile cart button
            <div className="w-[30px] sm:w-[50px] ml-auto flex justify-end bg-primary p-2 px-4 rounded-md">
              <i onClick={handleAddToCart} className="text-white text-center ri-shopping-cart-2-line"></i>
            </div>
          ) : (
            <>
              {/* Desktop "Add to Cart" button */}
              <button
                className="hidden md:block text-xs w-[90%] float-right py-2 px-1 text-center rounded-md border border-solid border-primary text-white bg-primary hover:bg-transparent hover:text-secondary transition-colors"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
              {/* Mobile cart button */}
              <div className="w-[30px] sm:w-[50px] md:hidden mx-auto flex justify-center bg-primary p-2 px-4 rounded-md">
                <i onClick={handleAddToCart} className="text-white text-center ri-shopping-cart-2-line"></i>
              </div>
            </>
          )}
        </div>
      </div>
      ):
      (
        <Link to={`/product/${product._id}`} className="no-underline text-black">
        <h5
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            fontSize: "14px",
            color: "#fff",
          }}
          className="w-max flex bg-primary p-[4px] mt-2 px-4 rounded-md"
        >
          Select Options
        </h5>
      </Link>
      )
      }
    </div>
  );
}

export default ProductlistItem;