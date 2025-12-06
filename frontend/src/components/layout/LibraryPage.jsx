import React, { useState } from "react";

const productsData = [
  {
    id: 1,
    title: "React for Beginners",
    category: "Books",
    description: "Learn the basics of React and build amazing UIs.",
    price: 299,
    image:
      "https://lh7-us.googleusercontent.com/D6BrXu23nOJepuMbM-ZSNza1nfl8qLh1PtaGzyYUebo6llBebhDTSKODso4N6JZsFMXuwxSRga2pIqidn6rPkjHJTNd7opp-5HYY87OOFXqiC0nGCcHHenuytpXoG5u4jHzD4MVPdfgW0QvUijKh5q8",
  },
  {
    id: 2,
    title: "Advanced JavaScript",
    category: "Books",
    description: "Deep dive into JavaScript and master advanced concepts.",
    price: 399,
    image:
      "https://miro.medium.com/v2/resize:fit:836/1*dbggYEdKfBg-4SqRqrkFow.png",
  },
  {
    id: 3,
    title: "CSS Mastery",
    category: "Books",
    description: "Become a CSS pro and create stunning web pages.",
    price: 249,
    image: "https://www.oreilly.com/library/cover/9781590596142/1200w630h/",
  },
  {
    id: 4,
    title: "Learn React Audio",
    category: "Audiobooks",
    description: "Learn React by listening to explanations.",
    price: 199,
    image:
      "https://www.notjust.dev/images/thumbnails/courses/react-native-mastery.png",
  },
  {
    id: 5,
    title: "Productivity App",
    category: "Apps",
    description: "Increase your productivity with this app.",
    price: 0,
    image:
      "https://png.pngtree.com/png-vector/20250205/ourmid/pngtree-mobile-app-development-boosting-productivity-with-a-3d-icon-isolated-on-png-image_15380846.png",
  },
  {
    id: 6,
    title: "E-Document Pack",
    category: "Docs",
    description: "Essential documents for web development.",
    price: 99,
    image:
      "https://is4-ssl.mzstatic.com/image/thumb/Purple116/v4/40/a0/a3/40a0a383-9cd7-f533-ca4e-165b93230fbe/AppIcon-0-1x_U007emarketing-0-7-0-85-220.png/1200x630wa.png",
  },
  {
    id: 7,
    title: "Gift Card",
    category: "Gift",
    description: "Gift this card to your loved ones.",
    price: 500,
    image: "https://www.pngarts.com/files/1/Gift-Card-PNG-Download-Image.png",
  },
];

const LibraryPage = () => {
  const [products] = useState(productsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortType, setSortType] = useState("");
  const [key, setKey] = useState("All");

  const filteredProducts = products
    .filter((p) => (key === "All" ? true : p.category === key))
    .filter(
      (p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (sortType === "priceLow") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortType === "priceHigh") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortType === "alphabet") {
    filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Banner Slider */}
      <div className="w-full overflow-hidden rounded-lg shadow mb-6">
        <div className="flex animate-slide">
          <img
            src="https://bbscart.com/img/hero/grocery_banner3.JPG"
            className="w-full object-cover"
          />
          <img
            src="https://bbscart.com/img/hero/grocery_banner4.JPG"
            className="w-full object-cover"
          />
        </div>
      </div>

      {/* Search + Sort */}
      <div className="flex gap-3 mb-4">
        <input
          className="border p-2 rounded w-full"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          onChange={(e) => setSortType(e.target.value)}
        >
          <option value="">Sort By</option>
          <option value="priceLow">Price: Low → High</option>
          <option value="priceHigh">Price: High → Low</option>
          <option value="alphabet">Alphabetical</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {["All", "Books", "Audiobooks", "Apps", "Docs", "Gift"].map((c) => (
          <button
            key={c}
            onClick={() => setKey(c)}
            className={`px-4 py-2 rounded-full border ${
              key === c ? "bg-blue-600 text-white" : "bg-white text-gray-700"
            }`}
          >
            {c} (
            {
              products.filter((p) => (c === "All" ? true : p.category === c))
                .length
            }
            )
          </button>
        ))}
      </div>

      {/* Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg shadow hover:shadow-lg transition cursor-pointer"
            onClick={() => setSelectedProduct(product)}
          >
            <img
              src={product.image}
              className="w-full h-64 object-cover rounded-t-lg"
            />

            <div className="p-4 flex flex-col">
              <h3 className="text-lg font-semibold">{product.title}</h3>
              <p className="text-gray-500 text-sm">{product.description}</p>

              <div className="mt-auto flex justify-between items-center pt-3">
                <span className="text-blue-600 font-bold">
                  {product.price === 0 ? "Free" : `₹${product.price}`}
                </span>

                <span
                  className={`px-2 py-1 text-xs rounded ${
                    product.price === 0
                      ? "bg-green-200 text-green-700"
                      : "bg-blue-200 text-blue-700"
                  }`}
                >
                  {product.price === 0 ? "Free" : "Paid"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="text-center mt-10 text-gray-500">
          <h3>No products found.</h3>
        </div>
      )}

      {/* Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-4 animate-fadeIn">
            <button
              onClick={() => setSelectedProduct(null)}
              className="float-right text-red-500 font-bold text-xl"
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-2">{selectedProduct.title}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <img
                src={selectedProduct.image}
                className="rounded w-full object-cover"
              />

              <div>
                <p className="text-gray-600">{selectedProduct.description}</p>

                <h3 className="text-blue-600 text-xl font-bold mt-4">
                  {selectedProduct.price === 0
                    ? "Free"
                    : `₹${selectedProduct.price}`}
                </h3>

                <div className="mt-4 flex gap-3">
                  <button className="bg-green-600 text-white px-4 py-2 rounded">
                    Add to Cart
                  </button>

                  <button className="bg-blue-600 text-white px-4 py-2 rounded">
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
