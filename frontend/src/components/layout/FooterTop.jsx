import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function FooterTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <div className="bg-[#cf1717e8] py-3">
        <div className="bbscontainer mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 text-center md:text-left md:w-1/2">
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
      <div className="footer-top bbscontainer py-[50px] max-[1199px]:py-[35px]">
        <div className="flex flex-wrap justify-between relative items-center">
          <div
            className="flex flex-wrap w-full max-[991px]:mb-[-30px]"
            data-aos="fade-up"
            data-aos-duration="1000"
            data-aos-delay="200"
          >
            <div className="min-[992px]:w-[25%] max-[991px]:w-full w-full px-[12px] bb-footer-toggle bb-footer-cat">
              <div className="bb-footer-widget bb-footer-company flex flex-col max-[991px]:mb-[24px]">
                <Link to="/">
                  <img
                    src="/img/logo/BBSCART_LOGO.PNG"
                    className="bb-footer-logo max-w-[144px] mb-[10px] max-[767px]:max-w-[100px]"
                    alt="footer logo"
                  />
                </Link>
                <p className="bb-footer-detail max-w-[400px] mb-[30px] p-[0] font-Poppins text-[14px] leading-[27px] font-normal text-secondary inline-block relative max-[1399px]:text-[15px] max-[1199px]:text-[14px]">
                  BSS Cart is the biggest market of grocery products. Get your
                  daily needs from our store.
                </p>
                <div className="bb-app-store m-[-7px] flex flex-wrap">
                  <Link to="/" className="app-img">
                    <img
                      src="/img/hero/playstore.png"
                      className="adroid max-w-[140px] m-[7px] rounded-[5px] max-[1399px]:max-w-[120px]"
                      alt="apple"
                    />
                  </Link>
                  <Link to="/" className="app-img mt-2">
                    <img
                      src="/img/hero/app.svg"
                      className="apple max-w-[110px] m-[7px] rounded-[5px] max-[1399px]:max-w-[120px]"
                      alt="apple"
                    />
                  </Link>
                </div>
              </div>
            </div>
            <div className="min-[992px]:w-[16.66%] max-[991px]:w-full w-full px-[12px] bb-footer-toggle bb-footer-info">
              <div className="bb-footer-widget">
                <h4 className="bb-footer-heading font-quicksand leading-[1.2] text-[18px] font-bold mb-[20px] text-secondary tracking-[0] relative block w-full pb-[15px] capitalize border-b-[1px] border-solid border-[#eee] max-[991px]:text-[14px]">
                  Quick Links
                </h4>
                <div className="bb-footer-links bb-footer-dropdown  max-[991px]:mb-[35px]">
                  <ul className="align-items-center">
                    <li className="bb-footer-link leading-[1.5] flex items-center mb-[16px] max-[991px]:mb-[15px]">
                      <Link
                        to="/services-terms-of-use"
                        className="transition-all duration-[0.3s] ease-in-out font-Poppins text-[14px] leading-[20px] text-secondary hover:text-primary mb-[0] inline-block break-all tracking-[0] font-normal"
                      >
                        Services Terms of Use
                      </Link>
                    </li>
                    <li className="bb-footer-link leading-[1.5] flex items-center mb-[16px] max-[991px]:mb-[15px]">
                      <Link
                        to="/product/category/womens-jewellery"
                        className="transition-all duration-[0.3s] ease-in-out font-Poppins text-[14px] leading-[20px] text-secondary hover:text-primary mb-[0] inline-block break-all tracking-[0] font-normal"
                      >
                        Jewellery
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="min-[992px]:w-[16.66%] max-[991px]:w-full w-full px-[12px] bb-footer-toggle bb-footer-account">
              <div className="bb-footer-widget">
                <h4 className="bb-footer-heading font-quicksand leading-[1.2] text-[18px] font-bold mb-[20px] text-secondary tracking-[0] relative block w-full pb-[15px] capitalize border-b-[1px] border-solid border-[#eee] max-[991px]:text-[14px]">
                  Customer Service
                </h4>
                <div className="bb-footer-links bb-footer-dropdown  max-[991px]:mb-[35px]">
                  <ul className="align-items-center">
                    <li className="bb-footer-link leading-[1.5] flex items-center mb-[16px] max-[991px]:mb-[15px]">
                      <Link
                        to="/terms-of-use"
                        className="transition-all duration-[0.3s] ease-in-out font-Poppins text-[14px] leading-[20px] text-secondary hover:text-primary mb-[0] inline-block break-all tracking-[0] font-normal"
                      >
                        Terms of use
                      </Link>
                    </li>
                    <li className="bb-footer-link leading-[1.5] flex items-center mb-[16px] max-[991px]:mb-[15px]">
                      <Link
                        to="/privacy-policy"
                        className="transition-all duration-[0.3s] ease-in-out font-Poppins text-[14px] leading-[20px] text-secondary hover:text-primary mb-[0] inline-block break-all tracking-[0] font-normal"
                      >
                        Privacy Policy
                      </Link>
                    </li>
                    <li className="bb-footer-link leading-[1.5] flex items-center mb-[16px] max-[991px]:mb-[15px]">
                      <Link
                        to="/cancellation-policy"
                        className="transition-all duration-[0.3s] ease-in-out font-Poppins text-[14px] leading-[20px] text-secondary hover:text-primary mb-[0] inline-block break-all tracking-[0] font-normal"
                      >
                        Cancellation Policy
                      </Link>
                    </li>
                    <li className="bb-footer-link leading-[1.5] flex items-center mb-[16px] max-[991px]:mb-[15px]">
                      <Link
                        to="/shipping-policy"
                        className="transition-all duration-[0.3s] ease-in-out font-Poppins text-[14px] leading-[20px] text-secondary hover:text-primary mb-[0] inline-block break-all tracking-[0] font-normal"
                      >
                        Shipping Policy
                      </Link>
                    </li>
                    <li className="bb-footer-link leading-[1.5] flex items-center mb-[16px] max-[991px]:mb-[15px]">
                      <Link
                        to="/refund-policy"
                        className="transition-all duration-[0.3s] ease-in-out font-Poppins text-[14px] leading-[20px] text-secondary hover:text-primary mb-[0] inline-block break-all tracking-[0] font-normal"
                      >
                        Refund Policy
                      </Link>
                    </li>
                    <li className="bb-footer-link leading-[1.5] flex items-center mb-[16px] max-[991px]:mb-[15px]">
                      <Link
                        to="/buyback-policy"
                        className="transition-all duration-[0.3s] ease-in-out font-Poppins text-[14px] leading-[20px] text-secondary hover:text-primary mb-[0] inline-block break-all tracking-[0] font-normal"
                      >
                        Buyback Policy
                      </Link>
                    </li>
                    <li className="bb-footer-link leading-[1.5] flex items-center mb-[16px] max-[991px]:mb-[15px]">
                      <Link
                        to="/exchange-policy"
                        className="transition-all duration-[0.3s] ease-in-out font-Poppins text-[14px] leading-[20px] text-secondary hover:text-primary mb-[0] inline-block break-all tracking-[0] font-normal"
                      >
                        Exchange Policy
                      </Link>
                    </li>
                    <li className="bb-footer-link leading-[1.5] flex items-center mb-[16px] max-[991px]:mb-[15px]">
                      <Link
                        to="/bank-cashback-policy"
                        className="transition-all duration-[0.3s] ease-in-out font-Poppins text-[14px] leading-[20px] text-secondary hover:text-primary mb-[0] inline-block break-all tracking-[0] font-normal"
                      >
                        Bank Cashback Policy
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="min-[992px]:w-[16.66%] max-[991px]:w-full w-full px-[12px] bb-footer-toggle bb-footer-service">
              <div className="bb-footer-widget">
                <h4 className="bb-footer-heading font-quicksand leading-[1.2] text-[18px] font-bold mb-[20px] text-secondary tracking-[0] relative block w-full pb-[15px] capitalize border-b-[1px] border-solid border-[#eee] max-[991px]:text-[14px]">
                  Vendors
                </h4>
                <div className="bb-footer-links bb-footer-dropdown  max-[991px]:mb-[35px]">
                  <ul className="align-items-center">
                    <li className="bb-footer-link leading-[1.5] flex items-center mb-[16px] max-[991px]:mb-[15px]">
                      <Link
                        to="/login"
                        className="transition-all duration-[0.3s] ease-in-out font-Poppins text-[14px] leading-[20px] text-secondary hover:text-primary mb-[0] inline-block break-all tracking-[0] font-normal"
                      >
                        Sign In
                      </Link>
                    </li>
                    <li className="bb-footer-link leading-[1.5] flex items-center mb-[16px] max-[991px]:mb-[15px]">
                      <Link
                        to="/cart"
                        className="transition-all duration-[0.3s] ease-in-out font-Poppins text-[14px] leading-[20px] text-secondary hover:text-primary mb-[0] inline-block break-all tracking-[0] font-normal"
                      >
                        View Cart
                      </Link>
                    </li>
                    {isAuthenticated && (
                      <li className="bb-footer-link leading-[1.5] flex items-center mb-[16px] max-[991px]:mb-[15px]">
                        <Link
                          to="/orders"
                          className="transition-all duration-[0.3s] ease-in-out font-Poppins text-[14px] leading-[20px] text-secondary hover:text-primary mb-[0] inline-block break-all tracking-[0] font-normal"
                        >
                          Order History
                        </Link>
                      </li>
                    )}
                    <li className="bb-footer-link leading-[1.5] flex items-center mb-[16px] max-[991px]:mb-[15px]">
                      <Link
                        to="/wishlist"
                        className="transition-all duration-[0.3s] ease-in-out font-Poppins text-[14px] leading-[20px] text-secondary hover:text-primary mb-[0] inline-block break-all tracking-[0] font-normal"
                      >
                        Wish List
                      </Link>
                    </li>

                    <li className="bb-footer-link leading-[1.5] flex items-center mb-[16px] max-[991px]:mb-[15px]">
                      <Link
                        to="/become-a-franchise-head "
                        className="transition-all duration-[0.3s] ease-in-out font-Poppins text-[14px] leading-[20px] text-secondary hover:text-primary mb-[0] inline-block break-all tracking-[0] font-normal"
                      >
                        Become a Franchise Head
                      </Link>
                    </li>

                    <li className="bb-footer-link leading-[1.5] flex items-center mb-[16px] max-[991px]:mb-[15px]">
                      <Link
                        to="/become-a-territory-head"
                        className="transition-all duration-[0.3s] ease-in-out font-Poppins text-[14px] leading-[20px] text-secondary hover:text-primary mb-[0] inline-block break-all tracking-[0] font-normal"
                      >
                        Become a Territory Head
                      </Link>
                    </li>
                    <li className="bb-footer-link leading-[1.5] flex items-center mb-[16px] max-[991px]:mb-[15px]">
                      <Link
                        to="/become-a-agent"
                        className="transition-all duration-[0.3s] ease-in-out font-Poppins text-[14px] leading-[20px] text-secondary hover:text-primary mb-[0] inline-block break-all tracking-[0] font-normal"
                      >
                        Become a Agent
                      </Link>
                    </li>
                    <li className="bb-footer-link leading-[1.5] flex items-center mb-[16px] max-[991px]:mb-[15px]">
                      <Link
                        to="/become-a-vendor"
                        className="transition-all duration-[0.3s] ease-in-out font-Poppins text-[14px] leading-[20px] text-secondary hover:text-primary mb-[0] inline-block break-all tracking-[0] font-normal"
                      >
                        Become a Vendor
                      </Link>
                    </li>

                    <li className="bb-footer-link leading-[1.5] flex items-center mb-[16px] max-[991px]:mb-[15px]">
                      <Link
                        to="/delivery-partner"
                        className="transition-all duration-[0.3s] ease-in-out font-Poppins text-[14px] leading-[20px] text-secondary hover:text-primary mb-[0] inline-block break-all tracking-[0] font-normal"
                      >
                        Delivery Partner
                      </Link>
                    </li>
                    <li className="bb-footer-link leading-[1.5] flex items-center mb-[16px] max-[991px]:mb-[15px]">
                      <Link
                        to="/customer-become-a-vendor"
                        className="transition-all duration-[0.3s] ease-in-out font-Poppins text-[14px] leading-[20px] text-secondary hover:text-primary mb-[0] inline-block break-all tracking-[0] font-normal"
                      >
                        Customer Become A Vendor
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="min-[992px]:w-[25%] max-[991px]:w-full w-full px-[12px] bb-footer-toggle bb-footer-cont-social">
              <div className="bb-footer-contact mb-[30px]">
                <div className="bb-footer-widget">
                  <h4 className="bb-footer-heading font-quicksand leading-[1.2] text-[18px] font-bold mb-[20px] text-secondary tracking-[0] relative block w-full pb-[15px] capitalize border-b-[1px] border-solid border-[#eee] max-[991px]:text-[14px]">
                    Contact
                  </h4>
                  <div className="bb-footer-links bb-footer-dropdown  max-[991px]:mb-[35px]">
                    <ul className="align-items-center">
                      <li className="bb-footer-link bb-foo-location flex items-start max-[991px]:mb-[15px] mb-[16px]">
                        <span className="mt-[3px] w-[25px] basis-[auto] grow-[0] shrink-[0]">
                          <i className="ri-map-pin-line leading-[0] text-[18px] text-primary"></i>
                        </span>
                        <p className="m-[0] font-Poppins text-[14px] text-secondary font-normal leading-[28px] tracking-[0.03rem]">
                          Floor, 1st, 5, 2nd, Cross, Bharathy Street, extension
                          Ellaipillaichavady, Anna Nagar, Puducherry, 605005
                        </p>
                      </li>
                      <li className="bb-footer-link bb-foo-call flex items-center max-[991px]:mb-[15px] mb-[16px]">
                        <span className="w-[25px] basis-[auto] grow-[0] shrink-[0]">
                          <i className="ri-phone-fill leading-[0] text-[18px] text-primary"></i>
                        </span>
                        <Link
                          to="tel:04132915916"
                          target="_blank"
                          className="transition-all duration-[0.3s] ease-in-out font-Poppins text-[14px] leading-[20px] text-secondary inline-block relative break-all tracking-[0] font-normal max-[1399px]:text-[15px] max-[1199px]:text-[14px]"
                        >
                          0413 291 5916
                        </Link>
                      </li>
                      <li className="bb-footer-link bb-foo-call flex items-start max-[991px]:mb-[15px] mb-[16px]">
                        <span className="w-[25px] basis-[auto] grow-[0] shrink-[0]">
                          <i className="ri-whatsapp-line leading-[0] text-[18px] text-primary"></i>
                        </span>
                        <Link
                          to="https://wa.me/9600729596"
                          target="_blank"
                          className="transition-all duration-[0.3s] ease-in-out font-Poppins text-[14px] leading-[20px] text-secondary inline-block relative break-all tracking-[0] font-normal max-[1399px]:text-[15px] max-[1199px]:text-[14px]"
                        >
                          +91 9600729596
                        </Link>
                      </li>
                      <li className="bb-footer-link bb-foo-mail flex items-cente">
                        <span className="w-[25px] basis-[auto] grow-[0] shrink-[0]">
                          <i className="ri-mail-line leading-[0] text-[18px] text-primary"></i>
                        </span>
                        <Link
                          to="mailto:example@email.com"
                          className="transition-all duration-[0.3s] ease-in-out font-Poppins text-[14px] leading-[20px] text-secondary inline-block relative break-all tracking-[0] font-normal max-[1399px]:text-[15px] max-[1199px]:text-[14px]"
                        >
                          info@bbscart.com
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="bb-footer-social">
                <div className="bb-footer-widget">
                  <div className="bb-footer-links bb-footer-dropdown  max-[991px]:mb-[35px]">
                    <ul className="flex items-start flex-wrap gap-[5px]">
                      <li>
                        <Link
                          to="https://www.facebook.com/profile.php?id=100090804256179"
                          target="_blank"
                          className="flex items-start justify-center w-[30px] h-[30px]"
                        >
                          <i className="ri-facebook-fill text-[28px] text-[#0e3edb] leading-none"></i>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="https://www.youtube.com/channel/UCNiBeRvAW1bQOUEcaqc0hYA"
                          target="_blank"
                          className="flex items-start justify-center w-[30px] h-[30px]"
                        >
                          <i className="ri-youtube-fill text-[28px] text-[#7a1111] leading-none"></i>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="https://www.linkedin.com/in/pavarasu-mayavan-50a171355/"
                          target="_blank"
                          className="flex items-start justify-center w-[30px] h-[30px]"
                        >
                          <i className="ri-linkedin-fill text-[28px] text-[#1479d8] leading-none"></i>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="https://www.instagram.com/bbscart/?hl=en#"
                          target="_blank"
                          className="flex items-start justify-center w-[30px] h-[30px]"
                        >
                          <i className="ri-instagram-line text-[28px] text-[#b40909] leading-none"></i>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-8 pb-8">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
          className="h-5"
          alt="Visa"
        />
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png"
          className="h-5"
          alt="Mastercard"
        />
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
          className="h-5"
          alt="Paypal"
        />
        <img
          src="https://www.pngmart.com/files/23/American-Express-Logo-PNG-HD.png
          "
          className="h-5"
          alt="Amex"
        />
        <img
          src="https://tse3.mm.bing.net/th/id/OIP.H19H7ULHraLqejoMBjXn6wHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"
          className="h-5"
          alt="Amazon Pay"
        />
      </div>

      <div className="footer-bottom py-[10px] border-t-[1px] border-solid border-[#eee] max-[991px]:py-[15px]">
        <div className="flex flex-wrap justify-between relative items-center mx-auto">
          <div className="flex flex-wrap w-full">
            <div className="bb-bottom-info w-full flex flex-row items-center justify-between max-[991px]:flex-col px-[12px]">
              <div className="footer-copy w-full mb-[15px]">
                <div className="footer-bottom-copy text-center">
                  <div className="bb-copy text-secondary text-[13px] tracking-[1px] text-center font-normal leading-[2]">
                    Copyright ©{" "}
                    <span
                      className="text-secondary text-[13px] tracking-[1px] text-center font-normal"
                      id="copyright_year"
                    ></span>
                    <Link
                      className="site-name transition-all duration-[0.3s] ease-in-out font-medium text-primary hover:text-secondary font-Poppins text-[15px] leading-[28px] tracking-[0.03rem]"
                      to="/"
                    >
                      BSSCART
                    </Link>{" "}
                    All Rights Reserved.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        {isVisible && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-5 right-5 p-1 px-2 text-white rounded-full shadow-lg hover:bg-blue-800 transition bg-gradient-to-r from-logoSecondary to-logoPrimary hover:from-logoPrimary hover:to-logoSecondary"
          >
            <i className="ri-arrow-up-fill"></i>
          </button>
        )}
      </div>
    </>
  );
}

export default FooterTop;
