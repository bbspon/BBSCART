import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "swiper/css/pagination";

const HeroSection = () => {
 const slides = [
   { id: 1, image: "/img/hero/Grocery2.jpg" },
   { id: 2, image: "/img/hero/Banner4.jpg" },
   { id: 3, image: "/img/hero/Grocery3.jpg" },
   { id: 4, image: "/img/hero/Grocery4.jpg" },
 ];

  return (
    <>
      <section className="w-full mt-12 pt-10">
        <Swiper
          loop
          centeredSlides={true}
          grabCursor={true}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          slidesPerView={1.5}
          spaceBetween={30}
          navigation
          pagination={{ clickable: true }}
          modules={[Autoplay, Pagination, Navigation]}
          breakpoints={{
            0: { slidesPerView: 1, spaceBetween: 10 },
            640: { slidesPerView: 1.2, spaceBetween: 15 },
            1024: { slidesPerView: 1.6, spaceBetween: 25 },
            1440: { slidesPerView: 2.2, spaceBetween: 30 },
          }}
          className="hero-slider w-full"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id} className="flex justify-center">
              <img
                src={slide.image}
                alt="Banner"
                className="w-full h-[450px] object-cover rounded-3xl shadow-xl"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* STYLES */}
        <style>
          {`
            .hero-slider .swiper-slide {
              transition: all 0.45s ease;
              opacity: 0.55;
              transform: scale(0.88);
            }

            .hero-slider .swiper-slide.swiper-slide-active {
              opacity: 1 !important;
              transform: scale(1.05) !important;
              z-index: 20 !important;
            }

          .swiper-button-prev,
.swiper-button-next {
  width: 42px !important;
  height: 42px !important;
  backdrop-filter: blur(6px);
  background: rgba(255, 255, 255, 0.35);
  border-radius: 12px;
  color: #000 !important;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}
.swiper-button-prev:after,
.swiper-button-next:after {
  font-size: 18px !important;
  font-weight: 600;
}


            .swiper-pagination-bullet {
              background: #fff;
              opacity: 0.7;
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
