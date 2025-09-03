import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import instance from "../../services/axiosInstance";

export default function SubcategoryPage() {
  const { subcategoryId } = useParams();
  const [params, setParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [q, setQ] = useState(params.get("q") || "");
  const [brand, setBrand] = useState(params.get("brand") || "");
  const [organic, setOrganic] = useState(params.get("organic") || "");
  const [minPrice, setMin] = useState(params.get("minPrice") || "");
  const [maxPrice, setMax] = useState(params.get("maxPrice") || "");

  const groupId = params.get("groupId") || "";
  const group = params.get("group") || "";
  const product = params.get("product") || "";
  const label = params.get("label") || "";

  // Correct localStorage key
  const [pincode, setPincode] = useState(
    localStorage.getItem("deliveryPincode") || ""
  );

  useEffect(() => {
    load();
  }, [
    subcategoryId,
    q,
    brand,
    organic,
    minPrice,
    maxPrice,
    groupId,
    group,
    product,
    pincode,
  ]);

  function load() {
    if (!pincode) {
      console.warn("Pincode not set. Cannot fetch products.");
      setItems([]);
      return;
    }

    instance
      .get("/api/products/public", {
        params: {
          subcategoryId,
          groupId: groupId || undefined,
          product: groupId ? undefined : product || undefined,
          group: groupId || product ? undefined : group || undefined,
          q: groupId || product || group ? undefined : q || undefined,
          brand: brand || undefined,
          organic: organic !== "" ? organic : undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          pincode,
          limit: 24,
          t: Date.now(), // bypass cache
        },
      })
      .then(({ data }) => {
        setItems(data.products || []); // <-- important: read data.products
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setItems([]);
      });
  }

  return (
    <div className="mx-auto max-w-6xl p-4">
      {label && <h2 className="mb-2 text-lg font-semibold">{label}</h2>}

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <input
          className="w-52 rounded border px-3 py-2 text-sm"
          placeholder="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="rounded border px-3 py-2 text-sm"
          value={brand}
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
            setParams({
              ...(label ? { label } : {}),
              ...(group ? { group } : {}),
              ...(product ? { product } : {}),
              ...(q ? { q } : {}),
              ...(brand ? { brand } : {}),
              ...(organic ? { organic } : {}),
              ...(minPrice ? { minPrice } : {}),
              ...(maxPrice ? { maxPrice } : {}),
              ...(pincode ? { pincode } : {}),
            });
            load();
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
                src={p.product_img}
                alt=""
                className="mb-2 h-32 w-full rounded object-cover"
              />
              <div className="line-clamp-2 text-sm">{p.name}</div>
              <div className="text-xs text-gray-500">{p.brand || ""}</div>
              <div className="text-sm font-semibold">
                ₹{p.priceInfo?.sale ?? p.price ?? 0}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
