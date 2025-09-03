// components/ProductSlider.js
import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const products = {
  trending: [
    {
      name: 'Fresh Lichi',
      type: 'Fruits',
      price: '$10.00',
      oldPrice: '$11.00',
      image: '/img/products/product-1.png',
    },
    {
      name: 'Berry & Graps Mix Snack',
      type: 'Driedfruit',
      price: '$52.00',
      oldPrice: '$55.00',
      image: '/img/products/product-2.png',
    },
    {
      name: 'Pineapple',
      type: 'Fruits',
      price: '$20.00',
      oldPrice: '$30.00',
      image: '/img/products/product-3.png',
    },
  ],
  rated: [
    {
      name: 'Ginger - Organic',
      type: 'Vegetables',
      price: '$62.00',
      oldPrice: '$65.00',
      image: '/img/products/product-4.png',
    },
    {
      name: 'Dates Value Pouch',
      type: 'Driedfruit',
      price: '$56.00',
      oldPrice: '$78.00',
      image: '/img/products/product-5.png',
    },
    {
      name: 'Blue Berry',
      type: 'Fruits',
      price: '$25.00',
      oldPrice: '$30.00',
      image: '/img/products/thumb-bananas.png',
    },
  ],
  selling: [
    {
      name: 'Lemon - Seedless',
      type: 'Vegetables',
      price: '$42.00',
      oldPrice: '$45.00',
      image: '/img/products/thumb-tomatoes.png',
    },
    {
      name: 'Mango - Kesar',
      type: 'Fruits',
      price: '$62.00',
      oldPrice: '$65.00',
      image: '/img/products/thumb-tomatoketchup.png',
    },
    {
      name: 'Mixed Nuts & Almonds',
      type: 'Driedfruit',
      price: '$10.00',
      oldPrice: '$11.00',
      image: '/img/products/thumbnail-5.png',
    },
  ],
};

const settings = {
  dots: false,
  arrows: true,
  infinite: false,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  responsive: [
    {
      breakpoint: 1024,
      settings: { slidesToShow: 1 },
    },
  ],
};

const ProductCard = ({ product }) => (
  <div className="flex items-center justify-between border p-4 rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md">
    <img src={product.image} alt={product.name} className="w-16 h-16 object-contain" />
    <div className="flex-1 ml-4">
      <h4 className="font-semibold text-gray-800">{product.name}</h4>
      <p className="text-sm text-gray-500">{product.type}</p>
      <p className="text-sm text-gray-800 font-bold">
        {product.price}{' '}
        <span className="text-xs line-through text-gray-400 ml-2">
          {product.oldPrice}
        </span>
      </p>
    </div>
  </div>
);

const ProductSlider = () => {
  return (
    <>
    <div className="container mx-auto px-4 py-10 trending">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Banner */}
        <div className="bg-cover bg-center bg-no-repeat p-6 rounded-xl text-end" style={{ backgroundImage: "url('/img/products/colourful-organic-ingredients-mexican-cuisine.jpg')" }}>
          <h2 className="text-xl font-bold text-white mb-4">Our Top Most Products Check It Now</h2>
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Shop Now</button>
        </div>

        {/* Sliders */}
        {['trending', 'rated', 'selling'].map((category, idx) => (
          <div key={idx}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                {category === 'trending' && <>Trending <span className="text-[#dc2043]">Items</span></>}
                {category === 'rated' && <>Top <span className="text-[#dc2043]">Rated</span></>}
                {category === 'selling' && <>Top <span className="text-[#dc2043]">Selling</span></>}
              </h3>
            </div>
            <Slider {...settings}>
              {products[category].map((prod, i) => (
                <div key={i} className="p-2">
                  <ProductCard product={prod} />
                </div>
              ))}
            </Slider>
          </div>
        ))}
      </div>
    </div>
    <style>
      {`
        .trending .slick-prev{
            top: -28px !important;
            right: 40px !important;
            left: auto;
        }
        .trending .slick-next{
          top: -28px !important;
          right: 10px;
        }
      `}
    </style>
    </>
  );
};

export default ProductSlider;
