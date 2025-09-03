import React, { useState, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function SingleProductGallery({ images }) {
  // ✅ Normalize images: if it's a string, convert it to an array
  const normalizedImages = Array.isArray(images) ? images : images ? [images] : [];

  const [currentImage, setCurrentImage] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({});
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const startPosition = useRef({ x: 0, y: 0 });
  const mainSliderRef = useRef(null);

  const isMobile = window.innerWidth < 768;

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    beforeChange: (_, next) => setCurrentImage(next),
  };

  const thumbnailsSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    focusOnSelect: true,
    arrows: true,
    beforeChange: (_, next) => setCurrentImage(next),
  };

  const handleThumbnailClick = (index) => {
    setCurrentImage(index);
    mainSliderRef.current.slickGoTo(index);
  };

  const handleMouseMove = (e) => {
    if (isMobile) return;

    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      transform: "scale(2)", // Zoom level
      transformOrigin: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setZoomStyle({});
  };

  const handleTapZoom = () => {
    if (!isMobile) return;
    setIsZoomed(!isZoomed);
    if (!isZoomed) setPosition({ x: 0, y: 0 });
  };

  const handleTouchStart = (e) => {
    if (!isZoomed || !isMobile) return;
    const touch = e.touches[0];
    startPosition.current = { x: touch.clientX - position.x, y: touch.clientY - position.y };
  };

  const handleTouchMove = (e) => {
    if (!isZoomed || !isMobile || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - startPosition.current.x,
      y: touch.clientY - startPosition.current.y,
    });
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[900px]">
        {/* Main Image with Zoom Effect */}
        <div className="relative mb-4 border border-gray-200 rounded-lg overflow-hidden">
          <Slider ref={mainSliderRef} {...sliderSettings}>
            {normalizedImages.map((img, index) => (
              <div key={index} className="relative">
                <div
                  className="w-full h-auto max-h-[500px] overflow-hidden flex justify-center items-center touch-none"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onClick={handleTapZoom}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                >
                  <img
                    src={import.meta.env.VITE_API_URL + img}
                    alt={`product-${index + 1}`}
                    className="transition-transform duration-200 ease-in-out"
                    style={{
                      transform: isMobile
                        ? isZoomed
                          ? `scale(2) translate(${position.x}px, ${position.y}px)`
                          : "scale(1)"
                        : zoomStyle.transform,
                      transformOrigin: isMobile ? "center center" : zoomStyle.transformOrigin,
                      cursor: isZoomed ? "grab" : "pointer",
                    }}
                  />
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Thumbnail Slider */}
        {normalizedImages.length > 1 && (
          <Slider {...thumbnailsSettings} className="thumbnail-slider">
            {normalizedImages.map((img, index) => (
              <div
                key={index}
                className={`px-2 ${
                  currentImage === index ? "border rounded-md border-primary" : ""
                }`}
                onClick={() => handleThumbnailClick(index)}
              >
                <img
                  src={import.meta.env.VITE_API_URL + img}
                  alt={`thumbnail-${index + 1}`}
                  className="rounded-lg mx-auto max-h-[100px] object-contain cursor-pointer"
                />
              </div>
            ))}
          </Slider>
        )}
      </div>
    </div>
  );
}

export default SingleProductGallery;