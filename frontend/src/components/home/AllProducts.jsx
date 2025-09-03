// ProductListingFull.jsx
import React, { useEffect, useMemo, useState } from "react";
import instance from "../../services/axiosInstance"; // adjust path as needed

// Helpers
const inr = (n) => new Intl.NumberFormat("en-IN").format(n);

// API endpoints Need to Update
const API_LIST = `${import.meta.env.VITE_API_URL}/api/products/public`;
const API_FACETS = `${import.meta.env.VITE_API_URL}/api/products/facets`;

export default function ProductListingFull() {
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(30000);

  const [allBrands, setAllBrands] = useState([]);
  const [ramOptions, setRamOptions] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 30000 });

  const [selectedBrands, setSelectedBrands] = useState(new Set());
  const [selectedRAM, setSelectedRAM] = useState(new Set());
  const [selectedRatings, setSelectedRatings] = useState(new Set());

  const [gstInvoiceOnly, setGstInvoiceOnly] = useState(false);
  const [delivery1DayOnly, setDelivery1DayOnly] = useState(false);

  const [view, setView] = useState("grid");
  const [sortBy, setSortBy] = useState("popularity");

  const [compareIds, setCompareIds] = useState(new Set());

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [page, setPage] = useState(1);
  const limit = 20;

  function toggleSetItem(setState, value) {
    setState((prev) => {
      const copy = new Set(prev);
      if (copy.has(value)) copy.delete(value);
      else copy.add(value);
      return copy;
    });
  }

  function resetFilters() {
    setSearch("");
    setMinPrice(priceRange.min);
    setMaxPrice(priceRange.max);
    setSelectedBrands(new Set());
    setSelectedRAM(new Set());
    setSelectedRatings(new Set());
    setGstInvoiceOnly(false);
    setDelivery1DayOnly(false);
    setSortBy("popularity");
    setPage(1);
  }

  const toggleCompare = (id) =>
    setCompareIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });

  // Fetch facets
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await instance.get(API_FACETS);
        if (!alive) return;
        const brands = (data.brands || []).map((b) => b.name).filter(Boolean);
        const rams = (data.ram || [])
          .map((r) => Number(r.value))
          .filter((n) => !Number.isNaN(n));
        const price = data.price || { min: 0, max: 30000 };
        setAllBrands(brands);
        setRamOptions(rams.sort((a, b) => a - b));
        setPriceRange({
          min: Math.max(0, Math.floor(price.min || 0)),
          max: Math.ceil(price.max || 30000),
        });
        setMinPrice(Math.max(0, Math.floor(price.min || 0)));
        setMaxPrice(Math.ceil(price.max || 30000));
      } catch (e) {
        console.error("Failed to load facets", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Fetch products
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setErr("");

    const params = {
      search: search || undefined,
      minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
      brands: selectedBrands.size
        ? Array.from(selectedBrands).join(",")
        : undefined,
      rating_gte: selectedRatings.size
        ? Math.max(...Array.from(selectedRatings))
        : undefined,
      ram_gte: selectedRAM.size
        ? Math.max(...Array.from(selectedRAM))
        : undefined,
      gstInvoice: gstInvoiceOnly || undefined,
      deliveryIn1Day: delivery1DayOnly || undefined,
      sort: sortBy,
      page,
      limit,
    };

    (async () => {
      try {
        const { data } = await instance.get(API_LIST, {
          params,
          signal: controller.signal,
        });
        console.log(data, "API Data LIST");

        setProducts(Array.isArray(data.products) ? data.products : []);
        setTotal(Number.isFinite(data.total) ? data.total : 0);
      } catch (e) {
        setErr(
          e?.response?.data?.error || e?.message || "Failed to load products"
        );
        setProducts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [
    search,
    minPrice,
    maxPrice,
    selectedBrands,
    selectedRAM,
    selectedRatings,
    gstInvoiceOnly,
    delivery1DayOnly,
    sortBy,
    page,
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const filtered = useMemo(() => products, [products]);

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
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search product title..."
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
              min={priceRange.min}
              max={maxPrice}
              onChange={(e) => {
                setMinPrice(Number(e.target.value || 0));
                setPage(1);
              }}
              className="w-1/2 border rounded px-2 py-1 text-sm"
              aria-label="Minimum price"
            />
            <input
              type="number"
              value={maxPrice}
              min={minPrice}
              max={priceRange.max}
              onChange={(e) => {
                setMaxPrice(Number(e.target.value || 0));
                setPage(1);
              }}
              className="w-1/2 border rounded px-2 py-1 text-sm"
              aria-label="Maximum price"
            />
          </div>
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(Number(e.target.value));
              setPage(1);
            }}
            className="w-full mt-2"
          />
          <div className="text-xs text-gray-500 mt-1">
            Range: ₹{inr(priceRange.min)} - ₹{inr(priceRange.max)}
          </div>
        </div>

        {/* Brands */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Brands</label>
          <div className="space-y-2">
            {allBrands.map((b) => (
              <label key={b} className="flex items-center gap-2 mx-3">
                <input
                  type="checkbox"
                  checked={selectedBrands.has(b)}
                  onChange={() => {
                    toggleSetItem(setSelectedBrands, b);
                    setPage(1);
                  }}
                  className="w-3 h-4"
                />
                <span className="mx-2">{b}</span>
              </label>
            ))}
            {allBrands.length === 0 && (
              <div className="text-xs text-gray-500 mx-3">No brand facets</div>
            )}
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
                  onChange={() => {
                    toggleSetItem(setSelectedRatings, rating);
                    setPage(1);
                  }}
                  className="cursor-pointer w-3 h-4 mx-3"
                />
                <span>
                  {Array.from({ length: rating })
                    .map(() => "★")
                    .join("")}{" "}
                  &nbsp; &amp; above
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* RAM */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">RAM</label>
          <div className="space-y-2 text-sm">
            {ramOptions.map((r) => (
              <label key={r} className="flex items-center gap-2 mx-3">
                <input
                  type="checkbox"
                  checked={selectedRAM.has(r)}
                  onChange={() => {
                    toggleSetItem(setSelectedRAM, r);
                    setPage(1);
                  }}
                  className="w-3 h-4"
                />
                <span>{r} GB &amp; above</span>
              </label>
            ))}
            {ramOptions.length === 0 && (
              <div className="text-xs text-gray-500 mx-3">No RAM facets</div>
            )}
          </div>
        </div>

        {/* GST & Delivery */}
        <div className="mb-4 text-sm space-y-2 mx-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={gstInvoiceOnly}
              onChange={() => {
                setGstInvoiceOnly((s) => !s);
                setPage(1);
              }}
              className="w-3 h-4"
            />
            GST Invoice Available
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={delivery1DayOnly}
              onChange={() => {
                setDelivery1DayOnly((s) => !s);
                setPage(1);
              }}
              className="w-3 h-4"
            />
            Delivery in 1 day
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setPage(1)}
            className="flex-1 bg-blue-600 text-white py-1 rounded text-sm"
          >
            Apply
          </button>
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
          <nav className="text-sm text-gray-600 mb-2">
            Home &gt; Mobiles &gt; Mobiles
          </nav>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">All Products</h1>
              <div className="text-sm text-gray-600">
                {loading
                  ? "Loading..."
                  : `Showing ${filtered.length} of ${total} products`}
                {err && <span className="text-red-600 ml-2">({err})</span>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="popularity">Popularity</option>
                <option value="price-asc">Price — Low to High</option>
                <option value="price-desc">Price — High to Low</option>
                <option value="newest">Newest First</option>
              </select>

              <div className="flex items-center gap-2 border rounded px-2">
                <button
                  aria-label="Grid view"
                  onClick={() => setView("grid")}
                  className={`px-2 py-1 text-sm ${
                    view === "grid" ? "font-semibold" : ""
                  }`}
                >
                  Grid
                </button>
                <button
                  aria-label="Table / row view"
                  onClick={() => setView("table")}
                  className={`px-2 py-1 text-sm ${
                    view === "table" ? "font-semibold" : ""
                  }`}
                >
                  Rows
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table header */}
        {view === "table" && (
          <div className="hidden md:flex items-center bg-gray-50 border rounded px-4 py-2 text-sm text-gray-700 mb-2">
            <div className="w-20">Image</div>
            <div className="flex-1">Product</div>
            <div className="w-64">Key Specs</div>
            <div className="w-40 text-right">Price &amp; Offers</div>
            <div className="w-28 text-center">Compare</div>
          </div>
        )}

        {/* Product list */}
        <div className="space-y-4">
          {!loading && filtered.length === 0 && !err && (
            <div className="text-sm text-gray-600">
              No products match your filters.
            </div>
          )}

          {filtered.map((p) =>
            view === "grid" ? (
              <article
                key={p.id}
                className="flex border rounded-lg p-4 hover:shadow-md transition bg-white"
              >
                <div className="w-36 h-36 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex-1 ml-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-medium text-gray-800">{p.title}</h2>
                      <div className="text-xs text-gray-500 mt-1">
                        {p.reviewsText}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold">₹{inr(p.price)}</div>
                      {p.oldPrice ? (
                        <div className="text-xs line-through text-gray-400">
                          ₹{inr(p.oldPrice)}
                        </div>
                      ) : null}
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
                        onChange={() => toggleCompare(p.id)}
                      />
                      <span>Add to Compare</span>
                    </label>

                    {p.assured && (
                      <span className="px-2 py-0.5 border text-xs rounded text-blue-700">
                        Assured
                      </span>
                    )}
                    {p.bestseller && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-xs rounded">
                        Bestseller
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ) : (
              <div
                key={p.id}
                className="md:flex items-center border rounded px-4 py-3 bg-white"
              >
                <div className="w-20 flex items-center">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full object-contain"
                  />
                </div>

                <div className="flex-1 px-4">
                  <div className="font-medium text-gray-800">{p.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {p.reviewsText}
                  </div>
                </div>

                <div className="w-64 text-sm text-gray-700">
                  <ul className="list-disc list-inside">
                    {(p.specs || []).slice(0, 3).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="w-40 text-right">
                  <div className="text-lg font-bold">₹{inr(p.price)}</div>
                  {p.oldPrice ? (
                    <div className="text-xs line-through text-gray-400">
                      ₹{inr(p.oldPrice)}
                    </div>
                  ) : null}
                  <div className="text-green-600 text-sm">{p.discountText}</div>
                  <div className="text-xs mt-1">{p.exchangeOffer}</div>
                </div>

                <div className="w-28 text-center">
                  <input
                    type="checkbox"
                    checked={compareIds.has(p.id)}
                    onChange={() => toggleCompare(p.id)}
                  />
                </div>
              </div>
            )
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Page {page} of {totalPages} {total ? `• Total ${total} items` : ""}
          </div>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={`px-3 py-1 border rounded text-sm ${
                page <= 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={`px-3 py-1 border rounded text-sm ${
                page >= totalPages ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Next
            </button>
          </div>
        </div>

        {/* Compare bar */}
        {compareIds.size > 0 && (
          <div className="fixed bottom-4 right-4 bg-white border rounded p-3 shadow-md flex items-center gap-4">
            <div className="text-sm">{compareIds.size} product(s) selected</div>
            <button className="bg-blue-600 text-white rounded px-3 py-1 text-sm">
              Compare
            </button>
            <button
              className="text-sm underline"
              onClick={() => setCompareIds(new Set())}
            >
              Clear
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
