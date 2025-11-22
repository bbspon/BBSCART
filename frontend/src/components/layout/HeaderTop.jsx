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
import { ImSearch } from "react-icons/im";
import { MdCancel } from "react-icons/md";
function HeaderTop() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen((v) => !v);
  const [open, setOpen] = useState(false);
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
const closePopup = () => setShowUserPopup(false);

  return (
    <>
      <header
        onClick={closePopup}
        className="sticky top-0 z-[999] flex flex-wrap items-center justify-between p-4 shadow bg-white"
      >
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
              <ProductSearch />
            </div>
          </div>
        )}

        {/* Right: User, Wishlist, Cart */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-center">
          {/* User */}
          <div className="relative group flex items-center gap-2">
            {/* Welcome text placed left of the icon */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <span
                  className="bb-btn-title font-sans font-semibold tracking-tight text-[14px]
 text-[#6b0e13]"
                >
                  Welcome!
                </span>
                <span className="bb-btn-stitle font-Poppins text-[13px] font-semibold text-[#6b0e13]">
                  {user?.name}
                </span>
              </div>
            ) : (
              <div className="hidden sm:block">
                <span className="text-sm text-[#0B7A4B] font-bold">
                  Welcome!
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
              <div
                className="
                absolute
                /* ---------- MOBILE (default) ---------- */
                left-[-0.2rem] right-1 bottom-[8px] w-[30vw]  text-center 
      
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
                          to="/my-account"
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
                        <Link
                          to="/checkout"
                          className="px-3 py-1 hover:bg-gray-100 rounded"
                        >
                          Checkout
                        </Link>
                      </li>

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
                            to="/your-lists"
                            className="block px-2 py-1 hover:bg-[#8e1c21] rounded"
                          >
                            Shopping List
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/your-lists"
                            className="block px-2 py-1 hover:bg-[#8e1c21] rounded"
                          >
                            Wish List
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/"
                            className="block px-2 py-1 hover:bg-[#8e1c21] rounded"
                          >
                            See More
                          </Link>
                        </li>

                        <hr className="border-gray-300" />

                        <li>
                          <Link
                            to="/"
                            className="block px-2 py-1 hover:bg-[#8e1c21] rounded"
                          >
                            Create Wish List
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/"
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
                        <li>
                          <Link
                            to="/plans"
                            className="block px-2 py-1 hover:bg-[#8e1c21] rounded"
                          >
                            Subscriptions
                          </Link>
                        </li>
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

                  <ProductSearch />
                </div>
              </div>
            )}
          </div>
          <NavbarCart />
          {/* Wishlist */}
          <div className="navbar-cart">
            <Link to="/wishlist">
              <FaHandHoldingHeart
                size={20}
                className="text-[#0B7A4B] w-5 h-5"
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
