import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { firstErrorMessage } from '../api/axios';

export default function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.response?.status === 401 ? 'Invalid username or password.' : firstErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1 className="auth-card__heading"><i className="bi bi-box-arrow-in-right"></i> Sign in</h1>
        <p className="auth-card__sub">Enter your credentials to continue shopping.</p>

        <form onSubmit={handleSubmit} className="field-stack" noValidate>
          <label className="field-label">Username</label>
          <input type="text" className="field-input" value={username} onChange={(e) => setUsername(e.target.value)} required />

          <label className="field-label">Password</label>
          <input type="password" className="field-input" value={password} onChange={(e) => setPassword(e.target.value)} required />

          {error && <p className="field-error">{error}</p>}

          <button type="submit" className="btn btn--primary btn--full" disabled={submitting}>
            <i className="bi bi-box-arrow-in-right"></i> {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-card__switch">No account yet? <Link to="/signup">Create one</Link></p>
      </div>
    </div>
  );
}
