import React, { useEffect } from "react";
import HeroSection from "../home/HeroSection";
import SectionCategory from "../home/SectionCategory";
import AnimationCards from "../home/AnimationCards";
import OfferSection from "../home/OfferSection";
import TrendingItems from "../home/TrendingItems";
import HeroVideoCarousel from "../home/HeroVideoCarousel";
import VendorSlider from "../home/VendorSlider";
import WhatsAppChat from "../home/WhatsAppChat";
import ProductList from "../products/ProductList";
import BannerOne from "../home/BannerOne";
import Services from "../home/Services";
import CallToActionSection from "../home/CallToActionSection";
import { useLocation } from "react-router-dom";
import AppDownloadCTA from "../layout/AppDownloadCTA";
import ProductsPage from "./ProductsPage";
import Discount from "../home/Discount";
import GroceryMap from "./GroceryMap";

function HomePage() {
  const location = useLocation();
  useEffect(() => {
    // Scroll to top whenever the route changes
    window.scrollTo(0, 0);
  }, [location]);
  return (
    <>
      <div>
        <HeroSection />
        <div className="homepage bbscontainer">
          <SectionCategory />
          <div className="py-8">
            <Discount />
          </div>
          <div className="home">
            <ProductList heading="Grocery Items" type="Slider" />
          </div>
          <TrendingItems />
          <VendorSlider />
          <ProductsPage />

          <AnimationCards />
          <OfferSection />
          <HeroVideoCarousel />
          <WhatsAppChat />
          <GroceryMap />
          <AppDownloadCTA />
        </div>
        <CallToActionSection />
        <div className="homepage bbscontainer">
          <BannerOne />
          <Services />
        </div>
      </div>
      {/* Page Content */}
    </>
  );
}

export default HomePage;
