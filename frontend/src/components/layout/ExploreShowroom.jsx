import React, { useState } from "react";

export default function ExploreShowroom() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  const categories = [
    {
      id: 1,
      title: "Mobiles",
      img: "https://eu-exstatic-vivofs.vivo.com/8Xa6evfY85lu15Pb/1717745436142/78cc0ae6dc49812ae7d4f2453469875f.png",
    },
    {
      id: 2,
      title: "Laptops",
      img: "https://pngimg.com/uploads/laptop/laptop_PNG101764.png",
    },
    {
      id: 3,
      title: "Fashion",
      img: "https://static.vecteezy.com/system/resources/previews/035/645/569/non_2x/ai-generated-woman-dress-isolated-on-transparent-background-created-with-generative-ai-free-png.png",
    },
    {
      id: 4,
      title: "Home Appliances",
      img: "https://static.vecteezy.com/system/resources/previews/047/308/664/non_2x/red-kitchen-appliances-on-a-white-background-free-png.png",
    },
    {
      id: 5,
      title: "Furniture",
      img: "https://www.pngarts.com/files/7/Modern-Furniture-PNG-Picture.png",
    },
    {
      id: 6,
      title: "Beauty",
      img: "https://png.pngtree.com/png-clipart/20241024/original/pngtree-geset-of-luxury-beauty-cosmetic-makeup-bdifferent-png-image_16480004.png",
    },
  ];

  const deals = [
    {
      id: 1,
      title: "Deal of the Day",
      discount: "50% OFF",
      img: "https://img.freepik.com/premium-vector/deal-day-label-with-long-shadow-advertising-discounts-symbol-vector_32996-2184.jpg?w=2000",
    },
    {
      id: 2,
      title: "Top Offers",
      discount: "Up to 60%",
      img: "https://png.pngtree.com/png-vector/20220917/ourmid/pngtree-top-deals-symbol-guaranteed-rate-vector-png-image_14564632.jpg",
    },
    {
      id: 3,
      title: "Trending Now",
      discount: "Hot Deals",
      img: "https://png.pngtree.com/png-clipart/20220509/original/pngtree-trending-topic-vector-logo-icon-or-symbol-with-black-yellow-line-png-image_7682863.png",
    },
  ];

  const brands = [
    {
      id: 1,
      name: "Samsung",
      img: "https://www.kindpng.com/picc/m/21-214058_samsung-mobile-png-samsung-s6-screen-price-transparent.png",
    },
    {
      id: 2,
      name: "Apple",
      img: "https://www.pngmart.com/files/15/Apple-iPhone-12-PNG-HD.png",
    },
    {
      id: 3,
      name: "Nike",
      img: "https://www.pngmart.com/files/22/Nike-PNG-Picture.png",
    },
    {
      id: 4,
      name: "Adidas",
      img: "https://download.logo.wine/logo/Adidas/Adidas-Logo.wine.png",
    },
    {
      id: 5,
      name: "Whirlpool",
      img: "https://tse1.mm.bing.net/th/id/OIP.ytTR5yrXmH7tLDkT2r0adwHaHa",
    },
  ];

  // ⭐ Search Logic
  const handleSearch = () => {
    const term = searchTerm.toLowerCase();

    const foundCategories = categories.filter((c) =>
      c.title.toLowerCase().includes(term)
    );

    const foundDeals = deals.filter((d) =>
      d.title.toLowerCase().includes(term)
    );

    const foundBrands = brands.filter((b) =>
      b.name.toLowerCase().includes(term)
    );

    const combined = [...foundCategories, ...foundDeals, ...foundBrands];

    if (combined.length === 0) {
      alert("No results found.");
    }

    setResults(combined);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Title */}
      <h2 className="text-center text-4xl font-bold tracking-wide mb-6">
        Explore Showroom
      </h2>

      {/* Search Bar */}
      <div className="flex w-full shadow-md rounded-xl overflow-hidden mb-6">
        <input
          type="text"
          placeholder="Search products, categories, brands..."
          className="w-full p-3 text-lg outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className="bg-black text-white px-6 text-lg"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="mb-10">
          <h3 className="text-xl font-bold uppercase mb-4">Search Results</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((item) => (
              <div
                key={item.id}
                className="bg-white shadow-lg rounded-xl p-4 text-center"
              >
                <img
                  src={item.img}
                  alt=""
                  className="h-32 mx-auto object-contain"
                />
                <p className="font-semibold mt-2">{item.title || item.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Banner */}
      <div className="mb-10">
        <img
          src="https://www.creativefabrica.com/wp-content/uploads/2021/04/26/Creative-Fashion-Sale-Banner-Graphics-11345601-1.jpg"
          className="rounded-3xl shadow-xl w-full max-h-[500px] object-cover"
          alt="banner"
        />
      </div>

      {/* Categories */}
      <h3 className="text-xl font-bold uppercase mb-3 tracking-wide">
        Shop by Categories
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
        {categories.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow-lg rounded-2xl p-4 text-center hover:shadow-xl transition"
          >
            <img
              src={item.img}
              className="h-40 mx-auto object-contain"
              alt={item.title}
            />
            <h6 className="mt-3 font-semibold text-lg">{item.title}</h6>
          </div>
        ))}
      </div>

      {/* Deals */}
      <h3 className="text-xl font-bold uppercase mb-3 tracking-wide">
        Best Deals For You
      </h3>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {deals.map((deal) => (
          <div
            key={deal.id}
            className="bg-white shadow-xl rounded-2xl p-5 text-center"
          >
            <img
              src={deal.img}
              alt={deal.title}
              className="h-40 mx-auto object-contain rounded"
            />
            <h6 className="mt-4 font-bold text-xl">{deal.title}</h6>
            <p className="text-red-600 font-bold text-lg">{deal.discount}</p>
          </div>
        ))}
      </div>

      {/* Brands */}
      <h3 className="text-xl font-bold uppercase mb-3 tracking-wide">
        Popular Brands
      </h3>

      <div className="flex gap-6 flex-wrap justify-center mb-10">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="text-center hover:scale-105 transition"
          >
            <img
              src={brand.img}
              className="w-28 h-28 rounded-full shadow-md p-3 object-contain bg-white"
              alt={brand.name}
            />
            <p className="mt-2 font-semibold">{brand.name}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="py-6 border-t text-center text-gray-600">
        © 2025 BBSCART online shopping • All Rights Reserved
      </footer>
    </div>
  );
}
