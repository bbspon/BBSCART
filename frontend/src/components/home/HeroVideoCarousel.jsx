import React, { useState, useEffect, useRef } from "react";

const videos = [
  "/videos/sample.mp4",
  "/videos/sample2.mp4",
  "/videos/sample3.mp4",
  "/videos/sample.mp4",
  "/videos/sample2.mp4",
  "/videos/sample3.mp4",
];

const HeroVideoCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRefs = useRef([]);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (video) {
        if (idx === activeIndex && isPlaying) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    });
  }, [activeIndex, isPlaying]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) next();
    }, 6000);
    return () => clearInterval(interval);
  }, [activeIndex, isPlaying]);

  const next = () => {
    setActiveIndex((prev) => (prev + 1) % videos.length);
  };

  const prev = () => {
    setActiveIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
    const currentVideo = videoRefs.current[activeIndex];
    if (currentVideo) {
      isPlaying ? currentVideo.pause() : currentVideo.play();
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    if (touchStartX.current - touchEndX.current > 50) {
      next();
    } else if (touchEndX.current - touchStartX.current > 50) {
      prev();
    }
  };

  return (
    <div
      className="relative w-full h-[650px] flex items-center justify-center bg-white overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Video Cards */}
      <div className="flex items-center justify-center gap-4 transition-transform duration-500">
        {videos.map((video, idx) => {
          const isActive = idx === activeIndex;
          const isLeft = idx === (activeIndex - 1 + videos.length) % videos.length;
          const isRight = idx === (activeIndex + 1) % videos.length;

          let style =
            "scale-90 opacity-40 blur-[2px] translate-y-6 pointer-events-none";
          if (isActive)
            style =
              "scale-105 opacity-100 blur-0 translate-y-0 z-20 shadow-xl";
          else if (isLeft)
            style =
              "scale-95 opacity-70 -translate-x-6 md:-translate-x-16 z-10";
          else if (isRight)
            style =
              "scale-95 opacity-70 translate-x-6 md:translate-x-16 z-10";

          return (
            <div
              key={idx}
              className={`relative transform transition-all duration-700 ease-in-out    bg-red-300 rounded-xl overflow-hidden ${style}`}
              style={{
                width: isActive ? "500px" : "300px",
                height: isActive ? "400px" : "380px",
                margin:"-40px",
                padding:"1px"
              }}
            >
              <video
                ref={(el) => (videoRefs.current[idx] = el)}
                src={video}
                autoPlay={isActive && isPlaying}
                muted
                loop
                playsInline
                preload="metadata"
                className="w-full h-full object-cover rounded-xl "
              />
              {isActive && (
                <>
                  <button
                    onClick={togglePlay}
                    className="absolute top-4 right-4 rounded-full text-yellow-600 text-[40px] shadow-lg transition"
                  >
                    {isPlaying ? <i className="ri-pause-circle-line"></i> : <i className="ri-play-circle-fill"></i>}
                  </button>
                  <button className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-md shadow-md transition">
                    View
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prev}
        className="absolute left-2 md:left-12 text-2xl md:text-3xl bg-white/50 hover:bg-white p-2 rounded-full shadow-md z-30"
      >
        <i className="ri-arrow-left-double-fill"></i>
      </button>
      <button
        onClick={next}
        className="absolute right-2 md:right-12 text-2xl md:text-3xl bg-white/50 hover:bg-white p-2 rounded-full shadow-md z-30"
      >
        <i className="ri-arrow-right-double-line"></i>
      </button>
    </div>
  );
};

export default HeroVideoCarousel;