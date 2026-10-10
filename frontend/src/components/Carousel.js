import React, { useEffect, useState, useCallback } from 'react';

const SLIDES = [
  { id: 1, title: 'Big Billion Deals', sub: 'Up to 70% off on Electronics', cta: 'Shop Electronics', category: 'electronics', image: '/images/banners/banner_electronics.jpg' },
  { id: 2, title: 'Fashion Week Sale', sub: 'Flat 50% off on top brands', cta: 'Shop Fashion', category: 'fashion', image: '/images/banners/banner_fashion.jpg' },
  { id: 3, title: 'Home Makeover', sub: 'Everything under ₹999', cta: 'Shop Home & Kitchen', category: 'home-kitchen', image: '/images/banners/banner_home.jpg' },
];

export default function Carousel({ onShopCategory }) {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => setIndex((i) => (i + 1) % SLIDES.length), []);
  const prev = () => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [next]);

  const slide = SLIDES[index];

  return (
    <div className="carousel" style={{ 
      backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url(${slide.image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <button className="carousel__arrow carousel__arrow--left" onClick={prev} aria-label="Previous slide">
        <i className="bi bi-chevron-left"></i>
      </button>

      <div className="container-fluid px-3 px-lg-4 carousel__inner" style={{ minHeight: '320px', alignItems: 'center' }}>
        <div style={{ maxWidth: '600px' }}>
          <span className="carousel__eyebrow"><i className="bi bi-lightning-charge-fill"></i> Limited time</span>
          <h1 className="carousel__title">{slide.title}</h1>
          <p className="carousel__sub">{slide.sub}</p>
          <button className="btn btn--pill btn--light" onClick={() => onShopCategory && onShopCategory(slide.category)}>
            {slide.cta} <i className="bi bi-arrow-right"></i>
          </button>
        </div>
      </div>

      <button className="carousel__arrow carousel__arrow--right" onClick={next} aria-label="Next slide">
        <i className="bi bi-chevron-right"></i>
      </button>

      <div className="carousel__dots">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            className={`carousel__dot ${i === index ? 'carousel__dot--active' : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
