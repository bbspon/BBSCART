import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaStar,
  FaShoppingCart,
  FaTruck,
  FaCertificate,
  FaMinus,
  FaPlus,
} from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_URL || "";
const API_LIST = `${API_BASE}/api/products/public`;
const API_FACETS = `${API_BASE}/api/products/facets`;
const API_CATEGORIES = `${API_BASE}/api/products/catalog/categories`;
const API_CATEGORY_BY_SLUG = `${API_BASE}/api/products/catalog/category-by-slug`;

const GROCERIES_SLUG = "groceries";

const fCurrency = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

function StarRating({ rating, size = 12 }) {
  const r = Math.max(0, Math.min(5, Number(rating || 0)));
  const full = Math.floor(r);
  const half = r - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <FaStar
          key={`f${i}`}
          className="text-yellow-500"
          style={{ width: size, height: size }}
        />
      ))}
      {half && (
        <FaStar
          className="text-yellow-300"
          style={{ width: size, height: size, opacity: 0.6 }}
        />
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <FaStar
          key={`e${i}`}
          className="text-gray-300"
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  );
}

export default function Grocery() {
  // category context (loaded dynamically)
  const [categoryId, setCategoryId] = useState("");
  const [catErr, setCatErr] = useState("");

  // filters/ui
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(1000);

  const [brandFilters, setBrandFilters] = useState([]);
  const [ratingFilters, setRatingFilters] = useState([]);
  const [offerFilters, setOfferFilters] = useState([]);
  const [formFilters, setFormFilters] = useState([]);
  const [onlyFreeDelivery, setOnlyFreeDelivery] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(false);

  // cart
  const [cart, setCart] = useState([]);

  // pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  // data
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // facets
  const [brands, setBrands] = useState([]);
  const [forms, setForms] = useState([]);
  const [offers, setOffers] = useState([]);
  const [dataMin, setDataMin] = useState(0);
  const [dataMax, setDataMax] = useState(1000);

  // 1) Get Groceries category id dynamically (no hardcode)
  useEffect(() => {
    let live = true;

    async function loadGroceriesId() {
      try {
        // cache helps when navigating back to this page
        const cached = sessionStorage.getItem("catId:groceries");
        if (cached) {
          if (live) setCategoryId(cached);
          return;
        }

       const { data } = await axios.get(API_CATEGORY_BY_SLUG, {
         params: { slug: GROCERIES_SLUG },
       });
       const id = data?.item?._id;
       if (!id) throw new Error("Could not find 'Groceries' category in DB");
       sessionStorage.setItem("catId:groceries", id);
       if (live) setCategoryId(id);

      } catch (e) {
        if (live)
          setCatErr(
            e?.response?.data?.message || e.message || "Failed to load category"
          );
      }
    }

    loadGroceriesId();
    return () => {
      live = false;
    };
  }, []);

  // load cart
  useEffect(() => {
    try {
      const saved = localStorage.getItem("grocery_cart_v2");
      if (saved) setCart(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem("grocery_cart_v2", JSON.stringify(cart));
  }, [cart]);

  // facets for Groceries only
  useEffect(() => {
    if (!categoryId) return;
    let live = true;
    (async () => {
      try {
        const { data } = await axios.get(API_FACETS, {
          params: { categoryId },
        });
        const b = (data?.brands || []).map((x) => x.name).filter(Boolean);
        const f = (data?.forms || []).map((x) => x.name).filter(Boolean);
        const o = (data?.offers || []).map((x) => x.name).filter(Boolean);
        const p = data?.price || {};
        if (!live) return;
        setBrands(b);
        setForms(f);
        setOffers(o);
        const min = Number.isFinite(p.min) ? p.min : 0;
        const max = Number.isFinite(p.max) ? p.max : 1000;
        setDataMin(min);
        setDataMax(max);
        setPriceMin(min);
        setPriceMax(max);
      } catch {
        // ignore
      }
    })();
    return () => {
      live = false;
    };
  }, [categoryId]);

  // products list (Groceries only)
  useEffect(() => {
    if (!categoryId) return;
    const controller = new AbortController();
    setLoading(true);
    setErr("");

    const params = {
      categoryId, // dynamic from DB
      search: search || undefined,
      minPrice: Number(priceMin),
      maxPrice: Number(priceMax),
      brands: brandFilters.length ? brandFilters.join(",") : undefined,
      rating_gte: ratingFilters.length ? Math.max(...ratingFilters) : undefined,
      offers: offerFilters.length ? offerFilters.join(",") : undefined,
      forms: formFilters.length ? formFilters.join(",") : undefined,
      freeDelivery: onlyFreeDelivery || undefined,
      inStock: onlyInStock || undefined,
      sort:
        sortBy === "priceLow"
          ? "price-asc"
          : sortBy === "priceHigh"
          ? "price-desc"
          : sortBy === "newest"
          ? "newest"
          : "popularity",
      page,
      limit: PAGE_SIZE,
    };

    (async () => {
      try {
        const { data } = await axios.get(API_LIST, {
          params,
          signal: controller.signal,
        });
        const mapped = (Array.isArray(data?.items) ? data.items : []).map(
          (p) => {
            const sale = p?.priceInfo?.sale ?? p?.price ?? 0;
            const mrp = p?.priceInfo?.mrp ?? p?.price ?? 0;
            const discountPct =
              mrp > 0 ? Math.max(0, Math.round(100 - (sale / mrp) * 100)) : 0;
            return {
              id: p?._id || p.id,
              name: p?.name,
              brand: p?.brand || "",
              weight: p?.weight || "",
              image:
                p?.product_img ||
                p?.gallery_imgs?.[0] ||
                "/img/placeholder.png",
              rating: p?.rating_avg || 0,
              reviews: p?.rating_count || 0,
              assured: !!p?.assured,
              freeDelivery: !!p?.deliveryIn1Day,
              inStock: Number(p?.stock || 0) > 0,
              offers: p?.ui?.offers || [],
              price: sale,
              oldPrice: mrp,
              discountPct,
              createdAt: p?.created_at,
            };
          }
        );

        setItems(mapped);
        setTotal(Number(data?.total) || mapped.length);
      } catch (e) {
        if (e.name !== "CanceledError") {
          setErr(
            e?.response?.data?.message || e?.message || "Failed to load items"
          );
          setItems([]);
          setTotal(0);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [
    categoryId,
    search,
    priceMin,
    priceMax,
    brandFilters,
    ratingFilters,
    offerFilters,
    formFilters,
    onlyFreeDelivery,
    onlyInStock,
    sortBy,
    page,
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((c) => c.id === product.id);
      if (found)
        return prev.map((c) =>
          c.id === product.id ? { ...c, qty: c.qty + 1 } : c
        );
      return [...prev, { ...product, qty: 1 }];
    });
  };
  const updateQty = (id, qty) => {
    setCart((prev) => {
      if (qty <= 0) return prev.filter((p) => p.id !== id);
      return prev.map((p) => (p.id === id ? { ...p, qty } : p));
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Grocery Store — Groceries
        </h1>
        {!categoryId && !catErr && (
          <p className="text-sm text-gray-500 mt-1">Loading category…</p>
        )}
        {catErr && <p className="text-sm text-red-600 mt-1">{catErr}</p>}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Filters */}
        <aside className="md:col-span-1 bg-white p-4 rounded shadow sticky top-6 h-fit">
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Price Range</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={priceMin}
                onChange={(e) => {
                  setPriceMin(Number(e.target.value || dataMin));
                  setPage(1);
                }}
                min={dataMin}
                max={priceMax}
                className="w-20 px-2 py-1 border rounded"
              />
              <span className="text-sm text-gray-500">to</span>
              <input
                type="number"
                value={priceMax}
                onChange={(e) => {
                  setPriceMax(Number(e.target.value || dataMax));
                  setPage(1);
                }}
                min={priceMin}
                max={Math.max(dataMax, priceMax)}
                className="w-24 px-2 py-1 border rounded"
              />
            </div>
            <div className="mt-2">
              <input
                type="range"
                min={dataMin}
                max={Math.max(dataMax, priceMax)}
                value={priceMax}
                onChange={(e) => {
                  setPriceMax(Number(e.target.value));
                  setPage(1);
                }}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">Max price slider</div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Brand</h3>
            <div className="flex flex-col gap-2">
              {brands.map((b) => (
                <label
                  key={b}
                  className="inline-flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={brandFilters.includes(b)}
                    onChange={() => {
                      setBrandFilters((prev) =>
                        prev.includes(b)
                          ? prev.filter((x) => x !== b)
                          : [...prev, b]
                      );
                      setPage(1);
                    }}
                    className="w-4 h-4"
                  />
                  {b}
                </label>
              ))}
              {brands.length === 0 && (
                <div className="text-xs text-gray-500">No brand facets</div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Customer Ratings</h3>
            {[4, 3, 2, 1].map((r) => (
              <label key={r} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={ratingFilters.includes(r)}
                  onChange={() => {
                    setRatingFilters((prev) =>
                      prev.includes(r)
                        ? prev.filter((x) => x !== r)
                        : [...prev, r]
                    );
                    setPage(1);
                  }}
                  className="w-4 h-4"
                />
                <span>{r}★ & above</span>
              </label>
            ))}
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Offers</h3>
            {offers.length === 0 ? (
              <div className="text-sm text-gray-500">No offers in data</div>
            ) : (
              offers.map((o) => (
                <label
                  key={o}
                  className="inline-flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={offerFilters.includes(o)}
                    onChange={() => {
                      setOfferFilters((prev) =>
                        prev.includes(o)
                          ? prev.filter((x) => x !== o)
                          : [...prev, o]
                      );
                      setPage(1);
                    }}
                    className="w-4 h-4"
                  />
                  {o}
                </label>
              ))
            )}
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Product Form</h3>
            {forms.map((f) => (
              <label key={f} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formFilters.includes(f)}
                  onChange={() => {
                    setFormFilters((prev) =>
                      prev.includes(f)
                        ? prev.filter((x) => x !== f)
                        : [...prev, f]
                    );
                    setPage(1);
                  }}
                  className="w-4 h-4"
                />
                {f}
              </label>
            ))}
            {forms.length === 0 && (
              <div className="text-xs text-gray-500">No form facets</div>
            )}
          </div>

          <div className="mb-4 flex flex-col gap-2">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={onlyFreeDelivery}
                onChange={() => {
                  setOnlyFreeDelivery((s) => !s);
                  setPage(1);
                }}
                className="w-4 h-4"
              />
              Free Delivery
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={() => {
                  setOnlyInStock((s) => !s);
                  setPage(1);
                }}
                className="w-4 h-4"
              />
              In Stock Only
            </label>
          </div>

          <div className="mt-2">
            <button
              onClick={() => {
                setSearch("");
                setSortBy("popularity");
                setPriceMin(dataMin);
                setPriceMax(dataMax);
                setBrandFilters([]);
                setRatingFilters([]);
                setOfferFilters([]);
                setFormFilters([]);
                setOnlyFreeDelivery(false);
                setOnlyInStock(false);
                setPage(1);
              }}
              className="text-sm text-blue-600"
            >
              Reset all filters
            </button>
          </div>
        </aside>

        {/* product grid */}
        <main className="md:col-span-4 bg-white p-5 rounded shadow">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {!loading && items.length === 0 && !err && (
              <div className="text-sm text-gray-600">
                No items match your filters.
              </div>
            )}

            {items.map((p) => {
              const cartItem = cart.find((c) => c.id === p.id);
              return (
                <article
                  key={p.id}
                  className="bg-white p-4 rounded shadow hover:shadow-lg transition relative flex flex-col"
                >
                  {Number(p.discountPct) > 0 && (
                    <div className="absolute left-3 top-3 bg-red-600 text-white text-xs px-2 py-1 rounded">
                      {p.discountPct}% OFF
                    </div>
                  )}

                  <div className="absolute right-3 top-3 flex items-center gap-1">
                    {p.assured && (
                      <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded text-xs font-semibold shadow">
                        <FaCertificate className="text-blue-600" /> Assured
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex items-center justify-center p-4">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="max-h-40 object-contain"
                    />
                  </div>

                  <div className="mt-3">
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
                      {p.name}
                    </h3>
                    <div className="text-xs text-gray-500">
                      {p.brand} • {p.weight}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1">
                        {Number(p.rating).toFixed(1)}
                        <FaStar
                          className="text-white"
                          style={{ width: 10, height: 10 }}
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        ({Number(p.reviews || 0).toLocaleString()})
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      {p.freeDelivery && (
                        <span className="flex items-center gap-1">
                          <FaTruck /> Free Delivery
                        </span>
                      )}
                      {!p.inStock && (
                        <span className="text-red-600 font-semibold">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <div className="text-lg font-bold">
                        {fCurrency(p.price)}
                      </div>
                      <div className="text-xs text-gray-500 line-through">
                        {fCurrency(p.oldPrice)}
                      </div>
                    </div>

                    <div>
                      {cartItem ? (
                        <div className="flex items-center border rounded">
                          <button
                            onClick={() => updateQty(p.id, cartItem.qty - 1)}
                            className="px-2 py-1"
                            aria-label="decrease"
                          >
                            <FaMinus />
                          </button>
                          <div className="px-3">{cartItem.qty}</div>
                          <button
                            onClick={() => updateQty(p.id, cartItem.qty + 1)}
                            className="px-2 py-1"
                            aria-label="increase"
                          >
                            <FaPlus />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(p)}
                          disabled={!p.inStock}
                          className={`px-3 py-1 rounded text-white text-sm ${
                            p.inStock
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "bg-gray-300 cursor-not-allowed"
                          }`}
                        >
                          Add to cart
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      {(p.offers || []).map((o) => (
                        <span
                          key={o}
                          className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs"
                        >
                          {o}
                        </span>
                      ))}
                    </div>
                    <div>
                      <StarRating rating={p.rating} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((s) => Math.max(1, s - 1))}
              className="px-3 py-1 border rounded"
              disabled={page === 1}
            >
              Prev
            </button>
            <div className="text-sm">
              Page {page} of {Math.max(1, Math.ceil(total / PAGE_SIZE))}
            </div>
            <button
              onClick={() =>
                setPage((s) =>
                  Math.min(Math.max(1, Math.ceil(total / PAGE_SIZE)), s + 1)
                )
              }
              className="px-3 py-1 border rounded"
              disabled={page >= Math.max(1, Math.ceil(total / PAGE_SIZE))}
            >
              Next
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
