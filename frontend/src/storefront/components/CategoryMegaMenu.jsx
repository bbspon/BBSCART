import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || "" });

export default function CategoryMegaMenu() {
  const [open, setOpen] = useState(false);

  const [cats, setCats] = useState([]);
  const [subs, setSubs] = useState([]);
  const [groups, setGroups] = useState([]);

  const [catId, setCatId] = useState("");
  const [sub, setSub] = useState(null);

  const nav = useNavigate();

  useEffect(() => {
    if (!open || cats.length) return;
    API.get("/api/products/catalog/categories").then(({ data }) =>
      setCats(data.items || [])
    );
  }, [open, cats.length]);

  useEffect(() => {
    if (!catId) {
      setSubs([]);
      setSub(null);
      setGroups([]);
      return;
    }
    API.get("/api/products/catalog/subcategories", {
      params: { category_id: catId },
    }).then(({ data }) => setSubs(data.items || []));
  }, [catId]);

  useEffect(() => {
    if (!sub?._id) {
      setGroups([]);
      return;
    }
    // Load dynamic product groups for selected sub-category
    API.get("/api/products/catalog/groups", {
      params: { subcategory_id: sub._id },
    })
      .then(({ data }) => setGroups(data.items || []))
      .catch(() => setGroups([]));
  }, [sub]);

  const onGroupClick = (g) => {
    // Prefer groupId for precise matching; Subcategory page will handle it.
   // in CategoryMegaMenu onGroupClick(g)
nav(`/subcategory/${sub._id}?groupId=${g._id}&label=${encodeURIComponent(g.label)}`);

    setOpen(false);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        setOpen(false);
        setCatId("");
        setSub(null);
        setGroups([]);
      }}
    >
      <button className="rounded bg-green-600 px-4 py-2 text-white">
        Shop by Category
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 w-[950px] rounded bg-white shadow-lg">
          <div className="flex">
            {/* Left: categories (dark like BigBasket) */}
            <div className="w-[32%] bg-[#111] text-white">
              <div className="max-h-[440px] overflow-auto p-2">
                {cats.map((c) => (
                  <div
                    key={c._id}
                    onMouseEnter={() => setCatId(c._id)}
                    className={`cursor-pointer rounded px-3 py-2 text-sm ${
                      catId === c._id ? "bg-white/10" : "hover:bg-white/10"
                    }`}
                  >
                    {c.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Middle: sub-categories */}
            <div className="w-[34%] border-x p-3">
              <div className="max-h-[440px] overflow-auto">
                {!subs.length ? (
                  <div className="px-2 py-2 text-sm text-gray-500">
                    Hover a category to see sub-categories
                  </div>
                ) : (
                  subs.map((s) => (
                    <div
                      key={s._id}
                      onMouseEnter={() => setSub(s)}
                      onClick={() => {
                        setOpen(false);
                        nav(`/subcategory/${s._id}`);
                      }}
                      className={`cursor-pointer rounded px-3 py-2 text-sm ${
                        sub?._id === s._id ? "bg-gray-100" : "hover:bg-gray-100"
                      }`}
                    >
                      {s.name}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: product groups for selected sub-category */}
            <div className="w-[34%] p-3">
              <div className="max-h-[440px] overflow-auto">
                {!groups.length ? (
                  <div className="px-2 py-2 text-sm text-gray-500">
                    Hover a sub-category to view groups
                  </div>
                ) : (
                  groups.map((g) => (
                    <div
                      key={g._id}
                      onClick={() => onGroupClick(g)}
                      className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      {g.label}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
