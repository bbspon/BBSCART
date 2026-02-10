import React, { useState, useEffect } from "react";
import { ProductService } from "../../services/ProductService";
import { useSelector } from "react-redux";
import ReactDOM from "react-dom";
import CategoryMegaMenu from "../../storefront/components/CategoryMegaMenu";
import { FaBars, FaTimes } from "react-icons/fa";
import healthAccess from "../../../public/img/logo/logo.png";
import ThiaLogo from "../../../public/img/logo/ThiaLogo.png";
import { useNavigate,Link } from "react-router-dom";

// Detect mobile width
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
const MENU_LINKS = {
  // User
  "Account Settings": "/user-setting",
  Orders: "/orders",
  Wishlist: "/wishlist",

  // Trending
  "Top Sellers": "/trending?type=top-sellers",
  "New Launches": "/trending?type=new-launches",
  Offers: "/offers",

  // Digital
  "MX Player": "/mx-player",
  Music: "/music",
  Games: "/games",

  // Categories
  "Toys & Stationery": "/subcategory/6974c2f8087410f5634717fe",
  "Fruits & Vegetables": "/fresh",
  Groceries: "/all-products",
  Electronics: "/category/electronics",

  // Programs
  Prime: "/prime",
  Membership: "/membership",
  "Deals Zone": "/deals",

  // Help
  "Customer Service": "/contact",
  Returns: "/returns",
  Language: "/language",
};

// Mock All Products Data
export const allProductsData = [
  { title: "User Name", items: ["Account Settings", "Orders", "Wishlist"] },
  // { title: "Trending", items: [ "New Launches", "Offers"] },
  {
    title: "Shop by Category",
    items: ["Toys & Stationery", "Fruits & Vegetables", "Groceries", "Electronics"],
  },
  // {
  //   title: "Programs & Features",
  //   items: ["Prime", "Membership", "Deals Zone"],
  // },
  {
    title: "Help & Settings",
    items: ["Customer Service"],
  },
];

const MegaMenu = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const isMobile = useIsMobile();
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [openAllProductsMobile, setOpenAllProductsMobile] = useState(false);
const navigate = useNavigate();

  const handleToggle = () => setShowAllProducts(!showAllProducts);

const topLinks = [
  { label: "Fresh", path: "/fresh" },
  { label: "Trending", path: "/trending" },
  { label: "Groceries", path: "/all-products" },
];

  // Tablet screen detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsTablet(width >= 768 && width < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch dynamic categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        let response = null;
        if (user?.role === "seller") {
          response = await ProductService.getCategorySellerID(user._id);
        } else if (user?.role === "admin") {
          response = await ProductService.getCategories();
        } else if (user?.role === "user") {
          response = await ProductService.getCategoriesNearbySeller();
        } else {
          response = await ProductService.getCategories();
        }
        setDynamicCategories(response || []);
      } catch (error) {
        setDynamicCategories([]);
      }
    };
    fetchCategories();
  }, [user]);

  // Offers ticker
  const offers = [
    "2% Instant Discount on HDFC Credit Cards Only",
    "No Wastage (VA) On Gold Coin",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(
      () => setCurrentIndex((prev) => (prev + 1) % offers.length),
      3000
    );
    return () => clearInterval(interval);
  }, [offers.length]);

