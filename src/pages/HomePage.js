import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import ProductCard from '../components/ProductCard';

const banners = [
  { bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', title: 'Latest Electronics', subtitle: 'Up to 40% off on top brands', cta: 'Shop Electronics', link: '/products?category=electronics', accent: '#FF9900' },
  { bg: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)', title: "Today's Best Deals", subtitle: 'Limited time offers you cannot miss', cta: 'See All Deals', link: '/products?featured=true', accent: '#FEBD69' },
  { bg: 'linear-gradient(135deg, #8B1A1A 0%, #c0392b 100%)', title: 'Books for Every Mind', subtitle: 'Bestsellers from ₹199', cta: 'Explore Books', link: '/products?category=books', accent: '#FFD700' },
];

const categories = [
  { name: 'Electronics', slug: 'electronics', icon: '💻', color: '#e8f4fd' },
  { name: 'Books', slug: 'books', icon: '📚', color: '#fff8e7' },
  { name: 'Clothing', slug: 'clothing', icon: '👗', color: '#fce8f3' },
  { name: 'Home & Kitchen', slug: 'home-kitchen', icon: '🏠', color: '#e8fdf0' },
  { name: 'Sports', slug: 'sports', icon: '⚽', color: '#fff0e8' },
  { name: 'Beauty', slug: 'beauty', icon: '💄', color: '#fde8f4' },
  { name: 'Toys', slug: 'toys', icon: '🧸', color: '#fffbe8' },
  { name: 'Automotive', slug: 'automotive', icon: '🚗', color: '#e8eeff' },
];

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [newest, setNewest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [featuredRes, newestRes] = await Promise.all([
          API.get('/products?featured=true&limit=8'),
          API.get('/products?sort=created_at&order=desc&limit=8'),
        ]);
        setFeatured(featuredRes.data.products);
        setNewest(newestRes.data.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setBannerIdx(i => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, []);

  const banner = banners[bannerIdx];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f2' }}>
      {/* Hero Banner */}
      <div style={{ position: 'relative', background: banner.bg, minHeight: 380, display: 'flex', alignItems: 'center', overflow: 'hidden', transition: 'background 0.8s ease' }}>
        <div className="container" style={{ zIndex: 1 }}>
          <div style={{ maxWidth: 520, padding: '40px 0' }}>
            <div style={{ display: 'inline-block', background: banner.accent, color: '#111', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>
              ⚡ SPECIAL OFFER
            </div>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, color: 'white', lineHeight: 1.2, marginBottom: 12 }}>{banner.title}</h1>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', marginBottom: 28 }}>{banner.subtitle}</p>
            <Link to={banner.link}
              style={{ display: 'inline-block', background: banner.accent, color: '#111', padding: '14px 32px', borderRadius: 6, fontWeight: 700, fontSize: 16, textDecoration: 'none', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}>
              {banner.cta} →
            </Link>
          </div>
        </div>

        {/* Banner nav dots */}
        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
          {banners.map((_, i) => (
            <button key={i} onClick={() => setBannerIdx(i)}
              style={{ width: i === bannerIdx ? 24 : 8, height: 8, borderRadius: 4, background: i === bannerIdx ? banner.accent : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
          ))}
        </div>

        {/* Decorative circles */}
        <div style={{ position: 'absolute', right: -60, top: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', right: 80, bottom: -80, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      </div>

      <div className="container" style={{ padding: '24px 16px' }}>

        {/* Categories grid */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, color: '#111' }}>Shop by Category</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
            {categories.map(cat => (
              <Link key={cat.slug} to={`/products?category=${cat.slug}`}
                style={{ background: cat.color, borderRadius: 10, padding: '20px 12px', textAlign: 'center', textDecoration: 'none', color: '#111', transition: 'all 0.2s', border: '1px solid transparent' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{cat.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{cat.name}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Deals */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 2 }}>⚡ Today's Deals</h2>
              <p style={{ fontSize: 13, color: '#888' }}>Limited time offers — don't miss out</p>
            </div>
            <Link to="/products?featured=true" style={{ color: '#007185', fontSize: 14, fontWeight: 600 }}>See all deals →</Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>

        {/* Promo Banner */}
        <div style={{ background: 'linear-gradient(135deg, #FF9900 0%, #FF6600 100%)', borderRadius: 12, padding: '28px 32px', marginBottom: 40, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>FREE DELIVERY</div>
            <h3 style={{ fontSize: 24, fontWeight: 900, color: 'white', marginBottom: 6 }}>On orders over ₹499</h3>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>Get fast delivery across India on eligible orders</p>
          </div>
          <Link to="/products" style={{ background: 'white', color: '#FF6600', padding: '12px 28px', borderRadius: 6, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>Shop Now</Link>
        </div>

        {/* New Arrivals */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 2 }}>🆕 New Arrivals</h2>
              <p style={{ fontSize: 13, color: '#888' }}>Fresh additions to our catalogue</p>
            </div>
            <Link to="/products?sort=created_at&order=desc" style={{ color: '#007185', fontSize: 14, fontWeight: 600 }}>View all →</Link>
          </div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {newest.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>

        {/* Trust badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { icon: '🚚', title: 'Fast Delivery', desc: 'Same day & next day delivery available' },
            { icon: '🔒', title: 'Secure Payment', desc: '100% secure transactions' },
            { icon: '↩️', title: 'Easy Returns', desc: '30-day hassle-free returns' },
            { icon: '🎧', title: '24/7 Support', desc: 'Round the clock customer care' },
          ].map(badge => (
            <div key={badge.title} style={{ background: 'white', borderRadius: 10, padding: '20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <span style={{ fontSize: 32 }}>{badge.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{badge.title}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{badge.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div style={{ background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
    <div style={{ paddingTop: '100%', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
    <div style={{ padding: 12 }}>
      {[80, 100, 60, 40].map((w, i) => (
        <div key={i} style={{ height: 12, width: `${w}%`, background: '#f0f0f0', borderRadius: 6, marginBottom: 8 }} />
      ))}
    </div>
    <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
  </div>
);

export default HomePage;
