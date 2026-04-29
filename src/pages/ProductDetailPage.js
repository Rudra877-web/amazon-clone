import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { useApp } from '../context/AppContext';
import { Stars } from '../components/ProductCard';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, addToCart } = useApp();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data.product);
        setReviews(data.reviews);
        if (data.product.category_id) {
          const related = await API.get(`/products?limit=6`);
          setRelatedProducts(related.data.products.filter(p => p.id !== id).slice(0, 4));
        }
      } catch (err) {
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login to add to cart'); navigate('/login'); return; }
    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      toast.success(`${quantity} item(s) added to cart!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) { navigate('/login'); return; }
    await handleAddToCart();
    navigate('/cart');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to write a review'); return; }
    setSubmittingReview(true);
    try {
      await API.post(`/products/${id}/review`, reviewForm);
      toast.success('Review submitted!');
      const { data } = await API.get(`/products/${id}`);
      setProduct(data.product);
      setReviews(data.reviews);
      setReviewForm({ rating: 5, title: '', body: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 48, height: 48, border: '4px solid #f0f0f0', borderTopColor: '#FF9900', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!product) return null;

  const images = Array.isArray(product.images) ? product.images : [];
  const mainImage = images[selectedImage] || 'https://via.placeholder.com/500x500?text=No+Image';
  const savings = product.original_price ? parseFloat(product.original_price) - parseFloat(product.price) : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f2' }}>
      <div className="container" style={{ padding: '20px 16px' }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: 16, fontSize: 13, color: '#555' }}>
          <Link to="/" style={{ color: '#007185' }}>Home</Link> {' › '}
          <Link to="/products" style={{ color: '#007185' }}>Products</Link> {' › '}
          {product.category_name && <><Link to={`/products?category=${product.category_slug}`} style={{ color: '#007185' }}>{product.category_name}</Link> {' › '}</>}
          <span style={{ color: '#555' }}>{product.title.slice(0, 50)}...</span>
        </div>

        {/* Main product section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'start', flexWrap: 'wrap', background: 'white', borderRadius: 10, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', marginBottom: 24 }}>

          {/* Image Gallery */}
          <div style={{ display: 'flex', gap: 12 }}>
            {/* Thumbnails */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {images.map((img, i) => (
                <div key={i} onClick={() => setSelectedImage(i)}
                  style={{ width: 60, height: 60, border: i === selectedImage ? '2px solid #FF9900' : '1px solid #ddd', borderRadius: 4, overflow: 'hidden', cursor: 'pointer', flexShrink: 0 }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => e.target.src = 'https://via.placeholder.com/60x60'} />
                </div>
              ))}
            </div>
            {/* Main image */}
            <div style={{ width: 380, height: 380, border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
              <img src={mainImage} alt={product.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'opacity 0.2s' }}
                onError={e => e.target.src = 'https://via.placeholder.com/400x400?text=Product'} />
            </div>
          </div>

          {/* Product Info */}
          <div style={{ minWidth: 280 }}>
            <div style={{ fontSize: 13, color: '#007185', marginBottom: 6 }}>
              {product.category_name && <Link to={`/products?category=${product.category_slug}`} style={{ color: '#007185' }}>{product.category_name}</Link>}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.4, marginBottom: 12, color: '#0F1111' }}>{product.title}</h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #eee' }}>
              <Stars rating={parseFloat(product.rating) || 0} />
              <span style={{ color: '#FF9900', fontWeight: 700 }}>{parseFloat(product.rating || 0).toFixed(1)}</span>
              <span style={{ color: '#007185', fontSize: 13 }}>{parseInt(product.review_count).toLocaleString()} ratings</span>
            </div>

            {/* Price */}
            <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: '#555' }}>Price:</span>
                <span style={{ fontSize: 28, fontWeight: 400, color: '#B12704' }}>
                  ₹{parseFloat(product.price).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </span>
                {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                  <>
                    <span style={{ fontSize: 14, color: '#888', textDecoration: 'line-through' }}>
                      M.R.P: ₹{parseFloat(product.original_price).toLocaleString('en-IN')}
                    </span>
                    <span style={{ background: '#CC0C39', color: 'white', padding: '2px 8px', borderRadius: 3, fontSize: 13, fontWeight: 700 }}>
                      -{product.discount_percent}%
                    </span>
                  </>
                )}
              </div>
              {savings > 0 && (
                <div style={{ fontSize: 13, color: '#007600', marginTop: 4 }}>
                  You Save: ₹{savings.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({product.discount_percent}%)
                </div>
              )}
              <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>Inclusive of all taxes</div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>About this item</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#333' }}>{product.description}</p>
            </div>

            {/* Stock */}
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontWeight: 700, color: product.stock > 0 ? '#007600' : '#CC0C39', fontSize: 14 }}>
                {product.stock > 10 ? '✓ In Stock' : product.stock > 0 ? `⚠️ Only ${product.stock} left in stock` : '✗ Out of Stock'}
              </span>
            </div>

            {/* Seller */}
            {product.seller_name && (
              <div style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>
                Sold by: <span style={{ color: '#007185' }}>{product.seller_name}</span>
              </div>
            )}

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {product.tags.map(tag => (
                  <span key={tag} style={{ background: '#f0f0f0', padding: '3px 10px', borderRadius: 20, fontSize: 12, color: '#555' }}>#{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Buy Box */}
          <div style={{ width: 220, background: 'white', border: '1px solid #ddd', borderRadius: 8, padding: 20, flexShrink: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 400, color: '#B12704', marginBottom: 8 }}>
              ₹{parseFloat(product.price).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </div>
            <div style={{ fontSize: 12, color: '#007600', marginBottom: 12 }}>
              🚚 FREE Delivery on orders over ₹499
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: product.stock > 0 ? '#007600' : '#CC0C39', marginBottom: 16 }}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </div>

            {product.stock > 0 && (
              <>
                {/* Quantity */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Qty:</label>
                  <select value={quantity} onChange={e => setQuantity(parseInt(e.target.value))}
                    style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, cursor: 'pointer', width: '100%' }}>
                    {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1}</option>
                    ))}
                  </select>
                </div>

                <button onClick={handleAddToCart} disabled={addingToCart}
                  style={{ width: '100%', padding: '10px', background: 'linear-gradient(to bottom, #f7dfa5, #f0c14b)', border: '1px solid #a88734', borderRadius: 20, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 8, transition: 'all 0.15s' }}>
                  {addingToCart ? '...' : '🛒 Add to Cart'}
                </button>
                <button onClick={handleBuyNow}
                  style={{ width: '100%', padding: '10px', background: 'linear-gradient(to bottom, #f0a070, #e47911)', border: '1px solid #c45500', borderRadius: 20, fontSize: 14, fontWeight: 600, color: 'white', cursor: 'pointer', marginBottom: 12, transition: 'all 0.15s' }}>
                  Buy Now
                </button>
              </>
            )}

            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
              <div>🔒 Secure transaction</div>
              <div>↩️ Return policy: 30 days</div>
              <div style={{ marginTop: 8, fontWeight: 600 }}>Ships from Amazon Clone</div>
              <div>Sold by {product.seller_name || 'Amazon Clone Store'}</div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ background: 'white', borderRadius: 10, padding: 24, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Customer Reviews</h2>

          {/* Rating Summary */}
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #eee', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 56, fontWeight: 300, color: '#111', lineHeight: 1 }}>{parseFloat(product.rating || 0).toFixed(1)}</div>
              <Stars rating={parseFloat(product.rating) || 0} />
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{parseInt(product.review_count).toLocaleString()} ratings</div>
            </div>

            {/* Write Review */}
            {user && (
              <div style={{ flex: 1, minWidth: 280 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Write a Review</h3>
                <form onSubmit={handleSubmitReview}>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Rating</label>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1,2,3,4,5].map(star => (
                        <span key={star} onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                          style={{ fontSize: 28, cursor: 'pointer', color: star <= reviewForm.rating ? '#FF9900' : '#ddd', transition: 'color 0.1s' }}>★</span>
                      ))}
                    </div>
                  </div>
                  <input type="text" placeholder="Review title" value={reviewForm.title} onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))} required
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, marginBottom: 8 }} />
                  <textarea placeholder="Share your experience with this product..." value={reviewForm.body} onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))} required rows={3}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, marginBottom: 10, resize: 'vertical' }} />
                  <button type="submit" disabled={submittingReview}
                    style={{ background: 'linear-gradient(to bottom, #f7dfa5, #f0c14b)', border: '1px solid #a88734', padding: '8px 20px', borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Review List */}
          {reviews.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: 20 }}>No reviews yet. Be the first to review!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {reviews.map(review => (
                <div key={review.id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FF9900', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>
                      {review.user_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{review.user_name}</div>
                      <div style={{ display: 'flex', gap: 1 }}>
                        {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= review.rating ? '#FF9900' : '#ddd', fontSize: 13 }}>★</span>)}
                      </div>
                    </div>
                    {review.verified_purchase && (
                      <span style={{ marginLeft: 'auto', fontSize: 11, color: '#C45500', fontWeight: 600 }}>✓ Verified Purchase</span>
                    )}
                  </div>
                  {review.title && <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{review.title}</div>}
                  <p style={{ fontSize: 14, color: '#333', lineHeight: 1.6 }}>{review.body}</p>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 6 }}>{new Date(review.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div style={{ background: 'white', borderRadius: 10, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Customers also viewed</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {relatedProducts.map(p => {
                const img = Array.isArray(p.images) ? p.images[0] : p.images?.[0];
                return (
                  <Link key={p.id} to={`/products/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden', transition: 'box-shadow 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                      <img src={img} alt={p.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} onError={e => e.target.src = 'https://via.placeholder.com/200x160'} />
                      <div style={{ padding: 10 }}>
                        <div style={{ fontSize: 12, lineHeight: 1.4, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title}</div>
                        <div style={{ fontWeight: 700, color: '#B12704', fontSize: 14 }}>₹{parseFloat(p.price).toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
