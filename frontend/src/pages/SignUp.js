import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { firstErrorMessage } from '../api/axios';

export default function SignUp() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', email: '', password: '', password2: '',
    phone: '', address: '', city: '', postal_code: '', country: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.password2) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await register(form);
      await login(form.username, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(firstErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card auth-card--wide">
        <h1 className="auth-card__heading"><i className="bi bi-bag-plus"></i> Create an account</h1>
        <p className="auth-card__sub">Sign up to start shopping. Every account gets a unique id automatically.</p>

        <form onSubmit={handleSubmit} className="field-stack" noValidate>
          <label className="field-label">Username</label>
          <input type="text" className="field-input" value={form.username} onChange={set('username')} required />

          <label className="field-label">Email</label>
          <input type="email" className="field-input" value={form.email} onChange={set('email')} required />

          <div className="row g-3">
            <div className="col-sm-6">
              <label className="field-label">Password</label>
              <input type="password" className="field-input" value={form.password} onChange={set('password')} required />
            </div>
            <div className="col-sm-6">
              <label className="field-label">Confirm password</label>
              <input type="password" className="field-input" value={form.password2} onChange={set('password2')} required />
            </div>
          </div>
          <p className="field-hint">At least 8 characters, not all numbers, not too common.</p>

          <div className="row g-3">
            <div className="col-sm-6">
              <label className="field-label">Phone <span className="dim">(optional)</span></label>
              <input type="text" className="field-input" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="col-sm-6">
              <label className="field-label">Country <span className="dim">(optional)</span></label>
              <input type="text" className="field-input" value={form.country} onChange={set('country')} />
            </div>
          </div>

          <label className="field-label">Address <span className="dim">(optional)</span></label>
          <input type="text" className="field-input" value={form.address} onChange={set('address')} />

          <div className="row g-3">
            <div className="col-sm-6">
              <label className="field-label">City <span className="dim">(optional)</span></label>
              <input type="text" className="field-input" value={form.city} onChange={set('city')} />
            </div>
            <div className="col-sm-6">
              <label className="field-label">Postal code <span className="dim">(optional)</span></label>
              <input type="text" className="field-input" value={form.postal_code} onChange={set('postal_code')} />
            </div>
          </div>

          {error && <p className="field-error">{error}</p>}

          <button type="submit" className="btn btn--primary btn--full" disabled={submitting}>
            <i className="bi bi-person-check"></i> {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-card__switch">Already have an account? <Link to="/signin">Sign in</Link></p>
      </div>
    </div>
  );
}
