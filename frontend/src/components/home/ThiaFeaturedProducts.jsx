import React from 'react';

const products = [
  {
    id: 1,
    name: 'Matte Finish Gold Bangle',
    image: '/img/thia/R.png',
    rating: 4,
    desc: '22K Gold | BIS Certified | 18.2g',
  },
  {
    id: 2,
    name: 'Antique Temple Necklace',
    image: '/img/thia/ring.png',
    rating: 5,
    desc: '24K Antique | 32.5g | Limited Edition',
  },
  {
    id: 3,
    name: 'Lightweight Gold Earrings',
    image: '/img/thia/gold-1.png',
    rating: 4,
    desc: '22K | Casual Wear | 9.8g',
  },
  {
    id: 4,
    name: 'Classic Gold Chain',
    image: '/img/thia/earring.png',
    rating: 3,
    desc: '22K | BIS Hallmark | 15.6g',
  },
];

const FeaturedProducts = () => {
  return (
    <>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-8 m-5">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition duration-300 group"
        >
          {/* Product Image */}
          <div className="overflow-hidden">
            <a href="/card-product"> < img
              src={product.image}
              alt={product.name}
              className="w-full h-56 object-cover transform group-hover:scale-105 transition duration-300"
            /></a>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <h3 className="text-base font-medium text-gray-800">{product.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{product.desc}</p>

            {/* Star Rating */}
            <div className="flex items-center text-yellow-500 text-sm mt-2">
              {Array(5)
                .fill()
                .map((_, i) => (
                  <i key={i}
                    className={i < product.rating ? 'ri-star-fill text-yellow-500' : 'ri-star-fill text-gray-300'}
                  />
                ))}
            </div>

            {/* Buttons */}
            <div className="mt-4 flex justify-between items-center">
              <button className="bg-yellow-500 text-white text-sm px-4 py-2 rounded hover:bg-yellow-600">
                Add to Cart
              </button>
              <i className="ri-heart-fill text-gray-500 hover:text-red-500 cursor-pointer" />
            </div>
          </div>
        </div>
      ))}
    </div>
    </>
  );
};

export default FeaturedProducts;