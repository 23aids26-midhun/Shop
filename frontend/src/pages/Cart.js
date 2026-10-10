import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ProductImage from '../components/ProductImage';

export default function Cart() {
  const { cart, loading, refreshCart, updateItem, removeItem } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => { refreshCart(); }, [refreshCart]);

  const handleQty = async (itemId, qty) => {
    try {
      await updateItem(itemId, qty);
    } catch (err) {
      toast(err?.response?.data?.detail || 'Could not update quantity.', 'error');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeItem(itemId);
      toast('Removed from cart.', 'info');
    } catch (err) {
      toast('Could not remove item.', 'error');
    }
  };

  if (loading) return <div className="container-fluid px-4 py-4"><p className="dim">Loading your cart…</p></div>;

  return (
    <div className="container-fluid px-4 py-4">
      <h1 className="page-heading"><i className="bi bi-cart3"></i> Your cart</h1>

      {cart.items.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-cart-x"></i>
          <p>Your cart is empty. <Link to="/">Go shopping</Link>.</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table ledger align-middle">
              <thead>
                <tr><th>Product</th><th>Price</th><th>Quantity</th><th>Subtotal</th><th></th></tr>
              </thead>
              <tbody>
                {cart.items.map((item) => (
                  <tr key={item.id}>
                    <td><div className="cart-product"><ProductImage product={item.product} size="thumb" /><span>{item.product.name}</span></div></td>
                    <td>₹{Number(item.product.price).toFixed(2)}</td>
                    <td>
                      <div className="qty-stepper">
                        <button onClick={() => handleQty(item.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => handleQty(item.id, item.quantity + 1)}>+</button>
                      </div>
                    </td>
                    <td>₹{Number(item.subtotal).toFixed(2)}</td>
                    <td className="text-end">
                      <button className="btn btn--danger btn--small" onClick={() => handleRemove(item.id)}>
                        <i className="bi bi-trash3"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="checkout-bar">
            <div>
              <span className="dim">Total</span>
              <span className="checkout-bar__total">₹{Number(cart.total_price).toFixed(2)}</span>
            </div>
            <button className="btn btn--primary" onClick={() => navigate('/checkout')}>
              <i className="bi bi-bag-check"></i> Proceed to checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
