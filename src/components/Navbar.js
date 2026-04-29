import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Navbar = () => {
  const { user, logout, cart } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const categories = ['All', 'Electronics', 'Books', 'Clothing', 'Home & Kitchen', 'Sports', 'Beauty', 'Toys'];

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      const params = new URLSearchParams({ search });
      if (category !== 'All') params.set('category', category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'));
      navigate(`/products?${params}`);
    }
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      {/* Main Nav */}
      <nav style={{ background: 'var(--amazon-blue)', color: 'white', padding: '8px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', padding: '4px 8px', border: '1px solid transparent', borderRadius: 3, flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'white'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-1px', color: 'white' }}>amazon</span>
              <span style={{ fontSize: 9, color: 'var(--amazon-orange)', letterSpacing: 1, marginTop: -4 }}>clone.in</span>
            </div>
          </Link>

          {/* Deliver to */}
          <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 8px', cursor: 'pointer', border: '1px solid transparent', borderRadius: 3, flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'white'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
            <span style={{ fontSize: 11, color: '#ccc' }}>Deliver to</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>📍 India</span>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', borderRadius: 4, overflow: 'hidden' }}>
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{ background: '#f3f3f3', color: '#555', border: 'none', padding: '0 8px', fontSize: 12, cursor: 'pointer', borderRight: '1px solid #ccc', minWidth: 60, maxWidth: 100 }}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search Amazon Clone"
              style={{ flex: 1, padding: '8px 12px', border: 'none', fontSize: 14, color: '#111', minWidth: 0 }}
            />
            <button type="submit" style={{ background: 'var(--amazon-orange)', padding: '0 16px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </form>

          {/* Language */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', cursor: 'pointer', border: '1px solid transparent', borderRadius: 3, flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'white'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
            <span>🇮🇳</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>EN</span>
          </div>

          {/* Account */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <div
              onClick={() => user ? setShowDropdown(!showDropdown) : navigate('/login')}
              style={{ padding: '4px 8px', cursor: 'pointer', border: '1px solid transparent', borderRadius: 3 }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'white'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
              <div style={{ fontSize: 11, color: '#ccc' }}>{user ? `Hello, ${user.name?.split(' ')[0]}` : 'Hello, sign in'}</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Account & Lists ▾</div>
            </div>
            {showDropdown && user && (
              <div style={{ position: 'absolute', right: 0, top: '100%', background: 'white', color: '#111', width: 220, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', borderRadius: 4, zIndex: 999, marginTop: 4 }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--amazon-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'white', margin: '0 auto 8px' }}>
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ fontWeight: 700 }}>{user.name}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{user.email}</div>
                </div>
                {[
                  { to: '/profile', icon: '👤', label: 'My Profile' },
                  { to: '/orders', icon: '📦', label: 'My Orders' },
                  { to: '/wishlist', icon: '❤️', label: 'My Wishlist' },
                  ...(user.role === 'admin' ? [{ to: '/admin', icon: '⚙️', label: 'Admin Panel' }] : []),
                ].map(item => (
                  <Link key={item.to} to={item.to} onClick={() => setShowDropdown(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', color: '#111', borderBottom: '1px solid #f0f0f0' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f7f7f7'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <span>{item.icon}</span><span style={{ fontSize: 14 }}>{item.label}</span>
                  </Link>
                ))}
                <button onClick={() => { logout(); setShowDropdown(false); navigate('/'); }}
                  style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#c00', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span>🚪</span> Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Returns */}
          <div style={{ padding: '4px 8px', cursor: 'pointer', border: '1px solid transparent', borderRadius: 3, flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'white'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
            onClick={() => navigate('/orders')}>
            <div style={{ fontSize: 11, color: '#ccc' }}>Returns</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>&amp; Orders</div>
          </div>

          {/* Cart */}
          <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', border: '1px solid transparent', borderRadius: 3, color: 'white', flexShrink: 0, position: 'relative' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'white'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
            <div style={{ position: 'relative' }}>
              <svg width="34" height="32" viewBox="0 0 34 32" fill="none">
                <path d="M4 4h3.5l2.5 14h14l2.5-10H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="14" cy="26" r="2" fill="white"/>
                <circle cx="24" cy="26" r="2" fill="white"/>
              </svg>
              {cart.count > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--amazon-orange)', color: 'white', borderRadius: '50%', width: 20, height: 20, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cart.count > 99 ? '99+' : cart.count}
                </span>
              )}
            </div>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Cart</span>
          </Link>
        </div>
      </nav>

      {/* Sub Nav */}
      <div style={{ background: 'var(--amazon-blue-light)', color: 'white', padding: '6px 0', overflowX: 'auto' }}>
        <div className="container" style={{ display: 'flex', gap: 4, alignItems: 'center', whiteSpace: 'nowrap' }}>
          <NavItem to="/products" label="☰ All" />
          <NavItem to="/products?featured=true" label="Today's Deals" />
          <NavItem to="/products?category=electronics" label="Electronics" />
          <NavItem to="/products?category=books" label="Books" />
          <NavItem to="/products?category=clothing" label="Fashion" />
          <NavItem to="/products?category=home-kitchen" label="Home & Kitchen" />
          <NavItem to="/products?category=sports" label="Sports" />
          <NavItem to="/products?category=beauty" label="Beauty" />
          <NavItem to="/products?category=toys" label="Toys" />
          <NavItem to="/products?sort=rating&order=desc" label="Best Sellers" />
          <NavItem to="/products?sort=created_at&order=desc" label="New Arrivals" />
        </div>
      </div>
    </header>
  );
};

const NavItem = ({ to, label }) => (
  <Link to={to} style={{ padding: '4px 10px', borderRadius: 3, fontSize: 13, color: 'white', border: '1px solid transparent', whiteSpace: 'nowrap' }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'white'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
    {label}
  </Link>
);

export default Navbar;
