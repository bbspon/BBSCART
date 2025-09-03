import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API } from "../../api/publicApi";

export default function CategoryPage() {
  const { categoryId } = useParams();
  const [subs, setSubs] = useState([]);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    API.get("/api/products/catalog/subcategories", {
      params: { category_id: categoryId },
    }).then(({ data }) => setSubs(data.items || []));
    API.get("/api/products/public", { params: { categoryId, limit: 8 } }).then(
      ({ data }) => setFeatured(data.items || [])
    );
  }, [categoryId]);

  return (
    <div className="mx-auto max-w-6xl p-4">
      <h1 className="mb-4 text-2xl font-semibold">Browse</h1>

      <h2 className="mb-2 text-lg font-medium">Sub-categories</h2>
      {!subs.length ? (
        <div className="mb-6 text-sm text-gray-500">No sub-categories.</div>
      ) : (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {subs.map((s) => (
            <Link
              key={s._id}
              to={`/c/${categoryId}/${s._id}`}
              className="rounded border p-3 hover:bg-gray-50"
            >
              {s.name}
            </Link>
          ))}
        </div>
      )}

      <h2 className="mb-2 text-lg font-medium">Featured products</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {featured.map((p) => (
          <Link
            key={p._id}
            to={`/p/${p._id}`}
            className="rounded border p-3 hover:bg-gray-50"
          >
            <img
              src={p.product_img}
              alt=""
              className="mb-2 h-40 w-full rounded object-cover"
            />
            <div className="line-clamp-2 text-sm">{p.name}</div>
            <div className="text-sm font-semibold">
              ₹{p.priceInfo?.sale ?? p.price ?? 0}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
