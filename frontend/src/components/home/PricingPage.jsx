import React, { useState } from "react";
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Share2,
  PackageCheck,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";

const ProductPage = () => {
  const [selectedImage, setSelectedImage] = useState(
    "https://www.notebookcheck.org/fileadmin/Notebooks/News/_nc3/12sultraconceptUntitled.jpg"
  );
  const [selectedColor, setSelectedColor] = useState("Red");
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [showMoreOffers, setShowMoreOffers] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState("Lucknow, 226001");
  const [selected, setSelected] = useState(false);
  const images = [
    "https://www.gizmochina.com/wp-content/uploads/2020/12/Xiaomi-Mi-11-Black-Camera.jpg",
    "https://149367133.v2.pressablecdn.com/wp-content/uploads/2021/03/210308-GadgetMatch-Xiaomi-Mi-11-Camera-108MP-1000x600.jpg",
    "https://tse3.mm.bing.net/th/id/OIP.odO21ISrABESPbECA6OGSAHaFj?cb=thfc1&w=1200&h=899&rs=1&pid=ImgDetMain&o=7&rm=3",
    "https://static1.xdaimages.com/wordpress/wp-content/uploads/2021/03/Xiaomi-Mi-11-XDA-Review-Fabric-Case.jpg",
  ];

  // Color images mapping for color options with images
  const colorOptions = [
    {
      name: "Red",
      img: "https://i01.appmifile.com/v1/MI_18455B3E4DA706226CF7535A58E875F0267/pms_1621248592.52271180.png",
    },
    {
      name: "Blue",
      img: "https://tse1.mm.bing.net/th/id/OIP.aPDhiAPMJum6X6AntbiB9gHaE8?cb=thfc1&rs=1&pid=ImgDetMain&o=7&rm=3",
    },
    {
      name: "Black",
      img: "https://w7.pngwing.com/pngs/21/100/png-transparent-xiaomi-redmi-note-5-pro-redmi-5-xiaomi-redmi-note-4-xiaomi-mi-5-oppo-f7-electronics-gadget-mobile-phone.png",
    },
  ];

  const sizes = ["S", "M", "L", "XL"];

  const offers = [
    "💳 10% Instant Discount with HDFC Cards",
    "📦 Free Delivery on first order",
    "💰 Cashback up to ₹1,000 on PayTM Wallet",
    "🎁 Buy 2 Get 1 Free",
    "🚚 Express Delivery within 24 hours",
  ];

  const highlights = [
    "Industry Leading Noise Cancellation",
    "Up to 30 Hours Battery Life",
    "Quick Charge: 10min for 5 hours playback",
    "Comfort-fit with lightweight design",
  ];

  const seller = {
    name: "THE NK Store",
    rating: 4.3,
    reviewsCount: 4321,
  };

  const reviews = [
    {
      rating: 4,
      title: "Value-for-money",
      comment: "It's very nice quality 🙂",
      reviewer: "Visalini Sanju",
      location: "Lucknow",
      date: "Feb, 2021",
      likes: 2,
      dislikes: 0,
    },
    {
      rating: 5,
      title: "Excellent",
      comment: "Nice",
      reviewer: "Flipkart Customer",
      location: "",
      date: "Nov, 2020",
      likes: 2,
      dislikes: 0,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 px-9 pt-5">
        Home / Electronics / Headphones /{" "}
        <span className="text-gray-800">Sony WH-1000XM5</span>
      </nav>

      <div className="container mx-auto px-4 py-6 grid lg:grid-cols-2 gap-6 ">
        {/* Left Column - Images */}
        <div className="space-y-4  ">
          <div className="flex flex-col items-center space-y-4 sticky top-20 border border-gray-200 rounded-lg shadow-lg bg-white p-8 mb-4">
            <div className="relative ">
              <img
                src={selectedImage}
                alt="Product"
                className="w-full rounded-xl shadow-lg object-cover"
              />
              <button className="absolute bottom-4 right-4 p-2 shadow ">
                <Star
                  size={25}
                  onClick={() => setSelected(!selected)}
                  className={`
        rounded-full p-1 cursor-pointer
        ${
          selected
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-orange-100 text-red-500 hover:bg-red-600"
        }
      `}
                />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2">
              {images.map((img) => (
                <img
                  key={img}
                  src={img}
                  alt="Thumbnail"
                  onClick={() => setSelectedImage(img)}
                  className={clsx(
                    "w-20 h-20 rounded-lg object-cover border-2 cursor-pointer",
                    selectedImage === img
                      ? "border-blue-500"
                      : "border-transparent"
                  )}
                />
              ))}
            </div>
            {/* Highlights */}
            <div className="bg-white py-4 ">
              <h2 className="font-semibold mb-3 text-lg">Highlights</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                {highlights.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Sony WH-1000XM5 Noise Cancelling Headphones
          </h1>

          {/* Ratings & Seller */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="flex text-yellow-400">
                {Array(5)
                  .fill()
                  .map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      fill={
                        i < Math.floor(seller.rating) ? "currentColor" : "none"
                      }
                      stroke="currentColor"
                    />
                  ))}
              </div>
              <span className="ml-2 font-semibold">{seller.rating}</span>
              <span className="ml-1 text-gray-600">
                ({seller.reviewsCount} ratings)
              </span>
            </div>
            <button className="text-blue-600 underline text-sm font-medium">
              See other sellers
            </button>
          </div>

          {/* Pricing */}
          <div>
            <div className="text-3xl font-bold text-green-600">₹26,990</div>
            <div className="text-sm text-gray-500 line-through">₹34,990</div>
            <div className="text-sm text-red-600">23% off</div>
          </div>

          {/* Delivery Location */}
          <div className="border rounded-lg p-4 bg-white flex items-center gap-3">
            <Truck size={20} className="text-gray-600" />
            <div>
              Delivery to{" "}
              <select
                className="border-b border-blue-500 outline-none font-semibold"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
              >
                <option>Lucknow, 226001</option>
                <option>Delhi, 110001</option>
                <option>Mumbai, 400001</option>
                <option>Bangalore, 560001</option>
              </select>
            </div>
          </div>

          {/* Offers with View More */}
          <div className="border rounded-lg p-4 bg-yellow-50">
            <h2
              className="font-semibold mb-2 flex items-center justify-between cursor-pointer"
              onClick={() => setShowMoreOffers(!showMoreOffers)}
            >
              Available Offers{" "}
              {showMoreOffers ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronRight size={20} />
              )}
            </h2>
            <ul className="space-y-1 text-sm">
              {(showMoreOffers ? offers : offers.slice(0, 3)).map(
                (offer, idx) => (
                  <li key={idx}>{offer}</li>
                )
              )}
            </ul>
          </div>

          {/* Colors as Images */}
          <div>
            <h3 className="font-medium">Color:</h3>
            <div className="flex gap-3 mt-2">
              {colorOptions.map(({ name, img }) => (
                <button
                  key={name}
                  onClick={() => {
                    setSelectedColor(name);
                    setSelectedImage(
                      images[colorOptions.findIndex((c) => c.name === name)] ||
                        selectedImage
                    );
                  }}
                  className={clsx(
                    "p-1 rounded border-2 cursor-pointer",
                    selectedColor === name
                      ? "border-blue-500"
                      : "border-gray-300"
                  )}
                >
                  <img src={img} alt={name} className="w-10 h-10 rounded" />
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <h3 className="font-medium">Size:</h3>
            <div className="flex gap-2 mt-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={clsx(
                    "px-4 py-2 rounded-full border",
                    selectedSize === s
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="font-medium">Quantity:</label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="ml-2 border rounded-lg p-2"
            >
              {[1, 2, 3, 4, 5].map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
              <ShoppingCart size={20} /> Add to Cart
            </button>
            <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
              <PackageCheck size={20} /> Buy Now
            </button>
          </div>

          {/* Extra Services */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Truck size={16} /> Free Delivery
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} /> 1 Year Warranty
            </div>
            <div className="flex items-center gap-2">
              <Heart size={16} /> Wishlist
            </div>
            <div className="flex items-center gap-2">
              <Share2 size={16} /> Share
            </div>
          </div>

          {/* Return Policy and Other Sellers */}
          <div className="flex justify-between items-center border-t pt-4 text-sm text-gray-600">
            <div>7 Days Return Policy?</div>
            <button className="text-blue-600 underline">
              See other sellers
            </button>
          </div>

          {/* Ratings & Reviews Section */}
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-3">Ratings & Reviews</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl font-bold text-yellow-400 flex items-center gap-1">
                4.4 <Star size={28} />
              </div>
              <div className="text-sm text-gray-600">
                16 Ratings & 2 Reviews
              </div>
              <button className="ml-auto bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm">
                Rate Product
              </button>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-2 mb-6">
              {[5, 4, 3, 2, 1].map((star) => {
                const counts = { 5: 10, 4: 4, 3: 1, 2: 1, 1: 0 };
                const total = 16;
                const percent = (counts[star] / total) * 100;
                const color =
                  star >= 4
                    ? "bg-green-600"
                    : star === 3
                    ? "bg-yellow-500"
                    : "bg-orange-500";
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-6 text-sm">{star}★</span>
                    <div className="flex-1 h-3 bg-gray-300 rounded overflow-hidden">
                      <div
                        className={`${color} h-3`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <span className="w-6 text-sm text-gray-600">
                      {counts[star]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Reviews */}
            <div className="space-y-6">
              {reviews.map((review, i) => (
                <div
                  key={i}
                  className="border p-4 rounded-lg bg-white shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-green-600 text-white px-2 rounded text-xs font-semibold flex items-center gap-1">
                      {review.rating}★
                    </div>
                    <div className="font-semibold">{review.title}</div>
                  </div>
                  <p className="text-gray-700 mb-2">{review.comment}</p>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span>{review.reviewer}</span>
                    {review.location && <span>• {review.location}</span>}
                    <span>• {review.date}</span>
                  </div>
                  <div className="flex gap-4 mt-2 text-gray-400 text-sm">
                    <button className="flex items-center gap-1 hover:text-gray-700">
                      👍 {review.likes}
                    </button>
                    <button className="flex items-center gap-1 hover:text-gray-700">
                      👎 {review.dislikes}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
