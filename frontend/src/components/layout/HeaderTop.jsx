// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Link, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import { loadUser, logout } from "../../services/authService";
// import { FaHeart } from "react-icons/fa6";
// import { FaHandHoldingHeart } from "react-icons/fa";
// import { RiUserShared2Fill } from "react-icons/ri";
// import { FaCartArrowDown } from "react-icons/fa";
// import DeliverTo from "../../components/DeliverTo";
// import NavbarCart from "../../components/NavbarCart";
// function HeaderTop() {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const toggleMenu = () => setMenuOpen((v) => !v);

//   const navItems = [
//     { name: "Home", href: "/" },
//     { name: "About BBSCART", href: "/about" },
//     { name: "Partner Network", href: "/vendor-home" },
//     { name: "Gallery | Testimonials", href: "/gallery" },
//     { name: "Contact Us", href: "/contact" },
//     { name: "Legal And Blog", href: "/legal-and-blog" },
//   ];

//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { user, isAuthenticated } = useSelector((state) => state.auth);
//   const cartItems = useSelector((state) => state.cart.items);
//   const wishItems = useSelector((state) => state.wishlist.items);

//   const wishCount = Object.values(wishItems).length;

//   const [showHealthcareFrame, setShowHealthcareFrame] = useState(false);
//   const handleAssigned = (data) => {
//     // optional UI actions after assignment
//     // e.g., refresh products
//   };
//   useEffect(() => {
//     if (isAuthenticated) dispatch(loadUser());
//   }, [dispatch, isAuthenticated]);

//   const handleLogout = async (e) => {
//     e.preventDefault();
//     try {
//       await logout(dispatch);
//       toast.success("Successfully Logged Out");
//       navigate("/");
//     } catch (error) {
//       toast.error(error.message || "Logout Failed");
//     }
//   };

//   const userRole = user?.role;
//   const roleDashboardRoutes = {
//     admin: "/admin/dashboard",
//     seller: "/seller/dashboard",
//     agent: "/agent/dashboard",
//     customer: "/customer/dashboard",
//     franchise: "/franchise/dashboard",
//     territory_head: "/territory/dashboard",
//   };
//   const dashboardPath = userRole && roleDashboardRoutes[userRole];

//   if (showHealthcareFrame) {
//     return (
//       <div className="w-full h-screen">
//         <iframe
//           src="http://healthcare.bbscart.com/"
//           title="Health Access Products"
//           className="w-full h-full border-none"
//         />
//       </div>
//     );
//   }

//   return (
//     <>
//       <header className="flex flex-wrap items-center justify-between p-4 shadow">
//         {/* Left: Logo + Menu */}
//         {/* Left: Logo + Mobile Toggle */}
//         <div className="flex items-center justify-between w-full md:w-auto">
//           <Link to="/">
//             <img
//               src="/img/logo/BBSCART_LOGO.PNG"
//               alt="BBSCART Logo"
//               className="w-[130px] sm:w-[150px] h-auto"
//             />
//           </Link>

//           {/* Hamburger button (visible only on small screens) */}
//           <button
//             onClick={toggleMenu}
//             className="md:hidden text-primary text-2xl focus:outline-none"
//           >
//             <i className="ri-menu-3-fill"></i>
//           </button>
//         </div>

//         {/* Middle: Desktop Navigation */}
//         <nav className="hidden md:flex flex-1 flex-wrap justify-center gap-3 text-sm font-medium text-gray-700">
//           {navItems.map((item, idx) => (
//             <Link
//               key={idx}
//               to={item.href}
//               className="relative px-2 py-1 transition-all duration-200 ease-in-out transform
//               hover:scale-105 hover:-translate-y-[2px] hover:shadow-md hover:bg-primary hover:text-white hover:rounded-md"
//             >
//               {item.name}
//             </Link>
//           ))}
//         </nav>

//         {/* Mobile Dropdown Panel */}
//         {menuOpen && (
//           <div className="md:hidden w-25 mt-2 flex flex-row flex-wrap gap-2 text-gray-700 justify-center">
//             {navItems.map((item, idx) => (
//               <Link
//                 key={idx}
//                 to={item.href}
//                 onClick={() => setMenuOpen(false)} // close on click
//                 className="block px-4 py-2  hover:bg-primary hover:text-white transition rounded-lg "
//               >
//                 {item.name}
//               </Link>
//             ))}
//           </div>
//         )}
//         {/* Right: Search, User, Wishlist, Cart */}
//         <div className="flex items-center gap-4 w-full md:w-auto justify-center">
//           {/* Search */}
//           <form className="relative w-full max-w-[250px] hidden md:block">
//             <input
//               type="text"
//               placeholder="Search"
//               className="w-[150px] h-6 pl-4 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none"
//             />
//             <button
//               type="submit"
//               className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
//             >
//               <i className="ri-search-line text-l" />
//             </button>
//           </form>

