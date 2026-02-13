import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function FooterTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.scrollY > 300);
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () =>
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  return (
    <>
      {/* Newsletter Bar */}
      <div className="bg-[#6b0e13] p-3">
        <div className="bbscontainer mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left">
            <div className="md:w-1/2 mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-white">
                Get the Latest Updates
              </h3>
              <p className="text-white/80 mt-2">
                Subscribe to our newsletter for exclusive offers and updates
              </p>
            </div>
            <form className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-3 rounded-md text-gray-800 w-full h-10 md:w-72 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
              <button
                type="submit"
                className="bg-white text-[#cf1717] px-6 py-1 h-10 rounded-md font-semibold hover:bg-gray-200 transition-colors duration-200"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-top bbscontainer py-12 md:py-10 ">
        <div className="flex flex-wrap justify-between items-start">
          {/* Company Info */}
          <div className="w-full sm:w-1/2 lg:w-1/4 px-3 mb-8 sm:mb-10">
            <Link to="/">
              <img
                src="/img/logo/BBSCART_LOGO.PNG"
                className="max-w-[144px] mb-3 mx-auto sm:mx-0"
                alt="footer logo"
              />
            </Link>
            <p className="max-w-[400px] mb-6 text-center sm:text-left font-Poppins text-[14px] leading-[27px] text-secondary">
              BSS Cart is the biggest market of grocery products. Get your daily
              needs from our store.
            </p>
<div className="flex items-center justify-center sm:justify-start flex-wrap gap-3">
  <Link to="/">
    <img
      src="/img/hero/playstore.png"
      className="max-h-[40px] rounded-[5px]"
      alt="Play Store"
    />
  </Link>
  <Link to="/">
    <img
      src="/img/hero/app.svg"
      className="max-h-[30px] rounded-[5px]"
      alt="App Store"
    />
  </Link>
</div>

          </div>

       

          {/* Customer Service */}
          <div className="w-1/2 sm:w-1/2 lg:w-1/6 px-3 mb-8">
            <h4 className="text-lg font-bold text-center  border-b pb-3 mb-5 text-secondary">
              Customer Service
            </h4>
            <ul className="space-y-4 text-center sm:text-left">
              {[
                ["Terms of use", "/terms-of-use"],
                ["Privacy Policy", "/privacy-policy"],
                ["Cancellation Policy", "/cancellation-policy"],
                ["Shipping Policy", "/shipping-policy"],
                ["Refund Policy", "/refund-policy"],
                ["Buyback Policy", "/buyback-policy"],
                ["Exchange Policy", "/exchange-policy"],
                ["Bank Cashback Policy", "/bank-cashback-policy"],
              ].map(([label, path]) => (
                <li key={path}>
                  <Link to={path} className="footer-link">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Vendors */}
          <div className="w-1/2 sm:w-1/2 lg:w-1/6 px-3 mb-8">
            <h4 className="text-lg font-bold border-b text-center  pb-3 mb-5 text-secondary">
              Business Partner
            </h4>
            <ul className="space-y-4 text-center sm:text-left">
              {/* <li>
                <Link to="/login" className="footer-link">
                  Sign In
                </Link>
              </li> */}
              {/* <li>
                <Link to="/cart" className="footer-link">
                  View Cart
                </Link>
              </li> */}
              {/* {isAuthenticated && (
                <li>
                  <Link to="/orders" className="footer-link">
                    Order History
                  </Link>
                </li>
              )} */}
              {/* <li>
                <Link to="/wishlist" className="footer-link">
                  Wish List
                </Link>
              </li> */}
              {[
                ["/become-a-franchise-head", "Become a Franchise Head"],
                ["/become-a-territory-head", "Become a Territory Head"],
                ["/become-a-agent", "Become a Agent"],
                ["/become-a-vendor", "Become a Vendor"],
                ["/become-a-vendor", "Delivery Partner"],
                ["/customer-become-a-vendor", "Customer Become A Vendor"],
              ].map(([path, label]) => (
                <li key={path}>
                  <Link to={path} className="footer-link">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
   {/* Quick Links */}
          <div className="w-100sm:w-1/2 lg:w-1/6 px-3 mb-8 flex justify-center flex-col mx-auto">
            <h4 className="text-lg text-center font-bold border-b pb-3 mb-5 text-secondary">
              Quick Links
            </h4>
            <ul className="space-y-4 text-center sm:text-left">
                 <li>
                <Link to="/cart" className="footer-link">
                  View Cart
                </Link>
              </li>
              {isAuthenticated && (
                <li>
                  <Link to="/orders" className="footer-link">
                    Order History
                  </Link>
                </li>
              )}
              <li>
                <Link to="/wishlist" className="footer-link">
                  Wish List
                </Link>
              </li>
              <li>
                <Link to="/services-terms-of-use" className="footer-link">
                  Services Terms of Use
                </Link>
              </li>
              <li>
                <Link
                  to="/product/category/womens-jewellery"
                  className="footer-link"
                >
                  Jewellery
                </Link>
              </li>
            </ul>
          </div>
          {/* Contact & Social */}
          <div className="w-full sm:w-1/2 lg:w-1/4 px-3 mb-8">
            <h4 className="text-lg text-center  font-bold border-b pb-3 mb-5 text-secondary">
              Contact
            </h4>
            <ul className="space-y-4 text-center sm:text-left">
              <li>
                <i className="ri-map-pin-line text-primary mr-2"></i>
                Floor, 1st, 7, 2nd Cross, Bharathy Street, Anna Nagar,
                Puducherry, 605005
              </li>
              <li>
                <i className="ri-phone-fill text-primary mr-2"></i>
                <Link to="tel:04132915916">0413 291 5916</Link>
              </li>
              <li>
                <i className="ri-whatsapp-line text-primary mr-2"></i>
                <Link to="https://wa.me/9600729596">+91 9600729596</Link>
              </li>
              <li>
                <i className="ri-mail-line text-primary mr-2"></i>
                <Link to="mailto:info@bbscart.com">info@bbscart.com</Link>
              </li>
            </ul>

            {/* Social icons */}
            <ul className="flex justify-center sm:justify-start mt-4 gap-4">
              <li>
                <Link
                  to="https://www.facebook.com/profile.php?id=100090804256179"
                  target="_blank"
                >
                  <i className="ri-facebook-fill text-2xl text-[#0e3edb]"></i>
                </Link>
              </li>
              <li>
                <Link
                  to="https://www.youtube.com/channel/UCNiBeRvAW1bQOUEcaqc0hYA"
                  target="_blank"
                >
                  <i className="ri-youtube-fill text-2xl text-[#7a1111]"></i>
                </Link>
              </li>
              <li>
                <Link
                  to="https://www.linkedin.com/in/pavarasu-mayavan-50a171355/"
                  target="_blank"
                >
                  <i className="ri-linkedin-fill text-2xl text-[#1479d8]"></i>
                </Link>
              </li>
              <li>
                <Link
                  to="https://www.instagram.com/bbscart/?hl=en#"
                  target="_blank"
                >
                  <i className="ri-instagram-line text-2xl text-[#b40909]"></i>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Icons */}
      <div className="flex justify-center gap-4 mt-8 pb-8 flex-wrap">
        {[
          ["Visa", "https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"],
          [
            "Mastercard",
            "https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png",
          ],
          ["Paypal", "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"],
          [
            "Amex",
            "https://www.pngmart.com/files/23/American-Express-Logo-PNG-HD.png",
          ],
          [
            "Amazon Pay",
            "https://tse3.mm.bing.net/th/id/OIP.H19H7ULHraLqejoMBjXn6wHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
          ],
        ].map(([alt, src]) => (
          <img key={alt} src={src} alt={alt} className="h-5" />
        ))}
      </div>

      {/* Footer bottom */}
      <div className="footer-bottom py-3 border-t border-gray-200 text-center">
        <p className="text-secondary text-sm tracking-wide">
          © {new Date().getFullYear()}{" "}
          <Link to="/" className="text-primary hover:text-secondary">
            BSSCART
          </Link>{" "}
          All Rights Reserved.
        </p>
      </div>

      {/* Scroll-to-top button */}
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-5 right-5 p-2 text-white rounded-full shadow-lg bg-gradient-to-r from-logoPrimary to-logoPrimary hover:from-logoPrimary hover:to-logoPrimary transition"
        >
          <i className="ri-arrow-up-fill"  style={{ fontSize: "1.2rem" }}></i>
        </button>
      )}
    </>
  );
}

export default FooterTop;
