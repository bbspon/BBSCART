import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";

const HeroSection = () => {
  const slides = [
    {
      id: 1,
      offer: "Flat 30% Off",
      title: "Explore Gold & Silver Jewellery",
      image: "/img/hero/pink-gold.jpg",
      link: "/product/:id",
    },
    {
      id: 2,
      offer: "Flat 30% Off",
      title: "Explore Organic & Fresh Vegetables",
      image: "/img/hero/red-gold.jpg",
      link: "/product/:id",
    },
    {
      id: 3,
      offer: "Flat 30% Off",
      title: "Explore Organic & Fresh Vegetables",
      image: "/img/hero/orange -gold.jpg",
      link: "/product/:id",
    },
  ];

  return (
    <section className="hero-section section-hero mb-5 sm:mb-8">
      <Swiper
        spaceBetween={50}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        modules={[Autoplay]}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="hero-slide-container relative w-full  ">
              {/* Background Image */}
              <img
                src={slide.image}
                alt={slide.title}
                className="<w-full h-full object-cover object-center rounded-md "
              />

              {/* Overlay Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6 z-10">
                {/* Buttons - top left */}
                <div className="flex flex-row justify-between align-items-center sm:flex-row gap-6">
                  <a
                    href={slide.link}
                    className="bg-gradient-to-b from-[#e9ab26] to-[#b7660b] rounded-md shadow text-white 
                    font-medium h-6 max-w-fit px-3 text-xs 
                    leading-tight flex items-start pt-1 hover:shadow-md mb-1"
                  >
                    Shop Now
                  </a>
                  <a
                    href={slide.link}
                    className="bg-gradient-to-b from-[#5bf5138a] to-[#ccc90d8e]
                    rounded-md shadow  text-white font-medium h-6 max-w-fit  px-3 text-xs 
                    leading-tight flex items-start pt-1 hover:shadow-md"
                  >
                    Explore Collections
                  </a>
                </div>

                {/* Text & Offer - bottom center */}

                <div className="flex flex-col items-start justify-end  gap-1 ">
                  <span className="text-xs  font-semibold bg-gray-200 rounded px-2 py-[2px] shadow-sm">
                    {slide.offer}
                  </span>
                  <h2 className="text-white font-medium text-xs sm:text-sm drop-shadow ">
                    {slide.title}
                  </h2>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HeroSection;
