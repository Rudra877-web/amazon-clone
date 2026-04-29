import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';

const statusColors = {
  pending: { bg: '#fff8e1', color: '#f57c00' },
  confirmed: { bg: '#e3f2fd', color: '#1565c0' },
  processing: { bg: '#f3e5f5', color: '#7b1fa2' },
  shipped: { bg: '#e8f5e9', color: '#2e7d32' },
  delivered: { bg: '#e8f5e9', color: '#1b5e20' },
  cancelled: { bg: '#ffebee', color: '#c62828' },
  refunded: { bg: '#fce4ec', color: '#880e4f' },
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/orders').then(({ data }) => {
      setOrders(data.orders);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #f0f0f0', borderTopColor: '#FF9900', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f2' }}>
      <div className="container" style={{ padding: '20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Your Orders</h1>
          <Link to="/products" style={{ color: '#007185', fontSize: 14 }}>Continue Shopping →</Link>
        </div>

        {orders.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 10, padding: 80, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>📦</div>
            <h2 style={{ fontSize: 22, fontWeight: 400, marginBottom: 12 }}>You haven't placed any orders yet</h2>
            <p style={{ color: '#666', marginBottom: 24 }}>When you place your first order, it will appear here</p>
            <Link to="/products" style={{ background: '#FF9900', color: 'white', padding: '12px 28px', borderRadius: 6, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map(order => {
              const statusStyle = statusColors[order.status] || { bg: '#f5f5f5', color: '#666' };
              const items = Array.isArray(order.items) ? order.items.filter(i => i && i.title) : [];
              return (
                <div key={order.id} style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', border: '1px solid #eee' }}>
                  {/* Order Header */}
                  <div style={{ background: '#f7f7f7', padding: '14px 20px', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', borderBottom: '1px solid #eee' }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Order Placed</div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Total</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#B12704' }}>₹{parseFloat(order.total_amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Payment</div>
                      <div style={{ fontSize: 14, textTransform: 'capitalize' }}>{order.payment_method}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <div style={{ fontSize: 11, color: '#666' }}>ORDER # {order.id.slice(0, 8).toUpperCase()}</div>
                      <span style={{ background: statusStyle.bg, color: statusStyle.color, padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>
                        {order.status}
                      </span>
                      <Link to={`/orders/${order.id}`} style={{ color: '#007185', fontSize: 13 }}>View Details →</Link>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
                      {items.slice(0, 4).map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img src={item.image} alt={item.title}
                            style={{ width: 64, height: 64, objectFit: 'contain', border: '1px solid #eee', borderRadius: 4 }}
                            onError={e => e.target.src = 'https://via.placeholder.com/64x64?text=Item'} />
                          <div>
                            <div style={{ fontSize: 13, lineHeight: 1.4, maxWidth: 180, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</div>
                            <div style={{ fontSize: 12, color: '#666' }}>Qty: {item.quantity} • ₹{parseFloat(item.price).toLocaleString('en-IN')}</div>
                          </div>
                        </div>
                      ))}
                      {items.length > 4 && <div style={{ fontSize: 13, color: '#666' }}>+{items.length - 4} more</div>}
                    </div>

                    <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <Link to={`/orders/${order.id}`}
                        style={{ padding: '7px 16px', background: 'linear-gradient(to bottom, #f7dfa5, #f0c14b)', border: '1px solid #a88734', borderRadius: 4, fontSize: 13, fontWeight: 600, color: '#111', textDecoration: 'none' }}>
                        View Order Details
                      </Link>
                      {(order.status === 'delivered') && (
                        <Link to={`/products`}
                          style={{ padding: '7px 16px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, color: '#111', textDecoration: 'none', background: 'white' }}>
                          Buy Again
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
