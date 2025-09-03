import React, { useState } from 'react';
import ProductList from '../products/ProductList';
import { useParams } from 'react-router-dom';
import ProductFilter from '../products/ProductFilter';

function ProductsSubCategoryPage() {
const { subcategory } = useParams();
  // **Single state for filters**
  const [filters, setFilters] = useState({
    filter: false,
    categories: [],
    subcategories: [],
    colors: [],
    tags: [],
    priceRange: { min: 0, max: 100000000 }, // Set default range
  });
  const updateFilters = (newFilters) => {
    setFilters(newFilters);
    console.log('updateFilters',filters);
  };
  return (
    <div className='pt-6 md:pt-10 pb-2 bbscontainer'>
        <div className="flex flex-row">
          <div className="md:w-[25%] lg:w-[20%]"><ProductFilter filters={filters} setFilters={updateFilters}/></div>
          <div className="w-100 md:w-[85%] lg:w-[80%]"><ProductList heading={false} filters={filters} type="Grid" filter={true} category={null} subcategory={subcategory}/></div>
        </div>
    </div>
  )
}

export default ProductsSubCategoryPage