const fullMenuData = [
  {
    id: "jewelry-1",
    title: "Thiaworld Jewellery",
    externalLink: "https://thiaworld.bbscart.com/",
    image: ThiaLogo, // 👈 your jewellery image
  },
  {
    id: "health-1",
    title: "BBS Global Health Access",
    externalLink: "http://healthcare.bbscart.com/",
    image: healthAccess, // 👈 your health image
  },
];


  return (
    <>
      {/* === TOP NAVBAR (Amazon Style) === */}
      <nav className="relative bg-[#0B7A4B] shadow-md border-b border-[#06653D] z-30 text-white font-medium tracking-wide">
        <div className="container mx-auto px-2 flex items-center justify-between">
          <button
            className="md:hidden p-2 text-white focus:outline-none"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open menu"
          >
            <FaBars className="w-7 h-7" />
          </button>
        </div>
      </nav>

      {/* === MAIN NAV ROW (Amazon Style) === */}
      <nav className="w-full bg-[#11A96A] text-white font-medium tracking-wide">
        <div className="hidden md:flex items-center justify-center gap-8 py-2 text-sm font-medium max-w-7xl mx-auto">
          {/* === All Products Button === */}
         {/* Menu Icon (opens mega menu) */}
<button
  onClick={() => setShowAllProducts(true)}
  className="flex items-center gap-2 px-3 py-2 rounded-md
             bg-white text-[#11A96A]
             hover:bg-[#37475A] hover:text-white transition"
  aria-label="Open menu"
>
  <FaBars />
</button>

{/* All Products (redirect only) */}
<button
  onClick={() => navigate("/all-products")}
  className="px-4 py-2 rounded-md font-semibold
             text-white hover:bg-[#37475A] transition"
>
  All Products
</button>


          {/* === Category Mega Menu === */}
          <div className="flex-shrink-0">
            <CategoryMegaMenu />
          </div>

          {/* === Top Links (Fresh / Trending / Best Sellers etc.) === */}
  <ul className="flex items-center gap-6">
  {topLinks.map((item, idx) => (
    <li key={idx}>
      <Link
        to={item.path}
        className="px-4 py-2 rounded-md font-semibold 
             hover:bg-[#37475A] hover:text-white transition inline-block"
      >
        {item.label}
      </Link>
    </li>
  ))}
</ul>

        </div>

        {/* === All Products Dropdown === */}
        {showAllProducts && (
          <div
            className="absolute left-0 top-[85px] w-full bg-white text-black 
                    shadow-xl border-t-4 border-[#FF9900] z-[99] animate-fadeIn"
          >
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 p-6 text-sm">
              {allProductsData.map((section, idx) => (
                <div key={idx}>
                  <h3 className="font-bold mb-2 text-black">{section.title}</h3>
            <ul className="space-y-1 text-black">
  {section.items.map((item, itemIdx) => {
    const path = MENU_LINKS[item];
    return (
      <li key={itemIdx}>
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
                  onClick={handleToggle}
                  className="flex items-center gap-2 bg-[#131921] text-white px-4 py-2 
                       rounded-lg hover:bg-[#232F3E] transition mt-4"
                >
                  <FaTimes />
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* MOBILE SIDEBAR */}
      {isMobile &&
        mobileSidebarOpen &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 z-[9999] flex">
            <div
              className="absolute inset-0 bg-black bg-opacity-40"
              onClick={() => setMobileSidebarOpen(false)}
            ></div>

            <div className="relative w-80 max-w-full h-full bg-[#232F3E] text-white shadow-2xl border-r border-[#131921] flex flex-col animate-slideInLeft">
              <button
                className="absolute top-3 right-3 text-gray-200 hover:text-white text-2xl z-10"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <FaTimes />
              </button>

              <div className="flex-1 overflow-y-auto pt-8 pb-4 px-4 custom-scrollbar text-white">
                <ul className="space-y-2">
                  <li className="relative group flex-shrink-0">
                    <div className="text-black">
                      <CategoryMegaMenu />
                    </div>
                  </li>

                  <button
                    onClick={() => setOpenAllProductsMobile(true)}
                    className="block w-full text-left px-3 py-2 font-semibold hover:bg-[#37475A] transition"
                  >
                    All Products
                  </button>

                  {fullMenuData.map((item) => (
                    <li key={item.id}>
                      <a
                        href={item.externalLink}
                        className="block w-full px-3 py-2 rounded-md font-semibold hover:bg-[#37475A] transition"
                        onClick={() => setMobileSidebarOpen(false)}
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mobile All Products Panel */}
            {openAllProductsMobile && (
              <div className="relative w-[80%] max-w-sm h-full bg-[#232F3E] text-white shadow-2xl animate-slideInRight flex flex-col overflow-y-auto custom-scrollbar">
                <div className="sticky top-0 flex justify-between items-center bg-[#131921] text-white px-4 py-3 shadow-md">
                  <h2 className="font-bold text-lg">All Products</h2>
                  <button
                    onClick={() => setOpenAllProductsMobile(false)}
                    className="p-2 rounded-full hover:bg-[#37475A] transition"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

                <div className="p-5 space-y-6">
                  {allProductsData.map((section, idx) => (
                    <div key={idx}>
                      <h3 className="font-semibold text-white mb-2">
                        {section.title}
                      </h3>
               <ul className="space-y-1">
  {section.items.map((item, itemIdx) => {
    const path = MENU_LINKS[item];
    return (
      <li key={itemIdx}>
        {path ? (
          <Link
            to={path}
            onClick={() => {
              setOpenAllProductsMobile(false);
              setMobileSidebarOpen(false);
            }}
            className="block py-1 px-2 rounded hover:bg-[#37475A] transition"
          >
            {item}
          </Link>
        ) : (
          <span className="block py-1 px-2">{item}</span>
        )}
      </li>
    );
  })}
</ul>

                    </div>
                  ))}
                </div>

                <div className="p-5 border-t border-[#131921] mt-auto">
                  <button
                    onClick={() => setOpenAllProductsMobile(false)}
                    className="w-full flex items-center justify-center gap-2 bg-[#131921] text-white py-2 rounded-md hover:bg-[#232F3E] transition"
                  >
                    <FaTimes />
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>,
          document.body
        )}

      {/* === Tablet View === */}
      {isTablet && (
        <div className="hidden md:flex flex-row border border-[#131921] bg-[#232F3E] text-white h-full w-full">
          <ul className="flex flex-row w-full">
            <li className="flex-1 px-4">
              <CategoryMegaMenu className="text-black" />
            </li>
            {fullMenuData.slice(0, 3).map((item) => (
              <li key={item.id} className="flex-1 px-4">
                <a
                  href={item.externalLink}
                  className="block w-full text-center px-3 py-2 rounded-md font-semibold text-white hover:bg-[#37475A] transition"
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* === Styles === */}
      <style>{`
          .bounce-text {
            animation: bounceIn 0.6s ease-in-out;
          }
          @keyframes bounceIn {
            0% { transform: translateY(-100%); opacity: 0; }
            50% { transform: translateY(10%); opacity: 1; }
            100% { transform: translateY(0); }
          }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      <div className="flex justify-between items-center px-1 py-1 md:px-10">
        <ul className="hidden lg:flex overflow-x-auto no-scrollbar justify-center space-x-2 lg:space-x-8 py-2 w-full">
          {fullMenuData.map((item) => (
            <li
              key={item.id}
              className="relative group flex-shrink-0"
              onMouseEnter={() => setActiveMenu(item.id)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <a
                href={item.externalLink}
                className="
        flex items-center gap-2 px-4 py-2 rounded-md
        font-semibold
        bg-[#F2F2F2] text-black
        hover:bg-[#37475A] hover:text-white
        transition duration-200
      "
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{ height: "30px", objectFit: "contain" }}
                />

                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default MegaMenu;
