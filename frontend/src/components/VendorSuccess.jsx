import React from "react";
import successImage from "../../public/img/ad/Franchisee.jpg";

const VendorSuccess = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#fdf6e3] to-[#fbe6d0] p-8 px-8">
      {/* Hero Image */}
      <img
        src={successImage}
        alt="Franchise Success"
        className="w-full max-h-[100vh] object-cover mb-6  animate-bounce-slow rounded-2xl shadow-lg"
      />

      {/* Optional CTA Button */}
      <button
        className="mt-4 bg-[#6b0e13] hover:bg-[#8c1a20] text-white px-6 py-3 rounded-xl shadow-lg transition-transform transform hover:scale-105"
        onClick={() => (window.location.href = "/")}
      >
        Go to Homepage
      </button>

      {/* Custom animation style */}
      <style>
        {`
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .animate-bounce-slow {
            animation: bounce-slow 2.5s infinite;
          }
        `}
      </style>
    </div>
  );
};

export default VendorSuccess;
