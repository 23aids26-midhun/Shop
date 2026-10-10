import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api, { firstErrorMessage } from '../api/axios';

const TABS = [
  { id: 'profile', label: 'Profile Info', icon: 'bi-person' },
  { id: 'security', label: 'Login & Security', icon: 'bi-shield-lock' },
  { id: 'addresses', label: 'Your Addresses', icon: 'bi-geo-alt' },
];

const EMPTY_ADDRESS = {
  label: 'home', full_name: '', phone: '', line1: '', line2: '',
  city: '', state: '', postal_code: '', country: 'India', is_default: false,
};

export default function Profile() {
  const [tab, setTab] = useState('profile');

  return (
    <div className="container-fluid px-4 py-4">
      <h1 className="page-heading"><i className="bi bi-person-circle"></i> Your Account</h1>

      <div className="row g-3">
        <div className="col-12 col-lg-3">
          <nav className="account-nav">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`account-nav__item ${tab === t.id ? 'account-nav__item--active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                <i className={`bi ${t.icon}`}></i> {t.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="col-12 col-lg-9">
          {tab === 'profile' && <ProfileTab />}
          {tab === 'security' && <SecurityTab />}
          {tab === 'addresses' && <AddressesTab />}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function ProfileTab() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    postal_code: user?.postal_code || '',
    country: user?.country || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await updateProfile(form);
      toast('Profile updated.', 'success');
    } catch (err) {
      setError(firstErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="panel">
      <h2 className="panel__heading">Account</h2>
      <p className="dim">
        <strong>{user?.username}</strong> · {user?.email}
        {user?.is_staff && <span className="admin-tag"> · admin</span>}
      </p>

      <hr />

      <h2 className="panel__heading">Default contact details</h2>
      <p className="panel__sub">Used to pre-fill your profile - saved addresses at checkout are separate.</p>
      <form onSubmit={handleSubmit} className="field-stack" noValidate>
        <label className="field-label">Phone</label>
        <input type="text" className="field-input" value={form.phone} onChange={set('phone')} />

        <label className="field-label">Address</label>
        <input type="text" className="field-input" value={form.address} onChange={set('address')} />

        <div className="row g-3">
          <div className="col-sm-6">
            <label className="field-label">City</label>
            <input type="text" className="field-input" value={form.city} onChange={set('city')} />
          </div>
          <div className="col-sm-6">
            <label className="field-label">Postal code</label>
            <input type="text" className="field-input" value={form.postal_code} onChange={set('postal_code')} />
          </div>
        </div>

        <label className="field-label">Country</label>
        <input type="text" className="field-input" value={form.country} onChange={set('country')} />

        {error && <p className="field-error">{error}</p>}

        <button type="submit" className="btn btn--primary" disabled={submitting}>
          <i className="bi bi-check2"></i> {submitting ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </section>
  );
}

/* ------------------------------------------------------------------ */
function SecurityTab() {
  const toast = useToast();
  const [form, setForm] = useState({ old_password: '', new_password: '', new_password2: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/accounts/change-password/', form);
      toast('Password updated.', 'success');
      setForm({ old_password: '', new_password: '', new_password2: '' });
    } catch (err) {
      setError(firstErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="panel">
      <h2 className="panel__heading">Login & Security</h2>
      <p className="panel__sub">Change your password. You'll need your current one first.</p>

      <form onSubmit={handleSubmit} className="field-stack" noValidate>
        <label className="field-label">Current password</label>
        <input type="password" className="field-input" value={form.old_password} onChange={set('old_password')} required />

        <div className="row g-3">
          <div className="col-sm-6">
            <label className="field-label">New password</label>
            <input type="password" className="field-input" value={form.new_password} onChange={set('new_password')} required />
          </div>
          <div className="col-sm-6">
            <label className="field-label">Confirm new password</label>
            <input type="password" className="field-input" value={form.new_password2} onChange={set('new_password2')} required />
          </div>
        </div>
        <p className="field-hint">At least 8 characters, not all numbers, not too common.</p>

        {error && <p className="field-error">{error}</p>}

        <button type="submit" className="btn btn--primary" disabled={submitting}>
          <i className="bi bi-shield-check"></i> {submitting ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </section>
  );
}

/* ------------------------------------------------------------------ */
function AddressesTab() {
  const toast = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = not open, {} = new, {...} = editing
  const [form, setForm] = useState(EMPTY_ADDRESS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.get('/accounts/addresses/')
      .then(({ data }) => setAddresses(data.results || data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setForm(EMPTY_ADDRESS); setEditing({}); setError(''); };
  const openEdit = (addr) => { setForm(addr); setEditing(addr); setError(''); };
  const closeForm = () => setEditing(null);

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (editing && editing.id) {
        await api.put(`/accounts/addresses/${editing.id}/`, form);
        toast('Address updated.', 'success');
      } else {
        await api.post('/accounts/addresses/', form);
        toast('Address added.', 'success');
      }
      closeForm();
      load();
    } catch (err) {
      setError(firstErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (addr) => {
    if (!window.confirm(`Remove the ${addr.label} address for ${addr.full_name}?`)) return;
    try {
      await api.del(`/accounts/addresses/${addr.id}/`);
      toast('Address removed.', 'info');
      load();
    } catch (err) {
      toast('Could not remove address.', 'error');
    }
  };

  const handleMakeDefault = async (addr) => {
    try {
      await api.patch(`/accounts/addresses/${addr.id}/`, { is_default: true });
      load();
    } catch (err) {
      toast('Could not set default.', 'error');
    }
  };

  return (
    <section className="panel">
      <div className="panel__row">
        <div>
          <h2 className="panel__heading">Your Addresses</h2>
          <p className="panel__sub">Saved addresses you can pick from at checkout.</p>
        </div>
        {!editing && (
          <button className="btn btn--outline btn--small" onClick={openNew}>
            <i className="bi bi-plus-lg"></i> Add a new address
          </button>
        )}
      </div>

      {editing && (
        <form onSubmit={handleSubmit} className="field-stack address-form" noValidate>
          <div className="row g-3">
            <div className="col-sm-4">
              <label className="field-label">Label</label>
              <select className="field-input" value={form.label} onChange={set('label')}>
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="col-sm-8">
              <label className="field-label">Full name</label>
              <input type="text" className="field-input" value={form.full_name} onChange={set('full_name')} required />
            </div>
          </div>

          <label className="field-label">Phone</label>
          <input type="text" className="field-input" value={form.phone} onChange={set('phone')} required />

          <label className="field-label">Address line 1</label>
          <input type="text" className="field-input" value={form.line1} onChange={set('line1')} required />

          <label className="field-label">Address line 2 <span className="dim">(optional)</span></label>
          <input type="text" className="field-input" value={form.line2} onChange={set('line2')} />

          <div className="row g-3">
            <div className="col-sm-6">
              <label className="field-label">City</label>
              <input type="text" className="field-input" value={form.city} onChange={set('city')} required />
            </div>
            <div className="col-sm-6">
              <label className="field-label">State</label>
              <input type="text" className="field-input" value={form.state} onChange={set('state')} />
            </div>
          </div>

          <div className="row g-3">
            <div className="col-sm-6">
              <label className="field-label">Postal code</label>
              <input type="text" className="field-input" value={form.postal_code} onChange={set('postal_code')} required />
            </div>
            <div className="col-sm-6">
              <label className="field-label">Country</label>
              <input type="text" className="field-input" value={form.country} onChange={set('country')} required />
            </div>
          </div>

          <label className="field-check">
            <input type="checkbox" checked={!!form.is_default} onChange={set('is_default')} />
            Make this my default address
          </label>

          {error && <p className="field-error">{error}</p>}

          <div className="form-actions">
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              <i className="bi bi-check2"></i> {submitting ? 'Saving…' : 'Save address'}
            </button>
            <button type="button" className="btn btn--ghost" onClick={closeForm}>Cancel</button>
          </div>
        </form>
      )}

      {!editing && (
        loading ? (
          <p className="dim">Loading your addresses…</p>
        ) : addresses.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-geo-alt"></i>
            <p>No saved addresses yet. Add one so checkout is a single click next time.</p>
          </div>
        ) : (
          <div className="address-grid">
            {addresses.map((addr) => (
              <div key={addr.id} className={`address-card ${addr.is_default ? 'address-card--default' : ''}`}>
                {addr.is_default && <span className="address-card__badge">Default</span>}
                <span className="address-card__label">{addr.label}</span>
                <strong>{addr.full_name}</strong>
                <span>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</span>
                <span>{addr.city}{addr.state ? `, ${addr.state}` : ''} - {addr.postal_code}</span>
                <span>{addr.country}</span>
                <span className="dim">Phone: {addr.phone}</span>
                <div className="address-card__actions">
                  <button className="btn btn--ghost btn--small" onClick={() => openEdit(addr)}>
                    <i className="bi bi-pencil"></i> Edit
                  </button>
                  {!addr.is_default && (
                    <button className="btn btn--ghost btn--small" onClick={() => handleMakeDefault(addr)}>
                      Set default
                    </button>
                  )}
                  <button className="btn btn--danger btn--small" onClick={() => handleDelete(addr)}>
                    <i className="bi bi-trash3"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </section>
  );
}
