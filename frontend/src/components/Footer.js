import React from 'react';
import { Link } from 'react-router-dom';

const COLUMNS = [
  { title: 'About', links: ['About Us', 'Careers', 'Shop Stories', 'Press'] },
  { title: 'Help', links: ['Payments', 'Shipping', 'Cancellation & Returns', 'FAQ'] },
  { title: 'Policy', links: ['Return Policy', 'Terms of Use', 'Security', 'Privacy'] },
  { title: 'Social', links: ['Facebook', 'Twitter', 'Instagram', 'YouTube'] },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-fluid px-3 px-lg-4">
        <div className="site-footer__grid">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((l) => <li key={l}><Link to="#">{l}</Link></li>)}
              </ul>
            </div>
          ))}
          <div className="site-footer__brand">
            <span className="site-header__brand-main">Shop</span>
            <p>Easy Payments & Easy Delivery.</p>
            <div className="site-footer__payments">
              <span>VISA</span><span>Mastercard</span><span>UPI</span><span>COD</span>
            </div>
          </div>
        </div>
      </div>
      <div className="site-footer__bottom">
        <div className="container-fluid px-3 px-lg-4 d-flex flex-wrap justify-content-between gap-2">
          <span>© 2026 Shop.com — a demo storefront, not a real retailer.</span>
          <span className="dim"></span>
        </div>
      </div>
    </footer>
  );
}
