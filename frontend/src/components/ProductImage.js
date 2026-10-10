import React, { useState } from 'react';
import { getProductVisual } from '../utils/productVisuals';

/** size: 'card' | 'detail' | 'thumb' */
export default function ProductImage({ product, size = 'card' }) {
  const [failed, setFailed] = useState(false);

  if (product.image_url && !failed) {
    return (
      <div className={`product-img product-img--${size}`}>
        <img src={product.image_url} alt={product.name} onError={() => setFailed(true)} />
      </div>
    );
  }

  const v = getProductVisual(product);
  return (
    <div className={`product-img product-img--${size} product-img--tile`} role="img" aria-label={product.name}>
      <span className="product-img__blob" style={{ background: v.from }}></span>
      <span className="product-img__emoji">{v.emoji}</span>
    </div>
  );
}
