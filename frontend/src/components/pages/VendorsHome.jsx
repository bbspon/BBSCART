import React, { useState, useRef, useEffect } from "react";
import Coin from "../../assets/coin.png";
import Franchise from "../../assets/franchise.png";
import Territory from "../../assets/territory.png";
import Vendor from "../../assets/vendor.png";
import Agent from "../../assets/agent.png";
import Delivery from "../../assets/delivery.png";
import CBAV from "../../assets/cbv.png";

function VendorsHome() {
  const [activeSection, setActiveSection] = useState(null);

  const franchiseRef = useRef(null);
  const territoryRef = useRef(null);
  const agentRef = useRef(null);
  const vendorRef = useRef(null);
  const deliveryRef = useRef(null);
  const becomeVendorRef = useRef(null);

  const handleToggle = (sectionName) => {
    setActiveSection((prev) => (prev === sectionName ? null : sectionName));
  };

  useEffect(() => {
    const scrollMap = {
      franchise: franchiseRef,
      territory: territoryRef,
      agent: agentRef,
      vendor: vendorRef,
      delivery: deliveryRef,
      becomeVendor: becomeVendorRef,
    };
    if (activeSection && scrollMap[activeSection]?.current) {
      scrollMap[activeSection].current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeSection]);

  return (
    <div className="w-full bg-gradient-to-b from-yellow-50 to-white p-6">
      {/* 🌟 Header */}
      <div className="text-center mt-16 animate-fadeIn">
        <h1 className="text-5xl md:text-6xl font-extrabold text-[#8e1c21] tracking-tight drop-shadow-md">
          BBSCART Partner Network
        </h1>
        <h6 className="text-lg md:text-xl text-gray-600 mt-3">
          Together, We Build. Together, We Grow.
        </h6>
      </div>

      {/* 💫 Intro Section */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-10 m-8 p-8 border border-yellow-200 rounded-3xl shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition duration-500">
        <div className="max-w-2xl text-gray-800 space-y-4 leading-relaxed">
          <h5 className="text-2xl font-semibold text-[#8e1c21]">
            At BBSCART, we believe success is best achieved together.
          </h5>
          <p>
            Our platform connects customers, vendors, delivery professionals,
            service providers, and regional leaders into one powerful network
            designed to create real opportunities and drive local economies.
          </p>
          <p>
            When you join BBSCART, you become part of a nationwide movement that
            blends technology, trust, and teamwork to deliver growth for every
            partner.
          </p>
        </div>

        <div className="text-center">
          <img
            className="rounded-2xl w-[320px] md:w-[520px] h-[220px] md:h-[300px] object-cover shadow-lg hover:scale-105 transition-transform duration-500"
            src={Coin}
            alt="Coin"
          />
        </div>
      </div>

      {/* 🚀 Partner Buttons */}
      <div className="flex flex-wrap justify-center gap-10 mx-5 px-5 my-12">
        {[
          { key: "franchise", label: "Franchise", icon: Franchise },
          { key: "territory", label: "Territory Head", icon: Territory },
          { key: "vendor", label: "Vendor", icon: Vendor },
          { key: "agent", label: "Agent", icon: Agent },
          { key: "delivery", label: "Delivery Partner", icon: Delivery },
          {
            key: "becomeVendor",
            label: "Customer Become A Vendor",
            icon: CBAV,
          },
        ].map((item) => (
          <div
            key={item.key}
            onClick={() => handleToggle(item.key)}
            className={`group flex flex-col items-center p-5 rounded-2xl shadow-md cursor-pointer bg-white border border-gray-100 hover:border-[#8e1c21] transition-all duration-300 w-[150px] hover:scale-105 hover:shadow-xl ${
              activeSection === item.key ? "bg-yellow-100 border-[#8e1c21]" : ""
            }`}
          >
            <img
              src={item.icon}
              alt={item.label}
              className="w-12 h-12 mb-3 group-hover:animate-bounce"
            />
            <span className="text-center text-gray-900 font-semibold group-hover:text-[#8e1c21]">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* 💎 Why Partner Section */}
      <div className="container mx-auto px-6 md:px-20 mb-14">
        <div className="border-b-2 border-yellow-200 pb-8 mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#8e1c21] mb-5">
            Why Partner with BBSCART?
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto">
            Joining BBSCART means becoming part of a thriving ecosystem powered
            by trusted services, premium products, and a loyal customer base.
          </p>
          <ul className="list-disc pl-8 mt-6 space-y-2 text-gray-700 text-left max-w-3xl mx-auto">
            <li>
              <strong>Expand Your Reach:</strong> Connect with BBSCART’s
              nationwide customer network.
            </li>
            <li>
              <strong>Operate with Confidence:</strong> Proven systems for
              growth and success.
            </li>
            <li>
              <strong>Flexible Roles:</strong> Choose from franchise, vendor, or
              delivery opportunities.
            </li>
            <li>
              <strong>Continuous Support:</strong> Access marketing and training
              help at every step.
            </li>
            <li>
              <strong>Trusted Brand:</strong> Build under a brand backed by
              integrity and innovation.
            </li>
          </ul>
        </div>

        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#8e1c21] mb-5">
            Products & Services That Empower You
          </h2>
          <ul className="list-disc pl-8 text-gray-700 text-left max-w-3xl mx-auto space-y-2">
            <li>
              <strong>Diverse Product Range:</strong> From jewelry to tech
              gadgets.
            </li>
            <li>
              <strong>Top Quality:</strong> Guaranteed craftsmanship and trust.
            </li>
            <li>
              <strong>Better Margins:</strong> Great value for customers and
              higher returns for you.
            </li>
            <li>
              <strong>Exclusive Offers:</strong> Only through BBSCART partners.
            </li>
            <li>
              <strong>Repeat Business:</strong> Loyal customers, recurring
              income.
            </li>
          </ul>
          <p className="text-center mt-10 text-gray-700 text-lg font-medium">
            Step into your BBSCART journey today — products are ready, customers
            are waiting, and the path to success is open.
          </p>
        </div>
      </div>

      {/* 🔥 Dynamic Role Sections */}
      {[
        {
          key: "franchise",
          ref: franchiseRef,
          title: "Franchise – Shape Your City’s Future with BBSCART",
        },
        {
          key: "territory",
          ref: territoryRef,
          title: "Territory Head – Lead Your Region’s Success with BBSCART",
        },
        {
          key: "vendor",
          ref: vendorRef,
          title: "Vendor – Expand Your Sales with the BBSCART Marketplace",
        },
        {
          key: "agent",
          ref: agentRef,
          title: "Agent – Connect Businesses to BBSCART and Grow Together",
        },
        {
          key: "delivery",
          ref: deliveryRef,
          title: "Delivery Partner – Deliver Value, Earn Income",
        },
        {
          key: "becomeVendor",
          ref: becomeVendorRef,
          title: "Customer Become A Vendor – Turn Shopping into a Business",
        },
      ].map(
        (section) =>
          activeSection === section.key && (
            <div
              key={section.key}
              ref={section.ref}
              className="bg-gradient-to-r from-yellow-50 to-white border border-yellow-200 rounded-3xl shadow-lg mx-auto mb-12 p-6 md:p-10 w-[90%] md:w-[80%] animate-fadeInUp"
            >
              <h4 className="text-2xl md:text-3xl font-semibold text-[#8e1c21] mb-4">
                {section.title}
              </h4>
              <p className="text-gray-700 leading-relaxed">
                Here you can add role-specific content, eligibility criteria,
                earnings, and benefits. Make it visually distinct per section
                (optional).
              </p>
              <div className="flex justify-end mt-6">
                <a
                  href="#"
                  className="px-6 py-2.5 bg-[#8e1c21] hover:bg-[#a32026] text-white font-semibold rounded-lg shadow transition-all hover:scale-105"
                >
                  Apply Now
                </a>
              </div>
            </div>
          )
      )}
    </div>
  );
}

export default VendorsHome;
