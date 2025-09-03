import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const vendors = [
  {
    name: "Milky Store",
    items: 25,
    sales: 754,
    rating: 5,
    logo: "/img/category/4.png",
    products: ["/img/products/product-1.png", "/img/products/product-2.png", "/img/products/product-3.png", "/img/products/product-4.png"],
  },
  {
    name: "Green Star",
    items: 15,
    sales: 879,
    rating: 4,
    logo: "/img/category/1.png",
    products: ["/img/products/product-1.png", "/img/products/product-2.png", "/img/products/product-3.png", "/img/products/product-4.png"],
  },
  {
    name: "Meaga Mart",
    items: 80,
    sales: 785,
    rating: 4,
    logo: "/img/category/2.png",
    products: ["/img/products/product-1.png", "/img/products/product-2.png", "/img/products/product-3.png", "/img/products/product-4.png"],
  },
  {
    name: "Farmisho",
    items: 20,
    sales: 587,
    rating: 5,
    logo: "/img/category/3.png",
    products: ["/img/products/product-1.png", "/img/products/product-2.png", "/img/products/product-3.png", "/img/products/product-4.png"],
  },
  {
    name: "Meaga Mart",
    items: 80,
    sales: 785,
    rating: 4,
    logo: "/img/category/4.png",
    products: ["/img/products/product-1.png", "/img/products/product-2.png", "/img/products/product-3.png", "/img/products/product-4.png"],
  },
  {
    name: "Farmisho",
    items: 20,
    sales: 587,
    rating: 5,
    logo: "/img/category/5.png",
    products: ["/img/products/product-1.png", "/img/products/product-2.png", "/img/products/product-3.png", "/img/products/product-4.png"],
  },
];

const settings = {
  dots: false,
  arrows: true,
  infinite: false,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 1,
  responsive: [
    {
      breakpoint: 1024,
      settings: { slidesToShow: 2 },
    },
    {
      breakpoint: 640,
      settings: { slidesToShow: 1 },
    },
  ],
};

const VendorCard = ({ vendor }) => (
  <div className="bg-white rounded-xl p-4 shadow-md">
    <div className="flex items-center gap-3 mb-4">
      <img src={vendor.logo} alt={vendor.name} className="w-12 h-12 rounded-md object-contain" />
      <div>
        <h4 className="font-bold text-gray-800">{vendor.name}</h4>
        <p className="text-sm text-gray-500">{vendor.items} Items</p>
      </div>
    </div>
    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
      <div className="flex text-yellow-500">
        {Array.from({ length: vendor.rating }).map((_, i) => (
          <span key={i}>★</span>
        ))}
        {Array.from({ length: 5 - vendor.rating }).map((_, i) => (
          <span key={i}>☆</span>
        ))}
      </div>
      <div>Sales {vendor.sales}</div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      {vendor.products.map((src, i) => (
        <div key={i} className="p-2 border rounded-md">
          <img src={src} alt="" className="h-16 object-contain mx-auto" />
        </div>
      ))}
    </div>
  </div>
);

const VendorSlider = () => {
  return (
    <>
    <div className="container mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Top <span className="text-[#dc2043]">Vendors</span>
        </h2>
        <button className="text-gray-500 hover:text-[#dc2043] flex items-center gap-1 text-sm">
          All Vendors <span className="text-xl">&raquo;</span>
        </button>
      </div>
      <Slider {...settings}>
        {vendors.map((vendor, i) => (
          <div key={i} className="px-2 py-3">
            <VendorCard vendor={vendor} />
          </div>
        ))}
      </Slider>
    </div>
    <style>
        {`
        .slick-prev:before, .slick-next:before{
            color: #dc2043;
            opacity: 1!important;
        }
        `}
    </style>
    </>
  );
};

export default VendorSlider;