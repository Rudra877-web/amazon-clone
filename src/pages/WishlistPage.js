import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import { Stars } from '../components/ProductCard';

const WishlistPage = () => {
  const { addToCart } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const { data } = await API.get('/wishlist');
      setItems(data.items);
    } catch (err) {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWishlist(); }, []);

  const handleRemove = async (productId, title) => {
    try {
      await API.delete(`/wishlist/${productId}`);
      setItems(prev => prev.filter(i => i.product_id !== productId));
      toast.success(`Removed "${title.slice(0, 30)}..." from wishlist`);
    } catch {
      toast.error('Failed to remove');
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to cart');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div style={{ width: 40, height: 40, border: '3px solid #f0f0f0', borderTopColor: '#FF9900', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f2' }}>
      <div className="container" style={{ padding: '24px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>
            ❤️ My Wishlist
            <span style={{ fontSize: 16, fontWeight: 400, color: '#888', marginLeft: 10 }}>({items.length} item{items.length !== 1 ? 's' : ''})</span>
          </h1>
          <Link to="/products" style={{ color: '#007185', fontSize: 14 }}>Continue Shopping →</Link>
        </div>

        {items.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 10, padding: 80, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 72, marginBottom: 20 }}>💔</div>
            <h2 style={{ fontSize: 22, fontWeight: 400, marginBottom: 12 }}>Your Wishlist is empty</h2>
            <p style={{ color: '#666', marginBottom: 24 }}>Save items you love and revisit them anytime</p>
            <Link to="/products" style={{ background: '#FF9900', color: 'white', padding: '12px 28px', borderRadius: 6, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
              Discover Products
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {items.map(item => {
              const image = Array.isArray(item.images) ? item.images[0] : item.images?.[0] || '';
              return (
                <div key={item.id} style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.14)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)'}>

                  {/* Remove button */}
                  <div style={{ position: 'relative' }}>
                    <button onClick={() => handleRemove(item.product_id, item.title)}
                      style={{ position: 'absolute', top: 10, right: 10, zIndex: 2, background: 'white', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', fontSize: 16 }}>
                      ✕
                    </button>
                    <Link to={`/products/${item.product_id}`}>
                      <img src={image} alt={item.title}
                        style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }}
                        onError={e => e.target.src = 'https://via.placeholder.com/260x220?text=Product'} />
                    </Link>
                    {item.discount_percent > 0 && (
                      <div style={{ position: 'absolute', top: 10, left: 10, background: '#CC0C39', color: 'white', padding: '3px 8px', borderRadius: 3, fontSize: 12, fontWeight: 700 }}>
                        -{item.discount_percent}%
                      </div>
                    )}
                  </div>

                  <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 12, color: '#007185', marginBottom: 4 }}>{item.category_name}</div>
                    <Link to={`/products/${item.product_id}`} style={{ fontSize: 14, lineHeight: 1.4, color: '#111', textDecoration: 'none', marginBottom: 8, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.title}
                    </Link>
                    <Stars rating={parseFloat(item.rating) || 0} count={item.review_count} />
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: '#B12704' }}>
                        ₹{parseFloat(item.price).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                      </span>
                      {item.original_price && parseFloat(item.original_price) > parseFloat(item.price) && (
                        <span style={{ fontSize: 13, color: '#888', textDecoration: 'line-through', marginLeft: 8 }}>
                          ₹{parseFloat(item.original_price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: item.stock > 0 ? '#007600' : '#CC0C39', marginBottom: 12 }}>
                      {item.stock > 0 ? `✓ In Stock (${item.stock} left)` : '✗ Out of Stock'}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleAddToCart(item.product_id)} disabled={item.stock === 0}
                        style={{ flex: 1, padding: '9px', background: item.stock === 0 ? '#f0f0f0' : 'linear-gradient(to bottom, #f7dfa5, #f0c14b)', border: '1px solid #a88734', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: item.stock === 0 ? 'not-allowed' : 'pointer', color: item.stock === 0 ? '#888' : '#111' }}>
                        🛒 Add to Cart
                      </button>
                      <button onClick={() => handleRemove(item.product_id, item.title)}
                        style={{ padding: '9px 12px', background: 'white', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, cursor: 'pointer', color: '#CC0C39' }}>
                        🗑
                      </button>
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

export default WishlistPage;
