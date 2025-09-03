import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { updateQuantity, removeFromCart, fetchCartItems } from '../../slice/cartSlice';

function CartPopup({ cartPopup, setCartPopup }) {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchCartItems()); // Fetch cart items when the component mounts
    }, []);
    
    const navigate = useNavigate();  // Initialize useNavigate hook
    const cartItems = useSelector((state) => state.cart.items);
    
    const cartTotal = Object.values(cartItems).reduce(
        (total, item) => total + (item?.quantity * (item.variant ? item?.variant?.price : item?.product?.price) || 0),
        0
        ).toFixed(2);
    const deliveryCharge = 0;

    // Handle increment
    const handleIncrement = (prodId,variantId,quantity) => {
        const currentQuantity = quantity || 1;
        const newQuantity = currentQuantity + 1;
        dispatch(updateQuantity({ productId: prodId, variantId, quantity: newQuantity })).then(() => {
            dispatch(fetchCartItems());
        });
    };

    // Handle decrement
    const handleDecrement = (prodId,variantId,quantity) => {
        const currentQuantity = quantity || 1;
        const newQuantity = Math.max(currentQuantity - 1, 1);
        if (newQuantity > 0) {
            dispatch(updateQuantity({ productId: prodId, variantId, quantity: newQuantity })).then(() => {
                dispatch(fetchCartItems());
            });
        }
    };

    const handleRemovecart = (prodId,variantId) => {
        dispatch(removeFromCart({productId: prodId,variantId})).then(() => {
            dispatch(fetchCartItems());
        }); // Pass only the productId
    };

    return (
        <div className={`bg-black overflow-hidden bg-opacity-50 z-50 transition-all duration-[0.3s] ease-in-out delay-300 ${cartPopup ? 'absolute top-0 w-full h-full' : 'relative'}`}> 
            <div className={`flex flex-wrap bg-white p-5 overflow-y-auto h-full min-w-[300px] md:min-w-[400px] float-right transition-all duration-[0.3s] ease-in-out absolute top-0 ${cartPopup ? 'right-0':'-right-[1000%]'}`}>
                <div className="w-full px-[12px]">
                    <div className="bb-inner-cart relative z-[9] flex flex-col h-full justify-between">
                        <div className="bb-top-contact">
                            <div className="bb-cart-title w-full mb-[20px] flex flex-wrap justify-between">
                                <h4 className="font-quicksand text-[18px] font-extrabold text-secondary tracking-[0.03rem] leading-[1.2]">My cart</h4>
                                <button onClick={() => setCartPopup(false)} className="bb-cart-close transition-all duration-[0.3s] ease-in-out w-[16px] h-[20px] absolute top-[-10px] right-[0] bg-[#e04e4eb3] rounded-[10px] cursor-pointer flex items-center" title="Close Cart"><i className="ri-close-line text-white"></i></button>
                            </div>
                        </div>
                        <div className="bb-cart-box item h-full flex flex-col max-[767px]:justify-start">
                            <ul className="bb-cart-items mb-[-24px]">
                            {cartItems && Object.keys(cartItems).length > 0 ? (
                                Object.values(cartItems).map(({ product, variant, quantity }) => (
                                <li key={product?._id} className="cart-sidebar-list mb-[24px] p-[10px] flex bg-[#f8f8fb] rounded-[20px] border-[1px] border-solid border-[#eee] relative max-[575px]:p-[10px]">
                                    <button onClick={() => handleRemovecart(product?._id)} className="cart-remove-item transition-all duration-[0.3s] ease-in-out bg-secondary w-[20px] h-[20px] text-[#fff] absolute top-[-3px] right-[-3px] rounded-[50%] flex items-center justify-center opacity-[0.5] text-[15px]"><i className="ri-close-line"></i></button>
                                    <img src={import.meta.env.VITE_API_URL+''+product?.product_img ?? ''} alt="product-img-1" className="w-[85px] rounded-[10px] border-[1px] border-solid border-[#eee] max-[575px]:w-[50px]"/>
                                    <div className="bb-cart-contact pl-[15px] relative grow-[1] shrink-[0] basis-[70%] overflow-hidden">
                                        <Link to={`/product/${product?._id}`} className="bb-cart-sub-title w-full mb-[8px] font-Poppins tracking-[0.03rem] text-secondary whitespace-nowrap overflow-hidden text-ellipsis block text-[14px] leading-[18px] font-medium">{product?.name}</Link>
                                        <span className="cart-price mb-[8px] text-[16px] leading-[18px] block font-Poppins text-secondary font-light tracking-[0.03rem]">
                                            <span className="new-price px-[3px] text-[14px] leading-[14px] text-secondary font-bold">₹{variant ? variant.price : product?.price}</span>
                                        </span>
                                        <div className="qty-plus-minus w-[85px] h-[45px] py-[0px] border-[1px] border-solid border-[#eee] overflow-hidden relative flex items-center justify-between bg-[#fff] rounded-[10px] px-3">
                                            <div className="dec bb-qtybtn cursor-pointer" onClick={() => handleDecrement(product?._id,(variant ? variant._id : null),quantity)}>-</div>
                                            <span>{quantity || 1}</span>
                                            <div className="inc bb-qtybtn cursor-pointer" onClick={() => handleIncrement(product?._id,(variant ? variant._id : null),quantity)}>+</div>
                                        </div>
                                    </div>
                                </li>
                                ))
                            ): (
                                <div className="w-full text-center">
                                    <h3 className="font-Poppins mt-5 text-[16px] text-secondary">Your cart is empty.</h3>
                                </div>
                            )}
                            </ul>
                        </div>
                        {cartItems && Object.keys(cartItems).length > 0 &&
                            <div className="bb-bottom-cart">
                                <div className="cart-sub-total mt-[20px] pb-[8px] flex flex-wrap justify-between border-t-[1px] border-solid border-[#eee]">
                                    <table className="table cart-table mt-[10px] w-full align-top">
                                        <tbody>
                                            <tr>
                                                <td className="title font-medium text-[#777] p-[.5rem]">Sub-Total :</td>
                                                <td className="price text-[#777] text-right p-[.5rem]">₹{cartTotal}</td>
                                            </tr>
                                            {/* <tr>
                                                <td className="title font-medium text-[#777] p-[.5rem]">VAT (20%) :</td>
                                                <td className="price text-[#777] text-right p-[.5rem]">₹60.00</td>
                                            </tr> */}
                                            <tr>
                                                <td className="title font-medium text-[#777] p-[.5rem]">Total :</td>
                                                <td className="price text-[#777] text-right p-[.5rem]">₹{cartTotal}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="cart-btn flex justify-between mb-[20px]">
                                    <button onClick={() => { setCartPopup(false); navigate('/cart'); }} className="bb-btn-1 transition-all duration-[0.3s] ease-in-out font-Poppins leading-[28px] tracking-[0.03rem] py-[5px] px-[15px] text-[14px] font-normal text-white rounded-[10px] border-[1px] border-solid border-primary bg-primary hover:bg-transparent hover:text-secondary">View Cart</button>
                                    <Link to="/checkout" className="bb-btn-2 transition-all duration-[0.3s] ease-in-out font-Poppins leading-[28px] tracking-[0.03rem] py-[5px] px-[15px] text-[14px] font-normal text-[#fff] rounded-[10px] border-[1px] border-solid border-primary bg-primary hover:bg-transparent hover:text-secondary">Checkout</Link>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartPopup;
