import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import API from '../api';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { cart, clearCart, user } = useApp();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [step, setStep] = useState(1); // 1: address, 2: payment, 3: review
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handlePlaceOrder = async () => {
    if (!address.line1 || !address.city || !address.pincode || !address.phone) {
      toast.error('Please fill all required address fields');
      setStep(1);
      return;
    }
    setPlacing(true);
    try {
      const { data } = await API.post('/orders', {
        shipping_address: address,
        payment_method: paymentMethod
      });
      toast.success('🎉 Order placed successfully!');
      navigate(`/orders/${data.order.id}`, { state: { newOrder: true } });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (!cart.items?.length) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🛒</div>
        <h2>Your cart is empty</h2>
        <Link to="/products" style={{ color: '#007185' }}>Continue Shopping</Link>
      </div>
    );
  }

  const subtotal = parseFloat(cart.total || 0);
  const shipping = subtotal >= 499 ? 0 : 40;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 4,
    fontSize: 14, outline: 'none', transition: 'border-color 0.15s'
  };

  const steps = ['Delivery Address', 'Payment Method', 'Review & Place Order'];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f2' }}>
      <div className="container" style={{ padding: '20px 16px' }}>

        {/* Steps */}
        <div style={{ background: 'white', borderRadius: 10, padding: '20px 24px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {steps.map((s, i) => (
              <React.Fragment key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: i < step ? 'pointer' : 'default' }}
                  onClick={() => i < step && setStep(i + 1)}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: step > i + 1 ? '#007600' : step === i + 1 ? '#FF9900' : '#ddd', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: step === i + 1 ? 700 : 400, color: step === i + 1 ? '#111' : step > i + 1 ? '#007600' : '#888' }}>{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: step > i + 1 ? '#007600' : '#eee', margin: '0 12px' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'flex-start' }}>

          {/* Left: Steps content */}
          <div>
            {/* Step 1: Address */}
            {step === 1 && (
              <div style={{ background: 'white', borderRadius: 10, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>📍 Delivery Address</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Full Name *</label>
                    <input value={address.name} onChange={e => setAddress(a => ({ ...a, name: e.target.value }))}
                      placeholder="Enter full name" style={inputStyle} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Phone Number *</label>
                    <input value={address.phone} onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))}
                      placeholder="+91 XXXXX XXXXX" style={inputStyle} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>PIN Code *</label>
                    <input value={address.pincode} onChange={e => setAddress(a => ({ ...a, pincode: e.target.value }))}
                      placeholder="6-digit PIN code" style={inputStyle} required />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Address Line 1 *</label>
                    <input value={address.line1} onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))}
                      placeholder="House No., Building, Street, Area" style={inputStyle} required />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Address Line 2</label>
                    <input value={address.line2} onChange={e => setAddress(a => ({ ...a, line2: e.target.value }))}
                      placeholder="Landmark, Apartment, Suite (optional)" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>City *</label>
                    <input value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                      placeholder="City" style={inputStyle} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>State</label>
                    <select value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value }))}
                      style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="">Select State</option>
                      {['Andhra Pradesh','Gujarat','Karnataka','Kerala','Maharashtra','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal','Delhi'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button onClick={() => {
                  if (!address.name || !address.phone || !address.line1 || !address.city || !address.pincode) {
                    toast.error('Please fill all required fields'); return;
                  }
                  setStep(2);
                }} style={{ marginTop: 20, background: 'linear-gradient(to bottom, #f7dfa5, #f0c14b)', border: '1px solid #a88734', padding: '12px 32px', borderRadius: 6, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div style={{ background: 'white', borderRadius: 10, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>💳 Payment Method</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  {[
                    { id: 'card', icon: '💳', label: 'Credit/Debit Card', desc: 'Visa, MasterCard, RuPay' },
                    { id: 'upi', icon: '📱', label: 'UPI', desc: 'PhonePe, GPay, Paytm' },
                    { id: 'netbanking', icon: '🏦', label: 'Net Banking', desc: 'All major banks' },
                    { id: 'cod', icon: '💵', label: 'Cash on Delivery', desc: 'Pay when delivered' },
                  ].map(method => (
                    <label key={method.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, border: `2px solid ${paymentMethod === method.id ? '#FF9900' : '#eee'}`, borderRadius: 8, cursor: 'pointer', transition: 'border-color 0.15s', background: paymentMethod === method.id ? '#fffdf0' : 'white' }}>
                      <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} style={{ width: 18, height: 18, accentColor: '#FF9900' }} />
                      <span style={{ fontSize: 28 }}>{method.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{method.label}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>{method.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setStep(1)} style={{ padding: '10px 20px', border: '1px solid #ddd', background: 'white', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>
                    ← Back
                  </button>
                  <button onClick={() => setStep(3)} style={{ background: 'linear-gradient(to bottom, #f7dfa5, #f0c14b)', border: '1px solid #a88734', padding: '10px 28px', borderRadius: 6, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                    Review Order →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div style={{ background: 'white', borderRadius: 10, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>✅ Review Your Order</h2>

                {/* Address summary */}
                <div style={{ background: '#f7f7f7', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>📍 Deliver to:</div>
                  <div style={{ fontSize: 13, color: '#333', lineHeight: 1.7 }}>
                    {address.name} • {address.phone}<br />
                    {address.line1}{address.line2 ? ', ' + address.line2 : ''}<br />
                    {address.city}, {address.state} - {address.pincode}
                  </div>
                </div>

                {/* Items */}
                <div style={{ marginBottom: 16 }}>
                  {cart.items.map(item => {
                    const img = Array.isArray(item.images) ? item.images[0] : item.images?.[0];
                    return (
                      <div key={item.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                        <img src={img} alt={item.title} style={{ width: 64, height: 64, objectFit: 'contain', border: '1px solid #eee', borderRadius: 4 }} onError={e => e.target.src = 'https://via.placeholder.com/64'} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, lineHeight: 1.4, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</div>
                          <div style={{ fontSize: 12, color: '#666' }}>Qty: {item.quantity}</div>
                        </div>
                        <div style={{ fontWeight: 700, color: '#B12704', fontSize: 14 }}>
                          ₹{(parseFloat(item.price) * item.quantity).toLocaleString('en-IN')}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setStep(2)} style={{ padding: '10px 20px', border: '1px solid #ddd', background: 'white', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>
                    ← Back
                  </button>
                  <button onClick={handlePlaceOrder} disabled={placing}
                    style={{ flex: 1, background: 'linear-gradient(to bottom, #f0a070, #e47911)', border: '1px solid #c45500', color: 'white', padding: '14px', borderRadius: 6, fontSize: 16, fontWeight: 700, cursor: placing ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}>
                    {placing ? '⏳ Placing Order...' : '🎉 Place Order • ₹' + total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div style={{ background: 'white', borderRadius: 10, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', position: 'sticky', top: 80 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #eee' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <Row label={`Items (${cart.count})`} value={`₹${subtotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} />
              <Row label="Shipping" value={shipping === 0 ? 'FREE' : `₹${shipping}`} valueColor={shipping === 0 ? '#007600' : '#111'} />
              <Row label="Tax (18% GST)" value={`₹${tax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} />
              <div style={{ borderTop: '2px solid #eee', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700 }}>
                <span>Order Total:</span>
                <span style={{ color: '#B12704' }}>₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
            {shipping === 0 && <div style={{ fontSize: 12, color: '#007600', background: '#f0fff4', padding: '8px 12px', borderRadius: 4 }}>✓ Your order qualifies for FREE Delivery!</div>}

            <div style={{ marginTop: 16 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Items in Order</h4>
              {cart.items.slice(0, 3).map(item => {
                const img = Array.isArray(item.images) ? item.images[0] : item.images?.[0];
                return (
                  <div key={item.id} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <img src={img} alt="" style={{ width: 40, height: 40, objectFit: 'contain', border: '1px solid #eee', borderRadius: 3 }} onError={e => e.target.src = 'https://via.placeholder.com/40'} />
                    <div style={{ flex: 1, fontSize: 11, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: '#333' }}>{item.title}</div>
                  </div>
                );
              })}
              {cart.items.length > 3 && <div style={{ fontSize: 12, color: '#666' }}>+{cart.items.length - 3} more item(s)</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, valueColor = '#111' }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
    <span style={{ color: '#555' }}>{label}</span>
    <span style={{ fontWeight: 500, color: valueColor }}>{value}</span>
  </div>
);

export default CheckoutPage;
