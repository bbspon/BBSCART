import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaCartArrowDown } from "react-icons/fa";
import {
  updateQuantity,
  removeFromCart,
  clearCart,
  fetchCartItems,
} from "../slice/cartSlice";

export default function NavbarCart() {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  const items = useSelector((state) => state.cart.items || []);

  // Normalize items to a simple UI model (handle different shapes)
  const uiItems = (Array.isArray(items) ? items : Object.values(items)).map(
    (it) => {
      const productObj = it.product && typeof it.product === "object" ? it.product : null;
      console.log("CART PRODUCT OBJ:", productObj);

      const id = productObj?._id || it.productId || it.product || it._id;
      const name = productObj?.name || it.name || productObj?.title || "Product";
      const price = Number(it.quantityPrice || it.price || productObj?.price || productObj?.mrp || 0);
      const qty = Number(it.quantity || it.qty || it.quantity || 0);
let rawImage =
  productObj?.product_img ||
  productObj?.product_img2 ||
  (Array.isArray(productObj?.gallery_imgs) ? productObj.gallery_imgs[0] : "") ||
  it.image ||
  "";


const image = rawImage
  ? rawImage.startsWith("http")
    ? rawImage
    : `${import.meta.env.VITE_API_URL}/uploads/${rawImage}`
  : "/no-image.png";


      return { id, name, price, qty, image };
    }
  );

  const totalCount = uiItems.reduce((s, it) => s + (Number(it.qty) || 0), 0);
  const totalPrice = uiItems.reduce((s, it) => s + (Number(it.qty || 0) * Number(it.price || 0)), 0);
useEffect(() => {
  if (!items || items.length === 0) {
    dispatch(fetchCartItems());
  }
}, []);


  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleSetQty = (idx, newQty) => {
    const it = uiItems[idx];
    if (!it) return;
    dispatch(updateQuantity({ productId: it.id, variantId: null, quantity: Number(newQty) }))
     
  };

  const handleRemove = (idx) => {
    const it = uiItems[idx];
    if (!it) return;
    dispatch(removeFromCart({ productId: it.id, variantId: null }))
  };

  const handleClear = () => {
    dispatch(clearCart())
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="px-3 py-2 flex items-center gap-2"
        onClick={() => setOpen((v) => !v)}
        title="Go to cart"
      >
        <FaCartArrowDown size={20} className="text-[#0B7A4B] w-5 h-5" />
        <span className="text-[#0B7A4B]">{totalCount}</span>
      </button>

      {open && uiItems.length > 0 && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg p-3 z-50">
          <div className="flex justify-between items-center mb-2">
            <strong>Cart</strong>
            <button className="text-sm text-red-600" onClick={handleClear}>
              Clear
            </button>
          </div>

          <div className="max-h-72 overflow-auto space-y-3">
            {uiItems.map((it, idx) => (
              <div key={it.id || idx} className="flex items-center gap-3">
<img
  src={it.image}
  onError={(e) => (e.currentTarget.src = "/no-image.png")}
  className="w-12 h-12 object-cover rounded"
/>
                <div className="flex-1">
                  <div className="text-sm font-medium line-clamp-2">{it.name}</div>
                  <div className="text-xs text-gray-500">
                    Unit: ₹{Number(it.price).toFixed(2)} | Subtotal: ₹{(Number(it.price) * it.qty).toFixed(2)}
                  </div>

                  <div className="text-xs">
                    Qty:{" "}
                    <input
                      type="number"
                      min={1}
                      value={it.qty}
                      onChange={(e) => handleSetQty(idx, Number(e.target.value))}
                      className="w-16 border rounded px-1"
                    />
                  </div>
                </div>
                <button className="text-red-600 text-sm" onClick={() => handleRemove(idx)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-between items-center">
            <div className="font-semibold">Total: ₹{totalPrice.toFixed(2)}</div>
            <button
              className="px-3 py-2 bg-black text-white rounded-lg"
              onClick={() => {
                setOpen(false);
                nav("/checkout");
              }}
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
