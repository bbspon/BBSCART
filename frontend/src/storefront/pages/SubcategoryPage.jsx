import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import instance from "../../services/axiosInstance";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

import { ChevronDown, ChevronUp, Star } from "lucide-react";

export default function SubcategoryPage() {
  const { subcategoryId } = useParams();
  const [params, setParams] = useSearchParams();

  // existing state
  const [items, setItems] = useState([]);
  const [q, setQ] = useState(params.get("q") || "");
  const [brandSingle, setBrand] = useState(params.get("brand") || "");
  const [organic, setOrganic] = useState(params.get("organic") || "");
  const [minPrice, setMin] = useState(params.get("minPrice") || "");
  const [maxPrice, setMax] = useState(params.get("maxPrice") || "");

  // new: multi-select filters from URL as CSV
  const brandsCSV = params.get("brands") || "";
  const materialsCSV = params.get("materials") || "";
  const packSizesCSV = params.get("packSizes") || "";
  const productTypesCSV = params.get("productTypes") || "";
  const returnPoliciesCSV = params.get("returnPolicies") || "";
  const discountsCSV = params.get("discounts") || "";
  const ratingsCSV = params.get("ratings") || "";
  const priceBandsCSV = params.get("priceBands") || "";

  // existing route params
  const groupId = params.get("groupId") || "";
  const group = params.get("group") || "";
  const product = params.get("product") || "";
  const label = params.get("label") || "";

  // UI expand/collapse
  const [showMoreCats, setShowMoreCats] = useState(false);
  const [expandedBrands, setExpandedBrands] = useState(true);
  const [expandedRating, setExpandedRating] = useState(true);
  const [expandedPrice, setExpandedPrice] = useState(true);
  const [expandedDiscount, setExpandedDiscount] = useState(true);
  const [expandedPackSize, setExpandedPackSize] = useState(true);
  const [expandedProductType, setExpandedProductType] = useState(true);
  const [expandedReturnPolicy, setExpandedReturnPolicy] = useState(true);
  const [expandedMaterial, setExpandedMaterial] = useState(true);
  const [categories, setCategories] = useState([]);
  const catsLoadedRef = useRef(false);

  useEffect(() => {
    if (catsLoadedRef.current) return; // stop 2nd run
    catsLoadedRef.current = true;

    const controller = new AbortController();
    (async () => {
      try {
        const pincode = getPincode(); // always send something
        const { data } = await instance.get("/products/categories", {
          params: { pincode },
          signal: controller.signal,
        });
        const arr = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : [];
        setCategories(arr);
      } catch (e) {
        if (e.name !== "CanceledError") setCategories([]);
      }
    })();

    return () => controller.abort();
  }, []); // ← empty deps so it won’t rerun
  const urlPincode = params.get("pincode") || "";
  const getPincode = () =>
    urlPincode ||
    localStorage.getItem("deliveryPincode") ||
    localStorage.getItem("bb_pincode") ||
    localStorage.getItem("user_pincode") ||
    localStorage.getItem("pincode") ||
    "";

  useEffect(() => {
    const loadCats = async () => {
      try {
        const pincode = getPincode();
        const { data } = await instance.get("/products/categories", {
          params: { pincode },
        });
        const arr = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : [];
        setCategories(arr);
      } catch {
        setCategories([]);
      }
    };
    loadCats();
    // also re-run if pincode changes in URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlPincode]);

const [subcats, setSubcats] = useState({});

const loadSubcats = async (catId) => {
  try {
    const pincode = getPincode();
    const { data } = await instance.get(
      `/products/categories/${catId}/subcategories`,
      {
        params: { pincode },
      }
    );
    const arr = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data)
      ? data
      : [];
    setSubcats((prev) => ({ ...prev, [catId]: arr }));
  } catch {
    setSubcats((prev) => ({ ...prev, [catId]: [] }));
  }
};


  // safe static fallbacks (kept from your file)
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
    categories: [
      "Speakers & Microphones",
      "Electronics",
      "Accessories",
      "Wearables",
      "Home Audio",
      "Gaming",
    ],
    brands: ["Agar", "Amazon", "Ambrane", "Amkette", "Apple", "Boat"],
    ratings: [5, 4, 3, 2, 1],
  };

  // facets from backend
  const [facets, setFacets] = useState(null);
  // Normalize facet payloads to string arrays safely
  function toStringArray(input, labelKey = "label") {
    if (!input) return [];
    if (Array.isArray(input)) {
      // strings -> keep; objects -> pick labelKey | value | name | key
      return input
        .map((x) => {
          if (x == null) return null;
          if (typeof x === "string") return x;
          if (typeof x === "number") return String(x);
          return x[labelKey] ?? x.value ?? x.name ?? x.key ?? null;
        })
        .filter(Boolean);
    }
    if (typeof input === "object") {
      // object map -> use keys
      return Object.keys(input);
    }
    // single primitive
    return [String(input)];
  }

  // image helper (kept)
  function pickImage(p) {
    const firstSingle =
      (Array.isArray(p.product_img) ? p.product_img[0] : p.product_img) || "";
    const firstGallery = Array.isArray(p.gallery_imgs)
      ? p.gallery_imgs[0]
      : p.gallery_imgs || "";
    const raw = firstSingle || firstGallery || "";
    if (!raw) return "";
    if (raw.startsWith("/uploads/")) return `${API_BASE}${raw}`;
    return raw;
  }

  // pincode detection (kept)
  const [pincode, setPincode] = useState(
    localStorage.getItem("deliveryPincode") ||
      localStorage.getItem("bb_pincode") ||
      localStorage.getItem("user_pincode") ||
      localStorage.getItem("pincode") ||
      ""
  );

  // helpers for CSV <-> array
  const csvToSet = (csv) =>
    new Set(
      csv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
  const setToCSV = (set) => Array.from(set).join(",");

  const selected = {
    brands: useMemo(() => csvToSet(brandsCSV), [brandsCSV]),
    materials: useMemo(() => csvToSet(materialsCSV), [materialsCSV]),
    packSizes: useMemo(() => csvToSet(packSizesCSV), [packSizesCSV]),
    productTypes: useMemo(() => csvToSet(productTypesCSV), [productTypesCSV]),
    returnPolicies: useMemo(
      () => csvToSet(returnPoliciesCSV),
      [returnPoliciesCSV]
    ),
    discounts: useMemo(() => csvToSet(discountsCSV), [discountsCSV]),
    ratings: useMemo(() => csvToSet(ratingsCSV), [ratingsCSV]),
    priceBands: useMemo(() => csvToSet(priceBandsCSV), [priceBandsCSV]),
  };

  // toggler that updates URL params and triggers reload
  const toggleValue = (key, value) => {
    const copy = new Set(selected[key]);
    if (copy.has(value)) copy.delete(value);
    else copy.add(value);

    const next = Object.fromEntries(params.entries());
    if (copy.size) next[key] = setToCSV(copy);
    else delete next[key];

    // keep existing top selectors
    if (label) next.label = label;
    if (group) next.group = group;
    if (product) next.product = product;
    if (q) next.q = q;
    if (brandSingle) next.brand = brandSingle;
    if (organic) next.organic = organic;
    if (minPrice) next.minPrice = minPrice;
    if (maxPrice) next.maxPrice = maxPrice;
    if (pincode) next.pincode = pincode;

    setParams(next, { replace: true });
  };

  // build base query used by both products and facets
  const buildBaseQuery = () => {
    const query = {
      subcategoryId,
      groupId: groupId || undefined,
      product: groupId ? undefined : product || undefined,
      group: groupId || product ? undefined : group || undefined,
      q: groupId || product || group ? undefined : q || undefined,
      brand: brandSingle || undefined, // single select kept
      organic: organic !== "" ? organic : undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      // multi-selects
      brands: brandsCSV || undefined,
      materials: materialsCSV || undefined,
      packSizes: packSizesCSV || undefined,
      productTypes: productTypesCSV || undefined,
      returnPolicies: returnPoliciesCSV || undefined,
      discounts: discountsCSV || undefined,
      ratings: ratingsCSV || undefined,
      priceBands: priceBandsCSV || undefined,
      limit: 24,
      t: Date.now(),
    };
    if (pincode && String(pincode).trim().length >= 3) {
      query.pincode = pincode;
    }
    return query;
  };

  // fetch products
  function loadProducts() {
    const query = buildBaseQuery();
    instance
      .get("/products/public", { params: query })
      .then(({ data }) => {
        setItems(data.products || data.items || []);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setItems([]);
      });
  }

  // fetch facets
  function loadFacets() {
    const query = buildBaseQuery();
    instance
      .get("/products/facets", { params: query })
      .then(({ data }) => {
        // accept common shapes: {facets:{...}} or direct {...}
        const f = data?.facets || data || {};
        setFacets({
          brands: f.brands || f.brand || null,
          materials: f.materials || f.material || null,
          packSizes: f.packSizes || f.packSize || null,
          productTypes: f.productTypes || f.productType || null,
          returnPolicies: f.returnPolicies || f.returnPolicy || null,
          discounts: f.discounts || f.discount || null,
          ratings: f.ratings || f.rating || null,
          priceBands: f.priceBands || f.price || null, // can be labels
          categories: f.categories || null,
        });
      })
      .catch(() => {
        setFacets(null); // fall back silently
      });
  }

  // effects
  useEffect(() => {
    loadProducts();
    loadFacets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    pincode,
  ]);

  // resolved lists to render (facets or fallback) — always arrays
  const lists = {
    categories: toStringArray(facets?.categories) || fallback.categories,
    ratings: toStringArray(facets?.ratings) || fallback.ratings, // if backend sends [5,4,3...] it stays fine
    brands: toStringArray(facets?.brands) || fallback.brands,
    priceBands: toStringArray(facets?.priceBands) || fallback.priceBands, // <-- was crashing
    discounts: toStringArray(facets?.discounts) || fallback.discounts,
    packSizes: toStringArray(facets?.packSizes) || fallback.packSizes,
    productTypes: toStringArray(facets?.productTypes) || fallback.productTypes,
    returnPolicies:
      toStringArray(facets?.returnPolicies) || fallback.returnPolicies,
    materials: toStringArray(facets?.materials) || fallback.materials,
  };
  function toArrayWithCounts(input, labelKey = "label", countKey = "count") {
    const labels = toStringArray(input, labelKey);
    const counts =
      Array.isArray(input) && typeof input[0] === "object"
        ? Object.fromEntries(
            input
              .map((x) => {
                const k = x[labelKey] ?? x.value ?? x.name ?? x.key ?? null;
                const c = x[countKey] ?? x.count ?? x.qty ?? x.total ?? null;
                return k ? [k, c ?? null] : null;
              })
              .filter(Boolean)
          )
        : typeof input === "object" && input
        ? input // already a map
        : {};
    return [labels, counts];
  }

  // Example usage for price:
  const [priceBandLabels, priceBandCounts] = toArrayWithCounts(
    facets?.priceBands
  );

  useEffect(() => {
    console.log("cats:", categories, "subcats:", subcats);
  }, [categories, subcats]);

  // UI
  return (
    <>
      <div className="flex ">
        <aside className="w-64 bg-white border-r border-gray-200 p-4 space-y-6">
          {/* Shop by Category (static sample or facet if provided) */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Shop by Category</h2>
            <ul className="space-y-2 text-gray-700">
              {categories.map((cat) => {
                const catId = cat._id || cat.id || cat.category_id;
                const catName =
                  cat.name || cat.category_name || cat.title || "Category";
                return (
                  <li key={catId}>
                    <button
                      onClick={() => loadSubcats(catId)}
                      className="w-full text-left font-medium hover:text-green-600"
                    >
                      {catName}
                    </button>

                    {Array.isArray(subcats[catId]) &&
                      subcats[catId].length > 0 && (
                        <ul className="ml-3 mt-1 space-y-1 text-sm">
                          {subcats[catId].map((s) => {
                            const subId = s._id || s.id || s.subcategory_id;
                            const subName =
                              s.name ||
                              s.subcategory_name ||
                              s.title ||
                              "Subcategory";
                            return (
                              <li key={subId}>
                                <Link
                                  to={`/subcategory/${subId}`}
                                  className="hover:underline"
                                >
                                  {subName}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Refined By */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Refined by</h2>

            {/* Product Rating */}
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
                  {(lists.ratings || []).map((r) => {
                    const key = String(r);
                    const checked = selected.ratings.has(key);
                    return (
                      <label
                        key={key}
                        className="flex items-center gap-2 cursor-pointer select-none px-3"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-yellow-400"
                          checked={checked}
                          onChange={() => toggleValue("ratings", key)}
                        />
                        <span className="flex items-center text-gray-700">
                          {Array.from({ length: r }).map((_, i) => (
                            <Star
                              key={`f-${i}`}
                              className="w-4 h-4 text-yellow-400 fill-yellow-400"
                            />
                          ))}
                          {Array.from({ length: 5 - r }).map((_, i) => (
                            <Star
                              key={`e-${i}`}
                              className="w-4 h-4 text-gray-300 fill-gray-300"
                            />
                          ))}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Brands */}
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
                    className="mt-2 mb-2 w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-green-400"
                    onChange={(e) => {
                      // optional: client-side filter of shown brands
                      // kept simple: no-op to preserve your UI
                    }}
                  />
                  <div className="divide-y divide-gray-100">
                    {(lists.brands || []).map((b) => {
                      const checked = selected.brands.has(b);
                      return (
                        <label
                          key={b}
                          className="flex items-center gap-2 px-1 py-1 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-green-600"
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

            {/* Price */}
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
                  {(lists.priceBands || []).map((label) => {
                    const checked = selected.priceBands.has(label);
                    return (
                      <label
                        key={label}
                        className="flex items-center gap-2 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-green-600"
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

            {/* Discount */}
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
                  {(lists.discounts || []).map((d) => {
                    const checked = selected.discounts.has(d);
                    return (
                      <label
                        key={d}
                        className="flex items-center gap-2 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-green-600"
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

            {/* Pack Size */}
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
                  {(lists.packSizes || []).map((s) => {
                    const checked = selected.packSizes.has(s);
                    return (
                      <label
                        key={s}
                        className="flex items-center gap-2 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-green-600"
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

            {/* Product Type */}
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
                  {(lists.productTypes || []).map((t) => {
                    const checked = selected.productTypes.has(t);
                    return (
                      <label
                        key={t}
                        className="flex items-center gap-2 cursor-pointer select-none px-1"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-green-600"
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

            {/* Return Policy */}
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
                  {(lists.returnPolicies || []).map((rp) => {
                    const checked = selected.returnPolicies.has(rp);
                    return (
                      <label
                        key={rp}
                        className="flex items-center gap-2 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-green-600"
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

            {/* Material */}
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
                  {(lists.materials || []).map((m) => {
                    const checked = selected.materials.has(m);
                    return (
                      <label
                        key={m}
                        className="flex items-center gap-2 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-green-600"
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

        <div className="mx-auto max-w-6xl p-4">
          {label && <h2 className="mb-2 text-lg font-semibold">{label}</h2>}

          {/* top controls kept */}
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
                // keep existing singles
                next.q = q || undefined;
                next.brand = brandSingle || undefined;
                next.organic = organic || undefined;
                next.minPrice = minPrice || undefined;
                next.maxPrice = maxPrice || undefined;
                // keep multi-selects as-is
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
                if (pincode) next.pincode = pincode;
                // remove undefined
                Object.keys(next).forEach(
                  (k) => next[k] === undefined && delete next[k]
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
                <Link
                  key={p._id}
                  to={`/p/${p._id}`}
                  className="rounded border p-3 hover:bg-gray-50"
                >
                  <img
                    src={pickImage(p)}
                    alt=""
                    className="mb-2 h-32 w-full rounded object-cover"
                  />
                  <div className="line-clamp-2 text-sm">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.brand || ""}</div>
                  <div className="text-sm font-semibold">₹{p.price}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
