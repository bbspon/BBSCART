// Fruits.jsx — Fruits-only listing filtered by category from DB (no hardcoded ids)
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const sampleFruits = [];

// API endpoints (generic products APIs)
const API_BASE = import.meta.env.VITE_API_URL || "";
const API_LIST = `${API_BASE}/api/products/public`; // GET products
const API_FACETS = `${API_BASE}/api/products/facets`; // GET facets (price range, etc.)
const API_CATEGORIES = `${API_BASE}/api/products/catalog/categories`;
const API_CATEGORY_BY_SLUG = `${API_BASE}/api/products/catalog/category-by-slug`;

const FRUITS_SLUG = "fruits";

const inr = (n) => new Intl.NumberFormat("en-IN").format(n);

// map server product -> card fields used by this page
function mapProduct(p) {
  const sale = p?.priceInfo?.sale ?? p?.price ?? 0;
  const mrp = p?.priceInfo?.mrp ?? p?.price ?? 0;
  const discountPct =
    mrp > 0 ? Math.max(0, Math.round(100 - (sale / mrp) * 100)) : 0;

  return {
    id: p?._id || p.id,
    name: p?.name,
    brand: p?.brand || "",
    image: p?.product_img || p?.gallery_imgs?.[0] || "/img/placeholder.png",
    rating: p?.rating_avg || 0,
    reviewsText: `${p?.rating_count || 0} Ratings`,
    gstInvoice: !!p?.gstInvoice,
    deliveryIn1Day: !!p?.deliveryIn1Day,
    bestseller: !!p?.bestseller,
    specs: Array.isArray(p?.specs) ? p.specs : [],

    // this page expects *per kg* fields; use sale/mrp as-is (rename only)
    pricePerKg: sale,
    oldPricePerKg: mrp,
    discountText: discountPct ? `${discountPct}% off` : "",
  };
}

