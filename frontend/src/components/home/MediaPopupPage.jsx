// HomePosterPopup.jsx
import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import Poster from "../../../public/img/ad/E-Delivery1.jpg";

const mockMedia = { type: "video", src: Ad };

const HomePosterPopup = () => {
  const [showPopup, setShowPopup] = useState(true);

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md">
      <div className="relative w-[90%] max-w-[1200px] max-h-[90vh] flex items-center justify-center bg-black rounded-2xl overflow-hidden shadow-2xl">
        {/* Cancel Icon */}
        <button
          onClick={() => setShowPopup(false)}
          className="absolute top-4 right-4 z-50 text-white   p-3 rounded-full shadow-2xl transition-transform transform hover:scale-110"
        >
          <FaTimes size={20} />
        </button>

        {/* Media */}
        <div className="w-full h-full flex items-center justify-center">
          {mockMedia.type === "video" ? (
            <video
              src={mockMedia.src}
              autoPlay
              muted
              loop
              className="w-full h-full object-contain rounded-3xl"
            />
          ) : (
            <img
              src={mockMedia.src}
              alt="poster"
              className="w-full h-full object-cover rounded-2xl"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePosterPopup;
