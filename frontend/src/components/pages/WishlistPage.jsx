import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from 'react-router-dom';
import { fetchWishlistItems,removeFromWishlist } from '../../slice/wishlistSlice';

function WishlistPage() {
    const dispatch = useDispatch();
    // useEffect(() => {
    //     dispatch(fetchWishlistItems());
    // }, [dispatch]);
    
    const wishlistItems = useSelector((state) => state.wishlist.items || []);

    // useEffect(() => {
    //     console.log("wishlistItems:", wishlistItems); // Debugging
    // }, [wishlistItems]);

    const location = useLocation();

    useEffect(() => {
        // Scroll to top whenever the route changes
        window.scrollTo(0, 0);
    }, [location]);


    const handleRemovewishlist = (prodId) => {
        dispatch(removeFromWishlist(prodId)); // Pass only the productId
    };

    useEffect(() => {
        window.scrollTo({
            top: 0, // Scroll to the top
            behavior: 'smooth', // Enables smooth scrolling
        });
    }, []);
    
      
    return (
        <section className="section-wishlist py-[50px] max-[1199px]:py-[35px]">
            <div className="flex flex-wrap justify-between relative items-center">
                {wishlistItems && Object.keys(wishlistItems).length > 0 ? (
                    <div className="flex flex-wrap w-full mb-[-24px]">
                        <div className="w-full px-[12px] mb-[24px]">
                            <div className="bb-wishlist-table border-[1px] border-solid border-[#eee] rounded-[20px] overflow-hidden max-[1399px]:overflow-y-auto aos-init aos-animate" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="400">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-[1px] border-solid border-[#eee]">
                                            <th className="font-Poppins p-[12px] text-left text-[16px] font-medium text-secondary leading-[26px] tracking-[0.02rem] capitalize">Product</th>
                                            <th className="font-Poppins p-[12px] text-left text-[16px] font-medium text-secondary leading-[26px] tracking-[0.02rem] capitalize">Remove{wishlistItems.length}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {Object.values(wishlistItems).map(({ product }) => (
                                        <tr key={product?._id} className="border-b-[1px] border-solid border-[#eee]">
                                            <td className="p-[12px]">
                                                <div className="Product-wishlist flex items-center">
                                                    <img src={import.meta.env.VITE_API_URL+''+product?.product_img ?? ''} alt={product?.name} className="w-[70px] border-[1px] border-solid border-[#eee] rounded-[10px]"/>
                                                    <div>   
                                                        <span className="ml-[10px] block font-Poppins text-[14px] font-semibold leading-[24px] tracking-[0.03rem] text-secondary">{product?.name}</span>
                                                        <span className="ml-[10px] block font-Poppins text-[12px] font-normal leading-[16px] tracking-[0.03rem] text-secondary">{product?.description}</span>
                                                        <div className='px-2'>
                                                        {Array.from({ length: 5 }).map((_, index) => (
                                                        <i
                                                            key={index}
                                                            className={`ri-star-fill float-left text-[15px] mr-[3px] ${
                                                            index < product?.rating ? 'text-[#e7d52e]' : 'text-[#777]'
                                                            }`}
                                                        ></i>
                                                        ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-[12px]">
                                                <div className="pro-remove mx-auto">
                                                    <button className='block mx-auto' onClick={()=>{console.log('ID - ',product?._id); handleRemovewishlist(product?._id)}}>
                                                        <i className="ri-heart-fill transition-all duration-[0.3s] ease-in-out text-[20px] text-primary hover:text-[#ff0000]"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>                    
                            <Link to="/" className="bb-btn-2 mt-[24px] inline-flex items-center justify-center check-btn transition-all duration-[0.3s] ease-in-out font-Poppins leading-[28px] tracking-[0.03rem] py-[8px] px-[20px] text-[14px] font-normal text-[#fff] bg-primary rounded-[10px] border-[1px] border-solid border-primary hover:bg-transparent hover:text-secondary aos-init aos-animate" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="400">Home</Link>
                        </div>
                    </div>
                ) : (
                    <div className="w-full text-center">
                        <h3 className="font-Poppins text-[20px] text-secondary">Your wishlist is empty.</h3>
                    </div>
                )}
            </div>
        </section>
    );
}

export default WishlistPage;