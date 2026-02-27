import React, { useState, useEffect } from "react";
import { ProductService } from "../../services/ProductService";
import { useSelector } from "react-redux";
import ReactDOM from "react-dom";
import CategoryMegaMenu from "../../storefront/components/CategoryMegaMenu";
import { FaBars, FaTimes } from "react-icons/fa";
import healthAccess from "../../../public/img/logo/logo.png";
import ThiaLogo from "../../../public/img/logo/ThiaLogo.png";
import { useNavigate, Link } from "react-router-dom";


// ✅ Detect mobile width
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};


// ✅ Menu links mapping
const MENU_LINKS = {
  "Account Settings": "/user-setting",
  Orders: "/orders",
  Wishlist: "/wishlist",

  "Toys & Stationery": "/subcategory/6974c2f8087410f5634717fe",
  "Fruits & Vegetables": "/fresh",
  Groceries: "/all-products",
  Electronics: "/category/electronics",

  "Customer Service": "/contact",
};


const MegaMenu = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const isMobile = useIsMobile();

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const displayName = user?.name;

  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [openAllProductsMobile, setOpenAllProductsMobile] = useState(false);

  const navigate = useNavigate();

  const topLinks = [
    { label: "Fresh", path: "/fresh" },
    { label: "Trending", path: "/trending" },
    { label: "Groceries", path: "/all-products" },
  ];

  const fullMenuData = [
    {
      id: "jewelry-1",
      title: "Thiaworld Jewellery",
      externalLink: "https://thiaworld.bbscart.com/",
      image: ThiaLogo,
    },
    {
      id: "health-1",
      title: "BBS Global Health Access",
      externalLink: "http://healthcare.bbscart.com/",
      image: healthAccess,
    },
  ];

  // ✅ Single-file menu data generator
  const allProductsData = [
    {
      title: isAuthenticated && displayName ? displayName : "User",
      items: ["Account Settings", "Orders", "Wishlist"],
    },
    {
      title: "Shop by Category",
      items: [
        "Toys & Stationery",
        "Fruits & Vegetables",
        "Groceries",
        "Electronics",
      ],
    },
    {
      title: "Help & Settings",
      items: ["Customer Service"],
    },
  ];

  // ✅ Fetch categories (optional)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await ProductService.getCategories();
        setDynamicCategories(response || []);
      } catch {
        setDynamicCategories([]);
      }
    };
    fetchCategories();
  }, []);

  return (
    <>
      {/* === MAIN NAV === */}
      <nav className="w-full bg-[#11A96A] text-white">
        <div className="hidden md:flex items-center justify-center gap-8 py-2 text-sm">

          {/* Menu Icon */}
          <button
            onClick={() => setShowAllProducts(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-white text-[#11A96A]"
          >
            <FaBars />
          </button>

          {/* All Products */}
          <button
            onClick={() => navigate("/all-products")}
            className="px-4 py-2 rounded-md font-semibold hover:bg-[#37475A]"
          >
            All Products
          </button>

          <CategoryMegaMenu />

          {/* Top Links */}
          <ul className="flex items-center gap-6">
            {topLinks.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className="px-4 py-2 rounded-md hover:bg-[#37475A]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* === Desktop Dropdown === */}
        {showAllProducts && (
          <div className="absolute left-0 top-[85px] w-full bg-white text-black shadow-xl z-[9999]">
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 p-6 text-sm">

              {allProductsData.map((section) => (
                <div key={section.title}>
                  <h3 className="font-bold mb-2 text-[#0B7A4B]">
                    {section.title.charAt(0).toUpperCase() + section.title.slice(1)}
                  </h3>

                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const path = MENU_LINKS[item];

                      return (
                        <li key={item}>
                          {path ? (
                            <Link
                              to={path}
                              onClick={() => setShowAllProducts(false)}
                              className="hover:underline hover:text-[#0B7A4B]"
                            >
                              {item}
                            </Link>
                          ) : (
                            <span>{item}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              <div className="flex justify-end col-span-full">
                <button
                  onClick={() => setShowAllProducts(false)}
                  className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg"
                >
                  <FaTimes /> Close
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* === MOBILE SIDEBAR === */}
      {isMobile &&
        mobileSidebarOpen &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 z-[9999] flex">
            <div
              className="absolute inset-0 bg-black bg-opacity-40"
              onClick={() => setMobileSidebarOpen(false)}
            />

            <div className="relative w-80 bg-[#232F3E] text-white h-full shadow-2xl">
              <button
                className="absolute top-3 right-3 text-2xl"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <FaTimes />
              </button>

              <div className="pt-10 px-4">
                <button
                  onClick={() => setOpenAllProductsMobile(true)}
                  className="block w-full text-left px-3 py-2 hover:bg-[#37475A]"
                >
                  All Products
                </button>
              </div>
            </div>

            {/* Mobile All Products */}
            {openAllProductsMobile && (
              <div className="relative w-[80%] bg-[#232F3E] text-white h-full shadow-2xl">
                <div className="flex justify-between items-center bg-black px-4 py-3">
                  <h2 className="font-bold">All Products</h2>
                  <button onClick={() => setOpenAllProductsMobile(false)}>
                    <FaTimes />
                  </button>
                </div>

                <div className="p-5 space-y-6">
                  {allProductsData.map((section) => (
                    <div key={section.title}>
                      <h3 className="font-semibold mb-2">
                        {section.title}
                      </h3>

                      <ul>
                        {section.items.map((item) => {
                          const path = MENU_LINKS[item];

                          return (
                            <li key={item}>
                              {path ? (
                                <Link
                                  to={path}
                                  onClick={() => {
                                    setOpenAllProductsMobile(false);
                                    setMobileSidebarOpen(false);
                                  }}
                                >
                                  {item}
                                </Link>
                              ) : (
                                <span>{item}</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
};

export default MegaMenu;