//           {/* User */}
//           <div className="relative group">
//             <div className="flex items-center cursor-pointer">
//               <RiUserShared2Fill className="text-[#6b0e13] w-6 h-6" />
//             </div>
//             <div className="absolute right-15 top-full mb-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-10">
//               {!isAuthenticated ? (
//                 <>
//                   <div className="d-flex flex-column">
//                     {/* <span className="bb-btn-title font-Poppins transition-all duration-[0.3s] ease-in-out text-[12px] leading-[1] text-secondary mb-[4px] tracking-[0.6px] capitalize font-medium whitespace-nowrap">
//                         Account
//                       </span> */}
//                     {/* <span className="bb-btn-stitle font-Poppins transition-all duration-[0.3s] ease-in-out text-[14px] leading-[16px] font-semibold text-secondary  tracking-[0.03rem] whitespace-nowrap">
//                         Login
//                       </span> */}
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <span className="bb-btn-title font-Poppins transition-all duration-[0.3s] ease-in-out text-[12px] leading-[1] text-secondary mb-[4px] tracking-[0.6px] capitalize font-medium whitespace-nowrap">
//                     Welcome!
//                   </span>
//                   <span className="bb-btn-stitle font-Poppins transition-all duration-[0.3s] ease-in-out text-[14px] leading-[16px] font-semibold text-secondary  tracking-[0.03rem] whitespace-nowrap">
//                     {user?.name}
//                   </span>
//                 </>
//               )}
//             </div>
//             <ul className="absolute right-5 left-50 bottom-[-22px] top-30 mt-2 w-44 bg-white rounded-md shadow-md hidden group-hover:block  text-sm">
//               {!isAuthenticated ? (
//                 <>
//                   <li>
//                     <Link
//                       to="/register"
//                       className="block px-4 py-2 hover:bg-gray-100"
//                     >
//                       Register
//                     </Link>
//                   </li>
//                   <li>
//                     <Link
//                       to="/login"
//                       className="block px-4 py-2 hover:bg-gray-100"
//                     >
//                       Login
//                     </Link>
//                   </li>
//                 </>
//               ) : (
//                 <>
//                   <li>
//                     <Link
//                       to="/my-account"
//                       className="block px-4 py-2 hover:bg-gray-100"
//                     >
//                       Profile
//                     </Link>
//                   </li>
//                   {dashboardPath && (
//                     <li>
//                       <Link
//                         to={dashboardPath}
//                         className="block px-4 py-2 hover:bg-gray-100"
//                       >
//                         Dashboard
//                       </Link>
//                     </li>
//                   )}
//                   <li>
//                     <Link
//                       to="/checkout"
//                       className="block px-4 py-2 hover:bg-gray-100"
//                     >
//                       Checkout
//                     </Link>
//                   </li>
//                   <li>
//                     <button
//                       onClick={handleLogout}
//                       className="block w-full text-left px-4 py-2 hover:bg-gray-100"
//                     >
//                       Logout
//                     </button>
//                   </li>
//                 </>
//               )}
//             </ul>
//           </div>
//           <div className="navbar-cart">
//             {/* Wrap the whole cart icon */}
//             <Link to="/cart">
//               <FaCartArrowDown size={20} className="text-[#6b0e13] w-5 h-5" />
//             </Link>
//           </div>
//              <div className="navbar-cart">
//             {/* Wrap the whole cart icon */}
//             <Link to="/wishlist">
//               <FaHandHoldingHeart size={20} className="text-[#6b0e13] w-5 h-5" />
//             </Link>
//           </div>
//         </div>
//       </header>

//       <DeliverTo onAssigned={(data) => console.log("Vendor set:", data)} />
//     </>
//   );
// }

// export default HeaderTop;
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

