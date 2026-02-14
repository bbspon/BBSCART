import React from "react";
import { useNavigate } from "react-router-dom";

import Coin from "../../assets/coin.png";
import Franchise from "../../assets/franchise.png";
import Territory from "../../assets/territory.png";
import Vendor from "../../assets/user-avatar.png";
import Agent from "../../assets/delivery.png";
import Delivery from "../../assets/delivery.png";
import CBAV from "../../assets/cbv.png";

function VendorsHome() {
  const navigate = useNavigate();

  const handleRedirect = (path) => {
    navigate(path);
  };

  return (
    <div className="w-full bg-gradient-to-b from-yellow-50 to-white p-6">

      {/* 🌟 Header */}
      <div className="text-center mt-16">
        <h1 className="text-5xl md:text-6xl font-extrabold text-[#8e1c21]">
          BBSCART Partner Network
        </h1>
        <h6 className="text-lg text-gray-600 mt-3">
          Together, We Build. Together, We Grow.
        </h6>
      </div>

      {/* 💫 Intro */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-10 m-8 p-8 border border-yellow-200 rounded-3xl shadow-xl bg-white">
        <div className="max-w-2xl text-gray-800 space-y-4">
          <h5 className="text-2xl font-semibold text-[#8e1c21]">
            At BBSCART, we believe success is best achieved together.
          </h5>
          <p>
            Our platform connects customers, vendors, delivery professionals,
            and regional leaders into one powerful network.
          </p>
          <p>
            Join BBSCART and become part of a growth-driven ecosystem.
          </p>
        </div>

        <div className="text-center">
          <img
            className="rounded-2xl w-[320px] md:w-[520px] shadow-lg"
            src={Coin}
            alt="Coin"
          />
        </div>
      </div>

      {/* 🚀 Partner Buttons */}
      <div className="flex flex-wrap justify-center gap-10 my-12">

        {[
          {
            label: "Franchise",
            icon: Franchise,
            path: "/become-a-franchise-head",
          },
          {
            label: "Territory Head",
            icon: Territory,
            path: "/become-a-territory-head",
          },
          {
            label: "Vendor",
            icon: Vendor,
            path: "/become-a-vendor",
          },
          {
            label: "Agent",
            icon: Agent,
            path: "/become-a-agent",
          },
          {
            label: "Delivery Partner",
            icon: Delivery,
            path: "/become-a-vendor", // ✅ as you requested
          },
          {
            label: "Customer Become A Vendor",
            icon: CBAV,
            path: "/customer-become-a-vendor",
          },
        ].map((item) => (
          <div
            key={item.label}
            onClick={() => handleRedirect(item.path)}
            className="group flex flex-col items-center p-5 rounded-2xl shadow-md cursor-pointer bg-white border hover:border-[#8e1c21] transition-all duration-300 w-[150px] hover:scale-105"
          >
            <img
              src={item.icon}
              alt={item.label}
              className="w-12 h-12 mb-3"
            />
            <span className="text-center font-semibold group-hover:text-[#8e1c21]">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* 💎 Why Partner */}
      <div className="container mx-auto px-6 md:px-20 mb-14 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#8e1c21] mb-5">
          Why Partner with BBSCART?
        </h2>
        <p className="text-gray-700 text-lg max-w-3xl mx-auto">
          Join a trusted ecosystem powered by premium products and strong demand.
        </p>
      </div>

      {/* 🔥 Apply Section */}
      <div className="flex justify-center">
        <button
          onClick={() => navigate("/become-a-vendor")}
          className="px-8 py-3 bg-[#8e1c21] hover:bg-[#a32026] text-white font-semibold rounded-xl shadow hover:scale-105 transition"
        >
          Start Your Journey
        </button>
      </div>

    </div>
  );
}

export default VendorsHome;
