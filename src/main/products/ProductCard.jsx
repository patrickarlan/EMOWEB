import React from 'react';
import './productCard.scss';
import emoex from '../../pics/EMOEX.png';

export default function ProductCard() {
  return (
    <div className="product-demo">
      <main className="product">
        <figure>
          <img src={emoex} alt="EMO EX" className="product-image" />
        </figure>

        <div className="product-description">
          <div className="info">
            <h1>EMO: AI PROTOTYPE</h1>
            <p>Compact emotion-driven assistant prototype with expressive design.</p>
          </div>

          <div className="price">₱1,000</div>
        </div>

        <div className="product-sidebar">
          <button className="buy" aria-label="Buy">
            {/* shopping bag / cart SVG */}
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M6 2l1 2h10l1-2H6zm0 4l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14H6z" />
            </svg>
            <span>BUY</span>
          </button>

          <button className="cart" aria-label="Add to cart">
            {/* cart SVG */}
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M7 4h-2l-1 2h2l3.6 7.59-1.35 2.45A1 1 0 0 0 10 18h8v-2h-7.42l.93-1.68L19 6H7z"/>
            </svg>
            <span>CART</span>
          </button>

          <button className="info-btn" aria-label="More info">
            {/* info SVG */}
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M11 17h2v-6h-2v6zm0-8h2V7h-2v2zm1-7C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            </svg>
            <span>INFO</span>
          </button>
        </div>
      </main>
    </div>
  );
}
