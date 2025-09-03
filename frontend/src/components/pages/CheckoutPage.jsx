import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { placeOrder } from '../../slice/orderSlice';
import Select from "react-select";
import { GetCountries, GetState, GetCity } from "react-country-state-city";
import toast from "react-hot-toast";
import { removeFromCart } from '../../slice/cartSlice';
import Button from '../layout/Button';
import { ProductService } from '../../services/ProductService';

const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

function CheckoutPage() {
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const cartItems = useSelector((state) => state.cart.items);
    const [cartTotal,setCartTotal] = useState(0);
    const deliveryCharge = 0;
    const { loading, order, error } = useSelector((state) => state.order);

    console.log('User - ', user);

    useEffect(() => {
        loadRazorpay();
    }, []);

    useEffect(() => {
        setOrderData((prev) => ({
            ...prev,
            orderItems: cartItems.map((item) => ({
                product: item.product._id,
                variant: item.variant ? item.variant._id : null, // Add variant if available
                quantity: item.quantity,
                price: item.variant ? item.variant.price : item.product.price,
            })),
            totalAmount: Object.values(cartItems)
                .reduce((total, item) => total + (item.quantity * (item.variant ? item.variant.price : item.product.price) || 0), 0)
                .toFixed(2),
        }));
        setCartTotal(orderData.totalAmount);
    }, []);    
    
    console.log('cartItems',cartItems);
    
    const [orderData, setOrderData] = useState({
        userId: "", // Dynamic user ID
        orderItems: cartItems,
        totalAmount: cartTotal,
        shippingAddress: { street: "", city: "", state: "", postalCode: "", country: "" },
        paymentMethod: "COD",
    });

    console.log('orderData',orderData);

    useEffect(() => {
        if (user) {
            setOrderData(prev => ({
                ...prev,
                shippingAddress: user?.details?.addresses || {
                    street: "",
                    city: "",
                    state: "",
                    postalCode: "",
                    country: "",
                },
            }));     
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setOrderData((prevData) => ({
            ...prevData,
            shippingAddress: { ...prevData.shippingAddress, [name]: value },
        }));
        console.log(orderData);
    };

    const handleSelectChange = (selectedOption, { name }) => {
        console.log(selectedOption);
        setOrderData((prevData) => ({
            ...prevData,
            shippingAddress: { 
                ...prevData.shippingAddress, 
                [name]: selectedOption.label // Store label instead of value
            },
        }));
        console.log(orderData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(orderData);
    
        const res = await loadRazorpay();

        dispatch(placeOrder(orderData))
            .then((response) => {
                console.log("Dispatch Response:", response);
                if (response.payload?.success) {
                    Object.values(cartItems).forEach((item) => {
                        console.log(item);
                        dispatch(removeFromCart({ productId: item.product._id, variantId: item.variant ? item.variant._id : null }));  // ✅ Fix: Dispatch for each item
                    });    

                    if (!res) {
                        console.error("Razorpay SDK failed to load");
                        return;
                    }

                    const options = {
                        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use your Razorpay key
                        amount: response.payload?.order.total_price,
                        currency: "INR",
                        name: "BBSCart",
                        description: "Test Transaction",
                        order_id: response.payload?.order.order_id,
                        handler: async (response) => {
                            // Step 3: Verify Payment
                            const paymentData = {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }
                            const verifyRes = await ProductService.verifyPayment(paymentData);
        
                            if (verifyRes.success) {
                                toast.success(""+verifyRes.message+", Order placed successfully!");
                                navigate("/");
                            } else {
                                toast.error(verifyRes.message || "Payment verification failed!");
                            }
                        },
                        prefill: {
                            name: user?.name,
                            email: user?.email,
                            contact: user?.details?.phone,
                        },
                        theme: {
                            color: "#3399cc",
                        },
                    };        
                    const rzp = new window.Razorpay(options);
                    rzp.open();
                } else {
                    toast.error(response.payload?.message || "Failed to place order.");
                }
            })
            .catch((error) => {
                toast.error("Something went wrong. Please try again.");
                console.error("Order Error:", error);
            });
    };
    
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    useEffect(() => {
        const fetchCountries = async () => {
            const countryList = await GetCountries();
            if (Array.isArray(countryList)) {
                setCountries(countryList.map(country => ({ value: country.id, label: country.name })));
            }
        };
        fetchCountries();
    }, []);

    useEffect(() => {
        const fetchStates = async () => {
            const selectedCountry = countries.find(c => c.label === orderData.shippingAddress.country);
            if (selectedCountry) {
                const stateList = await GetState(selectedCountry.value);
                if (Array.isArray(stateList)) {
                    setStates(stateList.map(state => ({ value: state.id, label: state.name })));
                } else {
                    setStates([]);
                }
            }
        };
        if (orderData.shippingAddress.country) fetchStates();
    }, [orderData.shippingAddress.country, countries]);

    useEffect(() => {
        const fetchCities = async () => {
            const selectedCountry = countries.find(c => c.label === orderData.shippingAddress.country);
            const selectedState = states.find(s => s.label === orderData.shippingAddress.state);
            
            if (selectedCountry && selectedState) {
                const cityList = await GetCity(selectedCountry.value, selectedState.value);
                if (Array.isArray(cityList)) {
                    setCities(cityList.map(city => ({ value: city.id, label: city.name })));
                } else {
                    setCities([]);
                }
            }
        };
        if (orderData.shippingAddress.state) fetchCities();
    }, [orderData.shippingAddress.state, states]);

    useEffect(() => {
        console.log("cartTotal:", cartTotal); // Debugging
    }, [cartItems]);

    const location = useLocation();

    useEffect(() => {
        // Scroll to top whenever the route changes
        window.scrollTo(0, 0);
    }, [location]);


    useEffect(() => {
        window.scrollTo({
            top: 0, // Scroll to the top
            behavior: 'smooth', // Enables smooth scrolling
        });
    }, []);    
      
    return (
        <>
            <section className="section-checkout bbscontainer pt-[50px] max-[1199px]:pt-[35px]">
                <div className="flex flex-wrap justify-between relative items-center">
                    <div className="flex flex-wrap w-full mb-[-24px]">
                        <div className="min-[992px]:w-[33.33%] w-full px-[12px] mb-[24px]">
                            <div className="bb-checkout-sidebar mb-[-24px]">
                                <div className="checkout-items border-[1px] border-solid border-[#eee] p-[20px] rounded-[20px] mb-[24px] aos-init aos-animate" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
                                    <div className="sub-title mb-[12px]">
                                        <h4 className="font-quicksand tracking-[0.03rem] leading-[1.2] text-[20px] font-bold text-secondary">summary</h4>
                                    </div>
                                    <div className="checkout-summary mb-[20px] border-b-[1px] border-solid border-[#eee]">
                                        <ul className="mb-[20px]">
                                            <li className="flex justify-between leading-[28px] mb-[8px]">
                                                <span className="left-item font-Poppins leading-[28px] tracking-[0.03rem] text-[14px] font-medium text-secondary">sub-total</span>
                                                <span className="font-Poppins leading-[28px] tracking-[0.03rem] text-[14px] font-medium text-secondary">Rs  {cartTotal ?? 0}</span>
                                            </li>
                                            <li className="flex justify-between leading-[28px] mb-[8px]">
                                                <span className="left-item font-Poppins leading-[28px] tracking-[0.03rem] text-[14px] font-medium text-secondary">Delivery Charges</span>
                                                <span className="font-Poppins leading-[28px] tracking-[0.03rem] text-[14px] font-medium text-secondary">Rs 0</span>
                                            </li>
                                            <li className="flex justify-between leading-[28px] mb-[8px]">
                                                <span className="left-item font-Poppins leading-[28px] tracking-[0.03rem] text-[14px] font-medium text-secondary">Coupon Discount</span>
                                                <span className="font-Poppins leading-[28px] tracking-[0.03rem] text-[14px] font-medium text-secondary">
                                                    <a href="" className="apply drop-coupon font-Poppins leading-[28px] tracking-[0.03rem] text-[14px] font-medium text-[#ff0000]">Apply Coupon</a>
                                                </span>
                                            </li>
                                            <li className="flex justify-between leading-[28px]">
                                                <div className="coupon-down-box w-full">
                                                    <form className="relative">
                                                        <input className="bb-coupon w-full p-[10px] text-[14px] font-normal text-secondary border-[1px] border-solid border-[#eee] outline-[0] rounded-[10px]" type="text" placeholder="Enter Your coupon Code" name="bb-coupon" required=""/>
                                                        <button className="bb-btn-2 transition-all duration-[0.3s] ease-in-out my-[8px] mr-[8px] flex justify-center items-center absolute right-[0] top-[0] bottom-[0] font-Poppins leading-[28px] tracking-[0.03rem] py-[2px] px-[12px] text-[13px] font-normal border-primary text-white bg-primary hover:bg-transparent hover:text-secondary rounded-[10px] border-[1px] border-solid" type="submit">Apply</button>
                                                    </form>
                                                </div>
                                            </li>                                    
                                        </ul>
                                    </div>
                                    <div className="bb-checkout-pro mb-[-24px]">
                                    {cartItems && Object.keys(cartItems).length > 0 ? (
                                        Object.values(cartItems).map(({ product, quantity }) => (
                                            <div key={product._id} className="pro-items p-[15px] bg-[#f8f8fb] border-[1px] border-solid border-[#eee] rounded-[20px] flex mb-[24px] max-[420px]:flex-col">
                                                <div className="image mr-[15px] max-[420px]:mr-[0] max-[420px]:mb-[15px]">
                                                    <img src={import.meta.env.VITE_API_URL+''+product.product_img ?? ''} alt="new-product-1" className="max-w-max w-[100px] h-[100px] border-[1px] border-solid border-[#eee] rounded-[20px] max-[1399px]:h-[80px] max-[1399px]:w-[80px]"/>
                                                </div>
                                                <div className="items-contact">
                                                    <h4 className="text-[16px]"><Link to={`/product/${product._id}`} className="font-Poppins tracking-[0.03rem] text-[15px] font-medium leading-[18px] text-secondary">{product.name}</Link></h4>
                                                    <span className="bb-pro-rating flex">
                                                        {
                                                            Array.from({ length: 5 }).map((_, index) => (
                                                            <i
                                                                key={index}
                                                                className={`ri-star-fill float-left text-[15px] mr-[3px] ${
                                                                index < product.rating ? 'text-[#e7d52e]' : 'text-[#777]'
                                                                }`}
                                                            ></i>
                                                            ))
                                                        }
                                                    </span>
                                                    <div className="inner-price flex items-center justify-left mb-[4px]">
                                                        <span className="new-price font-Poppins text-secondary font-semibold leading-[26px] tracking-[0.02rem] text-[15px]">{product.price}</span>
                                                        <span className="old-price ml-[10px] font-Poppins text-[#777] font-semibold leading-[26px] tracking-[0.02rem] text-[15px]"> * {quantity}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ): (
                                        <div className="w-full text-center">
                                            <h3 className="font-Poppins mt-5 text-[16px] text-secondary">Your cart is empty.</h3>
                                        </div>
                                    )}
                                    </div>
                                </div>
                                <div className="checkout-items border-[1px] border-solid border-[#eee] p-[20px] rounded-[20px] mb-[24px] aos-init aos-animate" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="400">
                                    <div className="sub-title mb-[12px]">
                                        <h4 className="font-quicksand tracking-[0.03rem] leading-[1.2] text-[20px] font-bold text-secondary">Delivery Method</h4>
                                    </div>
                                    <div className="checkout-method mb-[24px]">
                                        <span className="details font-Poppins leading-[26px] tracking-[0.02rem] text-[15px] font-medium text-secondary">Please select the preferred shipping method to use on this
                                            order.</span>
                                        <div className="bb-del-option flex mt-[12px] max-[480px]:flex-col">
                                            <div className="inner-del w-[50%] max-[480px]:w-full max-[480px]:mb-[8px]">
                                                <span className="bb-del-head font-Poppins leading-[26px] tracking-[0.02rem] text-[15px] font-semibold text-secondary">Free Shipping</span>
                                                <div className="radio-itens">
                                                    <input type="radio" id="rate1" name="rate" className="w-full text-[14px] font-normal text-secondary border-[1px] border-solid border-[#eee] outline-[0] rounded-[10px]" />
                                                    <label htmlFor="rate1" className="relative pl-[26px] cursor-pointer leading-[16px] inline-block text-secondary tracking-[0]">Rate - Rs 0 .00</label>
                                                </div>
                                            </div>
                                            <div className="inner-del w-[50%] max-[480px]:w-full">
                                                <span className="bb-del-head font-Poppins leading-[26px] tracking-[0.02rem] text-[15px] font-semibold text-secondary">Flat Rate</span>
                                                <div className="radio-itens">
                                                    <input type="radio" id="rate2" name="rate" className="w-full text-[14px] font-normal text-secondary border-[1px] border-solid border-[#eee] outline-[0] rounded-[10px]"/>
                                                    <label htmlFor="rate2" className="relative pl-[26px] cursor-pointer leading-[16px] inline-block text-secondary tracking-[0]">Rate - Rs 5.00</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="about-order">
                                        <h5 className="font-quicksand tracking-[0.03rem] leading-[1.2] mb-[12px] text-[15px] font-medium text-secondary">Add Comments About Your Order</h5>
                                        <textarea name="your-commemt" placeholder="Comments" className="w-full h-[100px] p-[10px] text-[14px] font-normal text-secondary border-[1px] border-solid border-[#eee] outline-[0] rounded-[10px]"></textarea>
                                    </div>
                                </div>
                                <div className="checkout-items border-[1px] border-solid border-[#eee] p-[20px] rounded-[20px] mb-[24px] aos-init aos-animate" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="600">
                                    <div className="sub-title mb-[12px]">
                                        <h4 className="font-quicksand tracking-[0.03rem] leading-[1.2] text-[20px] font-bold text-secondary">Payment Method</h4>
                                    </div>
                                    <div className="checkout-method mb-[24px]">
                                        <span className="details font-Poppins leading-[26px] tracking-[0.02rem] text-[15px] font-medium text-secondary">Please select the preferred shipping method to use on this
                                            order.</span>
                                        <div className="bb-del-option mt-[12px] flex max-[480px]:flex-col">
                                            <div className="inner-del w-[50%] max-[480px]:w-full">
                                                <div className="radio-itens">
                                                    <input type="radio" id="Cash1" name="radio-itens" className="w-full p-[10px] text-[14px] font-normal text-secondary border-[1px] border-solid border-[#eee] outline-[0] rounded-[10px]"/>
                                                    <label htmlFor="Cash1" className="relative pl-[26px] cursor-pointer leading-[16px] inline-block text-secondary tracking-[0]">Cash On Delivery</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="about-order">
                                        <h5 className="font-quicksand tracking-[0.03rem] leading-[1.2] mb-[12px] text-[15px] font-medium text-secondary">Add Comments About Your Order</h5>
                                        <textarea name="your-commemt" placeholder="Comments" className="w-full h-[100px] p-[10px] text-[14px] font-normal text-secondary border-[1px] border-solid border-[#eee] outline-[0] rounded-[10px]"></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="min-[992px]:w-[66.66%] w-full px-[12px] mb-[24px]">
                            <div className="bb-checkout-contact border-[1px] border-solid border-[#eee] p-[20px] rounded-[20px] aos-init aos-animate" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="400">
                                {
                                    !user ? (
                                        <>
                                            <div className="main-title mb-[20px]">
                                                <h4 className ="font-quicksand tracking-[0.03rem] leading-[1.2] text-[20px] font-bold text-secondary">Before placing order please log in</h4>
                                                <p className="font-Poppins leading-[28px] mt-3 tracking-[0.03rem] mb-[16px] text-[14px] font-light text-secondary">By creating an account you will be able to shop faster, be up to date on an order's status,
                                                    and keep track of the orders you have previously made.</p>
                                                <div className='flex flex-row gap-2'>
                                                    <Button link="/register" name='Register'/>
                                                    <Button link="/login" name='Login'/>
                                                </div>
                                            </div>
                                        </>
                                    ) :
                                    (
                                        <> 
                                            <div className="main-title mb-[20px]">
                                                <h4 className="font-quicksand tracking-[0.03rem] leading-[1.2] text-[20px] font-bold text-secondary">Billing Details</h4>
                                            </div>
                                            <div className="checkout-radio flex mb-[10px] max-[480px]:flex-col">
                                                <div className="radio-itens mr-[20px]">
                                                    <input type="radio" id="address1" name="address" className="w-auto mr-[2px] p-[10px]" />
                                                    <label htmlFor="address1" className="relative font-normal text-[14px] text-secondary pl-[26px] cursor-pointer leading-[16px] inline-block tracking-[0]">I want to use an existing address</label>
                                                </div>
                                                <div className="radio-itens">
                                                    <input type="radio" id="address2" name="address" className="w-auto mr-[2px] p-[10px]"/>
                                                    <label htmlFor="address2" className="relative font-normal text-[14px] text-secondary pl-[26px] cursor-pointer leading-[16px] inline-block tracking-[0]">I want to use new address</label>
                                                </div>
                                            </div>
                                            <div className="input-box-form mt-[20px]">
                                                <form onSubmit={handleSubmit}>
                                                    <div className="flex flex-wrap mx-[-12px]">
                                                        {/* First Name */}
                                                        <div className="min-[992px]:w-[50%] w-full px-[12px]">
                                                            <div className="input-item mb-[24px]">
                                                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">First Name *</label>
                                                                <input type="text" name="firstName" placeholder="Enter your First Name" className="w-full p-[10px] text-[14px] border border-[#eee] rounded-[10px]" value={user.name ?? ''} required />
                                                            </div>
                                                        </div>

                                                        {/* Last Name */}
                                                        <div className="min-[992px]:w-[50%] w-full px-[12px]">
                                                            <div className="input-item mb-[24px]">
                                                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">Last Name *</label>
                                                                <input type="text" name="lastName" placeholder="Enter your Last Name" className="w-full p-[10px] text-[14px] border border-[#eee] rounded-[10px]" required />
                                                            </div>
                                                        </div>

                                                        {/* Address */}
                                                        <div className="w-full px-[12px]">
                                                            <div className="input-item mb-[24px]">
                                                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">Address *</label>
                                                                <input type="text" name="street" onChange={handleChange} value={orderData.shippingAddress.street} placeholder="Address Line 1" className="w-full p-[10px] text-[14px] border border-[#eee] rounded-[10px]" required />
                                                            </div>
                                                        </div>                                            

                                                        {/* Country Dropdown */}
                                                        <div className="min-[992px]:w-[50%] w-full px-[12px]">
                                                            <div className="input-item mb-[24px]">
                                                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">Country *</label>
                                                                <Select
                                                                    options={countries}
                                                                    value={countries.find(option => option.label === orderData.shippingAddress.country) || null}
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
                                                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">State *</label>
                                                                <Select
                                                                    options={states}
                                                                    value={states.find(option => option.label === orderData.shippingAddress.state) || null}
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
                                                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">City *</label>
                                                                <Select
                                                                    options={cities}
                                                                    value={cities.find(option => option.label === orderData.shippingAddress.city) || null}
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
                                                                <label className="block text-[14px] font-medium text-secondary mb-[8px]">Post Code *</label>
                                                                <input type="text" name="postalCode" onChange={handleChange} value={orderData.shippingAddress.postalCode} placeholder="Post Code" className="w-full p-[10px] text-[14px] border border-[#eee] rounded-[10px]" required />
                                                            </div>
                                                        </div>

                                                        {/* Place Order Button */}
                                                        <div className="w-full px-[12px]">
                                                            <div className="input-button">
                                                                <button type="submit" className="bb-btn-2 inline-block py-[10px] px-[25px] text-[14px] font-medium text-white bg-[#6c7fd8] rounded-[10px] hover:bg-transparent hover:border-[#3d4750] hover:text-secondary border">
                                                                    Place Order
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </section> 
        </>
    );
}

export default CheckoutPage;