import React, { useState } from "react";

const categories = [
  "Frozen food",
  "Vegetables",
  "Snacks",
  "Chicken",
  "Meat & Ball",
  "Dairy & Milk",
  "Chocolate",
  "Fruits",
];

// 10 PRODUCTS PER CATEGORY
const products = [
  // -------------------- FROZEN FOOD --------------------
  { id: 1, name: "Organic Frozen Deer", price: 14.29, img: "https://www.tasteofhome.com/wp-content/uploads/2018/01/Crispy-Fried-Chicken_EXPS_TOHJJ22_6445_DR-_02_03_11b.jpg", cat: "Frozen food" },
  { id: 2, name: "Frozen Salmon Fillet", price: 18.99, img: "https://rhapsodynaturalfoods.com/wp-content/uploads/2015/03/Organic-local-cabbage-scaled.jpg", cat: "Frozen food" },
  { id: 3, name: "Bonduelle Royal Mix", price: 20.29, img: "https://tse3.mm.bing.net/th/id/OIP.FHVmCwhccxS57i3BV6ge9wAAAA?rs=1&pid=ImgDetMain", cat: "Frozen food" },
  { id: 4, name: "Frozen Boneless Meat", price: 8.29, img: "https://img1.exportersindia.com/product_images/bc-full/2023/4/11773803/frozen-boneless-buffalo-meat-1682336604-6855250.jpeg", cat: "Frozen food" },
  { id: 5, name: "Frozen Beef Cubes", price: 15.29, img: "https://www.jocooks.com/wp-content/uploads/2020/04/roast-beef-1.jpg", cat: "Frozen food" },
  { id: 6, name: "Frozen Turkey Cuts", price: 17.49, img: "https://tse2.mm.bing.net/th/id/OIP.m6XGfo6OK_vdK2da4bIH1wHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", cat: "Frozen food" },
  { id: 7, name: "Frozen Shrimp Pack", price: 19.29, img: "https://tse2.mm.bing.net/th/id/OIP.m6XGfo6OK_vdK2da4bIH1wHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", cat: "Frozen food" },
  { id: 8, name: "Frozen Lamb Chops", price: 22.49, img: "https://img.buzzfeed.com/video-api-prod/assets/2bce8c3067314d9aaf41d732caf79e6b/FB.jpg", cat: "Frozen food" },
  { id: 9, name: "Frozen Fish Fingers", price: 12.29, img: "https://i.ytimg.com/vi/LwwXfUSyKJE/maxresdefault.jpg", cat: "Frozen food" },
  { id: 10, name: "Frozen Dumplings", price: 11.79, img: "https://beaorviz.com/wp-content/uploads/2022/08/receta-dumplings-pollo-domplines.jpg", cat: "Frozen food" },

  // -------------------- VEGETABLES --------------------
  { id: 11, name: "Plant Hunter Pack", price: 20.29, img: "https://tse1.mm.bing.net/th/id/OIP.b7BnTo2iUW-xz0DgSOzjJwAAAA?rs=1&pid=ImgDetMain", cat: "Vegetables" },
  { id: 12, name: "Deshi Gajor (Carrot)", price: 19.29, img: "https://tse2.mm.bing.net/th/id/OIP.C6WDkbt69_Vt7EcytD9eKAHaHa?rs=1&pid=ImgDetMain", cat: "Vegetables" },
  { id: 13, name: "Local Cabbage", price: 9.29, img: "https://tse4.mm.bing.net/th/id/OIP.P0rW5Rb9FEEjdJF7CRPtDwHaFf?rs=1&pid=ImgDetMain", cat: "Vegetables" },
  { id: 14, name: "Fresh Spinach", price: 5.79, img: "https://tse3.mm.bing.net/th/id/OIP.HMbhA9dEoC0pOwLBA2SBagHaEK?rs=1&pid=ImgDetMain", cat: "Vegetables" },
  { id: 15, name: "Organic Broccoli", price: 6.49, img: "https://tse2.mm.bing.net/th/id/OIP.E_3YyogG5gM9rQKWYfXDHAHaE8?rs=1&pid=ImgDetMain", cat: "Vegetables" },
  { id: 16, name: "Fresh Tomato", price: 3.49, img: "https://tse4.mm.bing.net/th/id/OIP.jbfi9D9J1GQtH5jK_Cx9kgHaE7?rs=1&pid=ImgDetMain", cat: "Vegetables" },
  { id: 17, name: "Red Onions", price: 4.99, img: "https://tse1.mm.bing.net/th/id/OIP.rzYgQq2RaLSOyKQvsx_kCwHaE8?rs=1&pid=ImgDetMain", cat: "Vegetables" },
  { id: 18, name: "Cauliflower", price: 5.29, img: "https://tse3.mm.bing.net/th/id/OIP.e5HEo4-1C4Bp3I9P4Jr_3gHaE8?rs=1&pid=ImgDetMain", cat: "Vegetables" },
  { id: 19, name: "Capsicum Pack", price: 8.19, img: "https://tse2.mm.bing.net/th/id/OIP.Fn5qRZEB4fU1hS_xlNlrKgHaEK?rs=1&pid=ImgDetMain", cat: "Vegetables" },
  { id: 20, name: "Sweet Corn", price: 7.79, img: "https://tse2.mm.bing.net/th/id/OIP.2mrL0g42HhJ05fOMmPmd1AHaE8?rs=1&pid=ImgDetMain", cat: "Vegetables" },

  // -------------------- SNACKS --------------------
  { id: 21, name: "Lays Chips Bacon", price: 21.29, img: "https://tse1.mm.bing.net/th/id/OIP.BGnKbVqAc2LUwq5akAHv3wHaE8?rs=1&pid=ImgDetMain", cat: "Snacks" },
  { id: 22, name: "Doritos Nacho", price: 19.29, img: "https://tse1.mm.bing.net/th/id/OIP.0wK3PV3yNb8wVikiiA_1fQHaE8?rs=1&pid=ImgDetMain", cat: "Snacks" },
  { id: 23, name: "Pringles Sour Cream", price: 18.49, img: "https://tse1.mm.bing.net/th/id/OIP.LwhxZYPSFaZRYs_-yNRp7AHaJ4?rs=1&pid=ImgDetMain", cat: "Snacks" },
  { id: 24, name: "Popcorn Butter Pack", price: 13.99, img: "https://tse4.mm.bing.net/th/id/OIP.ExNtrdP8aR7xQruHqBvTzwHaHa?rs=1&pid=ImgDetMain", cat: "Snacks" },
  { id: 25, name: "Cheese Balls", price: 11.99, img: "https://tse4.mm.bing.net/th/id/OIP.clH8WpGgxO6U4q3PpBSdZgHaGL?rs=1&pid=ImgDetMain", cat: "Snacks" },
  { id: 26, name: "Tortilla Chips", price: 12.49, img: "https://tse1.mm.bing.net/th/id/OIP.uLtfE-DOvV_zF2ogeW2YHQHaE8?rs=1&pid=ImgDetMain", cat: "Snacks" },
  { id: 27, name: "Kurkure Masala", price: 6.99, img: "https://tse3.mm.bing.net/th/id/OIP.1CHhkHBu6mzLk4y585aEWwHaHa?rs=1&pid=ImgDetMain", cat: "Snacks" },
  { id: 28, name: "Salted Pretzels", price: 10.49, img: "https://tse2.mm.bing.net/th/id/OIP._cqWMYlMsqkP7s-fSxIsIgHaE8?rs=1&pid=ImgDetMain", cat: "Snacks" },
  { id: 29, name: "Nacho Salsa Dip", price: 9.99, img: "https://tse2.mm.bing.net/th/id/OIP.ZkJQrZK0AuTNRYDlx6C6uAHaE8?rs=1&pid=ImgDetMain", cat: "Snacks" },
  { id: 30, name: "Peanut Masala", price: 7.49, img: "https://tse2.mm.bing.net/th/id/OIP.QoYzbdKOf0WOXT3jz7OLaQHaE7?rs=1&pid=ImgDetMain", cat: "Snacks" },

  // -------------------- CHICKEN --------------------
  { id: 31, name: "Halal Frozen Chicken", price: 15.29, img: "https://img1.exportersindia.com/product_images/bc-full/2023/4/11773803/frozen-boneless-buffalo-meat-1682336604-6855250.jpeg", cat: "Chicken" },
  { id: 32, name: "Chicken Drumsticks", price: 13.99, img: "https://tse1.mm.bing.net/th/id/OIP.Gig0zuIYQyPuhyCxd5jEwwHaE7?rs=1&pid=ImgDetMain", cat: "Chicken" },
  { id: 33, name: "Chicken Breast Fillet", price: 16.49, img: "https://tse4.mm.bing.net/th/id/OIP.3fqks6Ndm42Hcps225y7OgHaE8?rs=1&pid=ImgDetMain", cat: "Chicken" },
  { id: 34, name: "Chicken Sausages", price: 11.99, img: "https://tse2.mm.bing.net/th/id/OIP.SaDGP1MTphxzsPSeHn9pQAHaHa?rs=1&pid=ImgDetMain", cat: "Chicken" },
  { id: 35, name: "Chicken Wings", price: 18.29, img: "https://tse2.mm.bing.net/th/id/OIP._0f7sKnz03Wx_wA0q9rgPAHaE8?rs=1&pid=ImgDetMain", cat: "Chicken" },
  { id: 36, name: "Chicken Nuggets", price: 9.79, img: "https://tse4.mm.bing.net/th/id/OIP.e2BYS0G7KvyJg8P4juscpgHaE8?rs=1&pid=ImgDetMain", cat: "Chicken" },
  { id: 37, name: "Chicken Seekh Kebab", price: 14.99, img: "https://tse1.mm.bing.net/th/id/OIP.j8wpFEfC-KNwilAtLq42WgHaE8?rs=1&pid=ImgDetMain", cat: "Chicken" },
  { id: 38, name: "Chicken Popcorn", price: 10.99, img: "https://tse2.mm.bing.net/th/id/OIP.FE35Q0T3_wDzztk9QFpmfgHaEK?rs=1&pid=ImgDetMain", cat: "Chicken" },
  { id: 39, name: "Chicken Cutlets", price: 12.99, img: "https://tse3.mm.bing.net/th/id/OIP._An5PERfzqWUPpUEi1F_dwHaEK?rs=1&pid=ImgDetMain", cat: "Chicken" },
  { id: 40, name: "Chicken Liver Pack", price: 8.49, img: "https://tse2.mm.bing.net/th/id/OIP.uKr1u1QOcRyzsRTgBcNkngHaEK?rs=1&pid=ImgDetMain", cat: "Chicken" },

  // -------------------- MEAT & BALL --------------------
  { id: 41, name: "Italian Meat Balls", price: 14.99, img: "https://tse3.mm.bing.net/th/id/OIP.D5d4mVUXkJ0n5jJ9Cj3U0gHaE8?rs=1&pid=ImgDetMain", cat: "Meat & Ball" },
  { id: 42, name: "Beef Meatballs", price: 18.49, img: "https://tse4.mm.bing.net/th/id/OIP.2akZDYuAi_M2MIJhPGGnGgHaE8?rs=1&pid=ImgDetMain", cat: "Meat & Ball" },
  { id: 43, name: "Pork Meatballs", price: 19.29, img: "https://tse4.mm.bing.net/th/id/OIP.x8lpHzsEj5yU5Zk_Mz6LdwHaHa?rs=1&pid=ImgDetMain", cat: "Meat & Ball" },
  { id: 44, name: "Chicken Meatballs", price: 15.49, img: "https://tse2.mm.bing.net/th/id/OIP.99mU3uAE6v7qDpiRnbZ0bgHaE8?rs=1&pid=ImgDetMain", cat: "Meat & Ball" },
  { id: 45, name: "Lamb Meatballs", price: 21.99, img: "https://tse3.mm.bing.net/th/id/OIP.3H1yO4meaD2lJ0lx53xa8QHaE7?rs=1&pid=ImgDetMain", cat: "Meat & Ball" },
  { id: 46, name: "Fish Balls", price: 13.99, img: "https://tse3.mm.bing.net/th/id/OIP.bOocPqscxwoxJrwCXRRUVAHaFj?rs=1&pid=ImgDetMain", cat: "Meat & Ball" },
  { id: 47, name: "Shrimp Balls", price: 17.99, img: "https://tse4.mm.bing.net/th/id/OIP.MN0cQ9Y9R0rsRx0TE5cTCAHaJQ?rs=1&pid=ImgDetMain", cat: "Meat & Ball" },
  { id: 48, name: "Wagyu Meatballs", price: 24.49, img: "https://tse2.mm.bing.net/th/id/OIP.Rf0FYkQw4xmHc1kU9dMBpgHaHa?rs=1&pid=ImgDetMain", cat: "Meat & Ball" },
  { id: 49, name: "BBQ Pork Balls", price: 16.49, img: "https://tse3.mm.bing.net/th/id/OIP.s2iV4k1kZx8NEiP5GcKx2AHaE8?rs=1&pid=ImgDetMain", cat: "Meat & Ball" },
  { id: 50, name: "Stuffed Meat Balls", price: 20.99, img: "https://tse3.mm.bing.net/th/id/OIP.ffv4v2D7EXV_QYvrtfKcFwHaHa?rs=1&pid=ImgDetMain", cat: "Meat & Ball" },

  // -------------------- DAIRY & MILK --------------------
  { id: 51, name: "Fresh Cow Milk", price: 4.99, img: "https://tse4.mm.bing.net/th/id/OIP.6odgmL6sP52KXvi9V9B2rwHaE7?rs=1&pid=ImgDetMain", cat: "Dairy & Milk" },
  { id: 52, name: "Full Cream Milk", price: 6.49, img: "https://tse3.mm.bing.net/th/id/OIP.zJkSPxO13aXqvZCEiLk9oAHaEK?rs=1&pid=ImgDetMain", cat: "Dairy & Milk" },
  { id: 53, name: "Greek Yogurt", price: 7.99, img: "https://tse1.mm.bing.net/th/id/OIP.w6wKoHQ6Uu76Z6DCeU44PAHaE8?rs=1&pid=ImgDetMain", cat: "Dairy & Milk" },
  { id: 54, name: "Processed Cheese Slices", price: 8.29, img: "https://tse3.mm.bing.net/th/id/OIP.aeUbAVfsHa-4WXTjhBMWOgHaE8?rs=1&pid=ImgDetMain", cat: "Dairy & Milk" },
  { id: 55, name: "Butter Salted Pack", price: 5.79, img: "https://tse2.mm.bing.net/th/id/OIP.qoj1O5MScuP2oQyXpXw0RgHaEK?rs=1&pid=ImgDetMain", cat: "Dairy & Milk" },
  { id: 56, name: "Fresh Cream", price: 4.99, img: "https://tse2.mm.bing.net/th/id/OIP.yHCEzq1ZMhUlCT3VkOIT3QHaE8?rs=1&pid=ImgDetMain", cat: "Dairy & Milk" },
  { id: 57, name: "Organic Paneer", price: 6.49, img: "https://tse4.mm.bing.net/th/id/OIP.MGaZ0_RK1K0aXYCafIPAgAHaFj?rs=1&pid=ImgDetMain", cat: "Dairy & Milk" },
  { id: 58, name: "Ghee Desi", price: 12.79, img: "https://tse3.mm.bing.net/th/id/OIP.aYp8kpzGZBvB-JSFA3kbxgHaEK?rs=1&pid=ImgDetMain", cat: "Dairy & Milk" },
  { id: 59, name: "Mozzarella Cheese", price: 10.29, img: "https://tse3.mm.bing.net/th/id/OIP.6ZCqFotLlYj_D_yiMRkUkAHaE7?rs=1&pid=ImgDetMain", cat: "Dairy & Milk" },
  { id: 60, name: "Whipped Cream", price: 11.19, img: "https://tse2.mm.bing.net/th/id/OIP.59_veyJ8ehWtRfqbbDXnsgHaEK?rs=1&pid=ImgDetMain", cat: "Dairy & Milk" },

  // -------------------- CHOCOLATE --------------------
  { id: 61, name: "Cadbury Dairy Milk", price: 2.99, img: "https://tse1.mm.bing.net/th/id/OIP.xP4lGn_ZF0MESE0BtKCxYgHaEK?rs=1&pid=ImgDetMain", cat: "Chocolate" },
  { id: 62, name: "Ferrero Rocher Pack", price: 12.49, img: "https://tse3.mm.bing.net/th/id/OIP.r5MvwHipNg7hT6e2jBBRwQHaE8?rs=1&pid=ImgDetMain", cat: "Chocolate" },
  { id: 63, name: "Lindt Dark 70%", price: 7.99, img: "https://tse4.mm.bing.net/th/id/OIP.kWL-JEfVVCcDthziak_NWQHaHa?rs=1&pid=ImgDetMain", cat: "Chocolate" },
  { id: 64, name: "KitKat Crunch", price: 3.49, img: "https://tse4.mm.bing.net/th/id/OIP.2xVQZQCB8Vw8TG6YKY3aigHaHa?rs=1&pid=ImgDetMain", cat: "Chocolate" },
  { id: 65, name: "Snickers Bar", price: 2.89, img: "https://tse1.mm.bing.net/th/id/OIP.MzEBY0oeAsGsWFgzr7ndggHaE8?rs=1&pid=ImgDetMain", cat: "Chocolate" },
  { id: 66, name: "Galaxy Smooth", price: 5.19, img: "https://tse1.mm.bing.net/th/id/OIP.VxIRUqZ0brN1e4JtFUrG0AHaFW?rs=1&pid=ImgDetMain", cat: "Chocolate" },
  { id: 67, name: "M&M's Peanut", price: 6.49, img: "https://tse2.mm.bing.net/th/id/OIP.jpSgEONQO0zfJ7W82dManAHaE8?rs=1&pid=ImgDetMain", cat: "Chocolate" },
  { id: 68, name: "Bounty Coconut", price: 3.79, img: "https://tse2.mm.bing.net/th/id/OIP.8dwrtVBDOTrC7yLykdDRtAHaE8?rs=1&pid=ImgDetMain", cat: "Chocolate" },
  { id: 69, name: "Dark Truffles", price: 11.99, img: "https://tse2.mm.bing.net/th/id/OIP.zWctguRFbhWABr9G8rHKEwAAAA?rs=1&pid=ImgDetMain", cat: "Chocolate" },
  { id: 70, name: "Almond Crunch Bar", price: 7.29, img: "https://tse1.mm.bing.net/th/id/OIP.Bu4vfEjOAmPRhDkFohcLAwHaHa?rs=1&pid=ImgDetMain", cat: "Chocolate" },

  // -------------------- FRUITS --------------------
  { id: 71, name: "Fresh Organic Banana", price: 6.99, img: "https://tse1.mm.bing.net/th/id/OIP.bA55cZ1TgXdOHYf0AGSmXwHaE7?rs=1&pid=ImgDetMain", cat: "Fruits" },
  { id: 72, name: "Fresh Mango", price: 12.49, img: "https://tse1.mm.bing.net/th/id/OIP.8RgHw7P9k7Wl_6Q7l5vNbgHaHa?rs=1&pid=ImgDetMain", cat: "Fruits" },
  { id: 73, name: "Red Apple Pack", price: 8.99, img: "https://tse3.mm.bing.net/th/id/OIP.Mo8_5A8GcNFMvz2FPHN0wAHaE8?rs=1&pid=ImgDetMain", cat: "Fruits" },
  { id: 74, name: "Watermelon Large", price: 15.29, img: "https://tse3.mm.bing.net/th/id/OIP.g9exLGBY2xbYlR5cYs3FsgHaE8?rs=1&pid=ImgDetMain", cat: "Fruits" },
  { id: 75, name: "Pineapple Fresh", price: 10.29, img: "https://tse2.mm.bing.net/th/id/OIP.QMW-6wNRWnBcf0d0jBLU9wHaE8?rs=1&pid=ImgDetMain", cat: "Fruits" },
  { id: 76, name: "Strawberry Box", price: 9.79, img: "https://tse3.mm.bing.net/th/id/OIP.9-HTStouMVOx9qR6be2NQAHaE8?rs=1&pid=ImgDetMain", cat: "Fruits" },
  { id: 77, name: "Green Grapes", price: 7.49, img: "https://tse3.mm.bing.net/th/id/OIP.GDKhIecb0wLrqBMT0_Z_BAHaFE?rs=1&pid=ImgDetMain", cat: "Fruits" },
  { id: 78, name: "Pomegranate", price: 8.99, img: "https://tse4.mm.bing.net/th/id/OIP.O9h4mYuv8cPC3TVbXYtppgHaE8?rs=1&pid=ImgDetMain", cat: "Fruits" },
  { id: 79, name: "Kiwi Pack", price: 9.29, img: "https://tse2.mm.bing.net/th/id/OIP.srneGY8ua0nTs71uBvL5twHaE8?rs=1&pid=ImgDetMain", cat: "Fruits" },
  { id: 80, name: "Blueberries", price: 11.29, img: "https://tse4.mm.bing.net/th/id/OIP.s29fHr7B1XajgP5sP4PsggHaEK?rs=1&pid=ImgDetMain", cat: "Fruits" },
];

