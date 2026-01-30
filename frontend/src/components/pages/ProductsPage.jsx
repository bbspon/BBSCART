import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import instance from "../../services/axiosInstance";
import { addToCart, fetchCartItems } from "../../slice/cartSlice";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
const STATIC_PREFIXES = ["/uploads"];
const PLACEHOLDER_IMAGE = "/img/placeholder.png";

function norm(u) {
  if (!u) return "";
  const s = String(u).trim();
  if (/^https?:\/\//i.test(s)) return s;
  if (STATIC_PREFIXES.some((pre) => s.startsWith(pre + "/")))
    return `${API_BASE}${s}`;
  return `${API_BASE}/uploads/${encodeURIComponent(s)}`;
}

function pickImage(p) {
  if (p?.product_img_url) return p.product_img_url;
  if (Array.isArray(p?.gallery_img_urls) && p.gallery_img_urls[0])
    return p.gallery_img_urls[0];
  const first = Array.isArray(p?.product_img) ? p.product_img[0] : p?.product_img;
  const gallery = Array.isArray(p?.gallery_imgs) ? p.gallery_imgs[0] : p?.gallery_imgs;
  const raw = (typeof first === "string" ? first : "") || (typeof gallery === "string" ? gallery : "");
  const chosen = raw.includes("|") ? raw.split("|").map((s) => s.trim()).filter(Boolean)[0] : raw;
  return chosen ? norm(chosen) : PLACEHOLDER_IMAGE;
}

const ProductsPage = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart?.items || []);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null); // null = "All"
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    let cancelled = false;
    instance
      .get("/products/catalog/categories")
      .then(({ data }) => {
        const items = data?.items || data || [];
        if (!cancelled) setCategories(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingCategories(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingProducts(true);
    const params = { limit: 24 };
    if (activeCategoryId != null && activeCategoryId !== "") {
      params.categoryId = String(activeCategoryId).trim();
    }
    const pin =
      localStorage.getItem("deliveryPincode") ||
      localStorage.getItem("bbs_pincode") ||
      localStorage.getItem("pincode");
    if (pin) params.pincode = pin;

    instance
      .get("/products/public", { params })
      .then(({ data }) => {
        const arr = data?.products ?? data?.items ?? [];
        if (!cancelled) setProducts(Array.isArray(arr) ? arr : []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingProducts(false);
      });
    return () => { cancelled = true; };
  }, [activeCategoryId]);

  const getQty = (productId) => {
    const item = cartItems.find((c) => c.productId === productId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const deliveryPincode =
      localStorage.getItem("deliveryPincode") ||
      localStorage.getItem("bbs_pincode") ||
      localStorage.getItem("pincode");
    if (!deliveryPincode) {
      toast.error("Please enter your delivery pincode before adding items to cart.");
      return;
    }
    dispatch(
      addToCart({
        productId: product._id,
        variantId: null,
        quantity: 1,
      })
    )
      .unwrap()
      .then(() => {
        dispatch(fetchCartItems());
        toast.success("Product added to cart!");
      })
      .catch((err) => {
        toast.error(err?.message || "Failed to add to cart.");
      });
  };

  return (
    <div className="p-6 bg-gradient-to-b from-gray-100 to-gray-300 min-h-screen">
      {/* Category Filter */}
      <div className="flex overflow-x-auto gap-3 pb-4 mb-6">
        <button
          onClick={() => setActiveCategoryId(null)}
          className={`px-5 py-2 min-w-max rounded-full text-sm font-semibold transition shadow-md
            ${activeCategoryId === null
              ? "bg-green-600 text-white shadow-lg scale-105"
              : "bg-white text-gray-700 hover:bg-green-100"
            }`}
        >
          All
        </button>
        {loadingCategories ? (
          <div className="px-5 py-2 rounded-full bg-gray-200 animate-pulse">Loading…</div>
        ) : (
          categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategoryId(cat._id)}
              className={`px-5 py-2 min-w-max rounded-full text-sm font-semibold transition shadow-md
                ${activeCategoryId === cat._id
                  ? "bg-green-600 text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 hover:bg-green-100"
                }`}
            >
              {cat.name}
            </button>
          ))
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {loadingProducts ? (
          Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center animate-pulse"
            >
              <div className="w-full h-32 bg-gray-200 rounded" />
              <div className="mt-3 h-4 w-3/4 bg-gray-200 rounded" />
              <div className="mt-2 h-5 w-1/3 bg-gray-200 rounded" />
              <div className="mt-3 h-9 w-full bg-gray-200 rounded-full" />
            </div>
          ))
        ) : (
          products.map((p) => {
            const price = p?.priceInfo?.sale ?? p?.price ?? 0;
            const qty = getQty(p._id);
            return (
              <div
                key={p._id}
                className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center transition hover:-translate-y-2 hover:shadow-2xl"
              >
                <Link to={`/p/${p._id}`} className="relative w-full h-32 flex justify-center block">
                  <img
                    src={pickImage(p)}
                    alt={p.name || ""}
                    className="h-full object-contain drop-shadow-md"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow">
                    Bestseller
                  </span>
                </Link>

                <h2 className="mt-3 text-sm font-semibold text-center text-gray-800 line-clamp-2">
                  {p.name}
                </h2>
                <p className="text-lg font-bold mt-2 text-green-700">
                  ₹{Number(price).toFixed(2)}
                </p>

                <button
                  className="mt-3 w-full border border-green-700 text-green-700 font-semibold rounded-full py-2
                    hover:bg-green-700 hover:text-white transition shadow-sm"
                  onClick={(e) => handleAddToCart(e, p)}
                >
                  {qty ? `Added (${qty})` : "Add to Cart"}
                </button>
              </div>
            );
          })
        )}
      </div>

      {!loadingProducts && !products.length && (
        <p className="text-center text-gray-500 py-8">No products in this category.</p>
      )}
    </div>
  );
};

export default ProductsPage;
