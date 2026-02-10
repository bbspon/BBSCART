import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import instance from "../../services/axiosInstance";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const pickImage = (p) => {
  const raw =
    p.product_img_url ||
    p.image ||
    p.product_img ||
    (Array.isArray(p.gallery_imgs) ? p.gallery_imgs[0] : "");

  if (!raw) return "/img/placeholder.png";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (String(raw).startsWith("/uploads/")) return `${API_BASE}${raw}`;
  return `${API_BASE}/uploads/${encodeURIComponent(String(raw))}`;
};

export default function Compare() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const ids = useMemo(() => {
    return (searchParams.get("ids") || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  }, [searchParams]);

  useEffect(() => {
    if (!ids.length) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);

        const results = await Promise.all(
          ids.map((id) =>
            instance
              .get(`/products/${id}`)
              .then((res) => res.data)
              .catch(() => null)
          )
        );

        setProducts(results.filter(Boolean));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [ids.join(",")]);

  if (loading) return <div className="p-6">Loading comparison…</div>;
  if (!products.length)
    return <div className="p-6">No products to compare</div>;

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">Compare Products</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div
            key={p._id}
            className="border rounded-lg p-4 bg-white shadow"
          >
            <img
              src={pickImage(p)}
              alt={p.name || p.product_name}
              className="h-40 mx-auto object-contain"
            />

            <h2 className="font-medium mt-3">
              {p.name || p.product_name}
            </h2>

            <div className="text-lg font-bold mt-2">₹{p.price}</div>

            <ul className="text-sm mt-3 space-y-1">
              {(p.specs || []).slice(0, 6).map((s, i) => (
                <li key={i}>• {s}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
