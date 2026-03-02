import React, { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import toast from "react-hot-toast";
import Button from "../layout/Button";
import { ProductService } from "../../services/ProductService";
import { useSelector, useDispatch } from "react-redux";
import { placeOrder } from "../../slice/orderSlice";
import { GetCountries, GetState, GetCity } from "react-country-state-city";
import { removeFromCart, fetchCartItems, clearCart } from "../../slice/cartSlice";
import SlotPicker from "../../components/SlotPicker";
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function pickMainImage(p) {
  const pickFromArray = (v) => (Array.isArray(v) && v.length ? v[0] : "");

  let raw = "";
  raw = raw || p?.image;
  raw = raw || p?.product_img_url;
  raw = raw || pickFromArray(p?.gallery_img_urls);
  raw = raw || pickFromArray(p?.gallery_imgs);
  raw = raw || p?.product_img;

  if (!raw) return "/img/placeholder.png";

  if (String(raw).includes("|")) raw = String(raw).split("|")[0].trim();

  if (String(raw).startsWith("/uploads/")) return `${API_BASE}${raw}`;

  if (/^https?:\/\//i.test(String(raw))) return raw;

  return `${API_BASE}/uploads/${encodeURIComponent(String(raw))}`;
}

function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const user = useSelector((state) => state.auth.user);
  const auth = useSelector((state) => state.auth);
  const reduxCartItems = useSelector((state) => state.cart.items || []);

  console.log("CHECKOUT USER →", user);
  console.log("AUTH STATE →", auth);
  console.log("CHECKOUT LOCATION STATE →", location.state);
  console.log("REDUX CART ITEMS →", reduxCartItems);

  // Check if this is a direct purchase from Buy Now button
  const isDirectPurchase = location.state?.directPurchase === true;
  const directProduct = location.state?.product;

  // Normalize Redux cart items to a consistent format
  const cartItems = useMemo(() => {
    // If direct purchase, use the product passed via route state
    if (isDirectPurchase && directProduct) {
      return [{
        productId: directProduct.productId,
        variantId: directProduct.variantId || null,
        name: directProduct.name || "Product",
        price: Number(directProduct.price || 0),
        qty: Number(directProduct.quantity || 1),
        image: directProduct.image || "",
      }];
    }

    // Otherwise, use Redux cart items
    const itemsArray = Array.isArray(reduxCartItems) ? reduxCartItems : Object.values(reduxCartItems || {});
    return itemsArray.map((item) => {
      const productObj = item.product && typeof item.product === "object" ? item.product : null;
      return {
        productId: productObj?._id || item.productId || item.product || item._id,
        variantId: item.variant?._id || item.variantId || item.variant || null,
        name: productObj?.name || item.name || productObj?.title || "Product",
        price: Number(item.quantityPrice || item.price || productObj?.price || productObj?.mrp || 0),
        qty: Number(item.quantity || item.qty || 0),
        image: productObj?.product_img_url
          || productObj?.product_img
          || (Array.isArray(productObj?.gallery_img_urls) && productObj.gallery_img_urls[0])
          || item.image
          || ""

      };
    });
  }, [reduxCartItems, isDirectPurchase, directProduct]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total + (Number(item.price) || 0) * (Number(item.qty) || 0),
      0
    );
  }, [cartItems]);

  const [orderData, setOrderData] = useState({
    user_id: user?._id || "",
    orderItems: cartItems.map((item) => ({
      product: item.productId,
      quantity: item.qty,
      price: Number(item.price) || 0,
      variant: item.variantId || null,
    })),
    totalAmount: cartTotal,
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    paymentMethod: "COD",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderData((prevData) => ({
      ...prevData,
      shippingAddress: { ...prevData.shippingAddress, [name]: value },
    }));
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setOrderData((prevData) => ({
      ...prevData,
      shippingAddress: {
        ...prevData.shippingAddress,
        [name]: selectedOption.label,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // require a delivery slot before placing order
    if (!deliverySlot) {
      toast.error("Please select a delivery slot.");
      return;
    }

    const sdkLoaded = await loadRazorpay();

    const authUser =
      user || JSON.parse(localStorage.getItem("auth_user") || "null");

    const finalOrder = {
      user_id: authUser?._id || authUser?.userId || "",
      orderItems: (Array.isArray(cartItems) ? cartItems : []).map((item) => ({
        product: item.productId || item._id || item.id,
        quantity: Number(item.qty) || 0,
        price: Number(item.price) || 0,
        variant: item.variantId || null,
      })),
      totalAmount: Number(cartTotal) || 0,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod || "COD",
      deliverySlot: deliverySlot,
    };

    console.log("✅ Final Order Payload:", finalOrder);

    if (!finalOrder.orderItems.length || finalOrder.totalAmount <= 0) {
      return toast.error("Your cart is empty.");
    }

    try {
      const response = await dispatch(placeOrder(finalOrder));
      console.log("Dispatch Response:", response);

      if (!response.payload?.success) {
        toast.error(response.payload?.message || "Failed to place order.");
        return;
      }

      const createdOrder = response.payload.order;
      const method = createdOrder?.payment_method || finalOrder.paymentMethod;
      const sentToDelivery = response.payload?.sentToDelivery === true;
      const deliveryOrderId = response.payload?.deliveryOrderId;
      const trackingId = response.payload?.trackingId;
      const deliverySuccessState = { sentToDelivery, deliveryOrderId, trackingId, order: createdOrder };

      if (createdOrder?.order_id) {
        try {
          const key = "bbscart_recent_order_ids";
          const raw = localStorage.getItem(key);
          const arr = raw ? JSON.parse(raw) : [];
          if (!arr.includes(createdOrder.order_id)) arr.unshift(createdOrder.order_id);
          localStorage.setItem(key, JSON.stringify(arr.slice(0, 20)));
        } catch (_) { }
      }

      // === Razorpay path ===
      if (method === "Razorpay") {
        if (!sdkLoaded) {
          toast.error("Payment SDK failed to load");
          return;
        }

        const rpOrderId = createdOrder?.order_id;
        if (!rpOrderId || !rpOrderId.startsWith("order_")) {
          toast.error("Invalid Razorpay order id");
          return;
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: Math.round(createdOrder.total_price * 100),
          currency: "INR",
          name: "BBSCART",
          description: "Order Payment",
          order_id: rpOrderId,
          handler: async (rzpRes) => {
            try {
              const paymentData = {
                razorpay_order_id: rzpRes.razorpay_order_id,
                razorpay_payment_id: rzpRes.razorpay_payment_id,
                razorpay_signature: rzpRes.razorpay_signature,
              };
              const verifyRes = await ProductService.verifyPayment(paymentData);
              if (verifyRes.success) {
                cartItems.forEach((item) =>
                  dispatch(
                    removeFromCart({
                      productId: item.productId,
                      variantId: item.variantId || null,
                    })
                  )
                );
                dispatch(clearCart());
                toast.success(
                  sentToDelivery
                    ? "Payment successful, order placed! Assigned order has been sent to the delivery app."
                    : "Payment successful, order placed!"
                );
                navigate(`/invoice/${createdOrder._id}`);
              } else {
                toast.error(verifyRes.message || "Payment verification failed");
              }
            } catch (err) {
              console.error(err);
              toast.error("Payment verification failed!");
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.details?.phone,
          },
          theme: { color: "#3399cc" },
        };

        new window.Razorpay(options).open();
        return;
      }

      // === COD or other non-gateway methods ===
      cartItems.forEach((item) =>
        dispatch(
          removeFromCart({
            productId: item.productId,
            variantId: item.variantId || null,
          })
        )
      );
      dispatch(clearCart());
      if (sentToDelivery) {
        toast.success(
          trackingId
            ? "Order placed successfully! Assigned order has been sent to the delivery app. Tracking ID: " + trackingId
            : "Order placed successfully! Assigned order has been sent to the delivery app."
        );
      } else {
        toast.success("Order placed successfully!");
      }
      navigate("/orders/success", { state: deliverySuccessState });
    } catch (error) {
      console.error("Order Error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  // ===================== Address Dropdown Logic ===================== //
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [deliverySlot, setDeliverySlot] = useState(null);
  const deliveryPincode = orderData?.shippingAddress?.postalCode || "";
  useEffect(() => {
    const fetchCountries = async () => {
      const countryList = await GetCountries();
      if (Array.isArray(countryList)) {
        setCountries(
          countryList.map((country) => ({
            value: country.id,
            label: country.name,
          }))
        );
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchStates = async () => {
      const selectedCountry = countries.find(
        (c) => c.label === orderData.shippingAddress.country
      );
      if (selectedCountry) {
        const stateList = await GetState(selectedCountry.value);
        if (Array.isArray(stateList)) {
          setStates(
            stateList.map((state) => ({ value: state.id, label: state.name }))
          );
        } else {
          setStates([]);
        }
      }
    };
    if (orderData.shippingAddress.country) fetchStates();
  }, [orderData.shippingAddress.country, countries]);

  useEffect(() => {
    const fetchCities = async () => {
      const selectedCountry = countries.find(
        (c) => c.label === orderData.shippingAddress.country
      );
      const selectedState = states.find(
        (s) => s.label === orderData.shippingAddress.state
      );

      if (selectedCountry && selectedState) {
        const cityList = await GetCity(
          selectedCountry.value,
          selectedState.value
        );
        if (Array.isArray(cityList)) {
          setCities(
            cityList.map((city) => ({ value: city.id, label: city.name }))
          );
        } else {
          setCities([]);
        }
      }
    };
    if (orderData.shippingAddress.state) fetchCities();
  }, [orderData.shippingAddress.state, states]);

  // Fetch cart items on component mount (only if not direct purchase)
  useEffect(() => {
    if (!isDirectPurchase) {
      dispatch(fetchCartItems());
    }
  }, [dispatch, isDirectPurchase]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return (
    <>
      <section className="section-checkout bbscontainer pt-[50px] max-[1199px]:pt-[35px]">
        <div className="flex flex-wrap justify-between relative items-center">
          <div className="flex flex-wrap w-full mb-[-24px]">
            <div className="min-[992px]:w-[33.33%] w-full px-[12px] mb-[24px]">
              <div className="bb-checkout-sidebar mb-[-24px]">
                <div className="checkout-items border-[1px] border-solid border-[#eee] p-[20px] rounded-[20px] mb-[24px] aos-init aos-animate">
                  <div className="sub-title mb-[12px]">
                    <h4 className="font-quicksand tracking-[0.03rem] leading-[1.2] text-[20px] font-bold text-secondary">
                      summary
                    </h4>
                  </div>
                  <div className="checkout-summary mb-[20px] border-b-[1px] border-solid border-[#eee]">
                    <ul className="mb-[20px]">
                      <li className="flex justify-between leading-[28px] mb-[8px]">
                        <span className="left-item font-Poppins leading-[28px] tracking-[0.03rem] text-[14px] font-medium text-secondary">
                          sub-total
                        </span>
                        <span className="font-Poppins leading-[28px] tracking-[0.03rem] text-[14px] font-medium text-secondary">
                          Rs {cartTotal ?? 0}
                        </span>
                      </li>
                      <li className="flex justify-between leading-[28px] mb-[8px]">
                        <span className="left-item font-Poppins leading-[28px] tracking-[0.03rem] text-[14px] font-medium text-secondary">
                          Delivery Charges
                        </span>
                        <span className="font-Poppins leading-[28px] tracking-[0.03rem] text-[14px] font-medium text-secondary">
                          Rs 0
                        </span>
                      </li>
                      <li className="flex justify-between leading-[28px] mb-[8px]">
                        <span className="left-item font-Poppins leading-[28px] tracking-[0.03rem] text-[14px] font-medium text-secondary">
                          Coupon Discount
                        </span>
                        <span className="font-Poppins leading-[28px] tracking-[0.03rem] text-[14px] font-medium text-secondary">
                          <a
                            href=""
                            className="apply drop-coupon font-Poppins leading-[28px] tracking-[0.03rem] text-[14px] font-medium text-[#ff0000]"
                          >
                            Apply Coupon
                          </a>
                        </span>
                      </li>
                      <li className="flex justify-between leading-[28px]">
                        <div className="coupon-down-box w-full">
                          <form className="relative">
                            <input
                              className="bb-coupon w-full p-[10px] text-[14px] font-normal text-secondary border-[1px] border-solid border-[#eee] outline-[0] rounded-[10px]"
                              type="text"
                              placeholder="Enter Your coupon Code"
                              name="bb-coupon"
                              required=""
                            />
                            <button
                              className="bb-btn-2 transition-all duration-[0.3s] ease-in-out my-[8px] mr-[8px] flex justify-center items-center absolute right-[0] top-[0] bottom-[0] font-Poppins leading-[28px] tracking-[0.03rem] py-[2px] px-[12px] text-[13px] font-normal border-primary text-white bg-primary hover:bg-transparent hover:text-secondary rounded-[10px] border-[1px] border-solid"
                              type="submit"
                            >
                              Apply
                            </button>
                          </form>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="bb-checkout-pro mb-[-24px]">
                    {cartItems && cartItems.length > 0 ? (
                      cartItems.map((item, idx) => (
                        <div
                          key={item.productId + "-" + idx}
                          className="pro-items p-[15px] bg-[#f8f8fb] border border-[#eee] rounded-[20px] flex mb-[24px] max-[420px]:flex-col"
                        >
                          <div className="image mr-[15px] max-[420px]:mr-[0] max-[420px]:mb-[15px]">
                            <img
                              src={pickMainImage(item)}
                              alt={item.name || "Product"}
                              className="max-w-max w-[100px] h-[100px] border-[1px] border-solid border-[#eee] rounded-[20px]"
                            />

                          </div>
                          <div className="items-contact">
                            <h4 className="text-[16px]">
                              <Link
                                to={`/product/${item.productId}`}
                                className="font-Poppins tracking-[0.03rem] text-[15px] font-medium leading-[18px] text-secondary"
                              >
                                {item.name}
                              </Link>
                            </h4>
                            <div className="inner-price flex items-center justify-left mb-[4px]">
                              <span className="new-price font-Poppins text-secondary font-semibold leading-[26px] tracking-[0.02rem] text-[15px]">
                                ₹{Number(item.price).toFixed(2)}
                              </span>
                              <span className="old-price ml-[10px] font-Poppins text-[#777] font-semibold leading-[26px] tracking-[0.02rem] text-[15px]">
                                {" "}
                                × {item.qty}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="w-full text-center">
                        <h3 className="font-Poppins mt-5 text-[16px] text-secondary">
                          Your cart is empty.
                        </h3>
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className="checkout-items border-[1px] border-solid border-[#eee] p-[20px] rounded-[20px] mb-[24px] aos-init aos-animate"
                  data-aos="fade-up"
                  data-aos-duration="1000"
                  data-aos-delay="400"
                >
                  <div className="sub-title mb-[12px]">
                    <h4 className="font-quicksand tracking-[0.03rem] leading-[1.2] text-[20px] font-bold text-secondary">
                      Delivery Method
                    </h4>
                  </div>
                  <div className="checkout-method mb-[24px]">
                    <span className="details font-Poppins leading-[26px] tracking-[0.02rem] text-[15px] font-medium text-secondary">
                      Please select your preferred payment method.
                    </span>
                    <div className="bb-del-option mt-[12px] flex max-[480px]:flex-col">
                      <div className="inner-del w-[50%] max-[480px]:w-full">
                        <div className="radio-itens">
                          <input
                            type="radio"
                            id="cod"
                            name="paymentMethod"
                            value="COD"
                            checked={orderData.paymentMethod === "COD"}
                            onChange={(e) =>
                              setOrderData({
                                ...orderData,
                                paymentMethod: e.target.value,
                              })
                            }
                            className="w-auto mr-[5px]"
                          />
                          <label
                            htmlFor="cod"
                            className="relative pl-[10px] cursor-pointer leading-[16px] inline-block text-secondary tracking-[0]"
                          >
                            Cash on Delivery
                          </label>
                        </div>
                      </div>

                      <div className="inner-del w-[50%] max-[480px]:w-full">
                        <div className="radio-itens">
                          <input
                            type="radio"
                            id="razorpay"
                            name="paymentMethod"
                            value="Razorpay"
                            checked={orderData.paymentMethod === "Razorpay"}
                            onChange={(e) =>
                              setOrderData({
                                ...orderData,
                                paymentMethod: e.target.value,
                              })
                            }
                            className="w-auto mr-[5px]"
                          />
                          <label
                            htmlFor="razorpay"
                            className="relative pl-[10px] cursor-pointer leading-[16px] inline-block text-secondary tracking-[0]"
                          >
                            Pay Online (Razorpay)
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="about-order">
                    <h5 className="font-quicksand tracking-[0.03rem] leading-[1.2] mb-[12px] text-[15px] font-medium text-secondary">
                      Add Comments About Your Order
                    </h5>
                    <textarea
                      name="your-commemt"
                      placeholder="Comments"
                      className="w-full h-[100px] p-[10px] text-[14px] font-normal text-secondary border-[1px] border-solid border-[#eee] outline-[0] rounded-[10px]"
                    ></textarea>
                  </div>
                </div>
                {/* <div
                  className="checkout-items border-[1px] border-solid border-[#eee] p-[20px] rounded-[20px] mb-[24px] aos-init aos-animate"
                  data-aos="fade-up"
                  data-aos-duration="1000"
                  data-aos-delay="600"
                >
                  <div className="sub-title mb-[12px]">
                    <h4 className="font-quicksand tracking-[0.03rem] leading-[1.2] text-[20px] font-bold text-secondary">
                      Payment Method
                    </h4>
                  </div>
                  <div className="checkout-method mb-[24px]">
                    <span className="details font-Poppins leading-[26px] tracking-[0.02rem] text-[15px] font-medium text-secondary">
                      Please select the preferred shipping method to use on this
                      order.
                    </span>
                    <div className="bb-del-option mt-[12px] flex max-[480px]:flex-col">
                      <div className="inner-del w-[50%] max-[480px]:w-full">
                        <div className="radio-itens">
                          <input
                            type="radio"
                            id="Cash1"
                            name="radio-itens"
                            className="w-full p-[10px] text-[14px] font-normal text-secondary border-[1px] border-solid border-[#eee] outline-[0] rounded-[10px]"
                          />
                          <label
                            htmlFor="Cash1"
                            className="relative pl-[26px] cursor-pointer leading-[16px] inline-block text-secondary tracking-[0]"
                          >
                            Cash On Delivery
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="about-order">
                    <h5 className="font-quicksand tracking-[0.03rem] leading-[1.2] mb-[12px] text-[15px] font-medium text-secondary">
                      Add Comments About Your Order
                    </h5>
                    <textarea
                      name="your-commemt"
                      placeholder="Comments"
                      className="w-full h-[100px] p-[10px] text-[14px] font-normal text-secondary border-[1px] border-solid border-[#eee] outline-[0] rounded-[10px]"
                    ></textarea>
                  </div>
                </div> */}
              </div>
            </div>
            <div className="min-[992px]:w-[66.66%] w-full px-[12px] mb-[24px]">
              <div
                className="bb-checkout-contact border-[1px] border-solid border-[#eee] p-[20px] rounded-[20px] aos-init aos-animate"
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-delay="400"
              >
                {!user ? (
                  <>
                    <div className="main-title mb-[20px]">
                      <h4 className="font-quicksand tracking-[0.03rem] leading-[1.2] text-[20px] font-bold text-secondary">
                        Before placing order please log in
                      </h4>
                      <p className="font-Poppins leading-[28px] mt-3 tracking-[0.03rem] mb-[16px] text-[14px] font-light text-secondary">
                        By creating an account you will be able to shop faster,
                        be up to date on an order's status, and keep track of
                        the orders you have previously made.
                      </p>
                      <div className="flex flex-row gap-2">
                        <Button link="/register" name="Register" />
                        <Button link="/login" name="Login" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="main-title mb-[20px]">
                      <h4 className="font-quicksand tracking-[0.03rem] leading-[1.2] text-[20px] font-bold text-secondary">
                        Billing Details
                      </h4>
                    </div>
                    <div className="checkout-radio flex mb-[10px] max-[480px]:flex-col">
                      <div className="radio-itens mr-[20px]">
                        <input
                          type="radio"
                          id="address1"
                          name="address"
                          className="w-auto mr-[2px] p-[10px]"
                        />
                        <label
                          htmlFor="address1"
                          className="relative font-normal text-[14px] text-secondary pl-[26px] cursor-pointer leading-[16px] inline-block tracking-[0]"
                        >
                          I want to use an existing address
                        </label>
                      </div>
                      <div className="radio-itens">
                        <input
                          type="radio"
                          id="address2"
                          name="address"
                          className="w-auto mr-[2px] p-[10px]"
                        />
                        <label
                          htmlFor="address2"
                          className="relative font-normal text-[14px] text-secondary pl-[26px] cursor-pointer leading-[16px] inline-block tracking-[0]"
                        >
                          I want to use new address
                        </label>
                      </div>
                    </div>
                    <div className="input-box-form mt-[20px]">
                      <form onSubmit={handleSubmit}>
                        <div className="flex flex-wrap mx-[-12px]">
                          {/* First Name */}
                          <div className="min-[992px]:w-[50%] w-full px-[12px]">
                            <div className="input-item mb-[24px]">
                              <label className="block text-[14px] font-medium text-secondary mb-[8px]">
                                First Name *
                              </label>
                              <input
                                type="text"
                                name="firstName"
                                placeholder="Enter your First Name"
                                className="w-full p-[10px] text-[14px] border border-[#eee] rounded-[10px]"
                                value={user.name ?? ""}
                                required
                              />
                            </div>
                          </div>

                          {/* Last Name */}
                          <div className="min-[992px]:w-[50%] w-full px-[12px]">
                            <div className="input-item mb-[24px]">
                              <label className="block text-[14px] font-medium text-secondary mb-[8px]">
                                Last Name *
                              </label>
                              <input
                                type="text"
                                name="lastName"
                                placeholder="Enter your Last Name"
                                className="w-full p-[10px] text-[14px] border border-[#eee] rounded-[10px]"
                                required
                              />
                            </div>
                          </div>

                          {/* Address */}
                          <div className="w-full px-[12px]">
                            <div className="input-item mb-[24px]">
                              <label className="block text-[14px] font-medium text-secondary mb-[8px]">
                                Address *
                              </label>
                              <input
                                type="text"
                                name="street"
                                onChange={handleChange}
                                value={orderData.shippingAddress.street}
                                placeholder="Address Line 1"
                                className="w-full p-[10px] text-[14px] border border-[#eee] rounded-[10px]"
                                required
                              />
                            </div>
                          </div>

                          {/* Country Dropdown */}
                          <div className="min-[992px]:w-[50%] w-full px-[12px]">
                            <div className="input-item mb-[24px]">
                              <label className="block text-[14px] font-medium text-secondary mb-[8px]">
                                Country *
                              </label>
                              <Select
                                options={countries}
                                value={
                                  countries.find(
                                    (option) =>
                                      option.label ===
                                      orderData.shippingAddress.country
                                  ) || null
                                }
                                onChange={handleSelectChange}
                                placeholder="Select Country"
                                isSearchable
                                className="w-full border rounded-lg"
                                name="country"
                              />
                            </div>
                          </div>

                          {/* Region/State Dropdown */}
                          <div className="min-[992px]:w-[50%] w-full px-[12px]">
                            <div className="input-item mb-[24px]">
                              <label className="block text-[14px] font-medium text-secondary mb-[8px]">
                                State *
                              </label>
                              <Select
                                options={states}
                                value={
                                  states.find(
                                    (option) =>
                                      option.label ===
                                      orderData.shippingAddress.state
                                  ) || null
                                }
                                onChange={handleSelectChange}
                                placeholder="Select Region/State"
                                isSearchable
                                className="w-full border rounded-lg"
                                name="state"
                              />
                            </div>
                          </div>

                          {/* City Dropdown */}
                          <div className="min-[992px]:w-[50%] w-full px-[12px]">
                            <div className="input-item mb-[24px]">
                              <label className="block text-[14px] font-medium text-secondary mb-[8px]">
                                City *
                              </label>
                              <Select
                                options={cities}
                                value={
                                  cities.find(
                                    (option) =>
                                      option.label ===
                                      orderData.shippingAddress.city
                                  ) || null
                                }
                                onChange={handleSelectChange}
                                placeholder="Select City"
                                isSearchable
                                className="w-full border rounded-lg"
                                name="city"
                              />
                            </div>
                          </div>

                          {/* Post Code */}
                          <div className="min-[992px]:w-[50%] w-full px-[12px]">
                            <div className="input-item mb-[24px]">
                              <label className="block text-[14px] font-medium text-secondary mb-[8px]">
                                Post Code *
                              </label>
                              <input
                                type="text"
                                name="postalCode"
                                onChange={handleChange}
                                value={orderData.shippingAddress.postalCode}
                                placeholder="Post Code"
                                className="w-full p-[10px] text-[14px] border border-[#eee] rounded-[10px]"
                                required
                              />
                            </div>
                          </div>
                          {/* Delivery Slot Picker */}
                          <div className="w-full px-[12px]">
                            <div className="input-item mb-[24px]">
                              <label className="block text-[14px] font-medium text-secondary mb-[8px]">
                                Delivery time slot *
                              </label>
                              <div className="p-[10px] border border-[#eee] rounded-[10px]">
                                <SlotPicker
                                  pincode={deliveryPincode}
                                  value={deliverySlot}
                                  onChange={setDeliverySlot}
                                />
                              </div>
                              {deliverySlot && (
                                <div className="mt-[6px] text-[12px] text-secondary">
                                  Selected: {deliverySlot.label} (
                                  {deliverySlot.start}–{deliverySlot.end}) on{" "}
                                  {deliverySlot.date}
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Place Order Button */}
                          <div className="w-full px-[12px]">
                            <div className="input-button">
                              <button
                                type="submit"
                                className="bb-btn-2 inline-block py-[10px] px-[25px] text-[14px] font-medium text-white bg-[#6c7fd8] rounded-[10px] hover:bg-transparent hover:border-[#3d4750] hover:text-secondary border"
                              >
                                Place Order
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default CheckoutPage;