export default function FruitsDetails({ products = sampleFruits }) {
  // dynamic Fruits category id
  const [categoryId, setCategoryId] = useState("");
  const [catErr, setCatErr] = useState("");

  // live items from API
  const [apiItems, setApiItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Use live items if present, else fallback to prop/static
  const data = useMemo(
    () => (apiItems && apiItems.length ? apiItems : products),
    [apiItems, products]
  );

  // filters/UI state (kept intact)
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(30000);
  const [rangeMin, setRangeMin] = useState(0);
  const [rangeMax, setRangeMax] = useState(30000);

  const [selectedBrands, setSelectedBrands] = useState(new Set());
  const [minRating, setMinRating] = useState(0);
  const [selectedRatings, setSelectedRatings] = useState(new Set());
  const [gstInvoiceOnly, setGstInvoiceOnly] = useState(false);
  const [delivery1DayOnly, setDelivery1DayOnly] = useState(false);
  const [view, setView] = useState("grid");
  const [sortBy, setSortBy] = useState("popularity");
  const [compareIds, setCompareIds] = useState(new Set());

  const allBrands = useMemo(
    () => Array.from(new Set(data.map((p) => p.brand).filter(Boolean))),
    [data]
  );

  function toggleSetItem(setState, value) {
    setState((prev) => {
      const copy = new Set(prev);
      copy.has(value) ? copy.delete(value) : copy.add(value);
      return copy;
    });
  }

  function resetFilters() {
    setSearch("");
    setMinPrice(rangeMin);
    setMaxPrice(rangeMax);
    setSelectedBrands(new Set());
    setMinRating(0);
    setSelectedRatings(new Set());
    setGstInvoiceOnly(false);
    setDelivery1DayOnly(false);
  }

  // 1) Load Fruits category id dynamically (no hardcoded id). Try by-slug, fallback to list.
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const cached = sessionStorage.getItem("catId:fruits");
        if (cached) {
          if (live) setCategoryId(cached);
          return;
        }
        // preferred: by-slug
        try {
          const { data } = await axios.get(API_CATEGORY_BY_SLUG, {
            params: { slug: FRUITS_SLUG },
          });
          const id = data?.item?._id;
          if (id) {
            sessionStorage.setItem("catId:fruits", id);
            if (live) setCategoryId(id);
            return;
          }
        } catch {
          // ignore and fallback
        }
        // fallback: get all categories and find by slug/name
        const { data } = await axios.get(API_CATEGORIES);
        const arr = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : [];
        const found =
          arr.find((c) => (c.slug || "").toLowerCase() === FRUITS_SLUG) ||
          arr.find((c) => (c.name || "").toLowerCase().includes("fruit"));
        if (!found?._id)
          throw new Error("Could not find 'Fruits' category in DB");
        sessionStorage.setItem("catId:fruits", found._id);
        if (live) setCategoryId(found._id);
      } catch (e) {
        if (live)
          setCatErr(
            e?.response?.data?.message || e.message || "Failed to load category"
          );
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  // 2) Fetch facets (price range) once we have the category
  useEffect(() => {
    if (!categoryId) return;
    let live = true;
    (async () => {
      try {
        const { data } = await axios.get(API_FACETS, {
          params: { categoryId },
        });
        const min = Math.max(0, Math.floor(data?.price?.min ?? 0));
        const max = Math.ceil(data?.price?.max ?? 30000);
        if (!live) return;
        setRangeMin(min);
        setRangeMax(max);
        setMinPrice(min);
        setMaxPrice(max);
      } catch {
        // ignore; stay with defaults
      }
    })();
    return () => {
      live = false;
    };
  }, [categoryId]);

  // 3) Fetch fruits from products API whenever filters/sort change
  useEffect(() => {
    if (!categoryId) return; // wait for category id
    const controller = new AbortController();
    setLoading(true);
    setErr("");

    const params = {
      categoryId, // key: server filters to Fruits only
      search: search || undefined,
      minPrice: Number(minPrice),
      maxPrice: Number(maxPrice),
      rating_gte: selectedRatings.size
        ? Math.max(...Array.from(selectedRatings))
        : minRating || undefined,
      gstInvoice: gstInvoiceOnly || undefined,
      deliveryIn1Day: delivery1DayOnly || undefined,
      sort:
        sortBy === "price-asc"
          ? "price-asc"
          : sortBy === "price-desc"
          ? "price-desc"
          : sortBy === "newest"
          ? "newest"
          : "popularity",
      page: 1,
      limit: 100,
    };

    (async () => {
      try {
        const { data } = await axios.get(API_LIST, {
          params,
          signal: controller.signal,
        });
        const items = Array.isArray(data?.items)
          ? data.items.map(mapProduct)
          : [];
        setApiItems(items);
      } catch (e) {
        if (e.name !== "CanceledError") {
          setErr(
            e?.response?.data?.message || e?.message || "Failed to load fruits"
          );
          setApiItems([]); // fall back to `products` prop if provided
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [
    categoryId,
    search,
    minPrice,
    maxPrice,
    selectedRatings,
    minRating,
    gstInvoiceOnly,
    delivery1DayOnly,
    sortBy,
  ]);

  // local filtering/sorting (kept intact)
  const filtered = useMemo(() => {
    return data
      .filter((p) => {
        if (
          search.trim() &&
          !`${p.name || ""}`.toLowerCase().includes(search.trim().toLowerCase())
        )
          return false;
        if (selectedBrands.size > 0 && !selectedBrands.has(p.brand))
          return false;
        if ((p.pricePerKg ?? 0) < minPrice || (p.pricePerKg ?? 0) > maxPrice)
          return false;

        if (selectedRatings.size > 0) {
          const matches = Array.from(selectedRatings).some(
            (threshold) => (p.rating || 0) >= threshold
          );
          if (!matches) return false;
        } else if ((p.rating || 0) < minRating) return false;

        if (gstInvoiceOnly && !p.gstInvoice) return false;
        if (delivery1DayOnly && !p.deliveryIn1Day) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "popularity") return (b.rating || 0) - (a.rating || 0);
        if (sortBy === "price-asc")
          return (a.pricePerKg || 0) - (b.pricePerKg || 0);
        if (sortBy === "price-desc")
          return (b.pricePerKg || 0) - (a.pricePerKg || 0);
        if (sortBy === "newest")
          return (
            new Date(b.addedAt || 0).getTime() -
            new Date(a.addedAt || 0).getTime()
          );
        return 0;
      });
  }, [
    data,
    search,
    selectedBrands,
    minPrice,
    maxPrice,
    minRating,
    gstInvoiceOnly,
    delivery1DayOnly,
    sortBy,
    selectedRatings,
  ]);

  const toggleCompare = (id) =>
    setCompareIds((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });

  return (
    <div className="flex gap-6 p-6">
      {/* Sidebar */}
      <aside className="w-72 border rounded bg-white p-4 sticky top-4 self-start h-fit">
        <h3 className="text-lg font-semibold mb-3">Filters</h3>

        {/* Search */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Search</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search fruits..."
            className="w-full border rounded px-2 py-1 text-sm"
          />
        </div>

        {/* Price */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Price (₹)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={minPrice}
              min={rangeMin}
              max={maxPrice}
              onChange={(e) => setMinPrice(Number(e.target.value || rangeMin))}
              className="w-1/2 border rounded px-2 py-1 text-sm"
            />
            <input
              type="number"
              value={maxPrice}
              min={minPrice}
              max={rangeMax}
              onChange={(e) => setMaxPrice(Number(e.target.value || rangeMax))}
              className="w-1/2 border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>

        {/* Ratings */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-3">
            Customer Ratings
          </label>
          <div className="flex flex-col gap-2 text-sm">
            {[5, 4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedRatings.has(rating)}
                  onChange={() => toggleSetItem(setSelectedRatings, rating)}
                  className="cursor-pointer w-3 h-4 mx-3"
                />
                <span>{"★".repeat(rating)} &amp; above</span>
              </label>
            ))}
          </div>
        </div>

        {/* Delivery */}
        <div className="mb-4 text-sm space-y-2 mx-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={delivery1DayOnly}
              onChange={() => setDelivery1DayOnly((s) => !s)}
              className="w-3 h-4"
            />
            Delivery in 1 day
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={gstInvoiceOnly}
              onChange={() => setGstInvoiceOnly((s) => !s)}
              className="w-3 h-4"
            />
            GST Invoice
          </label>
        </div>

        <div className="flex gap-2">
          <button
            onClick={resetFilters}
            className="flex-1 border rounded py-1 text-sm"
          >
            Clear
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Fruits</h1>
          <div className="text-sm text-gray-600">
            {!categoryId && !catErr && "Loading category…"}
            {catErr && <span className="text-red-600">{catErr}</span>}
            {categoryId &&
              (loading ? " Loading…" : ` Showing ${filtered.length} products`)}
            {err && <span className="text-red-600 ml-2">({err})</span>}
          </div>
        </div>

        <div className="space-y-4">
          {filtered.map((p) => (
            <article
              key={p.id}
              className="flex border rounded-lg p-4 hover:shadow-md transition bg-white"
            >
              <div className="w-36 h-36 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex-1 ml-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-medium text-gray-800">{p.name}</h2>
                    <div className="text-xs text-gray-500 mt-1">
                      {p.reviewsText}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold">
                      ₹{inr(p.pricePerKg)}
                    </div>
                    <div className="text-xs line-through text-gray-400">
                      ₹{inr(p.oldPricePerKg)}
                    </div>
                    <div className="text-green-600 text-sm">
                      {p.discountText}
                    </div>
                  </div>
                </div>

                <ul className="list-disc list-inside text-sm text-gray-700 mt-3">
                  {(p.specs || []).slice(0, 4).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>

                <div className="flex items-center gap-3 mt-3 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={compareIds.has(p.id)}
                      onChange={() =>
                        setCompareIds((prev) => {
                          const copy = new Set(prev);
                          copy.has(p.id) ? copy.delete(p.id) : copy.add(p.id);
                          return copy;
                        })
                      }
                    />
                    <span>Add to Compare</span>
                  </label>
                  {p.bestseller && (
                    <span className="px-2 py-0.5 bg-yellow-100 text-xs rounded">
                      Bestseller
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
