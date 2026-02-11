
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { loadUser, logout } from "../../services/authService";
import { FaHeart } from "react-icons/fa6";
import { FaHandHoldingHeart } from "react-icons/fa";
import { RiUserShared2Fill } from "react-icons/ri";
import { FaCartArrowDown } from "react-icons/fa";
import DeliverTo from "../../components/DeliverTo";
import NavbarCart from "../../components/NavbarCart";
import ProductSearch from "./ProductSearch";
import { ImSearch } from "react-icons/im";
import { MdCancel } from "react-icons/md";
function HeaderTop() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen((v) => !v);
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");

  const [showUserPopup, setShowUserPopup] = useState(false);
useEffect(() => {
  let timer;
  if (showUserPopup) {
    timer = setTimeout(() => setShowUserPopup(false), 5000);
  }
  return () => clearTimeout(timer);
}, [showUserPopup]);


  const navItems = [
    { name: "Home", href: "/" },
    { name: "About BBSCART", href: "/about" },
    { name: "Partner Network", href: "/vendor-home" },
    { name: "Gallery | Testimonials", href: "/gallery" },
    { name: "Contact Us", href: "/contact" },
    { name: "Legal And Blog", href: "/legal-and-blog" },
  ];

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishItems = useSelector((state) => state.wishlist.items);
const wishCount = wishItems.length;

  const [showHealthcareFrame, setShowHealthcareFrame] = useState(false);
useEffect(() => {
  if (user?.name) setDisplayName(user.name);
}, [user]);



  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout(dispatch);
      toast.success("Successfully Logged Out");
      navigate("/");
    } catch (error) {
      toast.error(error.message || "Logout Failed");
    }
  };

  const userRole = user?.role;
  const roleDashboardRoutes = {
    admin: "/admin/dashboard",
    seller: "/seller/dashboard",
    agent: "/agent/dashboard",
    customer: "/customer/dashboard",
    franchise: "/franchise/dashboard",
    territory_head: "/territory/dashboard",
  };
  const dashboardPath = userRole && roleDashboardRoutes[userRole];

  const handleNavClick = (href) => {
    if (location.pathname === href) {
      // Reload the page if the same link is clicked
      window.location.reload();
    } else {
      navigate(href);
    }
    setMenuOpen(false); // close mobile menu
  };

  if (showHealthcareFrame) {
    return (
      <div className="w-full h-screen">
        <iframe
          src="http://healthcare.bbscart.com/"
          title="Health Access Products"
          className="w-full h-full border-none"
        />
      </div>
    );
  }
