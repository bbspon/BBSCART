import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './components/pages/HomePage';
import SingleProductPage from './components/pages/SingleProductPage';
import ProductsCategoryPage from './components/pages/ProductsCategoryPage';
import CartPage from './components/pages/CartPage';
import CheckoutPage from './components/pages/CheckoutPage';
import ProductsList from './components/pages/admin/ProductsListPage';

function AppRoutes() {
    const location = useLocation();

    useEffect(() => {
        // Scroll to top whenever the route changes
        window.scrollTo(0, 0);
    }, [location]);

    return (
        <Routes>
            {/* Default Route */}
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<SingleProductPage />} />
            <Route path="/product/category/:category" element={<ProductsCategoryPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/adminproduct" element={<ProductsList />} />
            {/* Add additional routes as needed */}
        </Routes>
    );
}

export default AppRoutes;