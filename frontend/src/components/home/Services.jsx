import React from 'react'

function Services() {
  return (
    <>
        <h2 className="text-[24px] font-bold mb-4 text-center pt-6">Why Choose <span className='text-yellow-600'>Thiaworld?</span></h2>
        <div className="flex flex-wrap justify-between relative items-center pb-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 w-full mb-[-24px]">
                <div className="w-full " data-aos="flip-up" data-aos-duration="1000" data-aos-delay="200">
                    <div className="bb-services-box p-[30px] border-[1px] border-solid border-[#eee] rounded-[20px] text-center">
                        <div className="services-img mb-[20px] flex justify-center">
                            <img src="/img/services/1.png" alt="services-1" className="w-[50px]"/>
                        </div>
                        <div className="services-contact">
                            <h4 className="font-quicksand mb-[8px] text-[18px] font-bold text-secondary leading-[1.2] tracking-[0.03rem]">BIS Certified Gold</h4>
                            <p className="font-Poppins font-light text-[14px] leading-[20px] text-secondary tracking-[0.03rem]">Every product is BIS Hallmarked for purity and quality assurance.</p>
                        </div>
                    </div>
                </div>
                <div className="w-full " data-aos="flip-up" data-aos-duration="1000" data-aos-delay="400">
                    <div className="bb-services-box p-[30px] border-[1px] border-solid border-[#eee] rounded-[20px] text-center">
                        <div className="services-img mb-[20px] flex justify-center">
                            <img src="/img/services/2.png" alt="services-2" className="w-[50px]"/>
                        </div>
                        <div className="services-contact">
                            <h4 className="font-quicksand mb-[8px] text-[18px] font-bold text-secondary leading-[1.2] tracking-[0.03rem]">Bank-Pledged Security</h4>
                            <p className="font-Poppins font-light text-[14px] leading-[20px] text-secondary tracking-[0.03rem]">Jewelry is pledged in your name at your preferred bank to ensure safety.</p>
                        </div>
                    </div>
                </div>
                <div className="w-full " data-aos="flip-up" data-aos-duration="1000" data-aos-delay="600">
                    <div className="bb-services-box p-[30px] border-[1px] border-solid border-[#eee] rounded-[20px] text-center">
                        <div className="services-img mb-[20px] flex justify-center">
                            <img src="/img/services/3.png" alt="services-3" className="w-[50px]"/>
                        </div>
                        <div className="services-contact">
                            <h4 className="font-quicksand mb-[8px] text-[18px] font-bold text-secondary leading-[1.2] tracking-[0.03rem]">Transparent Pricing</h4>
                            <p className="font-Poppins font-light text-[14px] leading-[20px] text-secondary tracking-[0.03rem]">100% clarity in gold pricing, weight, and plan terms — no hidden charges.</p>
                        </div>
                    </div>
                </div>
                <div className="w-full " data-aos="flip-up" data-aos-duration="1000" data-aos-delay="800">
                    <div className="bb-services-box p-[30px] border-[1px] border-solid border-[#eee] rounded-[20px] text-center">
                        <div className="services-img mb-[20px] flex justify-center">
                            <img src="/img/services/4.png" alt="services-4" className="w-[50px]"/>
                        </div>
                        <div className="services-contact">
                            <h4 className="font-quicksand mb-[8px] text-[18px] font-bold text-secondary leading-[1.2] tracking-[0.03rem]">Safe Insured Delivery</h4>
                            <p className="font-Poppins font-light text-[14px] leading-[20px] text-secondary tracking-[0.03rem]">Insured doorstep delivery with tamper-proof packaging.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
  )
}

export default Services