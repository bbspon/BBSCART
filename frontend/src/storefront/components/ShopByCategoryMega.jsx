import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import instance from "../../services/axiosInstance";
export default function ShopByCategoryMega() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [subcats, setSubcats] = useState([]);
  const [activeSub, setActiveSub] = useState(null);
  const [preview, setPreview] = useState([]);
  const menuRef = useRef(null);
  const nav = useNavigate();

  // Close on outside click
  useEffect(() => {
    const onDoc = (e) => {
      if (!menuRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Load top-level categories once when opening
const loadCategories = async () => {
  if (categories.length) return;
  const pincode = localStorage.getItem("deliveryPincode") || ""; // dynamic
  const { data } = await instance.get("/products/categories", {
    params: { pincode },
  });
  setCategories(data.items || data || []);
};

  // When a category is hovered → load its sub-categories
const onCatHover = async (cat) => {
  setActiveCat(cat);
  setActiveSub(null);
  setPreview([]);
  try {
    const pincode = localStorage.getItem("deliveryPincode") || "";
    const { data } = await instance.get(
      `/products/categories/${cat._id}/subcategories`,
      { params: { pincode } }
    );
    setSubcats(data.items || []);
  } catch {
    setSubcats([]);
  }
};


  // When a sub-category is hovered → load preview products
const onSubHover = async (sub) => {
  setActiveSub(sub);
  try {
    const pincode = localStorage.getItem("deliveryPincode") || "";
    const { data } = await instance.get(
      `/products/subcategories/${sub._id}/preview-products?limit=6`,
      { params: { limit: 6, pincode } }
    );
    setPreview(data.items || []);
  } catch {
    setPreview([]);
  }
};

  const priceOf = (p) => {
    const sale = Number(p?.priceInfo?.sale);
    const base = Number(p?.price);
    if (Number.isFinite(sale) && sale > 0) return sale;
    if (Number.isFinite(base) && base > 0) return base;
    return 0;
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="px-3 py-2 rounded bg-green-600 text-white text-sm"
        onMouseEnter={() => {
          setOpen(true);
          loadCategories();
        }}
        onClick={() => {
          setOpen((v) => !v);
          loadCategories();
        }}
      >
        Shop by Category ▾
      </button>

      {open && (
        <div
          className="absolute z-50 mt-2 w-[920px] bg-white shadow-xl rounded border p-3"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="grid grid-cols-3 gap-4">
            {/* Column 1: Categories */}
            <div className="border-r pr-3 max-h-96 overflow-auto">
              {categories.map((c) => (
                <div
                  key={c._id}
                  onMouseEnter={() => onCatHover(c)}
                  className={`px-3 py-2 cursor-pointer rounded ${
                    activeCat?._id === c._id ? "bg-gray-100 font-medium" : ""
                  }`}
                >
                  {c.name}
                </div>
              ))}
            </div>

            {/* Column 2: Sub-categories */}
            <div className="border-r pr-3 max-h-96 overflow-auto">
              {!subcats.length && (
                <div className="text-gray-500 px-3 py-2">
                  Hover a category to see sub-categories
                </div>
              )}
              {subcats.map((s) => (
                <div
                  key={s._id}
                  onMouseEnter={() => onSubHover(s)}
                  className={`px-3 py-2 cursor-pointer rounded ${
                    activeSub?._id === s._id ? "bg-gray-100 font-medium" : ""
                  }`}
                  onClick={() => nav(`/c/${activeCat?._id}/s/${s._id}`)}
                >
                  {s.name}
                </div>
              ))}
              {activeCat && subcats.length > 0 && (
                <div className="px-3 py-2">
                  <Link
                    to={`/c/${activeCat._id}`}
                    className="text-blue-600 text-sm"
                  >
                    View all in {activeCat.name} →
                  </Link>
                </div>
              )}
            </div>

            {/* Column 3: Product preview */}
            <div className="max-h-96 overflow-auto">
              {!preview.length && (
                <div className="text-gray-500 px-3 py-2">
                  Hover a sub-category to preview products
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {preview.map((p) => (
                  <div
                    key={p._id}
                    className="p-2 border rounded cursor-pointer"
                    onClick={() => nav(`/p/${p._id}`)}
                  >
                    <img
                      src={p.product_img}
                      alt={p.name}
                      className="w-full h-24 object-cover rounded"
                      loading="lazy"
                    />
                    <div className="mt-1 text-xs line-clamp-2">{p.name}</div>
                    <div className="text-sm font-semibold mt-1">
                      ₹{priceOf(p)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