const ProductsPage = () => {
  const [activeCat, setActiveCat] = useState("Frozen food");
  const [cart, setCart] = useState({});

  const filtered = products.filter((p) => p.cat === activeCat);

  const addToCart = (id) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  return (
    <div className="p-6 bg-gradient-to-b from-gray-100 to-gray-300 min-h-screen">

      {/* Category Filter */}
      <div className="flex overflow-x-auto gap-3 pb-4 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`px-5 py-2 min-w-max rounded-full text-sm font-semibold transition shadow-md 
              ${activeCat === cat 
                ? "bg-green-600 text-white shadow-lg scale-105" 
                : "bg-white text-gray-700 hover:bg-green-100"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center transition hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="relative w-full h-32 flex justify-center">
              <img src={p.img} alt={p.name} className="h-full object-contain drop-shadow-md" />
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow">
                Bestseller
              </span>
            </div>

            <h2 className="mt-3 text-sm font-semibold text-center text-gray-800">{p.name}</h2>
            <p className="text-lg font-bold mt-2 text-green-700">${p.price.toFixed(2)}</p>

            <button
              className="mt-3 w-full border border-green-700 text-green-700 font-semibold rounded-full py-2 
              hover:bg-green-700 hover:text-white transition shadow-sm"
              onClick={() => addToCart(p.id)}
            >
              {cart[p.id] ? `Added (${cart[p.id]})` : "Add to Cart"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;
