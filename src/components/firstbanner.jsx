import React from "react";
import "../styles/firstbanner.css";
import bannerIcon from "../pics/banner-icon.png";

export default function FirstBanner() {
  const bgStyle = { backgroundImage: `url(${bannerIcon})` };

  return (
    <div className="first-banner" style={bgStyle}>
      <div className="banner-content">
        <div className="banner-card">
          <div className="banner-text text-center">
            <h2 className="banner-title">EMOWEB — Emotion AI</h2>
            <p className="banner-sub">A small demo area for emotion-aware web tools and components.</p>
          </div>
        </div>
      </div>
    </div>
  );
}