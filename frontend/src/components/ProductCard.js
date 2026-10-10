import React from 'react';
import { Link } from 'react-router-dom';
import ProductImage from './ProductImage';

function formatRupee(n) {
  return Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function ProductCard({ product, onAddToCart, onBuyNow }) {
  const hasDiscount = product.mrp && Number(product.mrp) > Number(product.price);

  return (
    <div className="product-card">
      <Link to={`/products/${product.slug}`} className="product-card__img-link">
        <ProductImage product={product} size="card" />
        {!product.in_stock && <span className="ribbon ribbon--out">Sold out</span>}
        {hasDiscount && product.in_stock && (
          <span className="ribbon ribbon--deal">{product.discount_percent}% OFF</span>
        )}
      </Link>
      <div className="product-card__body">
        <Link to={`/products/${product.slug}`} className="product-card__name-link">
          <h3 className="product-card__name">{product.name}</h3>
        </Link>

        {product.rating > 0 && (
          <div className="rating-row">
            <span className="rating-badge">{product.rating} <i className="bi bi-star-fill"></i></span>
            <span className="rating-count">({Number(product.rating_count).toLocaleString('en-IN')})</span>
          </div>
        )}

        <div className="price-row">
          <span className="price-now">₹{formatRupee(product.price)}</span>
          {hasDiscount && (
            <>
              <span className="price-mrp">₹{formatRupee(product.mrp)}</span>
              <span className="price-discount">{product.discount_percent}% off</span>
            </>
          )}
        </div>

        {product.in_stock ? (
          product.stock <= 5 && <span className="low-stock">Only {product.stock} left</span>
        ) : (
          <span className="low-stock low-stock--out">Currently unavailable</span>
        )}

        <div className="product-card__actions">
          <button
            className="btn btn--outline btn--small"
            disabled={!product.in_stock}
            onClick={() => onAddToCart(product)}
          >
            <i className="bi bi-cart-plus"></i> Add
          </button>
          <button
            className="btn btn--primary btn--small"
            disabled={!product.in_stock}
            onClick={() => onBuyNow(product)}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
