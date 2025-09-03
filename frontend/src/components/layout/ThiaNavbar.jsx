import React, { useState } from "react";
import { Link } from "react-router-dom";

// Replace react-icons with remixicon class names
const categories = [
  {
    key: "All",
    label: "All Categories",
    icon: <i className="ri-apps-2-fill"></i>,
    href: "/all-jewellery",
  },
  {
    key: "Bangles",
    label: "Bangles & Bracelets",
    icon: <i className="ri-fire-fill"></i>,
    href: "/bangle",
  },
  {
    key: "Necklaces",
    label: "Necklaces",
    icon: <i className="ri-h3"></i>,
    href: "/necklace",
  },
  {
    key: "Earrings",
    label: "Earrings",
    icon: <i className="ri-earbuds-line"></i>,
    href: "/earring",
  },
  {
    key: "Chains",
    label: "Chains",
    icon: <i className="ri-link"></i>,
    href: "/chain",
  },
  {
    key: "Rings",
    label: "Rings",
    icon: <i className="ri-ring-line"></i>,
    href: "/ring",
  },
  {
    key: "Pendants",
    label: "Pendants",
    icon: <i className="ri-shield-star-line"></i>,
    href: "/pendant",
  },
  {
    key: "NewArrivals",
    label: "New Arrivals",
    icon: <i className="ri-newspaper-line"></i>,
    href: "/new-arrivals",
  },
  {
    key: "FestiveOffers",
    label: "Festive Offers",
    icon: <i className="ri-gift-fill"></i>,
    href: "/festive-offers",
  },
];

const subCategories = {
  All: {
    styles: [
      "Earrings",
      "Pendants",
      "Rings",
      "Bangles & Bracelets",
      "Mangalsutra",
      "Chain",
      "Necklace",
      "Nosepin",
      "Toe Rings",
    ],
    gender: ["Men", "Women", "Unisex", "Kids & Teens"],
    occasion: [
      "Casual Wear",
      "Wedding",
      "Formal Wear",
      "Daily Wear",
      "Party Wear",
      "Traditional Wear",
    ],
    image: [
      "https://th.bing.com/th/id/OIP.m87iaQSgVkiOnMVv2DACGQHaFS?rs=1&pid=ImgDetMain",
      "https://th.bing.com/th/id/OIP.UKI8S-wMT71LjJdnzX5b7wHaFJ?rs=1&pid=ImgDetMain",
    ],
  },
};

const subBangles = {
  Bangles: {
    style: [
      "Bangles",
      "Cuff Bracelets",
      "Wristlets",
      "Chain Bracelets",
      "Bankle Bracelets",
    ],
    price: [
      "Under ₹10000",
      "₹10000 - ₹20000",
      "₹20000 - ₹50000",
      "₹50000 - ₹75000",
      "₹75000 - ₹1 L",
      "Above ₹1 L",
    ],
    material: ["Gold Bangles", "Silver Bangles"],

    imagetwo: [
      "https://png.pngtree.com/png-vector/20240715/ourmid/pngtree-gold-bangles-png-image_13092393.png",
      "https://img.tomade.com/images/mc/zuh2xhtass4gv9lsbox0/Yi-Heng-Da-Men-High-Quality-24K-Gold-Plated-Round-Shaped-Bracelet.jpg",
    ],
  },
};

const subNecklaces = {
  Necklaces: {
    style: [
      "Short Necklaces",
      "Long Necklaces",
      "Pendant Necklaces",
      "Necklace Sets",
      "Necklace Chains",
      "Necklace Pendants",
      "Necklace Bracelets",
    ],

    price: [
      "Under ₹10000",
      "₹10000 - ₹20000",
      "₹20000 - ₹50000",
      "₹50000 - ₹75000",
      "₹75000 - ₹1 L",
      "Above ₹1 L",
    ],
    material: ["Gold Bangles", "Silver Bangles"],
    imageThree: [
      "https://th.bing.com/th/id/OIP.2hBK2w-Ll7LR9kIi7FHPsgHaHa?w=600&h=600&rs=1&pid=ImgDetMain",
      "https://png.pngtree.com/png-vector/20240115/ourmid/pngtree-gold-necklace-on-display-stand-isolated-white-background-png-image_11440164.png",
    ],
  },
};

