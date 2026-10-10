import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : '/');
  };

  return (
    <header className="site-header">
      <div className="site-header__bar">
        <div className="container-fluid px-3 px-lg-4 d-flex align-items-center gap-2 gap-lg-4">
          <Link to="/" className="site-header__brand">
            <span className="site-header__brand-main">Shop</span>
            <span className="site-header__brand-tag">Explore <i className="bi bi-stars"></i></span>
          </Link>

          <form onSubmit={handleSearch} className="site-header__search d-none d-md-flex">
            <input
              type="text"
              placeholder="Search for products, brands and more"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button type="submit" aria-label="Search"><i className="bi bi-search"></i></button>
          </form>

          <div className="site-header__actions ms-auto">
            {isAuthenticated ? (
              <>
                <div
                  className="account-flyout"
                  onMouseEnter={() => setAccountOpen(true)}
                  onMouseLeave={() => setAccountOpen(false)}
                >
                  <button className="site-header__action">
                    <span className="dim-label">Hello, {user.username}</span>
                    <span className="main-label">Account <i className="bi bi-caret-down-fill"></i></span>
                  </button>
                  {accountOpen && (
                    <div className="account-flyout__panel">
                      <Link to="/profile">Your Account</Link>
                      <Link to="/orders">Your Orders</Link>
                      {isAdmin && <Link to="/manage">Manage Products</Link>}
                      <hr />
                      <button onClick={handleLogout}>Sign out</button>
                    </div>
                  )}
                </div>
                <Link to="/orders" className="site-header__action d-none d-lg-flex">
                  <span className="dim-label">Returns</span>
                  <span className="main-label">& Orders</span>
                </Link>
              </>
            ) : (
              <Link to="/signin" className="btn btn--pill">Sign in</Link>
            )}

            <Link to="/cart" className="site-header__cart">
              <i className="bi bi-cart3"></i>
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
              <span className="d-none d-lg-inline">Cart</span>
            </Link>
          </div>
        </div>

        <form onSubmit={handleSearch} className="site-header__search site-header__search--mobile d-md-none">
          <input
            type="text"
            placeholder="Search products…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="submit" aria-label="Search"><i className="bi bi-search"></i></button>
        </form>
      </div>

      {!isAuthenticated && (
        <div className="site-header__promo">
          New here? <Link to="/signup">Create an account</Link> to track orders and check out faster.
        </div>
      )}
    </header>
  );
}
