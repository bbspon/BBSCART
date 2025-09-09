import React, { useState, useRef, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { FaCartArrowDown } from "react-icons/fa"; // <-- Add this import

export default function NavbarCart() {
  const cart = useCart();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

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

  console.log("Cart items:", cart.state.items);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="px-3 py-2 rounded-xl shadow border flex items-center gap-2"
        onClick={() => setOpen((v) => !v)}
        title="Go to cart"
      >
        <FaCartArrowDown size={20} className="text-red-600 w-5 h-5" />{" "}
        {/* <-- Use the icon here */}
        <span>{cart.totalCount}</span>
      </button>

      {/* Show dropdown only when open */}
      {open && cart.state.items.length > 0 && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg p-3 z-50">
          <div className="flex justify-between items-center mb-2">
            <strong>Cart</strong>
            <button
              className="text-sm text-red-600"
              onClick={() => cart.clear()}
            >
              Clear
            </button>
          </div>

          <div className="max-h-72 overflow-auto space-y-3">
            {cart.state.items.map((it, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <img
                  src={it.image}
                  alt=""
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium line-clamp-2">
                    {it.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    ₹{Number(it.price || 0).toFixed(2)}
                  </div>
                  <div className="text-xs">
                    Qty:{" "}
                    <input
                      type="number"
                      min={1}
                      value={it.qty}
                      onChange={(e) => cart.setQty(idx, Number(e.target.value))}
                      className="w-16 border rounded px-1"
                    />
                  </div>
                </div>
                <button
                  className="text-red-600 text-sm"
                  onClick={() => cart.removeAt(idx)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-between items-center">
            <div className="font-semibold">
              Total: ₹{cart.totalPrice.toFixed(2)}
            </div>
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
