import React, { useState } from "react";

function BestSelling() {
  const [quantity, setQuantity] = useState(0);

  const increment = () => setQuantity(prev => prev + 1);
  const decrement = () => setQuantity(prev => (prev > 0 ? prev - 1 : 0));

  return (
    <>
      <div className="">
        <div className="best-selling-title">
          <h1>Best Selling Jewellery</h1>
          <div className="best-selling-filters">
            <span>New</span>
            <a href="/necklace"><span>Necklaces</span></a>
            <a href="/bangle"> <span>Bracelets</span></a>
          </div>
        </div>

        <div className="all-best-selling-products">
          <div className="best-selling-product">
            <div className="best-selling-product-title">
              <span className="selling-red">Sale</span>
              <span className="selling-green">New</span>
              <img
                src="/img/thia/R.png"
                alt=""
                className="selling-product-image"
              />
            </div>

            <div className="best-selling-products">
              <h1>Sculpted Necklace</h1>

              <div className="best-selling-product-price">
                <span className="selling-price line-through">
                  ₹ 1,00,000
                </span>
                <span
                  className="selling-price"
                  style={{ color: "#ff6600", fontWeight: "bold" }}
                >
                  ₹ 1,00,000 only
                </span>
              </div>

              <div className="best-selling-product-rating">
                <div>
                  <span className="box-best-sell" onClick={decrement}>-</span>
                  <span className="box-best-sell">{quantity}</span>
                  <span className="box-best-sell" onClick={increment}>+</span>
                </div>
                <button className="best-selling-product-button">
                  <i className="ri-shopping-cart-line"></i> View More
                </button>
              </div>
            </div>
          </div>

          <div className="best-selling-product">
            <div className="best-selling-product-title">
              <span className="selling-red">Sale</span>
              <span className="selling-green">New</span>
              <img
                src="/img/thia/ring.png"
                alt=""
                className="selling-product-image"
              />
            </div>

            <div className="best-selling-products">
              <h1>Gold Ring</h1>

              <div className="best-selling-product-price">
                <span className="selling-price line-through">
                  ₹ 1,00,000
                </span>
                <span
                  className="selling-price"
                  style={{ color: "#ff6600", fontWeight: "bold" }}
                >
                  ₹ 1,00,000 only
                </span>
              </div>

              <div className="best-selling-product-rating">
                <div>
                  <span className="box-best-sell" onClick={decrement}>-</span>
                  <span className="box-best-sell">{quantity}</span>
                  <span className="box-best-sell" onClick={increment}>+</span>
                </div>
                <button className="best-selling-product-button">
                  <i className="ri-shopping-cart-line"></i> View More
                </button>
              </div>
            </div>
          </div>

          <div className="best-selling-product">
            <div className="best-selling-product-title">
              <span className="selling-red">Sale</span>
              <span className="selling-green">New</span>
              <img
                src="/img/thia/gold-1.png"
                alt=""
                className="selling-product-image"
              />
            </div>

            <div className="best-selling-products">
              <h1>Bangles</h1>

              <div className="best-selling-product-price">
                <span className="selling-price line-through">
                  ₹ 1,00,000
                </span>
                <span
                  className="selling-price"
                  style={{ color: "#ff6600", fontWeight: "bold" }}
                >
                  ₹ 1,00,000 only
                </span>
              </div>

              <div className="best-selling-product-rating">
                <div>
                  <span className="box-best-sell" onClick={decrement}>-</span>
                  <span className="box-best-sell">{quantity}</span>
                  <span className="box-best-sell" onClick={increment}>+</span>
                </div>
                <button className="best-selling-product-button">
                  <i className="ri-shopping-cart-line"></i> View More
                </button>
              </div>
            </div>
          </div>

          <div className="best-selling-product">
            <div className="best-selling-product-title">
              <span className="selling-red">Sale</span>
              <span className="selling-green">New</span>
              <img
                src="/img/thia/earring.png"
                alt=""
                className="selling-product-image"
              />
            </div>

            <div className="best-selling-products">
              <h1>Earring</h1>

              <div className="best-selling-product-price">
                <span className="selling-price line-through">
                  ₹ 1,00,000
                </span>
                <span
                  className="selling-price"
                  style={{ color: "#ff6600", fontWeight: "bold" }}
                >
                  ₹ 1,00,000 only
                </span>
              </div>

              <div className="best-selling-product-rating">
                <div>
                  <span className="box-best-sell" onClick={decrement}>-</span>
                  <span className="box-best-sell">{quantity}</span>
                  <span className="box-best-sell" onClick={increment}>+</span>
                </div>
                <button className="best-selling-product-button">
                  <i className="ri-shopping-cart-line"></i> View More
                </button>
              </div>
            </div>
          </div>

        </div>

        <style>
          {`

            .all-best-selling-products{
             display: flex;
             flex-wrap: wrap;
             justify-content: center;
             gap: 20px;
            }
            .best-selling-container {
              padding: 1rem 50px;
            }

            .best-selling-title {
              display: flex;
              justify-content: space-between;
              padding: 0 1rem;
              border-bottom: 1px solid gray;
              padding-bottom: 10px;
              position: relative;
            }

            .best-selling-title h1 {
              font-family: 'Times New Roman';
              font-size: 20px;
              font-weight: bold;
            }

            .best-selling-filters {
              display: flex;
              gap: 30px;
            }

            .best-selling-filters span {
              font-family: 'Times New Roman';
              font-size: 15px;
              cursor: pointer;
            }

            .best-selling-products {
              display: flex;
              flex-direction: column;
              gap: 10px;
            }

            .best-selling-product {
              width: 300px;
              height: 420px;
              border: 1px solid gray;
              border-radius: 15px;
              margin-top: 20px;
              position: relative;
              background-color: #f9f9f9;
              box-shadow: rgba(0, 0, 1, 0.2) 0px 3px 8px;
            }

            .best-selling-product-title {
              padding: 20px;
            }

            .best-selling-product-title span {
              display: flex;
              flex-direction: column;
              color: white;
              text-align: center;
              font-size: 10px;
              font-weight: bold;
              border-radius: 5px;
              width: 50px;
              position: absolute;
            }

            .selling-product-image {
              padding: 30px;
              width: 300px;
              height: 250px;
            }

            .selling-red {
              background-color: red;
              top: 20px;
              left: 20px;
            }

            .selling-green {
              background-color: green;
              top: 50px;
              left: 20px;
            }

            .best-selling-products h1 {
              font-family: 'Times New Roman';
              font-size: 20px;
              text-align: center;
              width: 280px;
              background-color: #f9f9f9;
              border-radius: 5px;
              margin: 0 10px;
            }

            .best-selling-product-price {
              display: flex;
              justify-content: center;
              gap: 10px;
              width: 280px;
              background-color: #f9f9f9;
              margin: 0 10px;
            }

            .selling-price {
              font-family: 'Times New Roman';
              font-size: 15px;
              display: flex;
              align-items: center;
            }

            .best-selling-product-rating {
              display: flex;
              justify-content:space-between;
              align-items: center;
              gap: 10px;
              padding: 0 20px;
              margin: 0 10px;
              width: 280px;
              background-color: #f9f9f9;
            }

            .box-best-sell {
              border: 0.5px solid gray;
              padding: 2px 8px;            
              cursor: pointer;
              font-weight: bold;
              font-size: 16px;
            }

            .best-selling-product-button {
              background-color: goldenrod;
              color: black;
              padding: 5px 10px;
              border-radius: 5px;
              display: flex;
              align-items: center;
              gap: 5px;
              cursor: pointer;
            }
          `}
        </style>
      </div>
    </>
  );
}

export default BestSelling;
