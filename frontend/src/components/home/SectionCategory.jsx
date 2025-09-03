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
    speed: 1000,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <section className="category-carousel pb-6 md:pb-12 max-w-[85%] md:max-w-full mx-auto">

      <h2 className="font-quicksand text-center text-lg md:text-xl lg:text-2xl font-bold md:mb-4">
        Explore Categories
      </h2>
      <div>
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
                  className={`category-box p-6 rounded-xl flex flex-col items-center justify-between text-center w-[300px] h-[350px] shadow-xl ${category.bgColor}`}
                >
                  <div className="category-image mb-4">
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="w-[250px] h-[150px] object-contain"
                    />
                  </div>
                  <h5 className="text-md md:text-lg font-semibold mb-1">
                    {category.name}
                  </h5>
                  <p className="text-sm text-gray-700">
                    {category.items} items
                  </p>
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
      </div>
    </section>
  );
};

export default SectionCategory;
