import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import API from '../api';
import toast from 'react-hot-toast';

const statusSteps = ['confirmed', 'processing', 'shipped', 'delivered'];

const OrderDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const isNewOrder = location.state?.newOrder;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    API.get(`/orders/${id}`).then(({ data }) => {
      setOrder(data.order);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await API.put(`/orders/${id}/cancel`);
      setOrder(data.order);
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot cancel this order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #f0f0f0', borderTopColor: '#FF9900', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!order) return <div style={{ textAlign: 'center', padding: 60 }}>Order not found. <Link to="/orders" style={{ color: '#007185' }}>View all orders</Link></div>;

  const items = Array.isArray(order.items) ? order.items.filter(i => i && i.title) : [];
  const statusIdx = statusSteps.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';
  const canCancel = ['pending', 'confirmed'].includes(order.status);
  const address = order.shipping_address;

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f2' }}>
      <div className="container" style={{ padding: '20px 16px' }}>

        {isNewOrder && (
          <div style={{ background: '#f0fff4', border: '1px solid #9f9', borderRadius: 10, padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 40 }}>🎉</span>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1b5e20', marginBottom: 4 }}>Order placed successfully!</h2>
              <p style={{ fontSize: 14, color: '#2e7d32' }}>Thank you for your order. We'll send you a confirmation shortly.</p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>Order Details</h1>
            <div style={{ fontSize: 13, color: '#666' }}>
              <Link to="/orders" style={{ color: '#007185' }}>Your Orders</Link> › Order # {order.id.slice(0, 8).toUpperCase()}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {canCancel && (
              <button onClick={handleCancel} disabled={cancelling}
                style={{ padding: '8px 16px', border: '1px solid #CC0C39', background: 'white', color: '#CC0C39', borderRadius: 4, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
            <Link to="/products" style={{ padding: '8px 16px', background: 'linear-gradient(to bottom, #f7dfa5, #f0c14b)', border: '1px solid #a88734', color: '#111', borderRadius: 4, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              Buy Again
            </Link>
          </div>
        </div>

        {/* Order Status Tracker */}
        {!isCancelled && (
          <div style={{ background: 'white', borderRadius: 10, padding: '24px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>📦 Order Status</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 20, left: '12.5%', right: '12.5%', height: 3, background: '#f0f0f0' }} />
              <div style={{ position: 'absolute', top: 20, left: '12.5%', width: `${Math.max(0, statusIdx / (statusSteps.length - 1)) * 75}%`, height: 3, background: '#FF9900', transition: 'width 0.5s' }} />
              {statusSteps.map((s, i) => {
                const icons = { confirmed: '✓', processing: '⚙️', shipped: '🚚', delivered: '🎁' };
                const done = i <= statusIdx;
                return (
                  <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 1, flex: 1 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: done ? '#FF9900' : '#f0f0f0', color: done ? 'white' : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, border: i === statusIdx ? '3px solid #e47911' : 'none', transition: 'all 0.3s' }}>
                      {done ? icons[s] : i + 1}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: i === statusIdx ? 700 : 400, color: i === statusIdx ? '#111' : '#888', textTransform: 'capitalize', textAlign: 'center' }}>{s}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isCancelled && (
          <div style={{ background: '#ffebee', border: '1px solid #fac', borderRadius: 10, padding: 20, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 32 }}>❌</span>
            <div>
              <div style={{ fontWeight: 700, color: '#c62828', fontSize: 16 }}>Order Cancelled</div>
              <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>This order has been cancelled. If you were charged, a refund will be processed within 5-7 business days.</div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'flex-start' }}>
          {/* Left */}
          <div>
            {/* Items */}
            <div style={{ background: 'white', borderRadius: 10, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Order Items ({items.length})</h2>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: i < items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <img src={item.image} alt={item.title}
                    style={{ width: 80, height: 80, objectFit: 'contain', border: '1px solid #eee', borderRadius: 6, flexShrink: 0 }}
                    onError={e => e.target.src = 'https://via.placeholder.com/80x80?text=Item'} />
                  <div style={{ flex: 1 }}>
                    <Link to={`/products/${item.product_id}`} style={{ fontSize: 14, color: '#007185', textDecoration: 'none', fontWeight: 500, display: 'block', marginBottom: 4 }}>
                      {item.title}
                    </Link>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Qty: {item.quantity}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#B12704' }}>₹{parseFloat(item.price).toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#B12704', flexShrink: 0 }}>
                    ₹{(parseFloat(item.price) * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Order Summary */}
            <div style={{ background: 'white', borderRadius: 10, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Order Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                <Row label="Order Date" value={new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
                <Row label="Order ID" value={order.id.slice(0, 8).toUpperCase()} />
                <Row label="Payment" value={order.payment_method?.replace('_', ' ')} style={{ textTransform: 'capitalize' }} />
                <Row label="Payment Status" value={order.payment_status} valueColor={order.payment_status === 'completed' ? '#007600' : '#f57c00'} />
                {order.tracking_number && <Row label="Tracking" value={order.tracking_number} />}
                <div style={{ borderTop: '1px solid #eee', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15 }}>
                  <span>Total</span>
                  <span style={{ color: '#B12704' }}>₹{parseFloat(order.total_amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {address && (
              <div style={{ background: 'white', borderRadius: 10, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>📍 Shipping Address</h3>
                <div style={{ fontSize: 14, lineHeight: 1.7, color: '#333' }}>
                  <div style={{ fontWeight: 600 }}>{address.name}</div>
                  {address.phone && <div>{address.phone}</div>}
                  <div>{address.line1}</div>
                  {address.line2 && <div>{address.line2}</div>}
                  <div>{address.city}{address.state ? ', ' + address.state : ''}</div>
                  {address.pincode && <div>PIN: {address.pincode}</div>}
                  <div>{address.country}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, valueColor = '#111' }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
    <span style={{ color: '#666', flexShrink: 0 }}>{label}</span>
    <span style={{ fontWeight: 500, color: valueColor, textAlign: 'right', textTransform: 'capitalize' }}>{value}</span>
  </div>
);

export default OrderDetailPage;
