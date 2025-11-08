import React, { useState, useRef, useEffect } from "react";
import { FaSearch } from "react-icons/fa";

const ProductSearch = () => {
  const products = [
    { id: 1, name: "Apple iPhone 15" },
    { id: 2, name: "Samsung Galaxy S24" },
    { id: 3, name: "OnePlus 12" },
    { id: 4, name: "Sony WH-1000XM5 Headphones" },
    { id: 5, name: "MacBook Air M3" },
    { id: 6, name: "Apple Watch Ultra 2" },
    { id: 7, name: "Dell XPS 15" },
    { id: 8, name: "Google Pixel 9 Pro" },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [showList, setShowList] = useState(false);
  const wrapperRef = useRef(null);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowList(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="z-[9999]">
      <div ref={wrapperRef} className="relative w-[400px] max-w-md flex justify-center item">
        {/* 🔍 Search Bar */}
        <div className="relative ">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onFocus={() => setShowList(true)}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowList(true);
            }}
            className="w-full h-[30px] border border-gray-300 rounded-full py-3 pl-12 pr-4 text-gray-700 focus:ring-2
             focus:ring-red-600 focus:outline-none shadow-sm"
          />
          <FaSearch
            className="absolute left-4 top-2 text-gray-500 hover:text-red-600 cursor-pointer"
            size={14}
          />
        </div>

        {/* 📦 Product Dropdown */}
        {showList && (
          <div className="absolute w-full mt-8 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto no-scrollbar z-[99999]">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSearchTerm(product.name);
                    setShowList(false);
                  }}
                >
                  {product.name}
                </div>
              ))
            ) : (
              <p className="p-4 text-gray-500 text-center">No products found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSearch;
