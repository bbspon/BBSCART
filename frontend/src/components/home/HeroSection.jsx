import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "swiper/css/pagination";

const HeroSection = () => {
  const slides = [
    { id: 1, image: "/img/hero/red-gold.jpg" },
    { id: 2, image: "/img/hero/offers.jpg" }, // <-- This one gets 1000px width
    { id: 3, image: "/img/hero/red-gold.jpg" },
    { id: 4, image: "/img/hero/orange-gold.jpg" },
    {
      id: 5,
      image:
        "https://images.pexels.com/photos/531880/pexels-photo-531880.jpeg?cs=srgb&dl=pexels-pixabay-531880.jpg&fm=jpg",
    },
  ];

  const images = [
    "https://png.pngtree.com/background/20230624/original/pngtree-grocery-items-in-3d-view-picture-image_3991295.jpg",
    "https://i.pinimg.com/originals/26/33/da/2633da06590d107e0ab30178022253f8.jpg",
    "https://media.istockphoto.com/photos/large-group-of-food-and-drinks-isolated-on-white-background-picture-id500546148?k=20&m=500546148&s=612x612&w=0&h=kCmgBIrzzbju61HPwPGVahZUo-L2QcOFl5ohr89KCO4=",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Circular rotation logic
  const left = images[(index + 0) % images.length];
  const center = images[(index + 1) % images.length];
  const right = images[(index + 2) % images.length];
  return (
    <>
      <section className="w-full overflow-hidden mt-12 pt-10">
        <Swiper
          loop
          centeredSlides={true}
          grabCursor
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          slidesPerView={3}
          spaceBetween={0}
          navigation
          pagination={{ clickable: true }}
          modules={[Autoplay, Pagination, Navigation]}
          breakpoints={{
            0: { slidesPerView: 1, spaceBetween: 0 },
            640: { slidesPerView: 1.3, spaceBetween: 0 },
            1024: { slidesPerView: 3, spaceBetween: 0 },
          }}
          className="hero-slider w-full"
        >
          {slides.map((slide) => (
            <SwiperSlide
              key={slide.id}
              className="relative flex justify-center"
            >
              <img
                src={slide.image}
                alt="Slide Banner"
                className={`h-[450px] object-cover rounded-3xl shadow-2xl ${
                  slide.id === 2 ? "w-[1500px]" : "w-full"
                }`}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* SLIDE STYLING */}
        <style>
          {`
          .hero-slider .swiper-slide {
            transition: all 0.5s ease;
            opacity: 0.45;
            transform: scale(0.85);
          }

          .hero-slider .swiper-slide.swiper-slide-active {
            opacity: 1 !important;
            transform: scale(1.05) !important;
            z-index: 50 !important;
          }

          .swiper-pagination-bullet {
            background: white;
            opacity: 0.6;
          }
          .swiper-pagination-bullet-active {
            background: #ff6600;
            opacity: 1;
          }
        `}
        </style>
      </section>
    </>
  );
};

export default HeroSection;
