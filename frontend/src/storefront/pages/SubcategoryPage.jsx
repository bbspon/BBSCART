import { useEffect, useMemo, useRef, useState } from "react";
import {
  useParams,
  useSearchParams,
  Link,
  useNavigate,
} from "react-router-dom";
import instance from "../../services/axiosInstance";
import { ChevronDown, ChevronUp, Star, Check } from "lucide-react";
import { BsFillHeartFill } from "react-icons/bs";
import { ImCart } from "react-icons/im";
import { BsCurrencyRupee } from "react-icons/bs";
import { PiPlusCircleBold, PiMinusCircleBold } from "react-icons/pi";
import { TbArrowBadgeLeft } from "react-icons/tb";
import { TbArrowBadgeRight } from "react-icons/tb";
import {
  addToWishlist,
  fetchWishlistItems,
  removeFromWishlist,
} from "../../slice/wishlistSlice";

import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  updateQuantity,
  removeFromCart,
  fetchCartItems,
} from "../../slice/cartSlice";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const STATIC_PREFIXES = ["/uploads"]; // support both roots

export default function SubcategoryPage() {
  const [page, setPage] = useState(1);
  const totalPages = 10; // <-- add this line
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [expandedCategories, setExpandedCategories] = useState(true);
  const { items: wishlist } = useSelector((state) => state.wishlist);
  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const images = [
    "https://png.pngtree.com/background/20230525/original/pngtree-3d-grocery-store-with-orange-goods-in-the-background-picture-image_2738856.jpg",
    "https://tse2.mm.bing.net/th/id/OIP.L6fOWzQvVq0xXxmm7KHb4gHaCx?rs=1&pid=ImgDetMain&o=7&rm=3",
    "https://img.freepik.com/premium-photo/grocery-backgrounds_670382-182535.jpg?w=2000",
  ];

  const [current, setCurrent] = useState(0);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000); // change every 3s

    return () => clearInterval(interval);
  }, [images.length]);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };
  const toggleWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    const exists = wishlist.some(
      (w) => w.productId === productId || w?.product?._id === productId,
    );

    try {
      if (exists) {
        await dispatch(removeFromWishlist(productId));
      } else {
        await dispatch(addToWishlist({ productId }));
      }

      dispatch(fetchWishlistItems());
    } catch (err) {
      console.log("Wishlist toggle error:", err);
    }
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };
  const [isComboOpen, setIsComboOpen] = useState(false);
  const [showMoreCombos, setShowMoreCombos] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState("Select Combo");

  const comboOptions = [
    { label: "1 Kg", discount: "10% Off", price: "₹900", oldPrice: "₹1000" },
    { label: "2 Kg", discount: "12% Off", price: "₹1760", oldPrice: "₹2000" },
    { label: "3 Kg", discount: "15% Off", price: "₹2550", oldPrice: "₹3000" },
    { label: "4 Kg", discount: "18% Off", price: "₹3280", oldPrice: "₹4000" },
    { label: "5 Kg", discount: "20% Off", price: "₹4000", oldPrice: "₹5000" },
  ];

  const moreCombos = [
    { label: "6 Kg", discount: "22% Off", price: "₹4680", oldPrice: "₹6000" },
    { label: "7 Kg", discount: "23% Off", price: "₹5390", oldPrice: "₹7000" },
    { label: "8 Kg", discount: "25% Off", price: "₹6000", oldPrice: "₹8000" },
    { label: "9 Kg", discount: "26% Off", price: "₹6660", oldPrice: "₹9000" },
    { label: "10 Kg", discount: "28% Off", price: "₹7200", oldPrice: "₹10000" },
  ];

  useEffect(() => {
    dispatch(fetchWishlistItems());
  }, []);
  const cartItems = useSelector((state) => state.cart.items);

  const getQty = (id) => {
    const found = cartItems.find((c) => c.productId === id);
    return found ? found.quantity : 0;
  };

  const handleAdd = (e, product) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent navigation to product page

    const deliveryPincode = getPincode();
    if (!deliveryPincode) {
      toast.error(
        "Please enter your delivery pincode before adding items to cart.",
      );
      return;
    }

    // Ensure pincode is stored in localStorage (cartSlice reads from there)
    if (deliveryPincode) {
      localStorage.setItem("deliveryPincode", deliveryPincode);
    }

    console.log("[handleAdd] Adding product to cart:", {
      productId: product._id,
      productName: product.name,
      deliveryPincode,
    });

    dispatch(
      addToCart({
        productId: product._id,
        variantId: null,
        quantity: 1,
      }),
    )
      .unwrap() // Use unwrap() to get the actual result/error from the thunk
      .then((result) => {
        console.log("[handleAdd] Success:", result);
        dispatch(fetchCartItems());
        toast.success("Product added to cart!");
      })
      .catch((error) => {
        console.error("[handleAdd] Failed to add to cart:", error);
        const errorMsg =
          error?.message ||
          error?.error ||
          "Failed to add product to cart. Please try again.";
        toast.error(errorMsg);
      });
  };
  const handleIncrease = (e, product) => {
    e.preventDefault();
    const qty = getQty(product._id);

    dispatch(
      updateQuantity({
        productId: product._id,
        variantId: null,
        quantity: qty + 1,
      }),
    ).then(() => dispatch(fetchCartItems()));
  };

  const handleDecrease = (e, product) => {
    e.preventDefault();
    const qty = getQty(product._id);

    if (qty <= 1) {
      dispatch(
        removeFromCart({ productId: product._id, variantId: null }),
      ).then(() => dispatch(fetchCartItems()));
    } else {
      dispatch(
        updateQuantity({
          productId: product._id,
          variantId: null,
          quantity: qty - 1,
        }),
      ).then(() => dispatch(fetchCartItems()));
    }
  };

  const [liked, setLiked] = useState(false);
  const { subcategoryId } = useParams();
  const [params, setParams] = useSearchParams();
  // --- pincode helper (kept) ---
  const urlPincode = params.get("pincode") || "";
  const getPincode = () =>
    urlPincode ||
    localStorage.getItem("deliveryPincode") ||
    localStorage.getItem("bb_pincode") ||
    localStorage.getItem("user_pincode") ||
    localStorage.getItem("pincode");

  // --- products (kept) ---
  const [itemsRaw, setItemsRaw] = useState([]);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState(params.get("q") || "");
  const [brandSingle, setBrand] = useState(params.get("brand") || "");
  const [organic, setOrganic] = useState(params.get("organic") || "");
  const [minPrice, setMin] = useState(params.get("minPrice") || "");
  const [maxPrice, setMax] = useState(params.get("maxPrice") || "");

  // --- URL CSV (kept) ---
  const brandsCSV = params.get("brands") || "";
  const materialsCSV = params.get("materials") || "";
  const packSizesCSV = params.get("packSizes") || "";
  const productTypesCSV = params.get("productTypes") || "";
  const returnPoliciesCSV = params.get("returnPolicies") || "";
  const discountsCSV = params.get("discounts") || "";
  const ratingsCSV = params.get("ratings") || "";
  const priceBandsCSV = params.get("priceBands") || "";

  // --- categories (optional to keep) ---
  const [categories, setCategories] = useState([]);

  // --- NEW: all subcategories (direct) ---
  const [subcategories, setSubcategories] = useState([]);
  const [subcatSearch, setSubcatSearch] = useState("");
  const [expandedSubcats, setExpandedSubcats] = useState(true);

  // --- other route params (kept) ---
  const groupId = params.get("groupId") || "";
  const group = params.get("group") || "";
  const product = params.get("product") || "";
  const label = params.get("label") || "";

  // --- expand states (kept) ---
  const [expandedBrands, setExpandedBrands] = useState(true);
  const [expandedRating, setExpandedRating] = useState(true);
  const [expandedPrice, setExpandedPrice] = useState(true);
  const [expandedDiscount, setExpandedDiscount] = useState(true);
  const [expandedPackSize, setExpandedPackSize] = useState(true);
  const [expandedProductType, setExpandedProductType] = useState(true);
  const [expandedReturnPolicy, setExpandedReturnPolicy] = useState(true);
  const [expandedMaterial, setExpandedMaterial] = useState(true);

  // --- fallbacks (kept) ---
  const fallback = {
    materials: [
      "Cotton",
      "Polyester",
      "Wool",
      "Silk",
      "Leather",
      "Metal",
      "Plastic",
      "Wood",
    ],
    returnPolicies: [
      "7 Days Return",
      "15 Days Return",
      "30 Days Return",
      "No Returns",
      "Exchange Only",
    ],
    priceBands: [
      "Less than ₹200",
      "₹200 – ₹500",
      "₹500 – ₹1,000",
      "₹1,000 – ₹2,000",
      "₹2,000 – ₹5,000",
      "₹5,000 – ₹10,000",
    ],
    discounts: [
      "10% or more",
      "20% or more",
      "30% or more",
      "40% or more",
      "50% or more",
      "60% or more",
      "70% or more",
    ],
    productTypes: [
      "Organic",
      "Imported",
      "Local",
      "Premium",
      "Discounted",
      "Seasonal",
    ],
    packSizes: ["100g", "250g", "500g", "1kg", "2kg", "5kg", "10kg"],
    brands: ["Agar", "Amazon", "Ambrane", "Amkette", "Apple", "Boat"],
    ratings: [5, 4, 3, 2, 1],
  };

  const [facets, setFacets] = useState(null);

  // ---------- helpers (kept) ----------
  const toStringArray = (input, labelKey = "label") => {
    if (!input) return [];
    if (Array.isArray(input)) {
      return input
        .map((x) => {
          if (x == null) return null;
          if (typeof x === "string") return x;
          if (typeof x === "number") return String(x);
          return x[labelKey] ?? x.value ?? x.name ?? x.key ?? null;
        })
        .filter(Boolean);
    }
    if (typeof input === "object") return Object.keys(input);
    return [String(input)];
  };

  const parsePriceBand = (label) => {
    if (!label) return [null, null];
    const less = /Less than *₹\s*([\d,]+)/i.exec(label);
    if (less) {
      const max = Number(less[1].replace(/,/g, ""));
      return [0, isFinite(max) ? max - 1 : null];
    }
    const m = /₹\s*([\d,]+)\s*–\s*₹\s*([\d,]+)/.exec(label);
    if (m) {
      const a = Number(m[1].replace(/,/g, ""));
      const b = Number(m[2].replace(/,/g, ""));
      return [isFinite(a) ? a : null, isFinite(b) ? b : null];
    }
    return [null, null];
  };

  const buildPriceBandsFromItems = (prods) => {
    if (!Array.isArray(prods) || !prods.length) return [];
    const prices = prods
      .map((p) => Number(p?.priceInfo?.sale ?? p?.price))
      .filter((n) => Number.isFinite(n) && n > 0)
      .sort((a, b) => a - b);
    if (!prices.length) return [];
    const min = prices[0];
    const max = prices[prices.length - 1];
    const step = Math.max(100, Math.ceil((max - min) / 5));
    const bands = [];
    bands.push(`Less than ₹${step}`);
    let start = Math.floor(min / step) * step;
    while (start < max) {
      const end = start + step;
      bands.push(
        `₹${start.toLocaleString("en-IN")} – ₹${end.toLocaleString("en-IN")}`,
      );
      start = end;
    }
    return Array.from(new Set(bands)).slice(0, 7);
  };

  const csvToSet = (csv) =>
    new Set(
      csv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
  const setToCSV = (set) => Array.from(set).join(",");

  const selected = {
    brands: useMemo(() => csvToSet(brandsCSV), [brandsCSV]),
    materials: useMemo(() => csvToSet(materialsCSV), [materialsCSV]),
    packSizes: useMemo(() => csvToSet(packSizesCSV), [packSizesCSV]),
    productTypes: useMemo(() => csvToSet(productTypesCSV), [productTypesCSV]),
    returnPolicies: useMemo(
      () => csvToSet(returnPoliciesCSV),
      [returnPoliciesCSV],
    ),
    discounts: useMemo(() => csvToSet(discountsCSV), [discountsCSV]),
    ratings: useMemo(() => csvToSet(ratingsCSV), [ratingsCSV]),
    priceBands: useMemo(() => csvToSet(priceBandsCSV), [priceBandsCSV]),
  };

  const toggleValue = (key, value) => {
    const copy = new Set(selected[key]);
    if (copy.has(value)) copy.delete(value);
    else copy.add(value);

    const next = Object.fromEntries(params.entries());
    if (copy.size) next[key] = setToCSV(copy);
    else delete next[key];

    if (label) next.label = label;
    if (group) next.group = group;
    if (product) next.product = product;
    if (q) next.q = q;
    if (brandSingle) next.brand = brandSingle;
    if (organic) next.organic = organic;
    if (minPrice) next.minPrice = minPrice;
    if (maxPrice) next.maxPrice = maxPrice;

    const pin = getPincode();
    if (pin) next.pincode = pin;

    setParams(next, { replace: true });
  };

  // ---- derive numeric and CSV filters (kept) ----
  const deriveFilters = () => {
    let dMin = null,
      dMax = null;
    if (selected.priceBands.size) {
      for (const l of selected.priceBands) {
        const [a, b] = parsePriceBand(l);
        if (a != null) dMin = dMin == null ? a : Math.min(dMin, a);
        if (b != null) dMax = dMax == null ? b : Math.max(dMax, b);
      }
    }
    let discountMin = null;
    if (selected.discounts.size) {
      for (const l of selected.discounts) {
        const m = /(\d+)\s*%/.exec(l);
        if (m) {
          const n = Number(m[1]);
          if (isFinite(n)) discountMin = Math.max(discountMin ?? 0, n);
        }
      }
    }
    let ratingMin = null;
    if (selected.ratings.size) {
      for (const r of selected.ratings) {
        const n = Number(r);
        if (isFinite(n)) ratingMin = Math.max(ratingMin ?? 0, n);
      }
    }
    const csv = (s) => (s.size ? Array.from(s).join(",") : undefined);
    return {
      derivedMinPrice: dMin ?? undefined,
      derivedMaxPrice: dMax ?? undefined,
      discountMin: discountMin ?? undefined,
      ratingMin: ratingMin ?? undefined,
      brandsList: csv(selected.brands),
      materialsList: csv(selected.materials),
      packSizesList: csv(selected.packSizes),
      productTypesList: csv(selected.productTypes),
      returnPoliciesList: csv(selected.returnPolicies),
    };
  };

  const {
    derivedMinPrice,
    derivedMaxPrice,
    discountMin,
    ratingMin,
    brandsList,
    materialsList,
    packSizesList,
    productTypesList,
    returnPoliciesList,
  } = deriveFilters();

  const buildQuery = () => {
    const qobj = {
      subcategoryId,
      groupId: groupId || undefined,
      product: groupId ? undefined : product || undefined,
      group: groupId || product ? undefined : group || undefined,
      q: groupId || product || group ? undefined : q || undefined,
      brand: brandSingle || undefined,
      organic: organic !== "" ? organic : undefined,

      minPrice: (minPrice || derivedMinPrice) ?? undefined,
      maxPrice: (maxPrice || derivedMaxPrice) ?? undefined,

      brands: brandsList,
      materials: materialsList,
      packSizes: packSizesList,
      productTypes: productTypesList,
      returnPolicies: returnPoliciesList,

      ratingGte: ratingMin,
      discountGte: discountMin,

      limit: 48,
      t: Date.now(),
    };
    const pin = getPincode();
    if (pin && String(pin).trim().length >= 3) qobj.pincode = pin;
    console.log("[QUERY BUILT]", qobj);
    return qobj;
  };

  // ---------- network (kept) ----------
  function loadProducts() {
    const query = buildQuery();
    console.log("[REQ] /products/public", query);
    instance
      .get("/products/public", { params: query })
      .then(({ data }) => {
        const arr = data.products || data.items || [];
        console.log("[RES] /products/public", arr.length);
        setItemsRaw(arr);
      })
      .catch((err) => {
        console.error(
          "[ERR] /products/public",
          err?.response?.status,
          err?.response?.data || err.message,
        );
        setItemsRaw([]);
      });
  }

  function loadFacets() {
    const query = buildQuery();
    console.log("[REQ] /facets", query);
    instance
      .get("/facets", { params: query })
      .then(({ data }) => {
        const f = data?.facets || data || {};
        console.log("[RES] /facets", f);
        setFacets({
          brands: f.brands || f.brand || null,
          materials: f.materials || f.material || null,
          packSizes: f.packSizes || f.packSize || null,
          productTypes: f.productTypes || f.productType || null,
          returnPolicies: f.returnPolicies || f.returnPolicy || null,
          discounts: f.discounts || f.discount || null,
          ratings: f.ratings || f.ratings || null,
          priceBands: f.priceBands || f.price || null,
          categories: f.categories || null,
        });
      })
      .catch((err) => {
        console.error(
          "[ERR] /facets",
          err?.response?.status,
          err?.response?.data || err.message,
        );
        setFacets(null);
      });
  }

  // ---------- NEW: load subcategories directly ----------
  useEffect(() => {
    const fetchSubcats = async () => {
      try {
        const pincode = getPincode();
        console.log("[REQ] /subcategories", { pincode });
        const { data } = await instance.get("/subcategories", {
          params: { pincode },
        });
        const arr = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
            ? data
            : [];
        console.log("[RES] /subcategories", arr.length, arr);
        setSubcategories(arr);
      } catch (err) {
        console.error(
          "[ERR] /subcategories",
          err?.response?.status,
          err?.response?.data || err.message,
        );
        setSubcategories([]);
      }
    };

    const fetchCategories = async () => {
      try {
        const pincode = getPincode();
        console.log("[REQ] /categories", { pincode });
        const { data } = await instance.get("/categories", {
          params: { pincode },
        });
        const arr = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
            ? data
            : [];
        console.log("[RES] /categories", arr.length);
        setCategories(arr);
      } catch (err) {
        console.error(
          "[ERR] /categories",
          err?.response?.status,
          err?.response?.data || err.message,
        );
        setCategories([]);
      }
    };

    fetchSubcats(); // required for the new sidebar
    fetchCategories(); // optional: keeps your category block
  }, []); // on mount

  // ---------- effects for products/facets (kept) ----------
  useEffect(() => {
    loadProducts();
    loadFacets();
  }, [
    subcategoryId,
    q,
    brandSingle,
    organic,
    minPrice,
    maxPrice,
    brandsCSV,
    materialsCSV,
    packSizesCSV,
    productTypesCSV,
    returnPoliciesCSV,
    discountsCSV,
    ratingsCSV,
    priceBandsCSV,
    groupId,
    group,
    product,
    urlPincode,
  ]);

  // ---------- client-side fallback filter (kept) ----------
  const applyClientFilters = (list) => {
    const term = (q || "").trim().toLowerCase();

    const priceMinEff = Number(minPrice || derivedMinPrice);
    const priceMaxEff = Number(maxPrice || derivedMaxPrice);
    const hasPriceMin = Number.isFinite(priceMinEff);
    const hasPriceMax = Number.isFinite(priceMaxEff);

    const brandSet = selected.brands;
    const matSet = selected.materials;
    const packSet = selected.packSizes;
    const typeSet = selected.productTypes;
    const retSet = selected.returnPolicies;

    const ratingMinEff = Number(ratingMin || 0);
    const discountMinEff = Number(discountMin || 0);

    return list.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const brand = (p.brand || p.Brand || "").toString();
      const material = (
        p.material ||
        p.Material ||
        p.attributes?.material ||
        ""
      ).toString();
      const packSize = (
        p.packSize ||
        p.pack ||
        p.attributes?.packSize ||
        ""
      ).toString();
      const type = (
        p.type ||
        p.productType ||
        p.tags?.join(",") ||
        ""
      ).toString();
      const ret = (p.returnPolicy || p.return || "").toString();

      const price = Number(p?.priceInfo?.sale ?? p?.price);
      if (hasPriceMin && (!Number.isFinite(price) || price < priceMinEff))
        return false;
      if (hasPriceMax && (!Number.isFinite(price) || price > priceMaxEff))
        return false;

      if (term && !(name.includes(term) || brand.toLowerCase().includes(term)))
        return false;

      if (
        brandSingle &&
        brandSingle !== "" &&
        brand.toLowerCase() !== brandSingle.toLowerCase()
      )
        return false;
      if (brandSet.size && !brandSet.has(brand)) return false;
      if (matSet.size && !matSet.has(material)) return false;
      if (packSet.size && !packSet.has(packSize)) return false;
      if (typeSet.size && !Array.from(typeSet).some((t) => type.includes(t)))
        return false;
      if (retSet.size && !retSet.has(ret)) return false;

      const ratingValue = Number(p.rating || p.avgRating || p.reviews_avg || 0);
      if (
        ratingMinEff &&
        (!Number.isFinite(ratingValue) || ratingValue < ratingMinEff)
      )
        return false;

      const mrp = Number(p?.priceInfo?.mrp ?? p?.mrp ?? price);
      const discountPct =
        Number.isFinite(mrp) && mrp > 0 && Number.isFinite(price)
          ? Math.round((1 - price / mrp) * 100)
          : 0;
      if (discountMinEff && discountPct < discountMinEff) return false;

      return true;
    });
  };

  useEffect(() => {
    const filtered = applyClientFilters(itemsRaw);
    console.log(
      "[CLIENT FILTER] in:",
      itemsRaw.length,
      "out:",
      filtered.length,
    );
    setItems(filtered);
  }, [
    itemsRaw,
    q,
    brandSingle,
    organic,
    minPrice,
    maxPrice,
    brandsCSV,
    materialsCSV,
    packSizesCSV,
    productTypesCSV,
    returnPoliciesCSV,
    discountsCSV,
    ratingsCSV,
    priceBandsCSV,
  ]);

  const lists = {
    ratings: toStringArray(facets?.ratings) || fallback.ratings,
    brands: toStringArray(facets?.brands) || fallback.brands,
    discounts: toStringArray(facets?.discounts) || fallback.discounts,
    packSizes: toStringArray(facets?.packSizes) || fallback.packSizes,
    productTypes: toStringArray(facets?.productTypes) || fallback.productTypes,
    returnPolicies:
      toStringArray(facets?.returnPolicies) || fallback.returnPolicies,
    materials: toStringArray(facets?.materials) || fallback.materials,
  };

  const facetPriceBands = toStringArray(facets?.priceBands);
  const generatedPriceBands = facetPriceBands.length
    ? facetPriceBands
    : buildPriceBandsFromItems(itemsRaw);
  const priceBandsFinal = generatedPriceBands.length
    ? generatedPriceBands
    : fallback.priceBands;
  function norm(u) {
    if (!u) return "";
    const s = String(u).trim();
    // absolute URLs as-is
    if (/^https?:\/\//i.test(s)) return s;

    // server static paths: allow /uploads and /uploads-bbscart (and nested images/YYYY/MM)
    if (STATIC_PREFIXES.some((pre) => s.startsWith(pre + "/"))) {
      return `${API_BASE}${s}`;
    }

    // bare filename: fall back to the preferred products folder under /uploads
    return `${API_BASE}/uploads/${encodeURIComponent(s)}`;
  }

  function pickImage(p) {
    // 1) Prefer explicit, already-built URLs from backend
    if (p.product_img_url) return p.product_img_url;
    if (Array.isArray(p.gallery_img_urls) && p.gallery_img_urls[0]) {
      return p.gallery_img_urls[0];
    }

    // 2) Fallback to stored fields that might be arrays OR pipe-joined strings
    const firstSingleRaw = Array.isArray(p.product_img)
      ? p.product_img[0]
      : p.product_img;
    const firstGalleryRaw = Array.isArray(p.gallery_imgs)
      ? p.gallery_imgs[0]
      : p.gallery_imgs;

    // handle pipe-joined strings like "a.webp|b.webp"
    const splitFirst = (val) => {
      if (!val) return "";
      const t = String(val).trim();
      return t.includes("|")
        ? t
            .split("|")
            .map((s) => s.trim())
            .filter(Boolean)[0]
        : t;
    };

    const chosen =
      splitFirst(firstSingleRaw) || splitFirst(firstGalleryRaw) || "";
    if (!chosen) return "";

    // 3) Normalize into a usable URL (handles absolute, /uploads, /uploads-bbscart, bare filename)
    return norm(chosen);
  }

  // ------ UI ------
  return (
    <div className="flex flex-col md:flex-row gap-6  bg-gray-50 min-h-screen ">
      <aside
        className=" bg-white border-r border-gray-200 p-4  space-y-8 max-h-screen overflow-y-auto sticky top-0"
        style={{ width: "100%", maxWidth: "300px" }}
      >
        {/* NEW: Shop by Subcategory (direct) */}
        <div>
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setExpandedSubcats(!expandedSubcats)}
          >
            <h2 className="text-lg font-semibold whitespace-nowrap">
              Shop by Subcategory
            </h2>
            {expandedSubcats ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>

          {expandedSubcats && (
            <>
              <input
                type="text"
                placeholder="Search subcategories"
                className="mt-2 mb-2 w-full border rounded-md px-2 py-1 text-sm"
                value={subcatSearch}
                onChange={(e) => setSubcatSearch(e.target.value)}
              />
              {!subcategories.length && (
                <div className="text-sm text-gray-500">No subcategories.</div>
              )}
              <ul className="space-y-1 max-h-72 overflow-auto pr-1">
                {subcategories
                  .filter((s) => {
                    if (!subcatSearch.trim()) return true;
                    const n = (s.name || "").toLowerCase();
                    return n.includes(subcatSearch.trim().toLowerCase());
                  })
                  .map((s) => (
                    <li key={s._id}>
                      <Link
                        to={`/subcategory/${s._id}`}
                        className="block text-sm text-gray-700 hover:underline"
                      >
                        {s.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </>
          )}
        </div>

        {/* Optional: keep categories block (won’t be used for subcategories anymore) */}
        <div>
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setExpandedCategories(!expandedCategories)}
          >
            <h2 className="text-lg font-semibold whitespace-nowrap">
              Shop by Category
            </h2>

            {expandedCategories ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>

          {expandedCategories && (
            <>
              {!categories.length && (
                <div className="text-sm text-gray-500 mt-2">No categories.</div>
              )}

              <ul className="space-y-2 text-gray-700 mt-2">
                {categories.map((cat) => (
                  <li key={cat._id}>
                    <div className="font-medium">{cat.name}</div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Refined by (kept) */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Refined by</h2>

          <div className="mb-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedRating(!expandedRating)}
            >
              <h3 className="font-medium mb-2">Product Rating</h3>
              {expandedRating ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
            {expandedRating && (
              <div className="flex flex-col gap-2">
                {lists.ratings.map((r) => {
                  const key = String(r);
                  const checked = selected.ratings.has(key);
                  return (
                    <label
                      key={key}
                      className="flex items-center gap-2 cursor-pointer select-none px-3"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={checked}
                        onChange={() => toggleValue("ratings", key)}
                      />
                      <span className="flex items-center text-gray-700">
                        {Array.from({ length: Number(r) }).map((_, i) => (
                          <Star key={`f-${i}`} className="w-4 h-4" />
                        ))}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mb-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedBrands(!expandedBrands)}
            >
              <h3 className="font-medium">Brands</h3>
              {expandedBrands ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
            {expandedBrands && (
              <>
                <input
                  type="text"
                  placeholder="Search here"
                  className="mt-2 mb-2 w-full border rounded-md px-2 py-1 text-sm"
                  onChange={() => {}}
                />
                <div className="divide-y divide-gray-100">
                  {lists.brands.map((b) => {
                    const checked = selected.brands.has(b);
                    return (
                      <label
                        key={b}
                        className="flex items-center gap-2 px-1 py-1 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4"
                          checked={checked}
                          onChange={() => toggleValue("brands", b)}
                        />
                        <span className="text-gray-700">{b}</span>
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="mb-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedPrice(!expandedPrice)}
            >
              <h3 className="font-medium mb-2">Price</h3>
              {expandedPrice ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
            {expandedPrice && (
              <div className="flex flex-col gap-2 px-1">
                {priceBandsFinal.map((label) => {
                  const checked = selected.priceBands.has(label);
                  return (
                    <label
                      key={label}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={checked}
                        onChange={() => toggleValue("priceBands", label)}
                      />
                      <span className="text-gray-700">{label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mb-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedDiscount(!expandedDiscount)}
            >
              <h3 className="font-medium mb-2">Discount</h3>
              {expandedDiscount ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
            {expandedDiscount && (
              <div className="flex flex-col gap-2 px-1">
                {lists.discounts.map((d) => {
                  const checked = selected.discounts.has(d);
                  return (
                    <label
                      key={d}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={checked}
                        onChange={() => toggleValue("discounts", d)}
                      />
                      <span className="text-gray-700">{d}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedPackSize(!expandedPackSize)}
            >
              <h3 className="font-medium mb-2">Pack Size</h3>
              {expandedPackSize ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
            {expandedPackSize && (
              <div className="flex flex-col gap-2 px-2">
                {lists.packSizes.map((s) => {
                  const checked = selected.packSizes.has(s);
                  return (
                    <label
                      key={s}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={checked}
                        onChange={() => toggleValue("packSizes", s)}
                      />
                      <span className="text-gray-700">{s}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mb-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedProductType(!expandedProductType)}
            >
              <h3 className="font-medium mb-2">Product Type</h3>
              {expandedProductType ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
            {expandedProductType && (
              <div className="flex flex-col gap-2 px-1">
                {lists.productTypes.map((t) => {
                  const checked = selected.productTypes.has(t);
                  return (
                    <label
                      key={t}
                      className="flex items-center gap-2 cursor-pointer select-none px-1"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={checked}
                        onChange={() => toggleValue("productTypes", t)}
                      />
                      <span className="text-gray-700">{t}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mb-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedReturnPolicy(!expandedReturnPolicy)}
            >
              <h3 className="font-medium mb-2">Return Policy</h3>
              {expandedReturnPolicy ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
            {expandedReturnPolicy && (
              <div className="flex flex-col gap-2 px-1">
                {lists.returnPolicies.map((rp) => {
                  const checked = selected.returnPolicies.has(rp);
                  return (
                    <label
                      key={rp}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={checked}
                        onChange={() => toggleValue("returnPolicies", rp)}
                      />
                      <span className="text-gray-700">{rp}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mb-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedMaterial(!expandedMaterial)}
            >
              <h3 className="font-medium mb-2">Material</h3>
              {expandedMaterial ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
            {expandedMaterial && (
              <div className="flex flex-col gap-2 px-1">
                {lists.materials.map((m) => {
                  const checked = selected.materials.has(m);
                  return (
                    <label
                      key={m}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={checked}
                        onChange={() => toggleValue("materials", m)}
                      />
                      <span className="text-gray-700">{m}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className=" gap-3 sm:grid-cols-3 max-h-[100vh] overflow-y-auto p-2">
        {label && <h2 className="mb-2 text-lg font-semibold">{label}</h2>}
        {/* <div className="flex justify-between my-2 border-b border-b-black  pb-2">
          <h6 className="border border-gray-300 rounded-md px-5 py-2 bg-orange-50  font-semibold hover:bg-orange-100 hover:shadow-md transition shadow-sm">
            Egg, Meat, and Fish
          </h6>
          <h6 className="border border-gray-300 rounded-md px-5 py-2 bg-gray-50  font-semibold hover:bg-blue-100 hover:shadow-md transition shadow-sm">
            Thiaworld
          </h6>

          <h6 className="border border-gray-300 rounded-md px-5 py-2   font-semibold hover:bg-green-100 hover:shadow-md transition shadow-sm">
            Health
          </h6>

          <h6 className="border border-gray-300 rounded-md px-5 py-2  font-semibold hover:bg-pink-100 hover:shadow-md transition shadow-sm">
            Deal Week
          </h6>

          <h6 className="border border-gray-300 rounded-md px-5 py-2  font-semibold hover:bg-yellow-100 hover:shadow-md transition shadow-sm">
            Store Pick
          </h6>
        </div> */}
        <div className="flex gap-4">
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Casual ${i + 1}`}
              className="w-full h-40 object-cover rounded-lg py-3 px-2"
            />
          ))}
        </div>
        <div className="mb-4 flex flex-wrap items-end gap-3 justify-between">
          <input
            className="w-52 rounded border px-3 py-2 text-sm"
            placeholder="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="rounded border px-3 py-2 text-sm"
            value={brandSingle}
            onChange={(e) => setBrand(e.target.value)}
          >
            <option value="">Brand</option>
          </select>
          <select
            className="rounded border px-3 py-2 text-sm"
            value={organic}
            onChange={(e) => setOrganic(e.target.value)}
          >
            <option value="">Organic</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <input
            className="w-24 rounded border px-2 py-2 text-sm"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(e) => setMin(e.target.value)}
          />
          <input
            className="w-24 rounded border px-2 py-2 text-sm"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(e) => setMax(e.target.value)}
          />
          <button
            className="rounded bg-blue-600 px-3 py-2 text-sm text-white"
            onClick={() => {
              const next = Object.fromEntries(params.entries());
              next.q = q || undefined;
              next.brand = brandSingle || undefined;
              next.organic = organic || undefined;
              next.minPrice = minPrice || undefined;
              next.maxPrice = maxPrice || undefined;
              if (brandsCSV) next.brands = brandsCSV;
              if (materialsCSV) next.materials = materialsCSV;
              if (packSizesCSV) next.packSizes = packSizesCSV;
              if (productTypesCSV) next.productTypes = productTypesCSV;
              if (returnPoliciesCSV) next.returnPolicies = returnPoliciesCSV;
              if (discountsCSV) next.discounts = discountsCSV;
              if (ratingsCSV) next.ratings = ratingsCSV;
              if (priceBandsCSV) next.priceBands = priceBandsCSV;
              if (label) next.label = label;
              if (group) next.group = group;
              if (product) next.product = product;
              const pin = getPincode();
              if (pin) next.pincode = pin;
              Object.keys(next).forEach(
                (k) => next[k] === undefined && delete next[k],
              );
              setParams(next, { replace: true });
              loadProducts();
            }}
          >
            Apply
          </button>
        </div>

        {!items.length ? (
          <div className="text-sm text-gray-500">No products.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {items.map((p) => (
              <div
                key={p._id}
                className="relative border-2 rounded-xl p-5 bg-slate-10 hover:bg-gray-50"
              >
                {/* Product Card Link */}
                <Link to={`/p/${p._id}`} className="block ">
                  <img
                    src={pickImage(p)}
                    alt="Product"
                    className="mb-2 h-32 w-full rounded object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null; // prevents infinite loop
                      e.currentTarget.src =
                        "https://image.pngaaa.com/13/1887013-middle.png";
                    }}
                  />

                  <div className="flex items-center justify-between px-1 py-2">
                    <div>
                      <div className="line-clamp-2 text-sm">{p.name}</div>
                      <div className="text-xs text-gray-500">
                        {p.brand || ""}
                      </div>
                      <div className="text-sm font-semibold">₹{p.price}</div>
                    </div>
                    <div className="me-3">
                      <BsFillHeartFill
                        size={20}
                        onClick={(e) => toggleWishlist(e, p._id)}
                        className={`text-xl cursor-pointer transition-colors duration-200 ${
                          wishlist.some(
                            (w) =>
                              w.productId === p._id ||
                              w?.product?._id === p._id,
                          )
                            ? "text-red-500"
                            : "text-gray-300"
                        }`}
                      />
                    </div>
                  </div>

                  {/* ADD / BUY Section */}
                   <div className="flex gap-2 items-center justify-center sm:justify-start py-2 flex-wrap">
                    {getQty(p._id) === 0 ? (
                      <button
                        onClick={(e) => handleAdd(e, p)}
                        className="flex flex-row items-center gap-1 border rounded-2xl p-2 px-2 text-xs text-nowrap
                        text-white bg-orange-500 shadow-sm"
                      >
                        <ImCart size={15} />
                        ADD TO CART
                      </button>
                    ) : (
                      <div className="flex items-center justify-center border bg-cyan-200 rounded-lg px-2 flex-wrap py-1">
                        <span className="text-sm font-semibold text-gray-700 mr-1">
                          Qty:
                        </span>

                        <button
                          onClick={(e) => handleDecrease(e, p)}
                          className="py-1 text-gray-600 hover:bg-gray-100 font-bold text-lg"
                        >
                          <PiMinusCircleBold />
                        </button>

                        <span className="px-2 text-gray-800 font-medium text-sm text-center">
                          {getQty(p._id)}
                        </span>

                        <button
                          onClick={(e) => handleIncrease(e, p)}
                          className="py-1 text-gray-600 hover:bg-gray-100 font-bold text-lg"
                        >
                          <PiPlusCircleBold />
                        </button>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const deliveryPincode = getPincode();
                        if (!deliveryPincode) {
                          alert(
                            "Please enter your delivery pincode before buying.",
                          );
                          return;
                        }
                        // Add to cart and navigate to cart page
                        dispatch(
                          addToCart({
                            productId: p._id,
                            variantId: null,
                            quantity: 1,
                            deliveryPincode,
                          }),
                        ).then(() => {
                          dispatch(fetchCartItems(deliveryPincode));
                          // Navigate to cart page
                          navigate("/cart");
                        });
                      }}
                      className="flex flex-row items-center gap-1 border rounded-2xl p-2 px-1 text-xs text-nowrap
                     text-white bg-green-600 shadow-sm"
                    >
                      <BsCurrencyRupee size={18} />
                      BUY NOW
                    </button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-end pt-2 gap-3">
          {/* Prev Button */}
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className={`p-1 rounded-md ${
              page === 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-700 hover:text-black"
            }`}
          >
            <TbArrowBadgeLeft size={24} />
          </button>

          {/* Page Info */}
          <div className="flex items-center  gap-1">
            <span className="text-sm font-semibold text-gray-700">
              {page} of {totalPages}
            </span>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className={`p-1 rounded-md ${
              page === totalPages
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-700 hover:text-black"
            }`}
          >
            <TbArrowBadgeRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
