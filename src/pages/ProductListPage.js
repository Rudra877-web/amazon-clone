import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../api';
import ProductCard from '../components/ProductCard';

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'created_at';
  const order = searchParams.get('order') || 'desc';
  const page = parseInt(searchParams.get('page') || '1');
  const featured = searchParams.get('featured') || '';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (search) params.set('search', search);
      if (sort) params.set('sort', sort);
      if (order) params.set('order', order);
      if (page > 1) params.set('page', page);
      if (featured) params.set('featured', featured);
      if (priceRange.min) params.set('min_price', priceRange.min);
      if (priceRange.max) params.set('max_price', priceRange.max);
      params.set('limit', '20');

      const { data } = await API.get(`/products?${params}`);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, search, sort, order, page, featured, priceRange]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    API.get('/products/categories').then(({ data }) => setCategories(data.categories));
  }, []);

  const updateParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const sortOptions = [
    { value: 'created_at-desc', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating-desc', label: 'Best Rated' },
    { value: 'review_count-desc', label: 'Most Reviews' },
  ];

  const currentSort = `${sort}-${order}`;
  const pageTitle = search ? `Results for "${search}"` : category ? categories.find(c => c.slug === category)?.name || category : featured ? "Today's Deals" : 'All Products';

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f2' }}>
      <div className="container" style={{ padding: '20px 16px' }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: 16, fontSize: 13, color: '#555' }}>
          <Link to="/" style={{ color: '#007185' }}>Home</Link>
          {' › '}
          <span>{pageTitle}</span>
        </div>

        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          {/* Sidebar Filters */}
          <aside style={{ width: 220, flexShrink: 0, display: 'block' }}>
            <div style={{ background: 'white', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: 80 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #eee' }}>Filters</h3>

              {/* Department */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5 }}>Department</h4>
                <div onClick={() => updateParam('category', '')}
                  style={{ padding: '5px 0', fontSize: 13, cursor: 'pointer', color: !category ? '#C45500' : '#007185', fontWeight: !category ? 700 : 400 }}>
                  All Departments
                </div>
                {categories.map(cat => (
                  <div key={cat.id} onClick={() => updateParam('category', cat.slug)}
                    style={{ padding: '5px 0', fontSize: 13, cursor: 'pointer', color: category === cat.slug ? '#C45500' : '#007185', fontWeight: category === cat.slug ? 700 : 400, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{cat.icon}</span> {cat.name}
                  </div>
                ))}
              </div>

              {/* Price Range */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5 }}>Price (₹)</h4>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input type="number" placeholder="Min" value={priceRange.min} onChange={e => setPriceRange(p => ({ ...p, min: e.target.value }))}
                    style={{ width: '50%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13 }} />
                  <input type="number" placeholder="Max" value={priceRange.max} onChange={e => setPriceRange(p => ({ ...p, max: e.target.value }))}
                    style={{ width: '50%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13 }} />
                </div>
                <button onClick={fetchProducts} style={{ width: '100%', padding: '6px', background: 'linear-gradient(to bottom, #f7dfa5, #f0c14b)', border: '1px solid #a88734', borderRadius: 4, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  Apply
                </button>
              </div>

              {/* Featured */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5 }}>Special</h4>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" checked={featured === 'true'} onChange={e => updateParam('featured', e.target.checked ? 'true' : '')} />
                  ⚡ Today's Deals Only
                </label>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main style={{ flex: 1, minWidth: 0 }}>
            {/* Top bar */}
            <div style={{ background: 'white', borderRadius: 8, padding: '14px 16px', marginBottom: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div>
                <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 2 }}>{pageTitle}</h1>
                {!loading && <span style={{ fontSize: 13, color: '#666' }}>{pagination.total?.toLocaleString() || 0} results</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, color: '#666' }}>Sort by:</span>
                <select value={currentSort} onChange={e => { const [s, o] = e.target.value.split('-'); updateParam('sort', s); updateParam('order', o); }}
                  style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, cursor: 'pointer' }}>
                  {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ paddingTop: '100%', background: '#f0f0f0', animation: 'pulse 1.5s infinite' }} />
                    <div style={{ padding: 12 }}>{[80,100,60].map((w,j) => <div key={j} style={{ height: 12, width: `${w}%`, background: '#f0f0f0', borderRadius: 6, marginBottom: 8 }} />)}</div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 8, padding: 60, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: 60, marginBottom: 16 }}>🔍</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No results found</h3>
                <p style={{ color: '#666', marginBottom: 20 }}>Try different keywords or browse our categories</p>
                <Link to="/products" style={{ background: '#FF9900', color: 'white', padding: '10px 24px', borderRadius: 6, fontWeight: 600, fontSize: 14 }}>Browse All Products</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 32, flexWrap: 'wrap' }}>
                {page > 1 && (
                  <PaginationBtn label="← Prev" onClick={() => updateParam('page', page - 1)} />
                )}
                {[...Array(Math.min(pagination.pages, 10))].map((_, i) => {
                  const p = i + 1;
                  return <PaginationBtn key={p} label={p} active={p === page} onClick={() => updateParam('page', p)} />;
                })}
                {page < pagination.pages && (
                  <PaginationBtn label="Next →" onClick={() => updateParam('page', page + 1)} />
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

const PaginationBtn = ({ label, active, onClick }) => (
  <button onClick={onClick}
    style={{
      padding: '8px 14px', borderRadius: 4, border: active ? '1px solid #FF9900' : '1px solid #ddd',
      background: active ? '#FF9900' : 'white', color: active ? 'white' : '#111',
      fontWeight: active ? 700 : 400, cursor: 'pointer', fontSize: 13, transition: 'all 0.15s'
    }}>
    {label}
  </button>
);

export default ProductListPage;
