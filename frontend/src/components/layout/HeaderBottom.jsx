import React from 'react'

function HeaderBottom() {
  return (
    <>
        <div className="bb-main-menu-desk bg-[#fff] py-[5px] border-t-[1px] border-solid border-[#eee] max-[991px]:hidden">
            <div className="flex flex-wrap justify-between relative items-center">
                <div className="flex flex-wrap w-full">
                    <div className="w-full px-[12px]">
                        <div className="bb-inner-menu-desk flex max-[1199px]:relative max-[991px]:justify-between">
                            <button className="navbar-toggler shadow-none hidden" type="button" data-bs-toggle="collapse"
                                data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                                <i className="ri-menu-2-line"></i>
                            </button>
                            <div className="bb-main-menu relative flex flex-[auto] justify-start max-[991px]:hidden" id="navbarSupportedContent">
                                <ul className="navbar-nav flex flex-wrap flex-row ">
                                    <li className="nav-item flex items-center font-Poppins text-[15px] text-secondary font-light leading-[28px] tracking-[0.03rem] mr-[35px]">
                                        <a className="nav-link p-[0] font-Poppins leading-[28px] text-[15px] font-medium text-secondary tracking-[0.03rem] block" href="index.html">Home</a>
                                    </li>
                                    <li className="nav-item bb-main-dropdown group flex items-center mr-[45px]">
                                        <a className="nav-link bb-dropdown-item font-Poppins relative p-[0] leading-[28px] text-[15px] font-medium text-secondary block tracking-[0.03rem]" href="">Categories</a>
                                        <ul className="mega-menu group-hover:opacity-[1] group-hover:visible min-w-full transition-all duration-[0.3s] ease-in-out mt-[25px] pl-[30px] absolute top-[20px] z-[16] text-left opacity-[0] invisible left-[0] right-[auto] bg-[#fff] border-[1px] border-solid border-[#eee] flex flex-col rounded-[10px]">
                                            <li className="m-[0] flex items-center">
                                                <ul className="mega-block w-[calc(25%-30px)] mr-[30px] py-[15px]">
                                                    <li className="menu_title border-b-[1px] border-solid border-[#eee] mb-[10px] pb-[5px] flex items-center leading-[28px]"><a href="" className="transition-all duration-[0.3s] ease-in-out font-Poppins h-[auto] text-primary text-[15px] font-medium tracking-[0.03rem] block py-[10px] leading-[22px] capitalize">classNameic</a></li>
                                                    <li className="flex items-center leading-[28px]"><a href="shop-left-sidebar-col-3.html" className="transition-all duration-[0.3s] ease-in-out font-Poppins py-[10px] leading-[22px] text-[14px] font-normal tracking-[0.03rem] text-secondary hover:text-primary capitalize">Left sidebar 3 column</a></li>
                                                    <li className="flex items-center leading-[28px]"><a href="shop-left-sidebar-col-4.html" className="transition-all duration-[0.3s] ease-in-out font-Poppins py-[10px] leading-[22px] text-[14px] font-normal tracking-[0.03rem] text-secondary hover:text-primary capitalize">Left sidebar 4 column</a></li>
                                                    <li className="flex items-center leading-[28px]"><a href="shop-right-sidebar-col-3.html" className="transition-all duration-[0.3s] ease-in-out font-Poppins py-[10px] leading-[22px] text-[14px] font-normal tracking-[0.03rem] text-secondary hover:text-primary capitalize">Right sidebar 3 column</a></li>
                                                    <li className="flex items-center leading-[28px]"><a href="shop-right-sidebar-col-4.html" className="transition-all duration-[0.3s] ease-in-out font-Poppins py-[10px] leading-[22px] text-[14px] font-normal tracking-[0.03rem] text-secondary hover:text-primary capitalize">Right sidebar 4 column</a></li>
                                                    <li className="flex items-center leading-[28px]"><a href="shop-full-width.html" className="transition-all duration-[0.3s] ease-in-out font-Poppins py-[10px] leading-[22px] text-[14px] font-normal tracking-[0.03rem] text-secondary hover:text-primary capitalize">Full width 4 column</a></li>
                                                </ul>
                                                <ul className="mega-block w-[calc(25%-30px)] mr-[30px] py-[15px]">
                                                    <li className="menu_title border-b-[1px] border-solid border-[#eee] mb-[10px] pb-[5px] flex items-center leading-[28px]"><a href="" className="transition-all duration-[0.3s] ease-in-out font-Poppins h-[auto] text-primary text-[15px] font-medium tracking-[0.03rem] block py-[10px] leading-[22px] capitalize">Banner</a></li>
                                                    <li className="flex items-center leading-[28px]"><a href="shop-banner-left-sidebar-col-3.html" className="transition-all duration-[0.3s] ease-in-out font-Poppins py-[10px] leading-[22px] text-[14px] font-normal tracking-[0.03rem] text-secondary hover:text-primary capitalize">left sidebar 3 column</a></li>
                                                    <li className="flex items-center leading-[28px]"><a href="shop-banner-left-sidebar-col-4.html" className="transition-all duration-[0.3s] ease-in-out font-Poppins py-[10px] leading-[22px] text-[14px] font-normal tracking-[0.03rem] text-secondary hover:text-primary capitalize">left sidebar 4 column</a></li>
                                                    <li className="flex items-center leading-[28px]"><a href="shop-banner-right-sidebar-col-3.html" className="transition-all duration-[0.3s] ease-in-out font-Poppins py-[10px] leading-[22px] text-[14px] font-normal tracking-[0.03rem] text-secondary hover:text-primary capitalize">right sidebar 3 column</a></li>
                                                    <li className="flex items-center leading-[28px]"><a href="shop-banner-right-sidebar-col-4.html" className="transition-all duration-[0.3s] ease-in-out font-Poppins py-[10px] leading-[22px] text-[14px] font-normal tracking-[0.03rem] text-secondary hover:text-primary capitalize">right sidebar 4 column</a></li>
                                                    <li className="flex items-center leading-[28px]"><a href="shop-banner-full-width.html" className="transition-all duration-[0.3s] ease-in-out font-Poppins py-[10px] leading-[22px] text-[14px] font-normal tracking-[0.03rem] text-secondary hover:text-primary capitalize">Full width 4 column</a></li>
                                                </ul>
                                                <ul className="mega-block w-[calc(25%-30px)] mr-[30px] py-[15px]">
                                                    <li className="menu_title border-b-[1px] border-solid border-[#eee] mb-[10px] pb-[5px] flex items-center leading-[28px]"><a href="" className="transition-all duration-[0.3s] ease-in-out font-Poppins h-[auto] text-primary text-[15px] font-medium tracking-[0.03rem] block py-[10px] leading-[22px] capitalize">Columns</a></li>
                                                    <li className="flex items-center leading-[28px]"><a href="shop-full-width-col-3.html" className="transition-all duration-[0.3s] ease-in-out font-Poppins py-[10px] leading-[22px] text-[14px] font-normal tracking-[0.03rem] text-secondary hover:text-primary capitalize">3 Columns full width</a> </li>
                                                    <li className="flex items-center leading-[28px]"><a href="shop-full-width-col-4.html" className="transition-all duration-[0.3s] ease-in-out font-Poppins py-[10px] leading-[22px] text-[14px] font-normal tracking-[0.03rem] text-secondary hover:text-primary capitalize">4 Columns full width</a></li>
                                                    <li className="flex items-center leading-[28px]"><a href="shop-full-width-col-5.html" className="transition-all duration-[0.3s] ease-in-out font-Poppins py-[10px] leading-[22px] text-[14px] font-normal tracking-[0.03rem] text-secondary hover:text-primary capitalize">5 Columns full width</a></li>
                                                    <li className="flex items-center leading-[28px]"><a href="shop-full-width-col-6.html" className="transition-all duration-[0.3s] ease-in-out font-Poppins py-[10px] leading-[22px] text-[14px] font-normal tracking-[0.03rem] text-secondary hover:text-primary capitalize">6 Columns full width</a></li>
                                                    <li className="flex items-center leading-[28px]"><a href="shop-banner-full-width-col-3.html" className="transition-all duration-[0.3s] ease-in-out font-Poppins py-[10px] leading-[22px] text-[14px] font-normal tracking-[0.03rem] text-secondary hover:text-primary capitalize">Banner 3 Columns</a></li>
                                                </ul>
                                                <ul className="mega-block w-[calc(25%-30px)] mr-[30px] py-[15px]">
                                                    <li className="menu_title border-b-[1px] border-solid border-[#eee] mb-[10px] pb-[5px] flex items-center leading-[28px]"><a href="" className="transition-all duration-[0.3s] ease-in-out font-Poppins h-[auto] text-primary text-[15px] font-medium tracking-[0.03rem] block py-[10px] leading-[22px] capitalize">List</a></li>
                                                    <li className="flex items-center leading-[28px]"><a href="shop-list-left-sidebar.html" className="transition-all duration-[0.3s] ease-in-out font-Poppins py-[10px] leading-[22px] text-[14px] font-normal tracking-[0.03rem] text-secondary hover:text-primary capitalize">Shop left sidebar</a></li>
                                                    <li className="flex items-center leading-[28px]"><a href="shop-list-right-sidebar.html" className="transition-all duration-[0.3s] ease-in-out font-Poppins py-[10px] leading-[22px] text-[14px] font-normal tracking-[0.03rem] text-secondary hover:text-primary capitalize">Shop right sidebar</a></li>
                                                    <li className="flex items-center leading-[28px]"><a href="shop-list-banner-left-sidebar.html" className="transition-all duration-[0.3s] ease-in-out font-Poppins py-[10px] leading-[22px] text-[14px] font-normal tracking-[0.03rem] text-secondary hover:text-primary capitalize">Banner left sidebar</a></li>
                                                    <li className="flex items-center leading-[28px]"><a href="shop-list-banner-right-sidebar.html" className="transition-all duration-[0.3s] ease-in-out font-Poppins py-[10px] leading-[22px] text-[14px] font-normal tracking-[0.03rem] text-secondary hover:text-primary capitalize">Banner right sidebar</a></li>
                                                    <li className="flex items-center leading-[28px]"><a href="shop-list-full-col-2.html" className="transition-all duration-[0.3s] ease-in-out font-Poppins py-[10px] leading-[22px] text-[14px] font-normal tracking-[0.03rem] text-secondary hover:text-primary capitalize">Full width 2 columns</a></li>
                                                </ul>
                                            </li>
                                        </ul>
                                    </li>
                                    <li className="nav-item bb-dropdown flex items-center relative mr-[45px]">
                                        <a className="nav-link bb-dropdown-item font-Poppins relative p-[0] leading-[28px] text-[15px] font-medium text-secondary block tracking-[0.03rem]" href="">Products</a>
                                        <ul className="bb-dropdown-menu min-w-[205px] p-[10px] transition-all duration-[0.3s] ease-in-out mt-[25px] absolute top-[40px] z-[16] text-left opacity-[0] invisible left-[0] right-[auto] bg-[#fff] border-[1px] border-solid border-[#eee] flex flex-col rounded-[10px]">
                                            <li className="bb-mega-dropdown m-[0] py-[5px] px-[15px] relative flex items-center">
                                                <a className="bb-mega-item transition-all duration-[0.3s] ease-in-out font-Poppins py-[5px] leading-[22px] text-[14px] font-normal text-secondary hover:text-primary capitalize tracking-[0.03rem]" href="">Product page</a>
                                                <ul className="bb-mega-menu transition-all duration-[0.3s] ease-in-out min-w-[220px] p-[10px] mt-[25px] absolute top-[-20px] left-[193px] z-[16] text-left opacity-[0] invisible right-[auto] bg-[#fff] border-[1px] border-solid border-[#eee] flex flex-col rounded-[10px]">
                                                    <li className="m-[0] py-[5px] px-[15px] flex items-center"><a className="dropdown-item transition-all duration-[0.3s] ease-in-out py-[6px] text-[14px] font-normal text-secondary hover:text-primary capitalize" href="product-left-sidebar.html">Product left sidebar</a></li>
                                                    <li className="m-[0] py-[5px] px-[15px] flex items-center"><a className="dropdown-item transition-all duration-[0.3s] ease-in-out py-[6px] text-[14px] font-normal text-secondary hover:text-primary capitalize" href="product-right-sidebar.html">Product right sidebar</a></li>
                                                </ul>
                                            </li>
                                            <li className="bb-mega-dropdown m-[0] py-[5px] px-[15px] relative flex items-center">
                                                <a className="bb-mega-item transition-all duration-[0.3s] ease-in-out font-Poppins py-[5px] leading-[22px] text-[14px] font-normal text-secondary hover:text-primary capitalize tracking-[0.03rem]" href="">Product Accordion</a>
                                                <ul className="bb-mega-menu transition-all duration-[0.3s] ease-in-out min-w-[220px] p-[10px] mt-[25px] absolute top-[-20px] left-[193px] z-[16] text-left opacity-[0] invisible right-[auto] bg-[#fff] border-[1px] border-solid border-[#eee] flex flex-col rounded-[10px]">
                                                    <li className="m-[0] py-[5px] px-[15px] flex items-center"><a className="dropdown-item transition-all duration-[0.3s] ease-in-out py-[6px] text-[14px] font-normal text-secondary hover:text-primary capitalize" href="product-accordion-left-sidebar.html">left sidebar</a></li>
                                                    <li className="m-[0] py-[5px] px-[15px] flex items-center"><a className="dropdown-item transition-all duration-[0.3s] ease-in-out py-[6px] text-[14px] font-normal text-secondary hover:text-primary capitalize" href="product-accordion-right-sidebar.html">right sidebar</a></li>
                                                </ul>
                                            </li>
                                            <li className="m-[0] py-[5px] px-[15px] relative flex items-center">
                                                <a href="product-full-width.html" className="font-Poppins transition-all duration-[0.3s] ease-in-out py-[5px] leading-[22px] text-[14px] font-normal text-secondary hover:text-primary capitalize tracking-[0.03rem]">Product full width</a>
                                            </li>
                                            <li className="m-[0] py-[5px] px-[15px] relative flex items-center">
                                                <a href="product-accordion-full-width.html" className="font-Poppins transition-all duration-[0.3s] ease-in-out py-[5px] leading-[22px] text-[14px] font-normal text-secondary hover:text-primary capitalize tracking-[0.03rem]">accordion full width</a>
                                            </li>
                                        </ul>
                                    </li>
                                    <li className="nav-item bb-dropdown flex items-center relative mr-[45px]">
                                        <a className="nav-link bb-dropdown-item font-Poppins relative p-[0] leading-[28px] text-[15px] font-medium text-secondary block tracking-[0.03rem]" href="">Pages</a>
                                        <ul className="bb-dropdown-menu min-w-[205px] p-[10px] transition-all duration-[0.3s] ease-in-out mt-[25px] absolute top-[40px] z-[16] text-left opacity-[0] invisible left-[0] right-[auto] bg-[#fff] border-[1px] border-solid border-[#eee] flex flex-col rounded-[10px]">
                                            <li className="m-[0] py-[5px] px-[15px] flex items-center"><a className="dropdown-item transition-all duration-[0.3s] ease-in-out py-[5px] leading-[22px] text-[14px] font-normal text-secondary hover:text-primary capitalize block w-full whitespace-nowrap" href="about-us.html">About Us</a></li>
                                            <li className="m-[0] py-[5px] px-[15px] flex items-center"><a className="dropdown-item transition-all duration-[0.3s] ease-in-out py-[5px] leading-[22px] text-[14px] font-normal text-secondary hover:text-primary capitalize block w-full whitespace-nowrap" href="contact-us.html">Contact Us</a></li>
                                            <li className="m-[0] py-[5px] px-[15px] flex items-center"><a className="dropdown-item transition-all duration-[0.3s] ease-in-out py-[5px] leading-[22px] text-[14px] font-normal text-secondary hover:text-primary capitalize block w-full whitespace-nowrap" href="cart.html">Cart</a></li>
                                            <li className="m-[0] py-[5px] px-[15px] flex items-center"><a className="dropdown-item transition-all duration-[0.3s] ease-in-out py-[5px] leading-[22px] text-[14px] font-normal text-secondary hover:text-primary capitalize block w-full whitespace-nowrap" href="checkout.html">Checkout</a></li>
                                            <li className="m-[0] py-[5px] px-[15px] flex items-center"><a className="dropdown-item transition-all duration-[0.3s] ease-in-out py-[5px] leading-[22px] text-[14px] font-normal text-secondary hover:text-primary capitalize block w-full whitespace-nowrap" href="compare.html">Compare</a></li>
                                            <li className="m-[0] py-[5px] px-[15px] flex items-center"><a className="dropdown-item transition-all duration-[0.3s] ease-in-out py-[5px] leading-[22px] text-[14px] font-normal text-secondary hover:text-primary capitalize block w-full whitespace-nowrap" href="faq.html">Faq</a></li>
                                            <li className="m-[0] py-[5px] px-[15px] flex items-center"><a className="dropdown-item transition-all duration-[0.3s] ease-in-out py-[5px] leading-[22px] text-[14px] font-normal text-secondary hover:text-primary capitalize block w-full whitespace-nowrap" href="login.html">Login</a></li>
                                            <li className="m-[0] py-[5px] px-[15px] flex items-center"><a className="dropdown-item transition-all duration-[0.3s] ease-in-out py-[5px] leading-[22px] text-[14px] font-normal text-secondary hover:text-primary capitalize block w-full whitespace-nowrap" href="register.html">Register</a></li>
                                        </ul>
                                    </li>
                                    <li className="nav-item bb-dropdown flex items-center relative mr-[45px]">
                                        <a className="nav-link bb-dropdown-item font-Poppins relative p-[0] leading-[28px] text-[15px] font-medium text-secondary block tracking-[0.03rem]" href="">Blog</a>
                                        <ul className="bb-dropdown-menu min-w-[205px] p-[10px] transition-all duration-[0.3s] ease-in-out mt-[25px] absolute top-[40px] z-[16] text-left opacity-[0] invisible left-[0] right-[auto] bg-[#fff] border-[1px] border-solid border-[#eee] flex flex-col rounded-[10px]">
                                            <li className="m-[0] py-[5px] px-[15px] flex items-center"><a className="dropdown-item transition-all duration-[0.3s] ease-in-out py-[5px] leading-[22px] text-[14px] font-normal text-secondary hover:text-primary capitalize block w-full whitespace-nowrap" href="blog-left-sidebar.html">Left Sidebar</a></li>
                                            <li className="m-[0] py-[5px] px-[15px] flex items-center"><a className="dropdown-item transition-all duration-[0.3s] ease-in-out py-[5px] leading-[22px] text-[14px] font-normal text-secondary hover:text-primary capitalize block w-full whitespace-nowrap" href="blog-right-sidebar.html">Right Sidebar</a></li>
                                            <li className="m-[0] py-[5px] px-[15px] flex items-center"><a className="dropdown-item transition-all duration-[0.3s] ease-in-out py-[5px] leading-[22px] text-[14px] font-normal text-secondary hover:text-primary capitalize block w-full whitespace-nowrap" href="blog-full-width.html">Full Width</a></li>
                                            <li className="m-[0] py-[5px] px-[15px] flex items-center"><a className="dropdown-item transition-all duration-[0.3s] ease-in-out py-[5px] leading-[22px] text-[14px] font-normal text-secondary hover:text-primary capitalize block w-full whitespace-nowrap" href="blog-detail-left-sidebar.html">Detail Left Sidebar</a></li>
                                            <li className="m-[0] py-[5px] px-[15px] flex items-center"><a className="dropdown-item transition-all duration-[0.3s] ease-in-out py-[5px] leading-[22px] text-[14px] font-normal text-secondary hover:text-primary capitalize block w-full whitespace-nowrap" href="blog-detail-right-sidebar.html">Detail Right Sidebar</a></li>
                                            <li className="m-[0] py-[5px] px-[15px] flex items-center"><a className="dropdown-item transition-all duration-[0.3s] ease-in-out py-[5px] leading-[22px] text-[14px] font-normal text-secondary hover:text-primary capitalize block w-full whitespace-nowrap" href="blog-detail-full-width.html">Detail Full Width</a></li>
                                        </ul>
                                    </li>
                                    <li className="nav-item flex items-center">
                                        <a className="nav-link font-Poppins  p-[0] leading-[28px] text-[15px] font-medium tracking-[0.03rem] text-secondary flex" href="offer.html">
                                            
                                            Offers
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            {/* <div className="bb-dropdown-menu flex max-[991px]:hidden">
                                <div className="inner-select w-[180px] bg-[#fff] border-[1px] border-solid border-[#eee] rounded-[10px] flex items-center">
                                    
                                    <div className="custom-select transition-all duration-[0.3s] ease-in-out w-full h-full pr-[15px] text-[#777] flex items-center justify-between text-[14px] relative">
                                        <select>
                                            <option value="option1">Surat</option>
                                            <option value="option2">Delhi</option>
                                            <option value="option3">Rajkot</option>
                                            <option value="option4">Udaipur</option>
                                        </select>
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
  )
}

export default HeaderBottom