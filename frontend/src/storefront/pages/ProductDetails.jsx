import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance from "../../services/axiosInstance";
import { useCart } from "../../../context/CartContext";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";   // add this at the top

import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Share2,
  PackageCheck,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  fetchWishlistItems,
  addToWishlist,
  removeFromWishlist,
} from "../../slice/wishlistSlice";
import { addToCart, fetchCartItems } from "../../slice/cartSlice";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_URL;
 const STATIC_PREFIX = "/uploads";
 const norm = (u) => {
   if (!u) return "";
  const s = String(u).trim();
  // already absolute URL
 if (/^https?:\/\//i.test(s)) return s;
   // already a static path
   if (s.startsWith("/uploads/") || s.startsWith("/uploads/"))
   return `${API_BASE}${s}`;
  // bare filename from DB → build full URL
   return `${API_BASE}${STATIC_PREFIX}/${encodeURIComponent(s)}`;
 };

export default function ProductDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const cart = useCart();
  const dispatch = useDispatch();

  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [img, setImg] = useState("");
  const [quantity, setQuantity] = useState(1);

  const getPincode = () => {
    return localStorage.getItem("deliveryPincode") || "";
  };

  const [selected, setSelected] = useState(false); // wishlist toggle
  const [showOffers, setShowOffers] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
const { items: wishlist } = useSelector((state) => state.wishlist);

  const [deliveryLocation, setDeliveryLocation] =
    useState("Puducherry, 605008");
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setP(null);
        
        console.log("[ProductDetails] Fetching product:", id);
        const { data } = await instance.get(`/products/public/${id}`);
        console.log("[ProductDetails] Product fetched:", data?._id, data?.name);

        // Normalize gallery + sub images
        const galleryMain = Array.isArray(data?.gallery_imgs)
          ? data.gallery_imgs.map(norm).filter(Boolean)
          : [];

        const subs = [data?.product_img, data?.product_img2].map(norm).filter(Boolean);

        const primary = galleryMain[0] || subs[0] || "/img/placeholder.png";

        // ✅ Save normalized structure in _norm
        setP({
          ...data,
          _norm: { galleryMain, subs },
        });

        // ✅ Set main image for display
        setImg(primary);
      } catch (e) {
        console.error("[ProductDetails] Load product failed:", {
          id,
          status: e?.response?.status,
          data: e?.response?.data,
          message: e?.message,
        });
        setP(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);
useEffect(() => {
  dispatch(fetchWishlistItems());
}, []);

// --- Thumbs order: gallery first (main set), then sub images (product_img, product_img2) ---
const thumbs = useMemo(() => {
  const g = p?._norm?.galleryMain || [];
  const s = p?._norm?.subs || [];
  const all = [...g, ...s];
  return all.length ? all : ["/img/placeholder.png"];
}, [p]);
  const price = p?.priceInfo?.sale ?? p?.price ?? 0;
  const mrp = p?.priceInfo?.mrp ?? p?.price ?? 0;
  // ===== GST FROM CATEGORY =====
// ===== GST FROM CATEGORY =====
const category = p?.category_id || {};
const gstRate = p?.gstRate ?? p?.category_id?.gstRate ?? 0;
const hsnCode = p?.hsnCode ?? p?.category_id?.hsnCode ?? "";
const isTaxInclusive = Boolean(category?.isTaxInclusive);

const productPrice = Number(p?.price || 0);

let basePrice = productPrice;
let gstAmount = 0;
let finalPrice = productPrice;

if (gstRate > 0) {
  if (isTaxInclusive) {
    // Price already includes GST
    gstAmount = (productPrice * gstRate) / (100 + gstRate);
    basePrice = productPrice - gstAmount;
    finalPrice = productPrice;
  } else {
    // GST should be added
    gstAmount = (productPrice * gstRate) / 100;
    finalPrice = productPrice + gstAmount;
  }
}
  const discountText =
    p?.priceInfo?.discountText ||
    (mrp > price ? `${Math.round(100 - (price / mrp) * 100)}% off` : "");

  const gallery = useMemo(() => {
    const g = Array.isArray(p?.gallery_imgs) ? p.gallery_imgs : [];
    const imgs = [p?.product_img, ...g].filter(Boolean);
    return imgs.length ? imgs : ["/img/placeholder.png"];
  }, [p]);

  const dims = p?.dimensions || {};
  const specs = Array.isArray(p?.specs) ? p.specs : [];
  const tags = Array.isArray(p?.tags) ? p.tags : [];
  const variants = Array.isArray(p?.variants) ? p.variants : [];

  // UI-driven optional fields (PricingPage design)
  const ui = p?.ui || {};
  const seller = ui.seller || {
    name: "",
    rating: p?.rating_avg || 0,
    reviewsCount: p?.rating_count || 0,
  };
  const offers = Array.isArray(ui.offers) ? ui.offers : [];
  const highlights = Array.isArray(ui.highlights) ? ui.highlights : [];
  const colorOptions = Array.isArray(ui.colorOptions) ? ui.colorOptions : [];
  const sizes = Array.isArray(ui.sizes) ? ui.sizes : [];
  const reviews = Array.isArray(ui.reviews) ? ui.reviews : [];
  const ratingSummary = ui.ratingSummary || {
    counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    total: p?.rating_count || 0,
    avg: p?.rating_avg || 0,
  };

  if (loading) return <div className="container py-4">Loading…</div>;
  if (!p) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-4">
            The product you're looking for doesn't exist or is no longer available.
          </p>
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const onAddToCart = () => {
    const vendorId = p?.seller_id || "default";

    // Determine pincode: prefer stored deliveryPincode, fallback to parsing deliveryLocation
    let deliveryPincode = getPincode();
    if (!deliveryPincode) {
      const m = String(deliveryLocation || "").match(/(\d{5,6})/);
      deliveryPincode = m ? m[0] : "";
    }

    if (!deliveryPincode) {
      toast.error("Please enter your delivery pincode before adding items to cart.");
      return;
    }

    // Persist pincode for axios instance and cartSlice
    localStorage.setItem("deliveryPincode", deliveryPincode);

    // Keep the existing cart context update for immediate UI
    try {
cart.addItem(
  {
    productId: p._id,
    name: p.name,
    image: img,
    price: finalPrice,
    basePrice,
    gstRate,
    gstAmount,
    hsnCode,
    isTaxInclusive,
    qty: quantity,
    variantId: null,
  },
  vendorId
);
    } catch (err) {
      // ignore if context not available
    }

    // Dispatch the redux thunk to persist server-side cart
  dispatch(
  addToCart({
    productId: p._id,
    variantId: null,
    quantity,
    price: basePrice,
    gstRate,
    gstAmount,
    hsnCode,
    isTaxInclusive,
    finalPrice
  })
)
      .unwrap()
      .then(() => {
        dispatch(fetchCartItems());
        toast.success("Product added to cart!");
      })
      .catch((err) => {
        console.error("[ProductDetails] addToCart failed:", err);
        const msg = err?.message || err?.error || "Failed to add to cart";
        toast.error(msg);
      });
  };


  const onBuyNow = () => {
    onAddToCart();
    nav("/checkout");
  };

  return (
    <div className="container py-4">
      <h1 className="mb-3">{p?.name}</h1>

      <div className="container mx-auto px-4 py-6 grid lg:grid-cols-2 gap-6">
        {/* Left: images + thumbnails + highlights */}
        <div className="space-y-4">
          <div className="flex flex-col items-center space-y-4 sticky top-20 border border-gray-200 rounded-lg bg-white p-6">
            <div className="relative">
              <img
                src={img}
                alt={p?.name}
                style={{ maxHeight: 480, objectFit: "contain" }}
                className="w-full rounded-xl shadow"
                onError={(e) => (e.currentTarget.src = "/img/placeholder.png")}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  const exists = wishlist.some(
                    (w) => w.productId === p._id || w?.product?._id === p._id
                  );

                  if (exists) {
                    // REMOVE
                    dispatch(removeFromWishlist(p._id)).then(() =>
                      dispatch(fetchWishlistItems())
                    );
                  } else {
                    // ADD
                    dispatch(addToWishlist({ productId: p._id })).then(() =>
                      dispatch(fetchWishlistItems())
                    );
                  }
                }}
                className={`absolute bottom-4 right-4 p-2 rounded-full shadow transition ${
                  wishlist.some(
                    (w) => w.productId === p._id || w?.product?._id === p._id
                  )
                    ? "bg-red-600 text-white"
                    : "bg-orange-100 text-red-500"
                }`}
                title="Wishlist"
              >
                <Heart size={18} />
              </button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <div className="flex gap-2 flex-wrap">
                {thumbs.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => setImg(g)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      img === g ? "border-blue-500" : "border-transparent"
                    }`}
                    title="Preview"
                  >
                    <img
                      src={g}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) =>
                        (e.currentTarget.style.visibility = "hidden")
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {highlights.length > 0 && (
              <div className="bg-white w-full">
                <h2 className="font-semibold mb-2 text-lg">Highlights</h2>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                  {highlights.map((h, idx) => (
                    <li key={idx}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right: core info + actions */}
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">{p?.name}</h1>

          {/* ratings + seller header (PricingPage pattern) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex text-yellow-500">
                {Array(5)
                  .fill()
                  .map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={`${
                        i < Math.floor(seller.rating || 0)
                          ? "fill-yellow-500"
                          : ""
                      }`}
                    />
                  ))}
              </div>
              <span className="font-semibold">
                {(seller.rating || p?.rating_avg || 0).toFixed(1)}
              </span>
              <span className="text-gray-600">
                ({seller.reviewsCount || p?.rating_count || 0} ratings)
              </span>
            </div>
            <button className="text-blue-600 underline text-sm font-medium">
              See other sellers
            </button>
          </div>

          {/* price with mrp/discount */}
          <div>
<div className="text-3xl font-bold text-green-600">
₹{finalPrice.toFixed(2)}
</div>

{gstRate > 0 && (
  <div className="text-xs text-gray-600 mt-1">
    <div>GST: {gstRate}%</div>
    <div>HSN: {hsnCode || "-"}</div>

    {isTaxInclusive ? (
      <>
        <div>Price includes GST</div>
        <div>Included GST: ₹{gstAmount.toFixed(2)}</div>
      </>
    ) : (
      <>
        <div>Base Price: ₹{basePrice.toFixed(2)}</div>
        <div>GST Amount: ₹{gstAmount.toFixed(2)}</div>
      </>
    )}
  </div>
)}          {mrp > price && (
              <>
                <div className="text-sm text-gray-500 line-through">₹{mrp}</div>
                <div className="text-sm text-red-600">{discountText}</div>
              </>
            )}
          </div>

          {/* delivery location */}
          <div className="border rounded-lg p-4 bg-white flex items-center gap-3">
            <Truck size={20} className="text-gray-600" />
            <div>
              Delivery to
              <select
                className="border-b border-blue-500 outline-none font-semibold"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
              >
                <option>Puducherry, 605001</option>
                <option>Chennai, 600001</option>
                <option>Bangalore, 560001</option>
                <option>Hyderabad, 500001</option>
              </select>
            </div>
          </div>

          {/* offers list with expand/collapse */}
          {offers.length > 0 && (
            <div className="border rounded-lg p-4 bg-yellow-50">
              <h2
                className="font-semibold mb-2 flex items-center justify-between cursor-pointer"
                onClick={() => setShowOffers((s) => !s)}
              >
                Available Offers{" "}
                {showOffers ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </h2>
              <ul className="space-y-1 text-sm">
                {(showOffers ? offers : offers.slice(0, 3)).map(
                  (offer, idx) => (
                    <li key={idx}>{offer}</li>
                  )
                )}
              </ul>
            </div>
          )}

          {/* color swatches */}
          {colorOptions.length > 0 && (
            <div>
              <h3 className="font-medium">Color:</h3>
              <div className="flex gap-3 mt-2">
                {colorOptions.map(({ name, img: cimg }) => (
                  <button
                    key={name}
                    onClick={() => {
                      setSelectedColor(name);
                      // try to switch main image to a matching index if present
                      const i = colorOptions.findIndex((c) => c.name === name);
                      if (gallery[i]) setImg(gallery[i]);
                    }}
                    className={`p-1 rounded border-2 ${
                      selectedColor === name
                        ? "border-blue-500"
                        : "border-gray-300"
                    }`}
                    title={name}
                  >
                    <img src={cimg} alt={name} className="w-10 h-10 rounded" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* sizes */}
          {sizes.length > 0 && (
            <div>
              <h3 className="font-medium">Size:</h3>
              <div className="flex gap-2 mt-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 rounded-full border ${
                      selectedSize === s
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* quantity */}
          <div>
            <label className="font-medium">Quantity:</label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="ml-2 border rounded-lg p-2"
            >
              {[1, 2, 3, 4, 5].map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>

          {/* CTAs */}
          <div className="flex gap-4">
            <button
              onClick={onAddToCart}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} /> Add to Cart
            </button>
            <button
              onClick={onBuyNow}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <PackageCheck size={20} /> Buy Now
            </button>
          </div>

          {/* service badges */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Truck size={16} /> Free Delivery
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} /> 1 Year Warranty
            </div>
            <div className="flex items-center gap-2">
              <Heart size={16} /> Wishlist
            </div>
            <div className="flex items-center gap-2">
              <Share2 size={16} /> Share
            </div>
          </div>

          {/* quick facts (your existing fields) */}
          <div className="border rounded-lg p-4 bg-white space-y-2">
            <div className="text-sm text-gray-500">SKU</div>
            <div className="font-medium">{p?.SKU || "-"}</div>

            <div className="text-sm text-gray-500">Stock</div>
            <div className="font-medium">{p?.stock ?? 0}</div>

            <div className="text-sm text-gray-500">Weight</div>
            <div className="font-medium">{p?.weight || "-"}</div>

            <div className="text-sm text-gray-500">Dimensions</div>
            <div className="font-medium">
              {dims.length || dims.width || dims.height
                ? `${dims.length ?? 0} × ${dims.width ?? 0} × ${
                    dims.height ?? 0
                  }`
                : "-"}
            </div>

            <div className="text-sm text-gray-500">Category</div>
            <div className="font-medium">
              {p?.category_id?.name || p?.category_id || "-"}
            </div>

            <div className="text-sm text-gray-500">Sub-category</div>
            <div className="font-medium">
              {p?.subcategory_id?.name || p?.subcategory_id || "-"}
            </div>
          </div>

          {/* description */}
          {p?.description ? (
            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <div style={{ whiteSpace: "pre-wrap" }}>{p.description}</div>
            </div>
          ) : null}

          {/* ratings & reviews (bars + list) */}
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-3">Ratings & Reviews</h2>

            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl font-bold text-yellow-500 flex items-center gap-1">
                {(ratingSummary.avg || 0).toFixed(1)} <Star size={28} />
              </div>
              <div className="text-sm text-gray-600">
                {ratingSummary.total || 0} Ratings & {reviews.length} Reviews
              </div>
              <button className="ml-auto bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm">
                Rate Product
              </button>
              {/* <div className="ml-auto w-full max-w-md">
                <WriteTestimonial productId={p?._id} />
              </div> */}

              <Link
                to={`/write-testimonial/${p?._id}`}
                className="ml-auto bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
              >
                Write a Testimonial
              </Link>
            </div>

            <div className="space-y-2 mb-6">
              {[5, 4, 3, 2, 1].map((star) => {
                const counts = ratingSummary.counts || {};
                const total = ratingSummary.total || 0;
                const n = counts[star] || 0;
                const percent = total ? (n / total) * 100 : 0;
                const color =
                  star >= 4
                    ? "bg-green-600"
                    : star === 3
                    ? "bg-yellow-500"
                    : "bg-orange-500";
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-6 text-sm">{star}★</span>
                    <div className="flex-1 h-3 bg-gray-300 rounded overflow-hidden">
                      <div
                        className={`${color} h-3`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-6 text-sm text-gray-600">{n}</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-6">
              {reviews.map((r, i) => (
                <div
                  key={i}
                  className="border p-4 rounded-lg bg-white shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-green-600 text-white px-2 rounded text-xs font-semibold flex items-center gap-1">
                      {r.rating}★
                    </div>
                    <div className="font-semibold">{r.title}</div>
                  </div>
                  <p className="text-gray-700 mb-2">{r.comment}</p>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span>{r.reviewer}</span>
                    {r.location && <span>• {r.location}</span>}
                    {r.date && <span>• {r.date}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* variants (if you use them) */}
          {p?.is_variant && variants.length > 0 && (
            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold mb-3">Variants</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {variants.map((v) => (
                  <div key={v._id} className="border rounded-lg p-3">
                    <div className="font-semibold mb-2">
                      {v.variant_name || "Variant"}
                    </div>
                    {v.variant_img ? (
                      <img
                        src={v.variant_img}
                        alt=""
                        className="w-full h-28 object-cover rounded mb-2"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    ) : null}
                    <div className="text-sm">Price: ₹{v.price ?? "-"}</div>
                    <div className="text-sm">Stock: {v.stock ?? "-"}</div>
                    <div className="text-sm">SKU: {v.SKU || "-"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
