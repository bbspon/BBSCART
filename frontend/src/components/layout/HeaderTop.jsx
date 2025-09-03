import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loadUser, logout } from "../../services/authService";
import { fetchCartItems } from "../../slice/cartSlice";
import CartPopup from "./CartPopup";
import { FaHeart, FaCartArrowDown } from "react-icons/fa6";
import { RiUserShared2Fill } from "react-icons/ri";
import DeliverTo from "../../components/DeliverTo";
function HeaderTop({ toggleMenu }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishItems = useSelector((state) => state.wishlist.items);

  const cartCount = Object.values(cartItems).length;
  const wishCount = Object.values(wishItems).length;

  const [cartPopup, setCartPopup] = useState(false);
  const [showHealthcareFrame, setShowHealthcareFrame] = useState(false);
  const handleAssigned = (data) => {
    // optional UI actions after assignment
    // e.g., refresh products
  };
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
      <header className="w-full bg-white shadow z-50">
        <div className=" flex flex-col md:flex-row md:items-center md:justify-between  px-4 md:py-3 gap-4">
          {/* Left: Logo + Menu */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link to="/">
              <img
                src="/img/logo/BBSCART_LOGO.PNG"
                alt="BBSCART Logo"
                className="w-[130px] sm:w-[150px] h-auto"
              />
            </Link>

            <button
              onClick={toggleMenu}
              className="md:hidden text-primary text-2xl"
            >
              <i className="ri-menu-3-fill"></i>
            </button>
          </div>

          {/* Middle: Navigation */}
          <nav className="flex-1 flex flex-wrap justify-center gap-3 text-sm font-medium text-gray-700">
            {[
              { name: "Home", href: "/" },
              { name: "About BBSCART", href: "/about" },
              // {
              //   name: "Health Access | Products",
              //   onClick: () => setShowHealthcareFrame(true),
              // },
              { name: "Partner Network", href: "/vendor-home" },
              { name: "Gallery | Testimonials", href: "/gallery" },
              { name: "Contact Us", href: "/contact" },
              { name: "Legal And Blog", href: "/legal-and-blog" },
            ].map((item, idx) =>
              item.href ? (
                <Link
                  key={idx}
                  to={item.href}
                  className="relative px-2 py-1 transition-all duration-200 ease-in-out transform 
        hover:scale-105 hover:-translate-y-[2px] hover:shadow-md hover:bg-primary hover:text-white hover:rounded-md"
                >
                  {item.name}
                </Link>
              ) : (
                <button
                  key={idx}
                  onClick={item.onClick}
                  className="relative px-2 py-1 transition-all duration-200 ease-in-out transform 
        hover:scale-105 hover:-translate-y-[2px] hover:shadow-md hover:bg-primary hover:text-white hover:rounded-md"
                >
                  {item.name}
                </button>
              )
            )}
          </nav>

          {/* Right: Search, User, Wishlist, Cart */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            {/* Search */}
            <form className="relative w-full max-w-[250px] hidden md:block">
              <input
                type="text"
                placeholder="Search"
                className="w-[150px] h-6 pl-4 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
              >
                <i className="ri-search-line text-l" />
              </button>
            </form>

            {/* User */}
            <div className="relative group">
              <div className="flex items-center cursor-pointer">
                <RiUserShared2Fill className="text-red-600 w-6 h-6" />
              </div>
              <div className="absolute right-15 top-full mb-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-10">
                {!isAuthenticated ? (
                  <>
                    <div className="d-flex flex-column">
                      <span className="bb-btn-title font-Poppins transition-all duration-[0.3s] ease-in-out text-[12px] leading-[1] text-secondary mb-[4px] tracking-[0.6px] capitalize font-medium whitespace-nowrap">
                        Account
                      </span>
                      <span className="bb-btn-stitle font-Poppins transition-all duration-[0.3s] ease-in-out text-[14px] leading-[16px] font-semibold text-secondary  tracking-[0.03rem] whitespace-nowrap">
                        Login
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="bb-btn-title font-Poppins transition-all duration-[0.3s] ease-in-out text-[12px] leading-[1] text-secondary mb-[4px] tracking-[0.6px] capitalize font-medium whitespace-nowrap">
                      Welcome!
                    </span>
                    <span className="bb-btn-stitle font-Poppins transition-all duration-[0.3s] ease-in-out text-[14px] leading-[16px] font-semibold text-secondary  tracking-[0.03rem] whitespace-nowrap">
                      {user?.name}
                    </span>
                  </>
                )}
              </div>
              <ul className="absolute right-5 left-50 bottom-[-22px] top-30 mt-2 w-44 bg-white rounded-md shadow-md hidden group-hover:block  text-sm">
                {!isAuthenticated ? (
                  <>
                    <li>
                      <Link
                        to="/register"
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        Register
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/login"
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        Login
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link
                        to="/my-account"
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                    </li>
                    {dashboardPath && (
                      <li>
                        <Link
                          to={dashboardPath}
                          className="block px-4 py-2 hover:bg-gray-100"
                        >
                          Dashboard
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link
                        to="/checkout"
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        Checkout
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative">
              <FaHeart className="text-red-600 w-5 h-5" />
              {wishCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1 rounded-full">
                  {wishCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => {
                setCartPopup(true);
                dispatch(fetchCartItems());
              }}
              className="relative"
            >
              <FaCartArrowDown className="text-red-600 w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Cart Popup */}
      <CartPopup cartPopup={cartPopup} setCartPopup={setCartPopup} />
      <DeliverTo onAssigned={(data) => console.log("Vendor set:", data)} />
    </>
  );
}

export default HeaderTop;
