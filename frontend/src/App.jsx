import './common.css'; 
import './ProductSlider.css'; 
import './bannerOne.css'; 
import './SingleProduct.css'; 
import React, { useState, useEffect } from "react"; 
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from "react-router-dom"; 
import HeaderTop from './components/layout/HeaderTop'; 
import Navbar from './components/layout/Navbar'; 
import HomePage from './components/pages/HomePage'; 
import FooterTop from './components/layout/FooterTop'; 
import SingleProductPage from './components/pages/SingleProductPage'; 
import ProductsCategoryPage from './components/pages/ProductsCategoryPage'; 
import ProductsSubCategoryPage from './components/pages/ProductsSubCategoryPage'; 
import CartPage from './components/pages/CartPage';  
import Login from './components/auth/Login'; 
import Register from './components/auth/Register'; 

import Forgot from './components/auth/ForgotPassword'; 
import ResetPassword from "./components/auth/ResetPassword"; 
import { Toaster } from 'react-hot-toast'; 
import CheckoutPage from './components/pages/CheckoutPage'; 
import WishlistPage from './components/pages/WishlistPage'; 
import ProductsListPage from './components/pages/admin/ProductsListPage';   
import ProtectedRoute from './components/ProtectedRoute';  
import AdminDashboard from './components/admin/Dashboard'; 
import Products from './components/admin/Products'; 
import Categories from './components/admin/Categories'; 
import SubCategories from './components/admin/SubCategories'; 
import Orders from './components/admin/Orders';  
import MyAccount from './components/auth/MyAccount';
import Vendor from './components/admin/Vendor';
import Customers from './components/admin/Customers';
import OtherUser from './components/admin/OtherUser';
import UserRequest from './components/admin/UserRequest';
import BecomeAgent from './components/auth/BecomeAgent'; 
import BecomeFranchiseHead from './components/auth/BecomeFranchiseHead'; 
import BecomeTerritoryHead from './components/auth/BecomeTerritoryHead'; 
import CustomerOrders from './components/auth/Orders'; 

import AboutPage from './components/pages/AboutPage';
import TermsOfUse from './components/pages/TermsOfUse';
import ServicesTermsOfUse from './components/pages/ServicesTermsofUse';
import PrivacyPolicy from './components/pages/PrivacyPolicy';
import CancellationPolicy from './components/pages/CancellationPolicy';
import ShippingPolicy from './components/pages/ShippingPolicy';
import RefundPolicy from './components/pages/RefundPolicy';
import ExchangePolicy from './components/pages/ExchangePolicy';
import BuybackPolicy from './components/pages/BuybackPolicy';
import BankCashbackPolicy from './components/pages/BankCashbackPolicy';
import ContactUs from './components/pages/ContactUs';
import ThiaPage from './components/pages/ThiaPage';

import SellerDashboard from './components/seller/Dashboard';
import SellerProducts from './components/seller/Products';
import SellerCategories from './components/seller/Categories';
import SellerSubCategories from './components/seller/SubCategories';
import SellerOrders from './components/seller/Orders';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './services/authService';
import { fetchCartItems } from './slice/cartSlice';
import { fetchWishlistItems } from './slice/wishlistSlice';

import ScrollToTopOnRouteChange from "./components/ScrollToTopOnRouteChange";
import CustomerBecomeVendor from './components/auth/CustomerBecomeVendor';
import GalleryMediaTestimonials from './components/pages/GalleryMediaTestimonials';
import LegalAndBlogPage from './components/pages/LegalAndBlogPage';
import BBSCARTCMSPage from './components/pages/admin/cms/BBSCARTCMSPage';
import ThiaJewelleryCMS from './components/pages/admin/ThiaJewelleryCMS/ThiaJewelleryCMS';
import AllProducts from './components/home/AllProducts';
import FruitsDetails from './components/home/Fruits';
import GroceryDetails from './components/home/Grocery';
import PricingPage from './components/home/PricingPage';
import VendorForm from './components/admin/VendorForm';
import VendorSuccess from './components/VendorSuccess';
import FranchiseHeadForm from './components/admin/FranchiseHeadForm';
import AgentForm from './components/admin/AgentForm';
import AgentSuccess from './components/AgentSuccess';
import FranchiseSuccess from './components/FranchiseSuccess';
import TerritoryHeadSuccess from './components/TerritoryHeadSuccess';
import TerritoryHeadForm from './components/admin/TerritoryHeadForm';
import CustomerBecomeVendorForm from './components/admin/CustomerBecomeVendorForm';
import CustomerBecomeVendorSuccess from './components/CustomerBecomeVendorSuccess';
// import CheckoutPage from './components/home/CheckoutPage';

