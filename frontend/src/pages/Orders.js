import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const STATUS_CLASS = {
  pending: 'status--pending',
  paid: 'status--paid',
  shipped: 'status--shipped',
  delivered: 'status--delivered',
  cancelled: 'status--cancelled',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/', { params: { page_size: 100 } }).then(({ data }) => setOrders(data.results || data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container-fluid px-4 py-4"><p className="dim">Loading your orders…</p></div>;

  return (
    <div className="container-fluid px-4 py-4">
      <h1 className="page-heading"><i className="bi bi-receipt"></i> Your orders</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-receipt"></i>
          <p>No orders yet. <Link to="/">Go shopping</Link>.</p>
        </div>
      ) : (
        orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="order-card__head">
              <div>
                <strong>Order #{order.id}</strong>
                <span className="dim"> · {new Date(order.created_at).toLocaleString()}</span>
              </div>
              <span className={`status-pill ${STATUS_CLASS[order.status] || ''}`}>{order.status}</span>
            </div>
            <ul className="order-card__items">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.quantity} × {item.product_name} <span className="dim">— ₹{Number(item.subtotal).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="order-card__foot">
              <span className="dim"><i className="bi bi-geo-alt"></i> {order.shipping_address}, {order.city}</span>
              <strong>Total: ₹{Number(order.total_price).toFixed(2)}</strong>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
