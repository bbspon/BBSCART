import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";

const GregoryStoreHero = () => {
  const leftImages = [
    "https://cdn.create.vista.com/downloads/73f1b298-b3bb-4fb0-98ff-ff07542b8ef1_1024.jpeg",
    "https://cdn.create.vista.com/downloads/06f0e495-4e14-42d6-938c-f7d0c5867e80_1024.jpeg",
    "https://i.pinimg.com/originals/84/f1/41/84f1411eb5f200b48fa8d36848b662e9.jpg",
  ];

  return (
    <div
      className="w-full min-h-screen flex items-center bg-cover bg-center bg-no-repeat p-10"
      style={{
        backgroundImage:
          "url('https://static.vecteezy.com/system/resources/thumbnails/001/905/572/small_2x/blue-paper-background-free-photo.jpg')",
      }}
    >
      {/* LEFT SIDE IMAGE SLIDER */}
      <div className="w-1/2 flex items-center justify-center">
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 2500 }}
          loop={true}
          className="w-3/4 rounded-xl shadow-lg"
        >
          {leftImages.map((img, index) => (
            <SwiperSlide key={index}>
              <img
                src={img}
                className="w-full h-100 object-cover rounded-xl"
                alt="store-product"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* RIGHT SIDE IMAGE + TEXT */}
      <div className="w-1/2 flex flex-col items-center text-center px-10">
        <img
          src="https://www.moneycrashers.com/wp-content/uploads/2018/12/great-online-shopping-sites.jpg"
          className="w-1/2 rounded-xl shadow-lg mb-6"
          alt="main product"
        />

        <h1 className="text-4xl font-bold text-white drop-shadow-lg">
          Online Grocery Store & Delivery
        </h1>

        <button
          onClick={() =>
            (window.location.href = "https://bbscart.com/all-products")
          }
          className="mt-6 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-xl"
        >
          Order Now
        </button>
      </div>
    </div>
  );
};

export default GregoryStoreHero;