// Products App Component
import CategoryPage from "./storefront/pages/CategoryPage";
import SubcategoryPage from "./storefront/pages/SubcategoryPage";
import ProductDetails from "./storefront/pages/ProductDetails";
import AdminVendorsPage from "./components/pages/admin/AdminVendorsPage";
import AdminFranchiseesPage from "./components/pages/admin/AdminFranchiseesPage";
import AdminVendorRequestsPage from "./components/pages/AdminVendorRequestsPage";
import AdminFranchiseRequestsPage from "./components/pages/admin/AdminFranchiseRequestsPage";
import AdminTerritoryRequestsPage from "./components/pages/AdminTerritoryRequestsPage";
import AdminTerritoriesPage from "./components/pages/AdminTerritoriesPage";
import AdminAgentsPage from './components/pages/admin/AdminAgentsPage';
import AdminAgentRequestsPage from './components/pages/AdminAgentRequestsPage';
import AdminCustomerVendorsPage from './components/pages/AdminCustomerVendorsPage';
import AdminCustomerVendorRequestsPage from './components/pages/admin/AdminCustomerVendorRequestsPage';

// 30/09/25 - AdminVendorCredentials
import AdminVendorCredentials from "./components/admin/AdminVendorCredentials";
import VendorSetPassword from "./components/pages/VendorSetPassword";
function App() {
  const dispatch = useDispatch();
  const location = useLocation(); // Get the current route
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const excludeRoutes = ['/login', '/register'];

    if (!excludeRoutes.includes(location.pathname)) {
      // if(isAuthenticated){
        dispatch(loadUser());
      // }
      dispatch(fetchCartItems());
      dispatch(fetchWishlistItems());
    }
  }, [dispatch, location.pathname]); // Re-run when location changes

  const [menuOpen, setMenuOpen] = useState(false);
  const [shouldRenderHeaderFooter, setShouldRenderHeaderFooter] = useState(true);

  const toggleMenu = () => {
    setMenuOpen(true);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  useEffect(() => {
    const checkHeaderFooter = () => {
      const excludeHeaderFooterRoutes = ['/admin/dashboard', '/admin/products', '/admin/orders', '/admin/products/categories', '/admin/products/subcategories', '/admin/other-users', '/admin/customers', '/admin/vendors', '/seller/dashboard', '/seller/products', '/seller/orders', '/seller/products/categories', '/seller/products/subcategories', '/admin/users-request', '/thia'];
      setShouldRenderHeaderFooter(!excludeHeaderFooterRoutes.includes(location.pathname));
    };

    checkHeaderFooter();
  }, [location.pathname]); // Update when the location changes

  const AdminRoutes = () => <ProtectedRoute requiredRole="admin" />;
  const SellerRoutes = () => <ProtectedRoute requiredRole="seller" />;

  return (
    <>
      {shouldRenderHeaderFooter && <HeaderTop toggleMenu={toggleMenu} />}
      {shouldRenderHeaderFooter && (
        <Navbar menuOpen={menuOpen} closeMenu={closeMenu} />
      )}
      <ScrollToTopOnRouteChange />
      <Routes>
        <Route path="/c/:categoryId" element={<CategoryPage />} />
        <Route
          path="/subcategory/:subcategoryId"
          element={<SubcategoryPage />}
        />
        <Route path="/p/:id" element={<ProductDetails />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<SingleProductPage />} />
        <Route
          path="/product/category/:category"
          element={<ProductsCategoryPage />}
        />
        <Route
          path="/product/subcategory/:subcategory"
          element={<ProductsSubCategoryPage />}
        />
        <Route path="/gallery" element={<GalleryMediaTestimonials />} />
        <Route path="/legal-and-blog" element={<LegalAndBlogPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/customer-become-a-vendor"
          element={<CustomerBecomeVendorForm />}
        />
        {/* <Route path="/become-a-vendor" element={<BecomeVendor />} /> */}
        <Route path="/become-a-vendor" element={<VendorForm />} />
        <Route path="/become-a-agent" element={<AgentForm />} />
        <Route
          path="/become-a-territory-head"
          element={<TerritoryHeadForm />}
        />
        <Route
          path="/become-a-franchise-head"
          element={<FranchiseHeadForm />}
        />
        <Route path="/forgot-password" element={<Forgot />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/adminproduct" element={<ProductsListPage />} />
        <Route path="/my-account" element={<MyAccount />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route path="/services-terms-of-use" element={<ServicesTermsOfUse />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/cancellation-policy" element={<CancellationPolicy />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/exchange-policy" element={<ExchangePolicy />} />
        <Route path="/buyback-policy" element={<BuybackPolicy />} />
        <Route path="/bank-cashback-policy" element={<BankCashbackPolicy />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/orders" element={<CustomerOrders />} />
        <Route path="/thia" element={<ThiaPage />} />
        <Route path="/vendor-success" element={<VendorSuccess />} />
        <Route path="/agent-head-success" element={<AgentSuccess />} />
        <Route path="/franchisee-success" element={<FranchiseSuccess />} />
        <Route path="/admin/vendors" element={<AdminVendorsPage />} />
        <Route path="/admin/franchisees" element={<AdminFranchiseesPage />} />
        <Route
          path="/admin/requests/territories"
          element={<AdminTerritoryRequestsPage />}
        />
        <Route path="/admin/territories" element={<AdminTerritoriesPage />} />
        <Route
          path="/admin/agent-requests"
          element={<AdminAgentRequestsPage />}
        />
        <Route
          path="/admin/customer-vendor-requests"
          element={<AdminCustomerVendorRequestsPage />}
        />
        <Route
          path="/admin/customer-vendors"
          element={<AdminCustomerVendorsPage />}
        />
        <Route path="/admin/agents" element={<AdminAgentsPage />} />
        <Route
          path="/admin/requests/vendors"
          element={<AdminVendorRequestsPage />}
        />
        <Route
          path="/admin/requests/franchisees"
          element={<AdminFranchiseRequestsPage />}
        />
        <Route
          path="/customer-become-vendor-success"
          element={<CustomerBecomeVendorSuccess />}
        />
        <Route
          path="territory-head-success"
          element={<TerritoryHeadSuccess />}
        />
        {
          // 30/09/25 - AdminVendorCredentials
        }
        <Route
          path="/admin/vendor-credentials"
          element={<AdminVendorCredentials />}
        />

        <Route
          path="/vendor/set-password/:token"
          element={<VendorSetPassword />}
        />
        {/* Home Page card navigation */}
        <Route path="/all-products" element={<AllProducts />} />
        <Route path="/fruits" element={<FruitsDetails />} />
        <Route path="/grocery" element={<GroceryDetails />} />
        {/* ✅ Home>PricingPage */}
        <Route path="/pricing" element={<PricingPage />} />
        {/* ✅ Checkout */}
        {/* <Route path="/checkout" element={<CheckoutPage />} /> */}
        {/* ✅ Admin Routes */}
        <Route path="/admin" element={<AdminRoutes />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/categories" element={<Categories />} />
          <Route path="products/subcategories" element={<SubCategories />} />
          <Route path="orders" element={<Orders />} />
          <Route path="vendors" element={<Vendor />} />
          <Route path="customers" element={<Customers />} />
          <Route path="other-users" element={<OtherUser />} />
          <Route path="users-request" element={<UserRequest />} />
        </Route>
        {/* ✅ Seller Routes */}
        <Route path="/seller" element={<SellerRoutes />}>
          <Route path="dashboard" element={<SellerDashboard />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="products/categories" element={<SellerCategories />} />
          <Route
            path="products/subcategories"
            element={<SellerSubCategories />}
          />
          <Route path="orders" element={<SellerOrders />} />

          {/* <Route path="products" element={<ProductsPage />} /> */}
        </Route>
        {/* Made by medun */}
        {/* GLOBAL CMS CORE MODULES (Shared Across All 3) */}
        <Route path="/admin-cms" element={<BBSCARTCMSPage />}>
          <Route path="dashboard" element={<BBSCARTCMSPage />} />
        </Route>
        {/* Thia CMS */}
        <Route path="/thia-jewellery-cms" element={<ThiaJewelleryCMS />}>
          <Route path="dashboard" element={<BBSCARTCMSPage />} />
        </Route>
      </Routes>

      {shouldRenderHeaderFooter && <FooterTop />}
      <Toaster position="top-right" />
    </>
  );
}

// Router wrapper in index.js or App.js to ensure that useLocation works correctly
export default function RootApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