function HeaderTop() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen((v) => !v);

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
  const wishCount = Object.values(wishItems).length;

  const [showHealthcareFrame, setShowHealthcareFrame] = useState(false);

  useEffect(() => {
    if (isAuthenticated) dispatch(loadUser());
  }, [dispatch, isAuthenticated]);

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

  return (
    <>
      <header className="flex flex-wrap items-center justify-between p-4 shadow">
        {/* Left: Logo + Mobile Toggle */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link to="/">
            <img
              src="/img/logo/BBSCART_LOGO.PNG"
              alt="BBSCART Logo"
              className="w-[130px] sm:w-[150px] h-auto"
            />
          </Link>

          {/* Hamburger button (visible only on small screens) */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-primary text-2xl focus:outline-none"
          >
            <i className="ri-menu-3-fill"></i>
          </button>
        </div>

        {/* Middle: Desktop Navigation */}
        <nav className="hidden md:flex flex-1 flex-nowrap  justify-center gap-5 text-sm font-medium text-gray-700">
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
            <div className="flex flex-row justify-center items-center">
              <ProductSearch />
            </div>
          </div>
        </nav>

        {/* Mobile Dropdown Panel */}
        {menuOpen && (
          <div className="md:hidden w-full mt-2 flex flex-row flex-wrap gap-2 text-gray-700 justify-center">
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
              <ProductSearch />
            </div>
          </div>
        )}

        {/* Right: User, Wishlist, Cart */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-center">
          {/* User */}
          <div className="relative group">
            <div className="flex items-center cursor-pointer">
              <RiUserShared2Fill className="text-[#6b0e13] w-6 h-6" />
            </div>
            <div className="relative text-center top-8 z-[99]">
              {/* Dropdown / menu */}
              <div
                className="
      absolute
      /* ---------- MOBILE (default) ---------- */
      left-[9rem] right-1 bottom-[28px] w-[30vw]  text-center 
      
      /* ---------- DESKTOP (sm and up) ---------- */
      sm:left-auto sm:right-[-82px] sm:top-[-5px] sm:bottom-auto sm:w-52 sm:text-left

      /* common styles */
        overflow-hidden p-0 px-2 
      transform sm:translate-y-2
      z-[99]
    "
                role="dialog"
                aria-label="User dropdown"
              >
                {isAuthenticated && (
                  <div className="flex flex-row gap-2 sm:flex-row sm:gap-2 items-center sm:items-start justify-center sm:justify-start">
                    <span className="bb-btn-title font-Poppins text-[11px] sm:text-[14px] text-black sm:text-white mb-[2px] sm:mb-[4px] capitalize">
                      Welcome!
                    </span>
                    <span className="bb-btn-stitle font-Poppins text-[13px] sm:text-[14px] font-semibold text-black sm:text-white">
                      {user?.name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <ul
              className=" rounded-lg
    absolute 
     p-3 mt-2  
     text-sm z-[99] 
    hidden group-hover:block

    /* 📱 Mobile (default) */
    left-28 right-18 bottom-[-54.2rem] w-[43vw] mx-auto text-black 

    /* 💻 Desktop (sm and up) */
    sm:left-[-85px] sm:right-18 sm:top-[85px] sm:bottom-auto sm:w-44 sm:text-left z-9999
  "
            >
              {!isAuthenticated ? (
                <>
                  <div
                    className="
                 absolute z-[99] border-2 bg-[#6b0e13] rounded-xl shadow-md 

    /* 📱 Mobile (default) */
          left-[-18rem] right-auto bottom-[16.5rem] w-[vw] mx-auto p-5

    /* 💻 Desktop (sm and up) */  
    sm:left-[-25rem] sm:right-auto sm:bottom-[-31.5rem] 
  "
                  >
                    <ul className="flex flex-row mt-2 justify-center">
                      <li>
                        <Link
                          to="/register"
                          className="block px-4 py-2 text-white text-xl hover:bg-[#8e1c21] rounded-lg"
                        >
                          Register
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/login"
                          className="block px-4 py-2 text-white text-xl hover:bg-[#8e1c21] rounded-lg"
                        >
                          Login
                        </Link>
                      </li>
                    </ul>
                    <hr className="border-t-1 border-[#ecd9da] my-2 w-full" />

                    <div className="flex flex-nowrap">
                      <div className="min-w-[180px]">
                        <ul className="flex flex-col">
                          <h6 className="text-white px-4 text-xs mt-3">
                            Your Lists
                          </h6>
                          <li>
                            <Link
                              to="/"
                              className="block px-4 py-2 text-white hover:bg-[#8e1c21] rounded-lg"
                            >
                              Create a List
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/"
                              className="block px-4 py-2 text-white hover:bg-[#8e1c21] rounded-lg"
                            >
                              Wish from Any Website
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/"
                              className="block px-4 py-2 text-white hover:bg-[#8e1c21] rounded-lg"
                            >
                              Baby Wishlist
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/"
                              className="block px-4 py-2 text-white hover:bg-[#8e1c21] rounded-lg"
                            >
                              Discover Your Style
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/"
                              className="block px-4 py-2 text-white hover:bg-[#8e1c21] rounded-lg"
                            >
                              Explore Showroom
                            </Link>
                          </li>
                        </ul>
                      </div>

                      <div classsName="min-w-[180px] ">
                        <ul className="flex flex-col border-l border-white pl-4">
                          <h6 className="text-white px-4 text-xs mt-3">
                            Your Account
                          </h6>
                          <li>
                            <Link
                              to="/"
                              className="block px-4 py-2 text-white hover:bg-[#8e1c21] rounded-lg"
                            >
                              Your Account
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/orders-list"
                              className="block px-4 py-2 text-white hover:bg-[#8e1c21] rounded-lg"
                            >
                              Your Orders
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/"
                              className="block px-4 py-2 text-white hover:bg-[#8e1c21] rounded-lg"
                            >
                              Your Wishlist
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/"
                              className="block px-4 py-2 text-white hover:bg-[#8e1c21] rounded-lg"
                            >
                              Keep shopping for
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/"
                              className="block px-4 py-2 text-white hover:bg-[#8e1c21] rounded-lg"
                            >
                              Your Recommendations
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/"
                              className="block px-4 py-2 text-white hover:bg-[#8e1c21] rounded-lg"
                            >
                              Your Membership
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/"
                              className="block px-4 py-2 text-white hover:bg-[#8e1c21] rounded-lg"
                            >
                              Your Prime Membership
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/"
                              className="block px-4 py-2 text-white hover:bg-[#8e1c21] rounded-lg"
                            >
                              Your Prime Video
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/"
                              className="block px-4 py-2 text-white hover:bg-[#8e1c21] rounded-lg"
                            >
                              Your Subscribe & Save Items
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/"
                              className="block px-4 py-2 text-white hover:bg-[#8e1c21] rounded-lg"
                            >
                              Membershios & Subscriptions
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/"
                              className="block px-4 py-2 text-white hover:bg-[#8e1c21] rounded-lg"
                            >
                              Your Seller Account
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/"
                              className="block px-4 py-2 text-white hover:bg-[#8e1c21] rounded-lg"
                            >
                              Manager Your Content and Device
                            </Link>
                          </li>
                          <a
                            href="#"
                            className="block text-center text-white mt-2 text-sm underline underline-offset-4 hover:text-[#fddede]"
                          >
                            Register for a free Business Account
                          </a>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className=" relative left-[-23rem] top-[-65px] z-[99]
bg-[#6b0e13] text-white border-2 border-[#8e1c21]
rounded-2xl shadow-lg p-6
w-[100vw]  sm:w-[90vw] md:w-[100vw] lg:w-[45vw]
 overflow-y-visible"
                  >
                    {/* Profile + Quick Links */}
                    <div className="flex flex-row justify-around text-xl flex-wrap">
                      <li>
                        <Link
                          to="/my-account"
                          className="block px-4 py-2 hover:bg-gray-100 rounded-lg"
                        >
                          Profile
                        </Link>
                      </li>

                      {dashboardPath && (
                        <li>
                          <Link
                            to={dashboardPath}
                            className="block px-4 py-2 hover:bg-gray-100 rounded-lg"
                          >
                            Dashboard
                          </Link>
                        </li>
                      )}

                      <li>
                        <Link
                          to="/checkout"
                          className="block px-4 py-2 hover:bg-gray-100 rounded-lg"
                        >
                          Checkout
                        </Link>
                      </li>

                      <li>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg"
                        >
                          Logout
                        </button>
                      </li>
                    </div>
                    {/* 📦 Dropdown Panel */}
                    <div
                      className="
      mt-3
      flex flex-row items-start justify-between gap-10
 
      overflow-y-auto
      z-50
    "
                    >
                      {/* 🛍️ Left Column: Lists */}
                      <ul className="flex flex-col space-y-1 w-1/2 pr-4 ">
                        <li>
                          <Link
                            to="/your-lists"
                            className="block px-4 py-2 hover:bg-[#8e1c21] rounded-lg"
                          >
                            Shopping List
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/your-lists"
                            className="block px-4 py-2 hover:bg-[#8e1c21] rounded-lg"
                          >
                            Shopping List
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/your-lists"
                            className="block px-4 py-2 hover:bg-[#8e1c21] rounded-lg"
                          >
                            Shopping List
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/your-lists"
                            className="block px-4 py-2 hover:bg-[#8e1c21] rounded-lg"
                          >
                            Shopping List
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/your-lists"
                            className="block px-4 py-2 hover:bg-[#8e1c21] rounded-lg"
                          >
                            Shopping List
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/"
                            className="block px-4 py-2 hover:bg-[#8e1c21] rounded-lg"
                          >
                            See More
                          </Link>
                        </li>

                        <hr className="border-t border-[#ecd9da] my-2 w-full" />

                        <li>
                          <Link
                            to="/"
                            className="block px-4 py-2 hover:bg-[#8e1c21] rounded-lg"
                          >
                            Create a Wish List
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/"
                            className="block px-4 py-2 hover:bg-[#8e1c21] rounded-lg"
                          >
                            Wish from Any Website
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/"
                            className="block px-4 py-2 hover:bg-[#8e1c21] rounded-lg"
                          >
                            Baby Wishlist
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/"
                            className="block px-4 py-2 hover:bg-[#8e1c21] rounded-lg"
                          >
                            Discover Your Style
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/"
                            className="block px-4 py-2 hover:bg-[#8e1c21] rounded-lg"
                          >
                            Explore Showroom
                          </Link>
                        </li>
                      </ul>

                      {/* 👤 Right Column: Account */}
                      <ul className="flex flex-col space-y-1 w-1/2 pl-4 border-l border-[#dbcece]">
                        <li>
                          <Link
                            to="/switch-account"
                            className="block px-4 py-2 hover:bg-[#8e1c21] rounded-lg"
                          >
                            Switch Accounts
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/logout"
                            className="block px-4 py-2 hover:bg-[#8e1c21] rounded-lg"
                          >
                            Sign Out
                          </Link>
                        </li>

                        <hr className="border-t border-[#ecd9da] my-2 w-full" />

                        <li>
                          <Link
                            to="/account"
                            className="block px-4 py-2 hover:bg-[#8e1c21] rounded-lg"
                          >
                            Your Account
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/orders"
                            className="block px-4 py-2 hover:bg-[#8e1c21] rounded-lg"
                          >
                            Your Orders
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/wishlist"
                            className="block px-4 py-2 hover:bg-[#8e1c21] rounded-lg"
                          >
                            Your Wishlist
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/continue-shopping"
                            className="block px-4 py-2 hover:bg-[#8e1c21] rounded-lg"
                          >
                            Keep Shopping For
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/recommendations"
                            className="block px-4 py-2 hover:bg-[#8e1c21] rounded-lg"
                          >
                            Your Recommendations
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/safety-alerts"
                            className="block px-4 py-2 hover:bg-[#8e1c21] rounded-lg"
                          >
                            Recalls & Product Safety Alerts
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/membership"
                            className="block px-4 py-2 hover:bg-[#8e1c21] rounded-lg"
                          >
                            Your Membership
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/prime-video"
                            className="block px-4 py-2 hover:bg-[#8e1c21] rounded-lg"
                          >
                            Your Video
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/subscriptions"
                            className="block px-4 py-2 hover:bg-[#8e1c21] rounded-lg"
                          >
                            Your Subscribe & Save Items
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/plans"
                            className="block px-4 py-2 hover:bg-[#8e1c21] rounded-lg"
                          >
                            Memberships & Subscriptions
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/seller-account"
                            className="block px-4 py-2 hover:bg-[#8e1c21] rounded-lg"
                          >
                            Your Seller Account
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/library"
                            className="block px-4 py-2 hover:bg-[#8e1c21] rounded-lg"
                          >
                            Content Library
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/devices"
                            className="block px-4 py-2 hover:bg-[#8e1c21] rounded-lg"
                          >
                            Devices
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/business-register"
                            className="block px-4 py-2 underline underline-offset-4 hover:text-[#fddede]"
                          >
                            Register for a Free Business Account
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </>
              )}
            </ul>
          </div>

          <NavbarCart />
          {/* Wishlist */}
          <div className="navbar-cart">
            <Link to="/wishlist">
              <FaHandHoldingHeart
                size={20}
                className="text-[#6b0e13] w-5 h-5"
              />
            </Link>
          </div>
        </div>
      </header>

      <DeliverTo onAssigned={(data) => console.log("Vendor set:", data)} />
    </>
  );
}

export default HeaderTop;
