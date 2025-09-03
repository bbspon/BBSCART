import React from 'react'
import SingleProduct from '../products/SingleProduct'
import { useParams } from 'react-router-dom';


function SingleProductPage() {
    const { id } = useParams();
    console.log('id - ',id);
  return (
    <>
    <div className="product_single_page bbscontainer">
      <SingleProduct/>
    </div>
    </>
  )
}

export default SingleProductPage