const subEarrings = {
  Earrings: {
    style: [
      "Drops",
      "Jhumkas",
      "Hoops",
      "Dangler",
      "Chandbali",
      "Studs",
      "Suidhaga",
    ],
    price: [
      "Under ₹10000",
      "₹10000 - ₹20000",
      "₹20000 - ₹50000",
      "₹50000 - ₹75000",
      "₹75000 - ₹1 L",
      "Above ₹1 L",
    ],
    material: [
      "Diamond Earrings",
      "Platinum Earrings",
      "Gemstone Earrings",
      "Gold Earrings",
    ],
    imageone: [
      "https://th.bing.com/th/id/OIP.VXVbINpDxR0hEwhLDabLoQHaHa?rs=1&pid=ImgDetMain",
      "https://admin.pngadgil1832.com/UploadedFiles/ProductImages/ER14807866PNG_01.png",
    ],
  },
};

const subRings = {
  Rings: {
    style: [
      "Engagement Rings",
      "Casual Rings",
      "Wedding Rings",
      "Formal Rings",
      "Daily Wear",
      "Party Wear",
      "Traditional Wear",
    ],
    price: [
      "Under ₹10000",
      "₹10000 - ₹20000",
      "₹20000 - ₹50000",
      "₹50000 - ₹75000",
      "₹75000 - ₹1 L",
      "Above ₹1 L",
    ],
    material: ["Gold Earrings", "Silver Earrings"],
    imageFour: [
      "https://th.bing.com/th/id/OIP.AkKjQEn7OhKI6RLlUlLTzAHaFp?rs=1&pid=ImgDetMain",
      "https://i.etsystatic.com/21147649/r/il/3c15fe/2595282503/il_fullxfull.2595282503_5gxq.jpg",
    ],
  },
};

const subChains = {
  Chains: {
    style: [
      "Casual Chains",
      "Formal Chains",
      "Daily Wear",
      "Party Wear",
      "Traditional Wear",
    ],
    price: [
      "Under ₹10000",
      "₹10000 - ₹20000",
      "₹20000 - ₹50000",
      "₹50000 - ₹75000",
      "₹75000 - ₹1 L",
      "Above ₹1 L",
    ],
    material: ["Gold Earrings", "Silver Earrings"],
    imageFive: [
      "https://png.pngtree.com/png-clipart/20230413/original/pngtree-gold-chain-jewelry-illustration-png-image_9049595.png",
      "https://png.pngtree.com/png-clipart/20230413/original/pngtree-luxury-gold-chain-png-image_9051469.png",
    ],
  },
};

const subPendants = {
  Pendants: {
    style: [
      "Casual Pendants",
      "Formal Pendants",
      "Daily Wear",
      "Party Wear",
      "Traditional Wear",
    ],
    price: [
      "Under ₹10000",
      "₹10000 - ₹20000",
      "₹20000 - ₹50000",
      "₹50000 - ₹75000",
      "₹75000 - ₹1 L",
      "Above ₹1 L",
    ],
    material: ["Gold Earrings", "Silver Earrings"],
    imageSix: [
      " https://th.bing.com/th/id/R.af642e8dd2e7340c430849d4de9e148d?rik=IoG%2fhgTDL6gKyg&riu=http%3a%2f%2fwww.pngmart.com%2ffiles%2f1%2fGold-Jewelry-Transparent-PNG.png&ehk=LveSRiFsClFe57mrcMJ6Fl%2fIO41N0rb9XuQRy3%2bxf5I%3d&risl=&pid=ImgRaw&r=0&sres=1&sresct=1",
      "https://th.bing.com/th/id/OIP.RV2zTob-1HHIF7T2iYDFjAHaLJ?rs=1&pid=ImgDetMain",
    ],
  },
};

