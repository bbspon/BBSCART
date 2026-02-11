import React, { useState } from "react";
import bgImage1 from "../../assets/Categories/offer1.jpg";
import bgImage2 from "../../assets/Categories/offer2.jpg";
import bgImage3 from "../../assets/Categories/offer3.jpg";

const Discounts = () => {
  const [copied, setCopied] = useState(null);
  const offers = [
    {
      title: "10% Off Cashback",
      desc: "Max cashback $100",
      tag: "Limited",
      bg:bgImage1,
    },
    {
      title: "25% Off on Gold",
      desc: "Valid on orders above $500",
      tag: "Hot Deal",
      bg:bgImage2,
    },
    {
      title: "Flat $50 Cashback",
      desc: "New Users Only",
      tag: "New",
      bg: bgImage3,
    },
  ];

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <>
      <div className="border h-5 bg-sky-100"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-8 mt-8 mb-12">
        {offers.map((offer, index) => (
          <div
            key={index}
            className="relative p-4 rounded-xl text-white h-48 flex flex-col justify-end bg-cover bg-center shadow-xl overflow-hidden group transition transform hover:scale-105 hover:shadow-2xl"
            style={{ backgroundImage: `url(${offer.bg})` }}
          >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

            {/* Badge */}
            <span className="absolute top-2 left-2 bg-red-600 text-xs px-2 py-1 rounded-md shadow">
              {offer.tag}
            </span>

            {/* Content */}
            <div className="relative z-10">
              {/* <h4 className="font-bold text-xl">{offer.title}</h4>
              <p className="text-sm opacity-90">{offer.desc}</p> */}

              <div className="flex gap-4">
                {/* Copy Code */}
                {/* <button
                  className="mt-5 bg-white/30 text-white px-2 py-1 rounded-md text-sm font-semibold hover:bg-yellow-300 transition"
                  onClick={() => copyCode(offer.code)}
                >
                  {copied === offer.code ? "Copied!" : `Code: ${offer.code}`}
                </button> */}

                {/* CTA Button */}
                {/* <button className="mt-5 bg-blue-400 px-3 py-1 rounded-md text-sm font-semibold hover:bg-blue-600 transition">
                  Use Now
                </button> */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Discounts;
