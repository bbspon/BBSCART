import React from 'react'
import Button from '../layout/Button'

function BannerOne() {
  return (
    <>
        <div className="flex flex-wrap gap-2 justify-between relative items-center pb-12 mt-4 mx-4">
            <div className="flex flex-col md:flex-row gap-4 w-full mb-[-24px]">
                <div className="w-full md:w-[50%] mb-[24px]" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="400">
                    <div className="banner-box p-[30px] rounded-[20px] relative overflow-hidden bg-box-color-one bg-[#fbf2e5]">
                        <div className="inner-banner-box relative z-[1] flex justify-between max-[480px]:flex-col">
                            <div className="side-image px-[12px] flex items-center max-[480px]:p-[0] max-[480px]:mb-[12px] max-[480px]:justify-center">
                                <img src="/img/banner-one/one.png" alt="one" className="max-w-[320px] w-full max-h-[280px]"/>
                            </div>
                            <div className="inner-contact max-w-[250px] px-[12px] flex flex-col items-start justify-center max-[480px]:p-[0] max-[480px]:max-w-[100%] max-[480px]:text-center max-[480px]:items-center">
                                <h5 className="font-quicksand mb-[15px] text-secondary font-bold tracking-[0.03rem] text-secondary leading-[1.2] max-[480px]:mb-[2px] text-lg md:text-xl lg:text-2xl">Gold Coins & Jewellery</h5>
                                <p className="font-Poppins font-medium tracking-[0.03rem] text-secondary mb-[15px] max-[480px]:mb-[8px] text-sm md:text-md leading-2">The flavour of something</p>
                                <Button link='/product/category/groceries' name='Shop Now'/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-[50%]  mb-[24px]" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="400">
                    <div className="banner-box p-[30px] rounded-[20px] relative overflow-hidden bg-box-color-two bg-[#ffe8ee]">
                        <div className="inner-banner-box relative z-[1] flex justify-between max-[480px]:flex-col">
                            <div className="side-image px-[12px] flex items-center max-[480px]:p-[0] max-[480px]:mb-[12px] max-[480px]:justify-center">
                                <img src="/img/banner-one/two.png" alt="two" className="max-w-[320px] w-full max-h-[280px]"/>
                            </div>
                            <div className="inner-contact max-w-[250px] px-[12px] flex flex-col items-start justify-center max-[480px]:p-[0] max-[480px]:max-w-[100%] max-[480px]:text-center max-[480px]:items-center">
                                <h5 className="font-quicksand mb-[15px] text-secondary font-bold tracking-[0.03rem] text-secondary leading-[1.2] max-[480px]:mb-[2px] text-lg md:text-xl lg:text-2xl">Fresh Fruits & Vegetables</h5>
                                <p className="font-Poppins font-medium tracking-[0.03rem] text-secondary mb-[15px] max-[480px]:mb-[8px] text-sm md:text-md leading-2">A healthy meal for every one</p>
                                <Button link="/product/category/womens-jewellery" name='Shop Now'/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
  )
}

export default BannerOne