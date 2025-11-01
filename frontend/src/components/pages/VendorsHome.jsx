import React, { useState, useRef, useEffect } from "react";
import Coin from "../../assets/coin.png";
import Franchise from "../../assets/franchise.png";
import Territory from "../../assets/territory.png";
import Vendor from "../../assets/vendor.png";
import Agent from "../../assets/delivery.png";
import Delivery from "../../assets/delivery.png";
import CBAV from "../../assets/delivery.png";
function VendorsHome() {
  const [activeSection, setActiveSection] = useState(null);

  // Refs for each section
  const franchiseRef = useRef(null);
  const territoryRef = useRef(null);
  const agentRef = useRef(null);
  const vendorRef = useRef(null);
  const deliveryRef = useRef(null);
  const becomeVendorRef = useRef(null);

  const handleToggle = (sectionName) => {
    setActiveSection((prev) => (prev === sectionName ? null : sectionName));
  };

  // Scroll to section after activation
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
    <>
      {/* Main Heading and Introduction */}
      <div className="text-center  mt-5">
        <h1
          style={{
            fontSize: "48px",
            fontWeight: "bold",
            fontFamily: "Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          }}
        >
          BBSCART Partner Network
        </h1>

        <h6>Together, We Build. Together, We Grow.</h6>
      </div>

      <div className="d-flex justify-content-center align-items-center flex-row m-5  p-5 border rounded ">
        <div className="text-justify" style={{ maxWidth: "900px" }}>
          <h5 className="text-lg font-semibold font-sans text-gray-800">
            At BBSCART, we believe success is best achieved together.
          </h5>
          <p className="text-justify">
            Our platform connects customers, vendors, delivery professionals,
            service providers, and regional leaders into one powerful network,
            designed to create real opportunities, drive local economies, and
            make business easier for everyone.
          </p>
          <p>
            When you join BBSCART, you’re becoming part of a nationwide movement
            that blends technology, trust, and teamwork to deliver growth for
            every partner.
          </p>
        </div>

        {/* Image Section */}
        <div className="container   text-center">
          <div>
            <img
              className="img-fluid mx-auto d-flex justify-content-center "
              style={{ borderRadius: "5%", width: "500px", height: "300px" }}
              src={Coin}
              alt="Coin"
            />
          </div>
        </div>
      </div>

      {/* Buttons to toggle sections */}
      <div className="d-flex justify-content-around align-items-center flex-wrap mx-5 px-5 ">
        {/* Franchise Section */}
        <div
          className="d-flex flex-column align-items-center  rounded p-3"
          // style={{ backgroundColor: "lightyellow" }}
        >
          <img
            src={Franchise}
            alt="Franchise"
            style={{ width: "50px", height: "50px", marginBottom: "10px" }}
          />
          <a
          role="button"
            className="py-2 px-4 text-center rounded "
            style={{ color: "black", textDecoration: "none", width: "100%", }}
            onClick={() => handleToggle("franchise")}
          >
            Franchise
          </a>
        </div>
        {/* Territory Head Section */}
        <div
          className="d-flex flex-column align-items-center  rounded p-3"
          // style={{ backgroundColor: "lightgray" }}
        >
          <img
            src={Territory}
            alt="Territory Head"
            style={{ width: "50px", height: "50px", marginBottom: "10px" }}
          />
          <a
            role="button"
            className="py-2 px-4 text-center rounded"
            style={{
              color: "black",

              textDecoration: "none",
              width: "100%",
            }}
            onClick={() => handleToggle("territory")}
          >
            Territory Head
          </a>
        </div>
        {/* Vendor*/}
        <div
          className="d-flex flex-column align-items-center  rounded p-3"
          // style={{ backgroundColor: "lightgreen" }}
        >
          <img
            src={Vendor}
            alt="vendor"
            style={{ width: "50px", height: "50px", marginBottom: "10px" }}
          />
          <a
            role="button"
            className="py-2 px-4 text-center rounded"
            style={{
              color: "black",
              textDecoration: "none",
              width: "100%",
            }}
            onClick={() => handleToggle("vendor")}
          >
            Vendor
          </a>
        </div>
        {/* Agent */}
        <div
          className="d-flex flex-column align-items-center  rounded p-3"
          // style={{ backgroundColor: "lightblue" }}
        >
          <img
            src={Agent}
            alt="agent"
            style={{ width: "50px", height: "50px", marginBottom: "10px" }}
          />
          <a
            role="button"
            className="py-2 px-4 text-center rounded"
            style={{
              color: "black",
              textDecoration: "none",
              width: "100%",
            }}
            onClick={() => handleToggle("agent")}
          >
            Agent
          </a>
        </div>

        {/* Delivery Partner */}
        <div
          className="d-flex flex-column align-items-center  rounded p-3"
          // style={{ backgroundColor: "orange" }}
        >
          <img
            src={Delivery}
            alt="delivery"
            style={{ width: "50px", height: "50px", marginBottom: "10px" }}
          />
          <a
            role="button"
            className="py-2 px-4 text-center rounded"
            style={{
              color: "black",
              textDecoration: "none",
              width: "100%",
            }}
            onClick={() => handleToggle("delivery")}
          >
            Delivery Partner
          </a>
        </div>

        {/* Customer Become A Vendor */}
        <div
          className="d-flex flex-column align-items-center  rounded p-3"
          // style={{ backgroundColor: "red" }}
        >
          <img
            src={CBAV}
            alt="becomeVendor"
            style={{ width: "50px", height: "50px", marginBottom: "10px" }}
          />
          <a
            role="button"
            className="py-2 px-4 text-center rounded"
            style={{
              color: "black",
              textDecoration: "none",
              width: "100%",
            }}
            onClick={() => handleToggle("becomeVendor")}
          >
            Customer Become A Vendor
          </a>
        </div>

      </div>

      {/* Main Content Section */}
      <div className="container mb-5 p-5 p-4">
       <div className="border-bottom  pb-5  mb-4">

          <h2 className="text-center mb-4">Why Partner with BBSCART?</h2>
          <p className="text-justify ">
            Joining BBSCART means becoming part of a thriving business ecosystem
            powered by high-demand products, trusted services, and a brand
            customers already love. Every partnership is built for growth,
            backed by strong support and endless opportunities.
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2">
            <li>
              <strong>Expand Your Reach</strong> – Connect instantly with
              BBSCART’s ever-growing customer base across multiple regions,
              giving your business greater visibility from day one.
            </li>
            <li>
              <strong>Succeed with a Proven System</strong> – Operate using
              tried-and-tested processes for sales, payments, and marketing that
              are designed to deliver consistent results.
            </li>
            <li>
              <strong>Choose the Role That Fits You Best</strong> – From
              franchise ownership to delivery partnerships, select the
              opportunity that aligns perfectly with your skills and vision.
            </li>
            <li>
              <strong>Grow Every Step of the Way</strong> – Benefit from
              continuous training, dedicated marketing assistance, and the
              latest technology to keep you moving forward. With consistent
              effort in the first few months, many partners build a strong
              foundation that continues to generate income for a lifetime.
            </li>
            <li>
              <strong>Build with a Brand You Can Trust</strong> – BBSCART
              stands for transparency, loyalty, and shared success — your
              achievements are our achievements.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-center mb-4 mt-5">
            Our Products & Services Give You a Strong Advantage:
          </h2>
          <ul>
            <li>
              <strong>Wide & Exciting Range</strong> – Offer customers everything from stunning
              gold jewellery and lifestyle products to groceries, healthcare,
              and innovative tech accessories.
            </li>
            <li>
              <strong>Uncompromising Quality</strong> – Every product and service meets high
              standards of craftsmanship, reliability, and customer
              satisfaction.
            </li>
            <li>
              <strong>Value-Driven Pricing</strong> – Our pricing approach ensures your customers
              enjoy exceptional value while you maintain healthy earnings.
            </li>
            <li>
              <strong>Exclusive BBSCART Offerings</strong> – Access unique in-house products and
              special deals available only through BBSCART.
            </li>
            <li>
              <strong>Naturally Repeatable Sales</strong> – With a focus on essential and
              lifestyle products, you’ll enjoy strong customer loyalty and
              frequent repeat purchases.
            </li>
          </ul>
        </div>

        <p className="text-justify px-5 border-t ">
          Step into your BBSCART journey today , the products are ready, the
          customers are waiting, and the path to success is wide open.
        </p>
      </div>

      {/* Franchise */}
      {activeSection === "franchise" && (
        <div
          ref={franchiseRef}
          className="p-5 mb-5 border rounded p-4"
          style={{ background: "#f8f9fa", margin: "0 9%" }}
        >
          <h4>Franchise – Shape Your City’s Future with BBSCART</h4>
          <p className="text-justify mb-4 mx-5">
            (Hierarchy: Franchise → Agent → Vendor → Customer)
          </p>
          <h6>Role Overview:</h6>
          <p>
            Franchise Owners manage BBSCART’s operations in an exclusive
            territory, bringing the brand’s full range of products and services
            to their community. This is a paid business opportunity with a
            one-time franchisee fee that varies depending on your chosen
            location and region. In addition to your franchise earnings, you’ll
            also enjoy additional revenue benefits from our Delivery Partner
            role, giving you more ways to grow your income. This franchise is
            transferable or saleable only to an immediate family member, and
            only with prior written approval from the Company; BBSCART reserves
            full rights to approve or decline any transfer or sale.
          </p>

          <h6>Your Opportunities & Contributions:</h6>

          <ul>
            <li>
              Establish and operate a BBSCART outlet in your assigned territory
            </li>
            <li>
              Invest in your future with a franchise fee tailored to your area’s
              market potential.
            </li>
            <li>
              Earn dual revenue streams — franchise profits + delivery partner
              incentives.
            </li>
            <li>
              Build strong agent & vendor networks that deliver value to
              customers.
            </li>
            <li>
              Lead your local sales and service team with passion and vision.
            </li>
            <li>
              Benefit from BBSCART’s national brand power, marketing support,
              and training programs.
            </li>
            <li>
              Deliver excellence every day, ensuring customers trust and choose
              BBSCART first
            </li>
          </ul>

          <h6>Registration Process:</h6>

          <ol>
            <li>
              Complete the Franchise Application – Provide your business plan
              and territory preferences
            </li>
            <li>
              Submit Required Documents – Identity proof, address proof, and
              relevant licenses.
            </li>
            <li>
              Admin Review & Approval – Our team verifies your details and
              confirms your franchise rights.
            </li>
            <li>
              Launch Your Franchise Operations – Begin managing your territory
              with full brand and tech support
            </li>
          </ol>
          <div className="d-flex justify-content-end mt-3">
            <a href="#" className="btn btn-primary">
              Apply Now
            </a>
          </div>
        </div>
      )}

      {/* Territory Head */}
      {activeSection === "territory" && (
        <div
          ref={territoryRef}
          className="p-5 mb-5 border rounded p-4"
          style={{ background: "#f8f9fa", margin: "0 9%" }}
        >
          <h4>Territory Head – Lead Your Region’s Success with BBSCART</h4>
          <p className="text-justify mb-4 mx-5">
            (Hierarchy: Franchise → Agent → Vendor → Customer)
          </p>

          <h6>Role Overview:</h6>

          <p>
            Territory Heads oversee BBSCART’s operations across an entire
            region, managing multiple agents and vendors to ensure smooth
            operations, strong sales performance, and brand consistency. This is
            a paid leadership role with a one-time territory fee based on the
            market size and growth potential of your chosen area. Alongside your
            leadership earnings, you’ll also gain additional revenue benefits
            from Delivery Partner operations within your territory.
          </p>

          <p>
            This appointment is non-transferable and non-saleable; it’s a
            personal lifetime leadership role, subject to ongoing performance
            and compliance with Company policies.
          </p>

          <h6>Your Opportunities & Contributions:</h6>
          <ul>
            <li>
              Secure exclusive rights to manage BBSCART operations in your
              region.
            </li>
            <li>
              Invest with a one-time territory fee aligned to your market
              potential.
            </li>
            <li>
              Earn dual income streams — territory profit share + delivery
              partner incentives.
            </li>
            <li>
              Guide and mentor agents and vendors to achieve sales and service
              targets.
            </li>
            <li>
              Coordinate regional marketing and community engagement activities.
            </li>
            <li>
              Leverage BBSCART’s technology, systems, and brand reputation for
              growth.
            </li>
            <li>
              Maintain consistent quality and service standards across your
              region.
            </li>
          </ul>

          <h6>Registration Process:</h6>

          <ol>
            <li>
              Fill the Territory Head Application – Share your leadership
              profile and growth strategy.
            </li>
            <li>
              Upload Required Documents – ID proof, address proof, business
              credentials.
            </li>
            <li>
              Admin Evaluation & Confirmation – Review and approval of territory
              leadership rights.
            </li>
            <li>
              Start Regional Operations – Begin guiding your network with
              BBSCART’s support
            </li>
          </ol>
          <div className="d-flex justify-content-end mt-3">
            <a href="#" className="btn btn-primary">
              Apply Now
            </a>
          </div>
        </div>
      )}

      {/* Vendor */}
      {activeSection === "vendor" && (
        <div
          ref={vendorRef}
          className="mb-5 p-5 border rounded p-4"
          style={{ background: "#f8f9fa", margin: "0 9%" }}
        >
          <h4>Vendor – Expand Your Sales with the BBSCART Marketplace</h4>
          <p className="text-justify mb-4 mx-5">
            (Under Agent or Company → Customer)
          </p>
          <h6>Role Overview:</h6>

          <p>
            Vendors sell their products or services directly on the BBSCART
            platform, gaining access to a large and growing customer base. You
            can start with free registration or choose premium onboarding (paid)
            for enhanced visibility, marketing, and promotional support. Premium
            vendors also have the chance to earn extra revenue by delivering
            their own products as a Delivery Partner.
          </p>

          <p>
            This vendor account/opportunity is non-transferable and
            non-saleable; any change in business ownership requires fresh KYC
            and prior Company approval.
          </p>

          <h6>Your Opportunities & Contributions:</h6>

          <ul>
            <li>
              List your products or services on a trusted, nationwide
              marketplace.
            </li>
            <li>
              Choose free registration or invest in premium onboarding for
              faster growth.
            </li>
            <li>
              Increase sales with priority listings, promotions, and marketing
              boosts.
            </li>
            <li>Earn additional income by managing your own deliveries.</li>
            <li>
              Maintain high-quality products and service to build customer
              loyalty.
            </li>
            <li>Participate in seasonal campaigns and brand-led events.</li>
            <li>Enjoy secure, timely payments with transparent reporting.</li>
          </ul>

          <h6>Registration Process:</h6>

          <ol>
            <li>
              Complete the Vendor Application – Provide your product/service
              details.
            </li>
            <li>
              Upload Required Documents – ID proof, address proof, licenses (if
              required).
            </li>
            <li>
              Admin Verification – Review and approval of your vendor account.
            </li>
            <li>
              Start Selling – List your products and begin fulfilling orders.
            </li>
          </ol>
          <div className="d-flex justify-content-end mt-3">
            <a href="#" className="btn btn-primary">
              Apply Now
            </a>
          </div>
        </div>
      )}

      {/* Agent */}
      {activeSection === "agent" && (
        <div
          ref={agentRef}
          className="p-5 mb-5 border rounded p-4"
          style={{ background: "#f8f9fa", margin: "0 9%" }}
        >
          <h4> Agent – Connect Businesses to BBSCART and Grow Together</h4>
          <p className="text-justify mb-4 mx-5">
            (Under Franchise or Territory Head or Company → Vendor → Customer)
          </p>

          <h6>Role Overview:</h6>
          <p>
            Agents are the link between BBSCART and local vendors, responsible
            for onboarding businesses, supporting them in setup, and ensuring
            they succeed on the platform. This role is free to join but offers
            the opportunity to earn additional income by taking on Delivery
            Partner responsibilities alongside your agent duties.
          </p>
          <p>
            This engagement is non-transferable and non-saleable; it’s a
            lifetime opportunity while you remain active and compliant with
            Company policies.
          </p>

          <h6>Your Opportunities & Contributions:</h6>
          <ul>
            <li>
              Identify, approach, and onboard vendors in your assigned area.
            </li>
            <li>Earn attractive commissions for every vendor you register.</li>
            <li>
              Boost your income by also handling deliveries as a Delivery
              Partner.
            </li>
            <li>Provide training and ongoing support to your vendors.</li>
            <li>
              Represent BBSCART professionally in your community and at events.
            </li>
            <li>Build strong, lasting relationships with local businesses.</li>
            <li>
              Contribute to the growth of your franchise or territory head’s
              network.
            </li>
          </ul>

          <h6>Registration Process:</h6>
          <ol>
            <li>
              Fill the Agent Application – Provide details on your sales or
              networking experience.
            </li>
            <li>
              Upload Required Documents – ID proof, address proof, relevant work
              credentials.
            </li>
            <li>
              Approval & Onboarding – Our team reviews and activates your agent
              profile.
            </li>
            <li>
              Start Connecting Vendors – Begin building your vendor network.
            </li>
          </ol>
          <div className="d-flex justify-content-end mt-3">
            <a href="#" className="btn btn-primary">
              Apply Now
            </a>
          </div>
        </div>
      )}

      {/* Delivery Partner */}
      {activeSection === "delivery" && (
        <div
          ref={deliveryRef}
          className="mb-5 p-5 border rounded p-4"
          style={{ background: "#f8f9fa", margin: "0 9%" }}
        >
          <h4> Delivery Partner – Deliver Value, Earn Income</h4>
          <p className="text-justify mb-4 mx-5">
            (Supports all levels in the hierarchy)
          </p>

          <h6>Role Overview:</h6>
          <p>
            Delivery Partners ensure customers receive their orders quickly and
            safely, representing BBSCART at the final step of service.
            Registration is free, with an option to upgrade to Premium Delivery
            Partner (paid) for priority delivery assignments, optimised routes,
            and higher earnings potential.
          </p>
          <p>
            This role is transferable or saleable only to an immediate family
            member, and only with prior written approval from the Company;
            BBSCART reserves full rights to approve or decline any transfer or
            sale.
          </p>
          <h6>Your Opportunities & Contributions:</h6>

          <ul>
            <li>Earn a steady income for every successful delivery.</li>
            <li>
              Upgrade to premium status for priority routes and better rates.
            </li>
            <li>Represent BBSCART professionally during every delivery.</li>
            <li>
              Enhance customer satisfaction with timely and secure service.
            </li>
            <li>
              Receive fuel allowances, incentives, and bonuses for performance.
            </li>
            <li>Choose flexible working hours to suit your schedule.</li>
            <li>Be a key part of BBSCART’s customer experience.</li>
          </ul>
          <h6>Registration Process:</h6>
          <ol>
            <li>
              Complete the Delivery Partner Application – Include your service
              area and experience.
            </li>
            <li>
              Submit Required Documents – ID proof, address proof, driving
              license (if applicable).
            </li>
            <li>
              Admin Approval – Verification and activation of your account.
            </li>
            <li>Start Delivering – Accept orders and begin earning.</li>
          </ol>
          <div className="d-flex justify-content-end mt-3">
            <a href="#" className="btn btn-primary">
              Apply Now
            </a>
          </div>
        </div>
      )}

      {/* Become A Vendor */}
      {activeSection === "becomeVendor" && (
        <div
          ref={becomeVendorRef}
          className="mb-5 p-5 border rounded p-4"
          style={{ background: "#f8f9fa", margin: "0 9%" }}
        >
          <h4>Customer Become A Vendor – Turn Shopping into a Business</h4>
          <p className="text-justify mb-4 mx-5">
            (Customer moves into Vendor level in hierarchy)
          </p>

          <h6>Role Overview:</h6>
          <p>
            Existing BBSCART customers can upgrade to vendor status,
            transforming their buying experience into an earning opportunity.
            Standard vendor registration is free, while premium onboarding
            (paid) offers greater visibility, priority listings, and marketing
            advantages. Premium customer-vendors can also earn more by
            fulfilling their own deliveries.
          </p>
          <p>
            Your upgraded vendor account is non-transferable and non-saleable;
            any ownership change requires re-registration and prior Company
            approval.
          </p>
          <h6>Your Opportunities & Contributions:</h6>

          <ul>
            <li>Seamlessly upgrade your existing account to start selling.</li>
            <li>Choose free or premium onboarding based on your goals.</li>
            <li>
              Earn dual income streams — sales profits + delivery incentives.
            </li>
            <li>
              Benefit from the trust you’ve already built as a BBSCART customer.
            </li>
            <li>Access BBSCART’s tools, training, and promotional support.</li>
            <li>Expand your reach by tapping into our active customer base.</li>
            <li>
              Grow your business with a platform that champions local sellers.
            </li>
          </ul>

          <h6>Registration Process:</h6>

          <ol>
            <li>
              Submit Upgrade Application – Request vendor status from your
              customer account.
            </li>
            <li>
              Upload Required Documents – ID proof, address proof, licenses (if
              needed).
            </li>
            <li>Admin Verification – Approval of your vendor profile.</li>
            <li>
              Start Selling – List your products and serve BBSCART customers.
            </li>
          </ol>
          <div className="d-flex justify-content-end mt-3">
            <a href="#" className="btn btn-primary">
              Apply Now
            </a>
          </div>
        </div>
      )}
    </>
  );
}

export default VendorsHome;
