import React from "react";

const About = () => {
  return (
    <div className="bbscontainer py-12 max-w-5xl mx-auto px-4">
      <div className="w-full">
        {/* ABOUT SECTION */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">About Us</h1>
        <p className="text-base text-gray-700 mb-4">
          Welcome to <strong>BBSCART.COM</strong>, the next-generation online marketplace from the visionary team at <strong>BBSOCEAN Online Shopping Group</strong> — designed to <strong>transform how India shops, invests, and grows</strong>.
        </p>
        <p className="text-base text-gray-700 mb-4">
          BBSCART unites <strong>products, jewellery, services, and financial empowerment</strong> under one dynamic ecosystem — connecting local sellers, urban and rural buyers, investors, and small businesses through technology.
        </p>
        <p className="text-base text-gray-700 mb-4">
          From fashion and electronics to groceries and gold ownership — everything is powered by transparency, affordability, and local empowerment.
        </p>
        <p className="text-base text-gray-700 mb-6 font-semibold">
          Our promise: <span className="text-primary">Superior Quality</span>. <span className="text-primary">Unbeatable Prices</span>. <span className="text-primary">Lightning-Fast Delivery</span>.
        </p>

        {/* HIGHLIGHTS */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Key Highlights</h2>
        <ul className="list-disc list-inside text-base text-gray-700 mb-6 space-y-2">
          <li>⚡ Exciting Daily Deals, Festival Offers, and Discount Coupons</li>
          <li>🔁 Vendor Cross-Selling: Promote & earn from BBSCART partner products</li>
          <li>💰 Secure Payments via Golldex Wallet – loyalty + gold-backed investment</li>
          <li>🤝 Empowering Local Sellers: Franchise, Territory Head & Agent Model</li>
          <li>🏆 Own Real Gold with 40% upfront via Thia Secure Plan (BIS Certified)</li>
        </ul>

        {/* JEWELLERY & ETHOS */}
        <p className="text-base text-gray-700 mb-4">
          ✨ We are proud to launch <strong>THIAWORLD Jewellery</strong> exclusively on BBSCART — where tradition meets modern craftsmanship.
        </p>
        <p className="text-base text-gray-700 mb-6">
          Explore a handpicked collection of BIS-certified gold and diamond jewelry, ethically sourced and made accessible through smart investment plans.
        </p>

        {/* VISION */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Our Vision</h2>
        <p className="text-base text-gray-700 mb-4 italic">
          “To create India’s most trusted digital marketplace — empowering millions with smarter shopping, secure investing, and endless possibilities.”
        </p>
        <p className="text-base text-gray-700 mb-6">
          With <strong>BBSCART.COM</strong>, shopping isn’t just about buying — it’s about building a better financial future and unlocking new entrepreneurial paths.
        </p>

        {/* TIMELINE (optional UI) */}
        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">Our Journey So Far</h2>
        <ul className="list-disc list-inside text-base text-gray-700 mb-6 space-y-1">
          <li>📌 2023 – BBSCART Conceptualized & Business Model Designed</li>
          <li>🚀 2024 – Infrastructure Setup, Vendor Partnerships, Wallet Dev</li>
          <li>🛍️ 2025 – National Launch, Health + Gold Services Live</li>
          <li>🌐 2026+ – Expansion to GCC, AI Assistant, White-Label Partners</li>
        </ul>

        {/* SOCIAL MEDIA */}
        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">Social Media & Profiles</h2>
        <ul className="text-base text-blue-600 list-disc list-inside mb-6 space-y-1">
          <li>
            <a href="https://www.linkedin.com/in/pavarasu-mayavan-50a171355/" target="_blank" rel="noopener noreferrer">
              🔗 LinkedIn – Leadership & Company Vision
            </a>
          </li>
          <li>
            <a href="https://www.instagram.com/bbscart/?hl=en" target="_blank" rel="noopener noreferrer">
              📸 Instagram – Live Events, Promotions & Community
            </a>
          </li>
          <li>
            <a href="https://www.facebook.com/profile.php?id=100090804256179" target="_blank" rel="noopener noreferrer">
              👍 Facebook – Marketplace & Support Updates
            </a>
          </li>
          <li>
            <a href="https://www.youtube.com/channel/UCNiBeRvAW1bQOUEcaqc0hYA" target="_blank" rel="noopener noreferrer">
              ▶️ YouTube – Product Walkthroughs, Testimonials
            </a>
          </li>
        </ul>

        {/* CONTACT INFO */}
        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">Contact Us</h2>
        <p className="text-base text-gray-700 mb-1">
          📍 <strong>Address:</strong> No.7, II Floor, Bharathi Street, Ist Cross, Anna Nagar Extension, Puducherry – 605 005
        </p>
        <p className="text-base text-gray-700 mb-1">
          ☎️ <strong>Landline:</strong> +91 413 291 5916
        </p>
        <p className="text-base text-gray-700 mb-4">
          📱 <strong>Mobile:</strong> +91 96007 29596
        </p>
      </div>
    </div>
  );
};

export default About;
