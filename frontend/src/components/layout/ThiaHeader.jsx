import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ThiaHeader = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50" >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 py-2">

      {/* <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex flex-wrap  items-center justify-between gap-4 py-2"> */}
        {/* Logo */}
        <div className="flex items-center">
          <img
            src="/img/logo/BBSCART_LOGO.PNG"
            alt="Thiaworld Logo"
            className="max-w-[180px] max-h-[100px]"
          />
        </div>

        {/* Hamburger for Mobile */}
        <button
          className="md:hidden text-2xl text-gray-600"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <i className="ri-close-line"></i> : <i className="ri-bar-chart-horizontal-line"></i>}
        </button>

        {/* Search and Marquee (hidden on small screens) */}
        <div className="hidden md:flex flex-col md:flex-row items-center flex-1 gap-4">
          <div className="text-sm text-black overflow-hidden whitespace-nowrap w-full">
            <div className="animate-marquee inline-block">
              Matte Finish Bangles · 22K Necklaces · Antique Temple Jewelry ·
              Lightweight Gold Chains
            </div>
          </div>

          <div className="relative w-full max-w-md">
            <i className="ri-search-line absolute right-3 top-3 text-gray-400 text-sm"></i>
            <input
              type="text"
              placeholder="Search jewelry, collections, categories..."
              className="w-full pl-3 pr-8 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
            />
          </div>
        </div>

        {/* Right icons */}
        <div className="hidden md:flex items-center gap-4">
          <button className="relative text-gray-600 hover:text-red-500">
            <i className="ri-shopping-cart-line text-xl"></i>
          </button>

          <button className="relative text-gray-600 hover:text-yellow-600">
            <i className="ri-shield-user-line text-xl"></i>
            <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full px-1">
              1
            </span>
          </button>

          <button className="text-sm text-gray-700 hover:text-yellow-600 flex items-center">
            <i className="ri-heart-fill text-xl"></i>
            Login
          </button>

          <select className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-600">
            <option value="IN">🇮🇳 IN</option>
            <option value="UAE">🇦🇪 UAE</option>
            <option value="US">🇺🇸 US</option>
          </select>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4">
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
            />
            <div className="flex gap-6 justify-around">
              <button onClick={() => navigate("/")}>Home</button>
              <button>About</button>
              <button onClick={() => navigate("/contact")}>Contact</button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <div
        className="hidden md:flex justify-between items-center p-2"
        style={{ backgroundColor: "rgba(13,88,102)", color: "white" }}
      >
        <div className="w-1/3" />

        <div className="flex justify-center gap-10 w-1/3">
          <span onClick={() => navigate("/")} className="cursor-pointer">
            Home
          </span>
          <span>About Us</span>
          <span className="flex items-center gap-1"><i className="ri-secure-payment-line"></i>Thai-Secure Plan</span>
          <span
            onClick={() => navigate("/contact-page")}
            className="cursor-pointer"
          >
            Contact
          </span>
        </div>

        <div className="w-full md:w-1/3 flex justify-center md:justify-end px-4">
          <a
            href="https://www.joyalukkas.in/jewellery.html"
            target="_blank"
            rel="noreferrer"
          >
            More Pro
          </a>
        </div>
      </div>
    </header>
  );
};

export default ThiaHeader;