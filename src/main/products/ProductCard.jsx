import React from "react";
import "./productCard.scss"; // ensure your css/scss file is linked
import emoex from "../../pics/EMOEX.png";
import emoex2 from "../../pics/EMOEX2.png";
import emoex3 from "../../pics/EMOEX3.png";
import cartIcon from "../../pics/cart.png";

export default function ProductCard() {
  return (
    <main role="main" className="product-root">
      <div className="product">

        <div className="product-panel">
          <figure>
            <img
              src={emoex}
              alt="EMO EX"
              className="product-image"
            />
          </figure>

          <div className="product-description">
          <div className="info">
            <h1>LOREM IPSUM</h1>
            <p>
              Lorem Ipsum is simply dummy printing and typesetting industry
            </p>
          </div>

          <div className="price">89</div>
        </div>

        </div>

        <div className="product-sidebar">
          <button className="buy">
            <span>BUY ITEM</span>
          </button>

          <button className="info">
            <span>MORE INFO</span>
          </button>

          <button className="cart">
            <span>ADD TO CART</span>
          </button>
        </div>

      </div>

      <div className="product">

        <div className="product-panel">
          <figure>
            <img
              src={emoex2}
              alt="EMO EX"
              className="product-image"
            />
          </figure>

          <div className="product-description">
          <div className="info">
            <h1>LOREM IPSUM</h1>
            <p>
              Lorem Ipsum is simply dummy printing and typesetting industry
            </p>
          </div>

          <div className="price">89</div>
        </div>

        </div>

        <div className="product-sidebar">
          <button className="buy">
            <span>BUY ITEM</span>
          </button>

          <button className="info">
            <span>MORE INFO</span>
          </button>

          <button className="cart">
            <span>ADD TO CART</span>
          </button>
        </div>

      </div>

      <div className="product">

        <div className="product-panel">
          <figure>
            <img
              src={emoex3}
              alt="EMO EX"
              className="product-image"
            />
          </figure>

          <div className="product-description">
          <div className="info">
            <h1>LOREM IPSUM</h1>
            <p>
              Lorem Ipsum is simply dummy printing and typesetting industry
            </p>
          </div>

          <div className="price">89</div>
        </div>

        </div>

        <div className="product-sidebar">
          <button className="buy">
            <span>BUY ITEM</span>
          </button>

          <button className="info">
            <span>MORE INFO</span>
          </button>

          <button className="cart">
            <span>ADD TO CART</span>
          </button>
        </div>

      </div>
    </main>
  );
}
