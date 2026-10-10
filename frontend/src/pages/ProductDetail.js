import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProductImage from '../components/ProductImage';

function formatRupee(n) {
  return Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setQuantity(1);
    api.get(`/products/products/${slug}/`)
      .then(({ data }) => setProduct(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast('Please sign in to add items to your cart.', 'warning');
      navigate('/signin', { state: { from: `/products/${slug}` } });
      return;
    }
    try {
      await addToCart(product.id, quantity);
      toast('Added to cart.', 'success');
    } catch (err) {
      toast(err?.response?.data?.detail || 'Could not add to cart.', 'error');
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast('Please sign in to continue.', 'warning');
      navigate('/signin', { state: { from: `/products/${slug}` } });
      return;
    }
    try {
      await addToCart(product.id, quantity);
      navigate('/checkout');
    } catch (err) {
      toast(err?.response?.data?.detail || 'Could not start checkout.', 'error');
    }
  };

  if (loading) return <div className="container-fluid px-3 px-lg-4 py-4"><p className="dim">Loading…</p></div>;

  if (notFound || !product) {
    return (
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="empty-state">
          <i className="bi bi-question-circle"></i>
          <p>That product doesn't exist. <Link to="/">Back to shop</Link>.</p>
        </div>
      </div>
    );
  }

  const hasDiscount = product.mrp && Number(product.mrp) > Number(product.price);
  const highlights = (product.description || '')
    .split(/\.\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="container-fluid px-3 px-lg-4 py-4 pdp">
      <nav className="breadcrumb-row">
        <Link to="/">Home</Link>
        <i className="bi bi-chevron-right"></i>
        <Link to={`/?category=${product.category}`}>{product.category_name}</Link>
        <i className="bi bi-chevron-right"></i>
        <span className="dim">{product.name}</span>
      </nav>

      <div className="row g-4 mt-1">
        <div className="col-12 col-md-5">
          <div className="pdp__gallery">
            <ProductImage product={product} size="detail" />
          </div>
        </div>

        <div className="col-12 col-md-7">
          <span className="pdp__category">{product.category_name}</span>
          <h1 className="detail-title">{product.name}</h1>

          {product.rating > 0 && (
            <div className="rating-row rating-row--lg">
              <span className="rating-badge">{product.rating} <i className="bi bi-star-fill"></i></span>
              <span className="rating-count">{Number(product.rating_count).toLocaleString('en-IN')} ratings</span>
            </div>
          )}

          <div className="price-row price-row--lg">
            <span className="price-now">₹{formatRupee(product.price)}</span>
            {hasDiscount && (
              <>
                <span className="price-mrp">₹{formatRupee(product.mrp)}</span>
                <span className="price-discount">{product.discount_percent}% off</span>
              </>
            )}
          </div>
          {hasDiscount && <p className="dim mb-2">inclusive of all taxes</p>}

          {highlights.length > 0 && (
            <div className="pdp__highlights">
              <h3>About this item</h3>
              <ul>
                {highlights.map((h, i) => <li key={i}>{h}.</li>)}
              </ul>
            </div>
          )}

          {product.in_stock ? (
            <p className="low-stock mb-3">{product.stock <= 5 ? `Only ${product.stock} left — order soon` : 'In stock'}</p>
          ) : (
            <p className="low-stock low-stock--out mb-3">Currently unavailable</p>
          )}

          <div className="pdp__delivery">
            <i className="bi bi-truck"></i>
            <div>
              <strong>Free delivery</strong>
              <span className="dim"> on orders over ₹499. Usually dispatched within 1–2 business days.</span>
            </div>
          </div>

          <div className="detail-actions">
            <div className="qty-stepper qty-stepper--lg">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}>+</button>
            </div>
            <button className="btn btn--outline" disabled={!product.in_stock} onClick={handleAddToCart}>
              <i className="bi bi-cart-plus"></i> Add to cart
            </button>
            <button className="btn btn--primary" disabled={!product.in_stock} onClick={handleBuyNow}>
              <i className="bi bi-lightning-charge-fill"></i> Buy now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
