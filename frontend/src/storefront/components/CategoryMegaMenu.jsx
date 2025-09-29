import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ReactDOM from "react-dom";

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || "" });

export default function CategoryMegaMenu() {
  const [open, setOpen] = useState(false);
  const [cats, setCats] = useState([]);
  const [subs, setSubs] = useState([]);
  const [groups, setGroups] = useState([]);

  const [catId, setCatId] = useState("");
  const [sub, setSub] = useState(null);

  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const nav = useNavigate();

  // Fetch categories when menu first opens
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
    API.get("/api/products/catalog/groups", {
      params: { subcategory_id: sub._id },
    })
      .then(({ data }) => setGroups(data.items || []))
      .catch(() => setGroups([]));
  }, [sub]);

  const onGroupClick = (g) => {
    nav(
      `/subcategory/${sub._id}?groupId=${g._id}&label=${encodeURIComponent(
        g.label
      )}`
    );
    setOpen(false);
  };

  // Position the popup below button
  const [menuTop, setMenuTop] = useState(0);
  useEffect(() => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuTop(rect.bottom + 10); // add 10px gap
    }
  }, [open]);

  // Close when mouse leaves button + menu
  // useEffect(() => {
  //   const handleMouseMove = (e) => {
  //     if (!open) return;
  //     const btn = btnRef.current;
  //     const menu = menuRef.current;
  //     if (btn && menu && !btn.contains(e.target) && !menu.contains(e.target)) {
  //       setOpen(false);
  //     }
  //   };
  //   if (open) {
  //     document.addEventListener("mousemove", handleMouseMove);
  //   }
  //   return () => document.removeEventListener("mousemove", handleMouseMove);
  // }, [open]);

  useEffect(() => {
    const timerRef = { current: null };

    const handleMouseMove = (e) => {
      if (!open) return;
      const btn = btnRef.current;
      const menu = menuRef.current;
      const outside =
        btn && menu && !btn.contains(e.target) && !menu.contains(e.target);

      if (outside) {
        // start 5-second countdown if not already running
        if (!timerRef.current) {
          timerRef.current = setTimeout(() => {
            setOpen(false);
            timerRef.current = null;
          }, 500);
        }
      } else {
        // pointer back inside, cancel any pending close
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
    };

    if (open) {
      document.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open]);

  return (
    <>
      {/* Trigger button */}
      <button
        ref={btnRef}
        onMouseEnter={() => setOpen(true)}
        className="rounded  text-zinc-950 hover:bg-zinc-100 px-4 py-2 font-semibold  hover:text-black"
      >
        Shop by Category
      </button>

      {/* Dropdown popup */}
      {open &&
        ReactDOM.createPortal(
          <div
            id="mega-menu-popup"
            ref={menuRef}
            style={{ top: menuTop }}
            className="absolute left-1/2 z-[9999] -translate-x-1/2 m-auto rounded bg-white shadow-lg"
          >
            <div className="flex max-w-screen ">
              {/* Left: categories */}
              <div className="w-[100%] bg-[#111] text-white">
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

              {/* Middle: subcategories */}
              <div className="w-[80%] border-x p-3">
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
                          sub?._id === s._id
                            ? "bg-gray-100"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {s.name}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right: groups */}
              <div className="w-[80%] p-3">
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
          </div>,document.body
        )}
    </>
  );
}
