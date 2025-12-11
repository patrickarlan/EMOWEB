import React, { useEffect, useState } from "react";
import "../styles/carousel.css";

export default function BannerCarousel({ images, interval = 5000 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <div className="carousel-container">
      {images.map((img, i) => (
        <div
          key={i}
          className={`carousel-slide ${i === index ? "active" : ""}`}
          style={{ backgroundImage: `url(${img})` }}
        ></div>
      ))}
    </div>
  );
}
