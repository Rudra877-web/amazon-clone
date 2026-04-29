import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const Stars = ({ rating, count }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
      <div style={{ display: 'flex' }}>
        {[1,2,3,4,5].map(i => (
          <span key={i} style={{ color: i <= full ? '#FF9900' : (i === full+1 && half ? '#FF9900' : '#ddd'), fontSize: 14 }}>
            {i <= full ? '★' : (i === full+1 && half ? '⯨' : '★')}
          </span>
        ))}
      </div>
      {count !== undefined && <span style={{ color: '#007185', fontSize: 12 }}>{count.toLocaleString()}</span>}
    </div>
  );
};

const ProductCard = ({ product }) => {
  const { user, addToCart, addToWishlist, removeFromWishlist, checkWishlist } = useApp();
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const image = Array.isArray(product.images) ? product.images[0] : product.images?.[0] || 'https://via.placeholder.com/300x300?text=No+Image';

  useEffect(() => {
    if (user) {
      checkWishlist(product.id).then(setInWishlist).catch(() => {});
    }
  }, [user, product.id]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please login to add to cart'); return; }
    try {
      await addToCart(product.id);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to cart');
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please login to save items'); return; }
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id);
        setInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(product.id);
        setInWishlist(true);
        toast.success('Added to wishlist ❤️');
      }
    } catch {
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        background: 'white', borderRadius: 8, overflow: 'hidden',
        transition: 'box-shadow 0.2s, transform 0.2s',
        cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column',
      }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>

        {/* Image */}
        <div style={{ position: 'relative', paddingTop: '100%', background: '#f7f7f7', overflow: 'hidden' }}>
          <img src={image} alt={product.title}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
            onError={e => e.target.src = 'https://via.placeholder.com/300x300?text=Product'}
          />
          {product.discount_percent > 0 && (
            <div style={{ position: 'absolute', top: 10, left: 10, background: '#CC0C39', color: 'white', padding: '3px 8px', borderRadius: 3, fontSize: 12, fontWeight: 700 }}>
              -{product.discount_percent}%
            </div>
          )}
          {product.is_featured && (
            <div style={{ position: 'absolute', top: 10, right: 10, background: '#FF9900', color: 'white', padding: '3px 8px', borderRadius: 3, fontSize: 11, fontWeight: 700 }}>
              ⚡ DEAL
            </div>
          )}
          {/* Wishlist button */}
          <button onClick={handleWishlist} disabled={wishlistLoading}
            style={{ position: 'absolute', bottom: 8, right: 8, background: 'white', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', fontSize: 16, transition: 'transform 0.15s', zIndex: 1 }}
            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            {inWishlist ? '❤️' : '🤍'}
          </button>
          {product.stock === 0 && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#666' }}>
              Out of Stock
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 13, color: '#007185', marginBottom: 4 }}>{product.category_name}</div>
          <h3 style={{ fontSize: 14, lineHeight: 1.4, marginBottom: 6, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.title}
          </h3>
          <Stars rating={parseFloat(product.rating) || 0} count={product.review_count} />

          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#B12704' }}>
              ₹{parseFloat(product.price).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </span>
            {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
              <span style={{ fontSize: 12, color: '#888', textDecoration: 'line-through', marginLeft: 8 }}>
                ₹{parseFloat(product.original_price).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div style={{ fontSize: 12, color: '#007600', marginBottom: 10 }}>
            {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left!` : 'Out of Stock'}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            style={{
              background: product.stock === 0 ? '#ddd' : 'linear-gradient(to bottom, #f7dfa5, #f0c14b)',
              border: '1px solid #a88734', color: product.stock === 0 ? '#888' : '#111',
              padding: '8px 0', borderRadius: 20, fontSize: 13, fontWeight: 600,
              cursor: product.stock === 0 ? 'not-allowed' : 'pointer', width: '100%',
              transition: 'all 0.15s'
            }}>
            {product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export { Stars };
export default ProductCard;
