import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ProductSearch({ onClose }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const onSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    navigate(`/all-products?search=${encodeURIComponent(query.trim())}`);
    setQuery("");

    // ✅ CLOSE POPUP AFTER SEARCH
    if (onClose) onClose();
  };

  return (
    <form onSubmit={onSearch} className="relative w-full max-w-xl mx-auto">
      <input
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
      />

      <button
        type="submit"
        className="absolute right-1 top-1/2 -translate-y-1/2 bg-green-600 text-white px-4 py-1.5 rounded-full text-sm"
      >
        Search
      </button>
    </form>
  );
}

