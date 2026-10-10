import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { firstErrorMessage } from '../api/axios';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const BLANK_MANUAL = { shipping_address: '', city: '', postal_code: '', country: 'India' };

export default function Checkout() {
  const { cart, refreshCart, clearLocalCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [useManual, setUseManual] = useState(false);
  const [manual, setManual] = useState(BLANK_MANUAL);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { refreshCart(); }, [refreshCart]);

  const loadAddresses = useCallback(() => {
    setLoadingAddresses(true);
    api.get('/accounts/addresses/')
      .then(({ data }) => {
        const list = data.results || data;
        setAddresses(list);
        const def = list.find((a) => a.is_default) || list[0];
        if (def) setSelectedId(def.id);
        else setUseManual(true);
      })
      .finally(() => setLoadingAddresses(false));
  }, []);

  useEffect(() => { loadAddresses(); }, [loadAddresses]);

  const setManualField = (key) => (e) => setManual((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let payload;
    if (useManual || !selectedId) {
      if (!manual.shipping_address || !manual.city || !manual.postal_code || !manual.country) {
        setError('Please fill in every field, or pick a saved address instead.');
        return;
      }
      payload = manual;
    } else {
      const addr = addresses.find((a) => a.id === selectedId);
      payload = {
        shipping_address: `${addr.full_name}, ${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}${addr.state ? ', ' + addr.state : ''} (Phone: ${addr.phone})`,
        city: addr.city,
        postal_code: addr.postal_code,
        country: addr.country,
      };
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/orders/checkout/', payload);
      clearLocalCart();
      toast(`Order #${data.id} placed successfully!`, 'success');
      navigate('/orders', { replace: true });
    } catch (err) {
      setError(firstErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="container-fluid px-4 py-4">
        <div className="empty-state">
          <i className="bi bi-cart-x"></i>
          <p>Your cart is empty. <Link to="/">Go shopping</Link>.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4">
      <h1 className="page-heading"><i className="bi bi-bag-check"></i> Checkout</h1>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <section className="panel">
            <div className="panel__row">
              <h2 className="panel__heading">Deliver to</h2>
              {addresses.length > 0 && (
                <button type="button" className="btn btn--ghost btn--small" onClick={() => setUseManual((v) => !v)}>
                  {useManual ? 'Choose a saved address' : 'Use a different address'}
                </button>
              )}
            </div>

            {loadingAddresses ? (
              <p className="dim">Loading your addresses…</p>
            ) : !useManual && addresses.length > 0 ? (
              <>
                <div className="address-pick-list">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`address-pick ${selectedId === addr.id ? 'address-pick--selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedId === addr.id}
                        onChange={() => setSelectedId(addr.id)}
                      />
                      <div>
                        <span className="address-card__label">{addr.label}</span>
                        {addr.is_default && <span className="address-card__badge address-card__badge--inline">Default</span>}
                        <strong className="d-block">{addr.full_name}</strong>
                        <span className="d-block">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</span>
                        <span className="d-block">{addr.city}{addr.state ? `, ${addr.state}` : ''} - {addr.postal_code}</span>
                        <span className="dim">Phone: {addr.phone}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <Link to="/profile" className="account-nav__item" style={{ marginTop: '10px', display: 'inline-flex' }}>
                  <i className="bi bi-plus-lg"></i> Add a new address
                </Link>
              </>
            ) : (
              <form className="field-stack" noValidate>
                <label className="field-label">Address</label>
                <input type="text" className="field-input" value={manual.shipping_address} onChange={setManualField('shipping_address')} required />

                <div className="row g-3">
                  <div className="col-sm-6">
                    <label className="field-label">City</label>
                    <input type="text" className="field-input" value={manual.city} onChange={setManualField('city')} required />
                  </div>
                  <div className="col-sm-6">
                    <label className="field-label">Postal code</label>
                    <input type="text" className="field-input" value={manual.postal_code} onChange={setManualField('postal_code')} required />
                  </div>
                </div>

                <label className="field-label">Country</label>
                <input type="text" className="field-input" value={manual.country} onChange={setManualField('country')} required />

                <p className="field-hint">
                  Tip: save this in <Link to="/profile">Your Addresses</Link> so you don't have to type it again next time.
                </p>
              </form>
            )}

            {error && <p className="field-error mt-3">{error}</p>}

            <button type="button" onClick={handleSubmit} className="btn btn--primary btn--full" disabled={submitting}>
              <i className="bi bi-check2-circle"></i> {submitting ? 'Placing order…' : 'Place order'}
            </button>
          </section>
        </div>

        <div className="col-12 col-lg-5">
          <section className="panel">
            <h2 className="panel__heading">Order summary</h2>
            <ul className="order-summary-list">
              {cart.items.map((item) => (
                <li key={item.id}>
                  <span>{item.quantity} × {item.product.name}</span>
                  <span>₹{Number(item.subtotal).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="order-summary-total">
              <span>Total</span>
              <span>₹{Number(cart.total_price).toFixed(2)}</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
