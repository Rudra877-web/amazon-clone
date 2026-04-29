import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { cart, cartLoading, updateCartItem, removeFromCart, clearCart } = useApp();
  const navigate = useNavigate();

  const handleUpdate = async (itemId, newQty) => {
    if (newQty < 1) return;
    try { await updateCartItem(itemId, newQty); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to update'); }
  };

  const handleRemove = async (itemId, name) => {
    try { await removeFromCart(itemId); toast.success(`Removed "${name.slice(0, 30)}..." from cart`); }
    catch (err) { toast.error('Failed to remove item'); }
  };

  if (cartLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #f0f0f0', borderTopColor: '#FF9900', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f2' }}>
      <div className="container" style={{ padding: '20px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'flex-start' }}>

          {/* Cart Items */}
          <div>
            <div style={{ background: 'white', borderRadius: 10, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #eee' }}>
                <h1 style={{ fontSize: 24, fontWeight: 400 }}>
                  Shopping Cart
                  {cart.count > 0 && <span style={{ fontSize: 16, color: '#888', marginLeft: 8, fontWeight: 400 }}>({cart.count} item{cart.count !== 1 ? 's' : ''})</span>}
                </h1>
                {cart.items?.length > 0 && (
                  <span style={{ fontSize: 13, color: '#888' }}>Price</span>
                )}
              </div>

              {!cart.items?.length ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: 80, marginBottom: 20 }}>🛒</div>
                  <h2 style={{ fontSize: 24, fontWeight: 400, marginBottom: 12 }}>Your Amazon Cart is empty</h2>
                  <p style={{ color: '#666', marginBottom: 24 }}>Shop today's deals or explore our categories</p>
                  <Link to="/products" style={{ background: '#FF9900', color: 'white', padding: '12px 28px', borderRadius: 6, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <>
                  {cart.items.map((item) => {
                    const image = Array.isArray(item.images) ? item.images[0] : item.images?.[0] || 'https://via.placeholder.com/100x100';
                    return (
                      <div key={item.id} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                        <Link to={`/products/${item.product_id}`}>
                          <img src={image} alt={item.title}
                            style={{ width: 100, height: 100, objectFit: 'contain', border: '1px solid #eee', borderRadius: 6 }}
                            onError={e => e.target.src = 'https://via.placeholder.com/100x100'} />
                        </Link>

                        <div style={{ flex: 1 }}>
                          <Link to={`/products/${item.product_id}`} style={{ fontSize: 16, color: '#007185', fontWeight: 500, textDecoration: 'none', display: 'block', marginBottom: 4 }}>
                            {item.title}
                          </Link>
                          <div style={{ color: '#007600', fontSize: 13, marginBottom: 8 }}>
                            {item.stock > 10 ? 'In Stock' : `Only ${item.stock} left`}
                          </div>
                          {item.discount_percent > 0 && (
                            <div style={{ fontSize: 12, color: '#CC0C39', marginBottom: 8 }}>
                              -{item.discount_percent}% off
                            </div>
                          )}

                          {/* Controls */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid #ddd', borderRadius: 4, overflow: 'hidden' }}>
                              <button onClick={() => item.quantity <= 1 ? handleRemove(item.id, item.title) : handleUpdate(item.id, item.quantity - 1)}
                                style={{ width: 32, height: 32, background: '#f7f7f7', border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 700, color: '#333' }}>
                                {item.quantity <= 1 ? '🗑' : '−'}
                              </button>
                              <span style={{ width: 40, textAlign: 'center', fontSize: 14, fontWeight: 600, borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', lineHeight: '32px' }}>
                                {item.quantity}
                              </span>
                              <button onClick={() => handleUpdate(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock}
                                style={{ width: 32, height: 32, background: '#f7f7f7', border: 'none', cursor: item.quantity >= item.stock ? 'not-allowed' : 'pointer', fontSize: 16, fontWeight: 700, color: '#333' }}>
                                +
                              </button>
                            </div>
                            <span style={{ color: '#ddd' }}>|</span>
                            <button onClick={() => handleRemove(item.id, item.title)}
                              style={{ background: 'none', border: 'none', color: '#007185', fontSize: 13, cursor: 'pointer', padding: 0 }}>
                              Delete
                            </button>
                            <span style={{ color: '#ddd' }}>|</span>
                            <button style={{ background: 'none', border: 'none', color: '#007185', fontSize: 13, cursor: 'pointer', padding: 0 }}>
                              Save for later
                            </button>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: '#B12704' }}>
                            ₹{(parseFloat(item.price) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                          </div>
                          <div style={{ fontSize: 12, color: '#888' }}>₹{parseFloat(item.price).toLocaleString('en-IN')} each</div>
                        </div>
                      </div>
                    );
                  })}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16 }}>
                    <button onClick={clearCart} style={{ background: 'none', border: '1px solid #ddd', padding: '6px 14px', borderRadius: 4, fontSize: 13, cursor: 'pointer', color: '#CC0C39' }}>
                      🗑 Clear Cart
                    </button>
                    <div style={{ fontSize: 18 }}>
                      Subtotal ({cart.count} item{cart.count !== 1 ? 's' : ''}):
                      <strong style={{ marginLeft: 8, fontSize: 22, color: '#B12704' }}>
                        ₹{parseFloat(cart.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                      </strong>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Order Summary */}
          {cart.items?.length > 0 && (
            <div style={{ background: 'white', borderRadius: 10, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', position: 'sticky', top: 80 }}>
              <div style={{ fontSize: 14, color: '#007600', marginBottom: 12 }}>
                ✓ Your order qualifies for FREE Delivery
              </div>
              <div style={{ fontSize: 18, marginBottom: 16 }}>
                Subtotal ({cart.count} item{cart.count !== 1 ? 's' : ''}):
                <strong style={{ display: 'block', fontSize: 22, color: '#B12704', marginTop: 4 }}>
                  ₹{parseFloat(cart.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </strong>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 16, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked />
                <span>This order contains a gift</span>
              </label>
              <button onClick={() => navigate('/checkout')}
                style={{ width: '100%', padding: '12px', background: 'linear-gradient(to bottom, #f7dfa5, #f0c14b)', border: '1px solid #a88734', borderRadius: 20, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 10, transition: 'all 0.15s' }}>
                Proceed to Checkout
              </button>
              <Link to="/products" style={{ display: 'block', textAlign: 'center', color: '#007185', fontSize: 14 }}>
                Continue Shopping
              </Link>

              <div style={{ marginTop: 16, padding: 12, background: '#f7f7f7', borderRadius: 6, fontSize: 12, color: '#555', lineHeight: 1.6 }}>
                <div>🔒 Secure checkout</div>
                <div>↩️ Easy 30-day returns</div>
                <div>🚚 Free delivery on ₹499+</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
