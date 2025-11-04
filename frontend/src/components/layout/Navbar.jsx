import React, { useState, useEffect } from "react";
import { ProductService } from "../../services/ProductService";
import { useSelector } from "react-redux";
import ReactDOM from "react-dom";
import CategoryMegaMenu from "../../storefront/components/CategoryMegaMenu";
import { FaBars, FaTimes } from "react-icons/fa";

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

// ✅ Mock All Products Data
export const allProductsData = [
  { title: "User Name", items: ["Account Settings", "Orders", "Wishlist"] },
  { title: "Trending", items: ["Top Sellers", "New Launches", "Offers"] },
  {
    title: "Digital Content & Devices",
    items: ["MX Player", "Music", "Games"],
  },
  {
    title: "Shop by Category",
    items: ["Mobiles", "Fashion", "Groceries", "Electronics"],
  },
  {
    title: "Programs & Features",
    items: ["Prime", "Membership", "Deals Zone"],
  },
  {
    title: "Help & Settings",
    items: ["Customer Service", "Returns", "Language"],
  },
];

const MegaMenu = ({ menuType }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const isMobile = useIsMobile();
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeSidebarMenu, setActiveSidebarMenu] = useState(null);
  const [isTablet, setIsTablet] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [openAllProductsMobile, setOpenAllProductsMobile] = useState(false);

  const handleToggle = () => setShowAllProducts(!showAllProducts);

  const topLinks = ["Fresh", "Trending", "Best Sellers"];

  // ✅ Handle tablet screen detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsTablet(width >= 768 && width < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Fetch dynamic categories
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

  // ✅ Offers ticker
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
    },
    {
      id: "health-1",
      title: "BBS Global Health Access",
      externalLink: "http://healthcare.bbscart.com/",
    },
  ];

  const cn = (...classes) => classes.filter(Boolean).join(" ");

  return (
    <>
      {/* === Offer Bar === */}
      <div className="w-full bg-gradient-to-r from-[#4d060a] via-[#6b0e13] to-[#141414] text-white py-2 text-center overflow-hidden sticky top-0 z-50 shadow-neutral-950 shadow-2xl">
        <ul className="offer-msg list-none m-0 p-0">
          <li
            key={currentIndex}
            className="bounce-text text-sm font-medium text-white"
          >
            {offers[currentIndex]}
          </li>
        </ul>
      </div>

      {/* === Navbar === */}
      <nav className="relative bg-white shadow-md border-b border-gray-100 z-30">
        <div className="container mx-auto px-2 flex items-center justify-between">
          <button
            className="md:hidden p-2 text-[#cf1717] focus:outline-none"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open menu"
          >
            <FaBars className="w-7 h-7" />
          </button>
        </div>
      </nav>

      {/* === Main Nav Row === */}
      <nav className="w-full  text-black shadow-lg">
        <div className="hidden md:flex justify-start flex-wrap gap-4 text-sm font-medium">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggle}
              className="flex items-center justify-between w-[150px] gap-2  px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition"
            >
              <FaBars />
              <span className=" text-black">All Products</span>
            </button>
          </div>

          <div className="flex justify-between items-center px-1 py-1 md:px-10">
            <ul className="hidden lg:flex overflow-x-auto no-scrollbar justify-center space-x-2 lg:space-x-8 py-2 w-full">
              <li className="relative group flex-shrink-0">
                <CategoryMegaMenu />
              </li>

              {fullMenuData.map((item) => (
                <li
                  key={item.id}
                  className="relative group flex-shrink-0"
                  onMouseEnter={() => setActiveMenu(item.id)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <a
                    href={item.externalLink}
                    className="flex items-center gap-1 px-4 py-2 rounded-md  text-black hover:bg-gray-200 transition"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {topLinks.map((item, idx) => (
            <div className="flex justify-between items-center px-1 py-1 md:px-1">
              <button
                key={idx}
                className=" transition-all duration-200  text-black hover:bg-gray-200  flex items-center gap-1 px-4 py-2"
              >
                {item}
              </button>
            </div>
          ))}
        </div>

        {/* === All Products Dropdown (Desktop) === */}
        {showAllProducts && (
          <div className="absolute left-0 top-[85px] w-full bg-white text-black shadow-xl border-t-4 border-[#8e1c21] z-[99] animate-fadeIn">
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 p-6 text-sm">
              {allProductsData.map((section, idx) => (
                <div key={idx}>
                  <h3 className="font-bold mb-2 text-[#6b0e13]">
                    {section.title}
                  </h3>
                  <ul className="space-y-1">
                    {section.items.map((item, itemIdx) => (
                      <li key={itemIdx}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="flex justify-end col-span-full">
                <button
                  onClick={handleToggle}
                  className="flex items-center gap-2 bg-[#6b0e13] text-white px-4 py-2 rounded-lg hover:bg-[#8e1c21] transition mt-4"
                >
                  <FaTimes />
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* === Mobile Sidebar === */}
      {isMobile &&
        mobileSidebarOpen &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 z-[9999] flex">
            <div
              className="absolute inset-0 bg-black bg-opacity-40"
              onClick={() => setMobileSidebarOpen(false)}
            ></div>
            <div className="relative w-80 max-w-full h-full bg-white shadow-2xl border-r border-[#cf1717] flex flex-col animate-slideInLeft">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-[#cf1717] text-2xl z-10"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <FaTimes />
              </button>

              <div className="flex-1 overflow-y-auto pt-8 pb-4 px-4 custom-scrollbar">
                <ul className="space-y-2">
                  <li className="relative group flex-shrink-0">
                    <CategoryMegaMenu />
                  </li>

                  {/* Mobile All Products Section */}
                  <button
                    onClick={() => setOpenAllProductsMobile(true)}
                    className="block w-full text-left px-3 py-2 font-semibold text-gray-800 hover:bg-[#f7eaea] hover:text-[#cf1717] transition"
                  >
                    All Products
                  </button>

                  {fullMenuData.map((item) => (
                    <li key={item.id}>
                      <a
                        href={item.externalLink}
                        className="block w-full px-3 py-2 rounded-md font-semibold text-gray-800 hover:bg-[#f7eaea] hover:text-[#cf1717] transition"
                        onClick={() => setMobileSidebarOpen(false)}
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* === Slide-in All Products Panel (Mobile) === */}
            {openAllProductsMobile && (
              <div className="relative w-[80%] max-w-sm h-full bg-white shadow-2xl animate-slideInRight flex flex-col overflow-y-auto custom-scrollbar">
                <div className="sticky top-0 flex justify-between items-center bg-[#6b0e13] text-white px-4 py-3 shadow-md">
                  <h2 className="font-bold text-lg">All Products</h2>
                  <button
                    onClick={() => setOpenAllProductsMobile(false)}
                    className="p-2 rounded-full hover:bg-[#8e1c21] transition"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

                <div className="p-5 space-y-6">
                  {allProductsData.map((section, idx) => (
                    <div key={idx}>
                      <h3 className="font-semibold text-[#6b0e13] mb-2">
                        {section.title}
                      </h3>
                      <ul className="space-y-1 text-gray-700">
                        {section.items.map((item, itemIdx) => (
                          <li
                            key={itemIdx}
                            className="py-1 px-2 rounded hover:bg-[#f7eaea] hover:text-[#8e1c21] transition"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="p-5 border-t mt-auto">
                  <button
                    onClick={() => setOpenAllProductsMobile(false)}
                    className="w-full flex items-center justify-center gap-2 bg-[#6b0e13] text-white py-2 rounded-md hover:bg-[#8e1c21] transition"
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
        <div className="hidden md:flex flex-row border h-full w-full">
          <ul className="flex flex-row w-full">
            <li className="flex-1 px-4">
              <CategoryMegaMenu />
            </li>
            {fullMenuData.slice(0, 3).map((item) => (
              <li key={item.id} className="flex-1 px-4">
                <a
                  href={item.externalLink}
                  className="block w-full text-center px-3 py-2 rounded-md font-semibold text-gray-800 hover:bg-[#f7eaea] hover:text-[#cf1717] transition"
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
        .custom-scrollbar::-webkit-scrollbar { width: 8px; background: #f7eaea; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cf1717; border-radius: 8px; }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.3s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default MegaMenu;