const closePopup = () => setShowUserPopup(false);

  return (
    <>
      <header
        onClick={closePopup}
        className="sticky top-0 z-[999] flex flex-wrap items-center justify-between p-4 shadow bg-white"
      >
        {/* Left: Logo + Mobile Toggle */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <button
            onClick={() => window.location.reload()}
            className="cursor-pointer transition-transform hover:scale-105"
            title="Reload page"
          >
            <img
              src="/img/logo/BBSCART_LOGO.PNG"
              alt="BBSCART Logo"
              className="w-[150px] sm:w-[200px] h-auto"
            />
          </button>

          {/* Hamburger button (visible only on small screens) */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-primary text-2xl focus:outline-none"
          >
            <i className="ri-menu-3-fill"></i>
          </button>
        </div>

        {/* Middle: Desktop Navigation */}
        <nav
          className="hidden md:flex flex-1 flex-nowrap justify-center gap-5 text-[16px] font-sans font-semibold tracking-tight text-[16px]
 text-gray-800"
        >
          <div classsName="flex">
            <div>
              {navItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleNavClick(item.href)}
                  className="relative px-2 py-1 transition-all duration-200 ease-in-out transform 
                hover:scale-105 hover:-translate-y-[2px] hover:shadow-md hover:bg-primary hover:text-white hover:rounded-md"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Mobile Dropdown Panel */}
        {menuOpen && (
          <div className="md:hidden w-full mt-2 flex flex-row flex-wrap gap-2 text-[#0B7A4B] justify-center">
            {navItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleNavClick(item.href)}
                className="block px-4 py-2 hover:bg-primary hover:text-white transition rounded-lg"
              >
                {item.name}
              </button>
            ))}
            <div className="flex flex-row justify-center items-center">
              <ProductSearch onClose={() => setMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Right: User, Wishlist, Cart */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-center">
          {/* User */}
          <div className="relative group flex items-center gap-2">
            {/* Welcome text placed left of the icon */}
            {isAuthenticated && displayName ? (
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-[12px] font-semibold text-[#6b0e13]">
                  Welcome!
                </span>
                <span className="text-[13px] font-bold text-[#6b0e13] capitalize">
                  {displayName}
                </span>
              </div>
            ) : (
              <div className="hidden sm:block">
                <span className="text-sm font-semibold text-[#0B7A4B]">
                  Hi, Explore!
                </span>
              </div>
            )}

            <div
              className="flex items-center cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setShowUserPopup(!showUserPopup);
              }}
            >
              <RiUserShared2Fill className="text-[#0B7A4B] w-6 h-6" />
            </div>

            <div className="relative text-center top-8 z-[99]">
              {/* Dropdown / menu */}
            </div>
            {showUserPopup && (
              <div
                className="
      fixed
      top-[70px]
      right-0
      z-[9999]
      w-[360px]
      bg-white
      border border-gray-300
      shadow-xl
      rounded-xl
      p-3
    "
              >
                {/* NOT LOGGED IN */}
                {!isAuthenticated ? (
                  <div className="p-3">
                    {/* Login + Register */}
                    <ul className="flex justify-between mb-3">
                      <li>
                        <Link
                          to="/register"
                          className="block px-4 py-2 text-[#0B0B0B] hover:bg-[#E8F3ED] rounded-lg"
                        >
                          Register
                        </Link>
                      </li>

                      <li>
                        <Link
                          to="/login"
                          className="block px-4 py-2 text-[#0B0B0B] hover:bg-[#E8F3ED] rounded-lg"
                        >
                          Login
                        </Link>
                      </li>
                    </ul>

                    <hr className="my-2 border-gray-300" />

                    {/* LISTS + ACCOUNT */}
                    <div className="flex gap-4">
                      {/* LEFT */}
                      <ul className="flex-1 text-sm space-y-1">
                        <h6 className="text-[#0B7A4B] font-semibold">
                          Your Lists
                        </h6>
                        <li>
                          <Link
                            to="/"
                            className="block px-2 py-1 hover:bg-[#E8F3ED] rounded"
                          >
                            Create a List
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/"
                            className="block px-2 py-1 hover:bg-[#E8F3ED] rounded"
                          >
                            Wish From Any Website
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/"
                            className="block px-2 py-1 hover:bg-[#E8F3ED] rounded"
                          >
                            Baby Wishlist
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/"
                            className="block px-2 py-1 hover:bg-[#E8F3ED] rounded"
                          >
                            Discover Your Style
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/"
                            className="block px-2 py-1 hover:bg-[#E8F3ED] rounded"
                          >
                            Explore Showroom
                          </Link>
                        </li>
                      </ul>

                      {/* RIGHT */}
                      <ul className="flex-1 text-sm space-y-1 border-l pl-3">
                        <h6 className="text-[#0B7A4B] font-semibold">
                          Your Account
                        </h6>
                        <li>
                          <Link
                            to="/"
                            className="block px-2 py-1 hover:bg-[#E8F3ED] rounded"
                          >
                            Your Account
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/orders-list"
                            className="block px-2 py-1 hover:bg-[#E8F3ED] rounded"
                          >
                            Your Orders
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/"
                            className="block px-2 py-1 hover:bg-[#E8F3ED] rounded"
                          >
                            Your Wishlist
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/"
                            className="block px-2 py-1 hover:bg-[#E8F3ED] rounded"
                          >
                            Recommendations
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  /* LOGGED IN */
                  <div className="p-3">
                    {/* TOP SHORTCUTS */}
                    <ul className="flex justify-between mb-3 text-sm">
                      <li>
                        <Link
                          to="/user-setting"
                          className="px-3 py-1 hover:bg-gray-100 rounded"
                        >
                          Profile
                        </Link>
                      </li>

                      {dashboardPath && (
                        <li>
                          <Link
                            to={dashboardPath}
                            className="px-3 py-1 hover:bg-gray-100 rounded"
                          >
                            Dashboard
                          </Link>
                        </li>
                      )}


                      <li>
                        <button
                          onClick={handleLogout}
                          className="px-3 py-1 hover:bg-gray-100 rounded"
                        >
                          Logout
                        </button>
                      </li>
                    </ul>

                    <hr className="my-2 border-gray-300" />

                    {/* TWO COLUMN PANEL */}
                    <div className="flex gap-4 text-sm">
                      {/* LEFT COLUMN */}
                      <ul className="flex-1 space-y-1">
                        <li>
                          <Link
                            to="/orders"
                            className="block px-2 py-1 hover:bg-[#8e1c21] rounded"
                          >
                            Shopping List
                          </Link>
                        </li>
                      
                        <li>
                          <Link
                            to="/all-products"
                            className="block px-2 py-1 hover:bg-[#8e1c21] rounded"
                          >
                            Create Wish List
                          </Link>
                        </li>
                    

                        <hr className="border-gray-300" />
  <li>
                        <Link
                          to="/checkout"
                            className="block px-2 py-1 hover:bg-[#8e1c21] rounded"
                        >
                          Checkout
                        </Link>
                      </li> 
                        <li>
                          <Link
                            to="/explore"
                            className="block px-2 py-1 hover:bg-[#8e1c21] rounded"
                          >
                            Explore Showroom
                          </Link>
                        </li>
                      </ul>

                      {/* RIGHT COLUMN */}
                      <ul className="flex-1 space-y-1 border-l pl-3">
                        <li>
                          <Link
                            to="/switch-account"
                            className="block px-2 py-1 hover:bg-[#8e1c21] rounded"
                          >
                            Switch Account
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/orders"
                            className="block px-2 py-1 hover:bg-[#8e1c21] rounded"
                          >
                            Your Orders
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/wishlist"
                            className="block px-2 py-1 hover:bg-[#8e1c21] rounded"
                          >
                            Wishlist
                          </Link>
                        </li>
                        {/* <li>
                          <Link
                            to="/plans"
                            className="block px-2 py-1 hover:bg-[#8e1c21] rounded"
                          >
                            Subscriptions
                          </Link>
                        </li> */}
                        <li>
                          <Link
                            to="/library"
                            className="block px-2 py-1 hover:bg-[#8e1c21] rounded"
                          >
                            Content Library
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-row justify-center items-center">
            {/* Search Icon */}
            <button
              onClick={() => setOpen(true)}
              className="text-xl p-2 hover:scale-110 transition"
            >
              <ImSearch className="text-[#0B7A4B] w-5 h-5" />
            </button>

            {/* Popup Modal */}
            {open && (
              <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                <div className=" p-5 rounded-2xl shadow-xl min-w-[350px] relative bg-slate-200 mt-2">
                  {/* Close button */}
                  <button
                    onClick={() => setOpen(false)}
                    className="absolute  top-2 right-2 text-gray-600 hover:text-black "
                  >
                    <MdCancel />
                  </button>

                  <ProductSearch onClose={() => setOpen(false)} />
                </div>
              </div>
            )}
          </div>
          <NavbarCart />
          {/* Wishlist */}
          <div className="navbar-cart relative">
            <Link to="/wishlist">
              <FaHandHoldingHeart
                size={22}
                className="text-[#0B7A4B] w-6 h-6"
              />
              {wishCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold
                 flex items-center justify-center rounded-full w-5 h-5"
                >
                  {wishCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <DeliverTo onAssigned={(data) => console.log("Vendor set:", data)} />
    </>
  );
}

export default HeaderTop;