// Combine all submenu data for easier access
const subMenus = {
  ...subCategories,
  ...subBangles,
  ...subNecklaces,
  ...subEarrings,
  ...subChains,
  ...subRings,
  ...subPendants,
};

const Navbar = () => {
  const [activeCategory, setActiveCategory] = useState(null);

  const menuData = subMenus[activeCategory];

  return (
    <nav className="sticky top-[68px] z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 py-2 flex flex-wrap items-center justify-center gap-6 overflow-x-auto">
        {categories.map(({ key, label, icon, href }) => (
          <Link
            key={key}
            to={href}
            onMouseEnter={() => setActiveCategory(key)}
            onMouseLeave={() => setActiveCategory(null)}
            className="text-sm text-gray-700 hover:text-yellow-600 transition-all font-medium whitespace-nowrap flex items-center"
          >
            {icon}
            <span className="ml-2">{label}</span>
          </Link>
        ))}
      </div>

      {activeCategory && menuData && (
        <div
          className="absolute left-0 right-0 bg-white shadow-md border-t border-gray-200 z-50"
          onMouseEnter={() => setActiveCategory(activeCategory)}
          onMouseLeave={() => setActiveCategory(null)}
        >
          <div className="max-w-screen-xl mx-auto px-4 py-6 grid grid-cols-4 gap-6">
            {menuData.styles && (
              <div>
                <h1 className="text-xl font-semibold mb-2 font-serif">All Jewellery</h1>
                <ul className="space-y-1 p-3 font-playfair text-lg">
                  {menuData.styles.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-700 hover:text-yellow-600 cursor-pointer"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {menuData.gender && (
              <div>
                <h1 className="text-xl font-semibold mb-2 font-serif">Gender</h1>
                <ul className="space-y-1 p-3 font-playfair text-lg">
                  {menuData.gender.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-700 hover:text-yellow-600 cursor-pointer"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {menuData.occasion && (
              <div>
                <h1 className="text-xl font-semibold mb-2 font-serif">Occasion</h1>
                <ul className="space-y-1 p-3 font-playfair text-lg">
                  {menuData.occasion.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-700 hover:text-yellow-600 cursor-pointer"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {menuData.style && (
              <div>
                <h4 className="text-l font-semibold mb-2 font-serif">Style</h4>
                <ul className="p-2 font-playfair text-lg">
                  {menuData.style.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-700 hover:text-yellow-600 cursor-pointer"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {menuData.price && (
              <div>
                <h4 className="text-l font-semibold mb-2 font-serif">Shop By Price</h4>
                <ul className="space-y-1">
                  {menuData.price.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-700 hover:text-yellow-600 cursor-pointer"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {menuData.material && (
              <div>
                <h4 className="text-l font-semibold mb-2 font-serif">Shop By Metal & Stone</h4>
                <ul className="space-y-1">
                  {menuData.material.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-700 hover:text-yellow-600 cursor-pointer"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {["image", "imageone", "imagetwo", "imageThree", "imageFour", "imageFive", "imageSix"].map(
              (key) =>
                menuData[key] &&
                Array.isArray(menuData[key]) && (
                  <div
                    key={key}
                    className={`flex ${
                      key === "imagetwo" || key === "imageSix" ? "flex-row" : "flex-col"
                    } gap-5 justify-center`}
                  >
                    {menuData[key].map((imgSrc, idx) => (
                      <img
                        key={idx}
                        src={imgSrc}
                        alt={`${activeCategory} visual ${idx + 1}`}
                        className="w-80 h-40 object-cover rounded border border-gray-300 p-2"
                      />
                    ))}
                  </div>
                )
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;