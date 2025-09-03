import React, { useState, useEffect, useRef } from "react";

const videos = [
  "/videos/sample.mp4",
  "/videos/sample2.mp4",
  "/videos/sample3.mp4",
  
  "/videos/thiaworld.mp4",
  "/videos/sample.mp4",
  "/videos/sample.mp4",
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
          video.play().catch(() => {}); // play if allowed
        } else {
          video.pause(); // stop others
        }
      }
    });
  }, [activeIndex, isPlaying]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) next();
    }, 5000);
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
      className="relative w-full h-[600px] flex items-center justify-center bg-white overflow-hidden px-2 md:px-0"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Video Cards */}
      <div className="flex items-center justify-center gap-2 md:gap-4 transition-transform duration-500">
        {videos.map((video, idx) => {
          const isActive = idx === activeIndex;
          const isLeft = idx === (activeIndex - 1 + videos.length) % videos.length;
          const isRight = idx === (activeIndex + 1) % videos.length;

          let style = "scale-90 opacity-50 blur-sm translate-y-5";
          if (isActive) style = "scale-100 opacity-100 blur-0 z-10";
          else if (isLeft) style = "scale-95 opacity-70 -translate-x-4 md:-translate-x-10";
          else if (isRight) style = "scale-95 opacity-70 translate-x-4 md:translate-x-10";

          return (
            <div
              key={idx}
              className={`hero-video ${style}`}
              // className={`relative transition-all duration-700 transform rounded-lg  bg-black overflow-hidden ${style}`}
              style={{
                width: isActive ? "730px" : "200px",
                height: isActive ? "420px" : "340px",
              }}
            >
              <video
                ref={(el) => (videoRefs.current[idx] = el)}
                src={video}
                autoPlay={isActive && isPlaying}
                muted
                loop
                preload="metadata"
                playsInline
                className="w-full h-full object-cover"
              />
              {isActive && (
                <>
                  <button
                    onClick={togglePlay}
                    className="absolute top-4 right-4 bg-white/70 hover:bg-white p-2 rounded-full shadow"
                  >
                    {isPlaying ? <i class="fa fa-pause" aria-hidden="true"></i> : <i class="fa fa-play" aria-hidden="true"></i> }
                  </button>
                  <button className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm">
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
        className="absolute left-2 md:left-16 text-2xl md:text-3xl bg-white/70 hover:bg-white p-2 rounded-full shadow-md"
      >
        ❮
      </button>
      <button
        onClick={next}
        className="absolute right-2 md:right-16 text-2xl md:text-3xl bg-white/70 hover:bg-white p-2 rounded-full shadow-md"
      >
        ❯
      </button>
      <style>
        {`
          .hero-video {
          margin:-50px;
          padding:10px;
          border-radius:10px;
          transform: translate(10%, 0%);
          position: relative;
          right: 20px;

          video{
          border-radius:30px;
          animation: fadeIn 2s ease-in-out;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }

          }
          
          }
        `}
      </style>
    </div>
    
  );
};

export default HeroVideoCarousel;
