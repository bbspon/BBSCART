import React from "react";
import Slider from "react-slick";
import { motion } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";

const SectionCategory = () => {
  const categories = [
    {
      id: 1,
      name: "All Products",
      items: 49,
      icon: "https://clipground.com/images/supermarket-products-png-3.png",
      description:
        "A wide variety of fresh and organic fruits to meet your daily nutritional needs",
      bgColor: "bg-gradient-to-br from-blue-100 to-blue-300",
      path: "/all-products", // Added paths here for Link to work
    },
    {
      id: 2,
      name: "Jewellery",
      items: 8,
      icon: "https://png.pngtree.com/png-clipart/20230412/original/pngtree-jewelry-gold-necklace-png-image_9048376.png",
      description:
        "A wide variety of fresh and organic fruits to meet your daily nutritional needs",
      bgColor: "bg-gradient-to-br from-pink-100 to-pink-300",
      path: "https://thiaworld.bbscart.com/",
      external: true, // optional flag
    },

    {
      id: 3,
      name: "Grocery Store",
      items: 291,
      icon: "https://png.pngtree.com/png-clipart/20231118/original/pngtree-assortment-of-grocery-items-arranged-on-photo-png-image_13611479.png",
      description:
        "A wide variety of fresh and organic fruits to meet your daily nutritional needs",
      bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-300",
      path: "/grocery",
    },
    {
      id: 4,
      name: "Fruits",
      items: 412,
      icon: "https://static.vecteezy.com/system/resources/thumbnails/045/911/440/small_2x/assortment-of-tropical-fruits-with-fresh-water-droplets-on-transparent-background-stock-png.png",
      description:
        "A wide variety of fresh and organic fruits to meet your daily nutritional needs",
      bgColor: "bg-gradient-to-br from-green-100 to-green-300",
      path: "/fruits", // Added paths here for Link to work
    },
  ];

  const settings = {
    dots: false,
    infinite: true,
    speed: 800,
    slidesToShow: 5,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1536, settings: { slidesToShow: 4 } }, // large desktops
      { breakpoint: 1280, settings: { slidesToShow: 3 } }, // laptops
      { breakpoint: 1024, settings: { slidesToShow: 2 } }, // tablets landscape
      { breakpoint: 768, settings: { slidesToShow: 1 } },  // tablets portrait & mobiles
    ],
  };

  return (
 <div className="flex justify-center items-center">
      <section className="category-carousel w-full max-w-screen-2xl px-4 md:px-6 lg:px-8 pb-8 md:pb-12">
        <h2 className="font-quicksand text-center text-xl md:text-2xl lg:text-3xl font-bold mb-6">
          Explore Categories
        </h2>
        <Slider {...settings}>
          {categories.map((category) => (
            <div key={category.id} className="p-4">
              <Link to={category.path} className="block">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`category-box p-6 rounded-xl flex flex-col items-center justify-between text-center shadow-xl ${category.bgColor}`}
                >
                  <div className="mb-4 w-full flex justify-center">
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="w-40 h-28 sm:w-48 sm:h-32 md:w-56 md:h-36 object-contain"
                    />
                  </div>
                  <h5 className="text-base md:text-lg font-semibold mb-1">
                    {category.name}
                  </h5>
                  <p className="text-sm text-gray-700">{category.items} items</p>
                  {category.description && (
                    <p className="text-xs text-gray-500 mt-2 hidden md:block">
                      {category.description}
                    </p>
                  )}
                </motion.div>
              </Link>
            </div>
          ))}
        </Slider>
      </section>
    </div>
  );
};

export default SectionCategory;
