import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import instance from "../../services/axiosInstance";
import { ChevronDown, ChevronUp, Star } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function SubcategoryPage() {
  const { subcategoryId } = useParams();
  const [params, setParams] = useSearchParams();

  const urlPincode = params.get("pincode") || "";
  const getPincode = () =>
    urlPincode ||
    localStorage.getItem("deliveryPincode") ||
    localStorage.getItem("bb_pincode") ||
    localStorage.getItem("user_pincode") ||
    localStorage.getItem("pincode") ||
    "";

  // products
  const [itemsRaw, setItemsRaw] = useState([]); // unfiltered from server
  const [items, setItems] = useState([]); // filtered client-side
  const [q, setQ] = useState(params.get("q") || "");
  const [brandSingle, setBrand] = useState(params.get("brand") || "");
  const [organic, setOrganic] = useState(params.get("organic") || "");
  const [minPrice, setMin] = useState(params.get("minPrice") || "");
  const [maxPrice, setMax] = useState(params.get("maxPrice") || "");

  // url CSV
  const brandsCSV = params.get("brands") || "";
  const materialsCSV = params.get("materials") || "";
  const packSizesCSV = params.get("packSizes") || "";
  const productTypesCSV = params.get("productTypes") || "";
  const returnPoliciesCSV = params.get("returnPolicies") || "";
  const discountsCSV = params.get("discounts") || "";
  const ratingsCSV = params.get("ratings") || "";
  const priceBandsCSV = params.get("priceBands") || "";

  // sidebar: categories/subcats
  const [categories, setCategories] = useState([]);
  const [subcats, setSubcats] = useState({});
  const catsLoadedRef = useRef(false);

  // other route params
  const groupId = params.get("groupId") || "";
  const group = params.get("group") || "";
  const product = params.get("product") || "";
  const label = params.get("label") || "";

  // expand states
  const [expandedBrands, setExpandedBrands] = useState(true);
  const [expandedRating, setExpandedRating] = useState(true);
  const [expandedPrice, setExpandedPrice] = useState(true);
  const [expandedDiscount, setExpandedDiscount] = useState(true);
  const [expandedPackSize, setExpandedPackSize] = useState(true);
  const [expandedProductType, setExpandedProductType] = useState(true);
  const [expandedReturnPolicy, setExpandedReturnPolicy] = useState(true);
  const [expandedMaterial, setExpandedMaterial] = useState(true);

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

  // helpers
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
        `₹${start.toLocaleString("en-IN")} – ₹${end.toLocaleString("en-IN")}`
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

  // derive numeric and csv filters
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

      // priority: explicit inputs > derived from bands
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

  // network
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
          err?.response?.data || err.message
        );
        setItemsRaw([]);
      });
  }

  function loadFacets() {
    const query = buildQuery();
    console.log("[REQ] /products/facets", query);
    instance
      .get("/products/facets", { params: query })
      .then(({ data }) => {
        const f = data?.facets || data || {};
        console.log("[RES] /products/facets", f);
        setFacets({
          brands: f.brands || f.brand || null,
          materials: f.materials || f.material || null,
          packSizes: f.packSizes || f.packSize || null,
          productTypes: f.productTypes || f.productType || null,
          returnPolicies: f.returnPolicies || f.returnPolicy || null,
          discounts: f.discounts || f.discount || null,
          ratings: f.ratings || f.rating || null,
          priceBands: f.priceBands || f.price || null,
          categories: f.categories || null,
        });
      })
      .catch((err) => {
        console.error(
          "[ERR] /products/facets",
          err?.response?.status,
          err?.response?.data || err.message
        );
        setFacets(null);
      });
  }

  function loadCategoriesOnce() {
    if (catsLoadedRef.current) return;
    catsLoadedRef.current = true;
    const pin = getPincode();
    console.log("[REQ] /products/categories", { pincode: pin });
    instance
      .get("/products/categories", { params: { pincode: pin } })
      .then(({ data }) => {
        const arr = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : [];
        console.log("[RES] /products/categories", arr.length);
        setCategories(arr);
        const firstId = arr?.[0]?._id || arr?.[0]?.id || arr?.[0]?.category_id;
        if (firstId) loadSubcats(firstId);
      })
      .catch((err) => {
        console.error(
          "[ERR] /products/categories",
          err?.response?.status,
          err?.response?.data || err.message
        );
        setCategories([]);
      });
  }

  const loadSubcats = async (catId) => {
    const pin = getPincode();
    console.log("[REQ] /products/categories/:id/subcategories", {
      catId,
      pincode: pin,
    });
    try {
      const { data } = await instance.get(
        `/products/categories/${catId}/subcategories`,
        { params: { pincode: pin } }
      );
      const arr = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
        ? data
        : [];
      console.log("[RES] subcategories", catId, arr.length);
      setSubcats((prev) => ({ ...prev, [catId]: arr }));
    } catch (err) {
      console.error(
        "[ERR] subcategories",
        catId,
        err?.response?.status,
        err?.response?.data || err.message
      );
      setSubcats((prev) => ({ ...prev, [catId]: [] }));
    }
  };

  // compute filtered items locally (fallback if server doesn't filter)
  const applyClientFilters = (list) => {
    const pin = getPincode(); // not used in filtering, but keep for clarity
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

  // effects
  useEffect(() => {
    loadCategoriesOnce();
  }, []);
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

  // when raw items or any filter changes, re-apply client filters
  useEffect(() => {
    const filtered = applyClientFilters(itemsRaw);
    console.log(
      "[CLIENT FILTER] in:",
      itemsRaw.length,
      "out:",
      filtered.length
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

  return (
    <div className="flex">
      <aside className="w-64 bg-white border-r border-gray-200 p-4 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Shop by Category</h2>
          {!categories.length && (
            <div className="text-sm text-gray-500">No categories.</div>
          )}
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

      <div className="mx-auto max-w-6xl p-4">
        {label && <h2 className="mb-2 text-lg font-semibold">{label}</h2>}

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
                (k) => next[k] === undefined && delete next[k]
              );
              setParams(next, { replace: true });
              loadProducts(); // also re-pull from server
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
                  src={(() => {
                    const firstSingle =
                      (Array.isArray(p.product_img)
                        ? p.product_img[0]
                        : p.product_img) || "";
                    const firstGallery = Array.isArray(p.gallery_imgs)
                      ? p.gallery_imgs[0]
                      : p.gallery_imgs || "";
                    const raw = firstSingle || firstGallery || "";
                    if (!raw) return "";
                    if (raw.startsWith("/uploads/")) return `${API_BASE}${raw}`;
                    return raw;
                  })()}
                  alt=""
                  className="mb-2 h-32 w-full rounded object-cover"
                />
                <div className="line-clamp-2 text-sm">{p.name}</div>
                <div className="text-xs text-gray-500">{p.brand || ""}</div>
                <div className="text-sm font-semibold">
                  ₹{p.price}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
