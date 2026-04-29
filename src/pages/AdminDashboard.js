import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

// ─── Tiny sparkline bar chart ────────────────────────────────────────────────
const MiniBarChart = ({ data, color = '#FF9900' }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 48 }}>
      {data.map((d, i) => (
        <div key={i} title={`${d.label}: ${d.value}`}
          style={{ flex: 1, background: color, opacity: 0.7 + (i / data.length) * 0.3, borderRadius: '2px 2px 0 0', height: `${max > 0 ? (d.value / max) * 100 : 0}%`, minHeight: 2, transition: 'height 0.3s' }} />
      ))}
    </div>
  );
};

// ─── Status badge ─────────────────────────────────────────────────────────────
const statusColors = {
  pending: { bg: '#fff8e1', color: '#f57c00' },
  confirmed: { bg: '#e3f2fd', color: '#1565c0' },
  processing: { bg: '#f3e5f5', color: '#7b1fa2' },
  shipped: { bg: '#e8f5e9', color: '#2e7d32' },
  delivered: { bg: '#e8f5e9', color: '#1b5e20' },
  cancelled: { bg: '#ffebee', color: '#c62828' },
  refunded: { bg: '#fce4ec', color: '#880e4f' },
};

const StatusBadge = ({ status }) => {
  const s = statusColors[status] || { bg: '#f5f5f5', color: '#666' };
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
};

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color, chartData }) => (
  <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #eee' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
        {icon}
      </div>
      <span style={{ fontSize: 11, color: '#888', background: '#f5f5f5', padding: '2px 8px', borderRadius: 10 }}>30d</span>
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, color: '#111', marginBottom: 2 }}>{value}</div>
    <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>{label}</div>
    {chartData && <MiniBarChart data={chartData} color={color} />}
    {sub && <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>{sub}</div>}
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newProduct, setNewProduct] = useState({ title: '', description: '', price: '', original_price: '', stock: '', category_id: '', images: [''], is_featured: false });

  // Guard: only admins
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/');
    }
  }, [user, navigate]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await API.get('/admin/stats');
      setStats(data);
    } catch {}
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: 15 });
      if (orderFilter) params.set('status', orderFilter);
      const { data } = await API.get(`/admin/orders?${params}`);
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch {} finally { setLoading(false); }
  }, [currentPage, orderFilter]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: 15 });
      if (searchQuery) params.set('search', searchQuery);
      const { data } = await API.get(`/admin/users?${params}`);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch {} finally { setLoading(false); }
  }, [currentPage, searchQuery]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: 15 });
      if (searchQuery) params.set('search', searchQuery);
      const { data } = await API.get(`/admin/products?${params}`);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch {} finally { setLoading(false); }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchStats();
    API.get('/products/categories').then(({ data }) => setCategories(data.categories));
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'products') fetchProducts();
  }, [activeTab, fetchOrders, fetchUsers, fetchProducts]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);
    try {
      await API.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
      fetchStats();
    } catch { toast.error('Failed to update status'); }
    finally { setUpdatingOrder(null); }
  };

  const handleDeleteProduct = async (productId, title) => {
    if (!window.confirm(`Deactivate "${title.slice(0, 40)}"?`)) return;
    try {
      await API.delete(`/admin/products/${productId}`);
      toast.success('Product deactivated');
      fetchProducts();
    } catch { toast.error('Failed to deactivate'); }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await API.post('/products', {
        ...newProduct,
        price: parseFloat(newProduct.price),
        original_price: newProduct.original_price ? parseFloat(newProduct.original_price) : null,
        stock: parseInt(newProduct.stock),
        category_id: parseInt(newProduct.category_id),
        images: newProduct.images.filter(Boolean),
      });
      toast.success('Product created!');
      setShowAddProduct(false);
      setNewProduct({ title: '', description: '', price: '', original_price: '', stock: '', category_id: '', images: [''], is_featured: false });
      fetchProducts();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to create'); }
  };

  const revenueChartData = stats?.revenueByDay?.slice(-14).map(d => ({
    label: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    value: parseFloat(d.revenue),
  })) || [];

  const ordersChartData = stats?.revenueByDay?.slice(-14).map(d => ({
    label: d.date,
    value: parseInt(d.orders),
  })) || [];

  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'orders', icon: '📦', label: 'Orders' },
    { id: 'products', icon: '🛍️', label: 'Products' },
    { id: 'users', icon: '👥', label: 'Users' },
  ];

  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #ddd',
    borderRadius: 6, fontSize: 14, boxSizing: 'border-box', outline: 'none',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6f8' }}>
      {/* Sidebar */}
      <aside style={{ width: 230, background: '#131921', color: 'white', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-1px', color: 'white' }}>amazon</div>
          <div style={{ fontSize: 10, color: '#FF9900', letterSpacing: 2, marginTop: -2 }}>ADMIN PANEL</div>
        </div>

        <div style={{ padding: '12px 0', flex: 1 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setCurrentPage(1); setSearchQuery(''); }}
              style={{ width: '100%', padding: '12px 20px', background: activeTab === item.id ? 'rgba(255,153,0,0.15)' : 'none', border: 'none', color: activeTab === item.id ? '#FF9900' : '#ccc', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, borderLeft: activeTab === item.id ? '3px solid #FF9900' : '3px solid transparent', transition: 'all 0.15s' }}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FF9900', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: '#aaa' }}>Administrator</div>
            </div>
          </div>
          <Link to="/" style={{ display: 'block', marginTop: 14, fontSize: 12, color: '#aaa', textDecoration: 'none' }}>← Back to Store</Link>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '28px', overflow: 'auto' }}>

        {/* ── DASHBOARD ── */}
        {activeTab === 'dashboard' && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Dashboard</h1>
            <p style={{ color: '#888', marginBottom: 24 }}>Welcome back, {user?.name}. Here's what's happening.</p>

            {!stats ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                <div style={{ width: 40, height: 40, border: '3px solid #f0f0f0', borderTopColor: '#FF9900', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            ) : (
              <>
                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
                  <StatCard icon="💰" label="Total Revenue" value={`₹${stats.stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} color="#FF9900" chartData={revenueChartData} sub={`${revenueChartData.length} days of data`} />
                  <StatCard icon="📦" label="Total Orders" value={stats.stats.totalOrders.toLocaleString()} color="#4CAF50" chartData={ordersChartData} />
                  <StatCard icon="👥" label="Customers" value={stats.stats.totalUsers.toLocaleString()} color="#2196F3" />
                  <StatCard icon="🛍️" label="Active Products" value={stats.stats.totalProducts.toLocaleString()} color="#9C27B0" />
                </div>

                {/* Orders by Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                  <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Orders by Status</h3>
                    {stats.ordersByStatus.map(s => {
                      const style = statusColors[s.status] || { bg: '#f5f5f5', color: '#666' };
                      const pct = Math.round((parseInt(s.count) / stats.stats.totalOrders) * 100);
                      return (
                        <div key={s.status} style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                            <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{s.status}</span>
                            <span style={{ color: '#666' }}>{s.count} ({pct}%)</span>
                          </div>
                          <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: style.color, borderRadius: 3, transition: 'width 0.5s' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Top Products */}
                  <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Top Selling Products</h3>
                    {stats.topProducts.slice(0, 5).map((p, i) => {
                      const img = Array.isArray(p.images) ? p.images[0] : p.images?.[0];
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <span style={{ fontSize: 12, color: '#888', width: 18, flexShrink: 0 }}>#{i + 1}</span>
                          <img src={img} alt="" style={{ width: 36, height: 36, objectFit: 'contain', border: '1px solid #eee', borderRadius: 4 }} onError={e => e.target.src = 'https://via.placeholder.com/36'} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                            <div style={{ fontSize: 11, color: '#888' }}>{p.units_sold} sold</div>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#B12704', flexShrink: 0 }}>₹{parseFloat(p.revenue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Orders */}
                <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Orders</h3>
                    <button onClick={() => setActiveTab('orders')} style={{ fontSize: 13, color: '#007185', background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                          {['Order ID', 'Customer', 'Date', 'Amount', 'Status'].map(h => (
                            <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#888', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentOrders.map(o => (
                          <tr key={o.id} style={{ borderBottom: '1px solid #f5f5f5' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                            onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                            <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#007185', fontSize: 12 }}>{o.id.slice(0, 8).toUpperCase()}</td>
                            <td style={{ padding: '10px 12px' }}>
                              <div style={{ fontWeight: 600 }}>{o.user_name}</div>
                              <div style={{ fontSize: 11, color: '#888' }}>{o.user_email}</div>
                            </td>
                            <td style={{ padding: '10px 12px', color: '#666' }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                            <td style={{ padding: '10px 12px', fontWeight: 700, color: '#B12704' }}>₹{parseFloat(o.total_amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                            <td style={{ padding: '10px 12px' }}><StatusBadge status={o.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── ORDERS ── */}
        {activeTab === 'orders' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800 }}>Orders Management</h1>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                  <button key={s} onClick={() => { setOrderFilter(s); setCurrentPage(1); }}
                    style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: orderFilter === s ? '2px solid #FF9900' : '1px solid #ddd', background: orderFilter === s ? '#FF9900' : 'white', color: orderFilter === s ? 'white' : '#555', textTransform: s ? 'capitalize' : 'none', transition: 'all 0.15s' }}>
                    {s || 'All'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              {loading ? (
                <div style={{ padding: 60, textAlign: 'center' }}>
                  <div style={{ width: 36, height: 36, border: '3px solid #f0f0f0', borderTopColor: '#FF9900', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead style={{ background: '#fafafa' }}>
                      <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                        {['Order', 'Customer', 'Date', 'Total', 'Payment', 'Status', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#555', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id} style={{ borderBottom: '1px solid #f5f5f5', transition: 'background 0.1s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                          onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#007185', fontWeight: 700 }}>#{order.id.slice(0, 8).toUpperCase()}</span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 600 }}>{order.user_name}</div>
                            <div style={{ fontSize: 11, color: '#888' }}>{order.user_email}</div>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#666', whiteSpace: 'nowrap' }}>
                            {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#B12704' }}>
                            ₹{parseFloat(order.total_amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#555', textTransform: 'capitalize' }}>{order.payment_method}</td>
                          <td style={{ padding: '12px 14px' }}><StatusBadge status={order.status} /></td>
                          <td style={{ padding: '12px 14px' }}>
                            <select
                              value={order.status}
                              onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                              disabled={updatingOrder === order.id}
                              style={{ padding: '5px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12, cursor: 'pointer', background: 'white' }}>
                              {['pending','confirmed','processing','shipped','delivered','cancelled','refunded'].map(s => (
                                <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '16px', borderTop: '1px solid #f0f0f0' }}>
                  {[...Array(Math.min(pagination.pages, 8))].map((_, i) => (
                    <button key={i + 1} onClick={() => setCurrentPage(i + 1)}
                      style={{ width: 32, height: 32, borderRadius: 4, border: currentPage === i + 1 ? '2px solid #FF9900' : '1px solid #ddd', background: currentPage === i + 1 ? '#FF9900' : 'white', color: currentPage === i + 1 ? 'white' : '#111', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800 }}>Products Management</h1>
              <div style={{ display: 'flex', gap: 10 }}>
                <input placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchProducts()}
                  style={{ padding: '8px 14px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, width: 220, outline: 'none' }} />
                <button onClick={() => setShowAddProduct(true)}
                  style={{ padding: '8px 18px', background: '#FF9900', border: 'none', borderRadius: 6, color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  + Add Product
                </button>
              </div>
            </div>

            {/* Add Product Modal */}
            {showAddProduct && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <div style={{ background: 'white', borderRadius: 12, padding: 32, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700 }}>Add New Product</h2>
                    <button onClick={() => setShowAddProduct(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>✕</button>
                  </div>
                  <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Title *</label>
                      <input required value={newProduct.title} onChange={e => setNewProduct(p => ({ ...p, title: e.target.value }))} placeholder="Product title" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Description *</label>
                      <textarea required value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Product description" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Price (₹) *</label>
                        <input required type="number" min="0" step="0.01" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} style={inputStyle} placeholder="0.00" />
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>MRP (₹)</label>
                        <input type="number" min="0" step="0.01" value={newProduct.original_price} onChange={e => setNewProduct(p => ({ ...p, original_price: e.target.value }))} style={inputStyle} placeholder="0.00" />
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Stock *</label>
                        <input required type="number" min="0" value={newProduct.stock} onChange={e => setNewProduct(p => ({ ...p, stock: e.target.value }))} style={inputStyle} placeholder="0" />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Category *</label>
                      <select required value={newProduct.category_id} onChange={e => setNewProduct(p => ({ ...p, category_id: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="">Select category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Image URLs</label>
                      {newProduct.images.map((img, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                          <input value={img} onChange={e => {
                            const imgs = [...newProduct.images];
                            imgs[i] = e.target.value;
                            setNewProduct(p => ({ ...p, images: imgs }));
                          }} style={{ ...inputStyle, marginBottom: 0 }} placeholder={`Image URL ${i + 1}`} />
                          {i === newProduct.images.length - 1 && (
                            <button type="button" onClick={() => setNewProduct(p => ({ ...p, images: [...p.images, ''] }))}
                              style={{ padding: '0 12px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 18, flexShrink: 0 }}>+</button>
                          )}
                        </div>
                      ))}
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                      <input type="checkbox" checked={newProduct.is_featured} onChange={e => setNewProduct(p => ({ ...p, is_featured: e.target.checked }))} />
                      ⚡ Mark as Featured Deal
                    </label>
                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                      <button type="button" onClick={() => setShowAddProduct(false)} style={{ flex: 1, padding: '11px', background: 'white', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
                      <button type="submit" style={{ flex: 2, padding: '11px', background: '#FF9900', border: 'none', borderRadius: 6, color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Create Product</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead style={{ background: '#fafafa' }}>
                    <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                      {['Product', 'Category', 'Price', 'Stock', 'Rating', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#555', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={7} style={{ padding: 60, textAlign: 'center' }}>
                        <div style={{ width: 36, height: 36, border: '3px solid #f0f0f0', borderTopColor: '#FF9900', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                      </td></tr>
                    ) : products.map(p => {
                      const img = Array.isArray(p.images) ? p.images[0] : p.images?.[0];
                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f5' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                          onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <img src={img} alt="" style={{ width: 40, height: 40, objectFit: 'contain', border: '1px solid #eee', borderRadius: 4 }} onError={e => e.target.src = 'https://via.placeholder.com/40'} />
                              <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, fontWeight: 500 }}>{p.title}</div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#666' }}>{p.category_name}</td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#B12704' }}>₹{parseFloat(p.price).toLocaleString('en-IN')}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ color: p.stock > 10 ? '#007600' : p.stock > 0 ? '#f57c00' : '#c62828', fontWeight: 600 }}>{p.stock}</span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ color: '#FF9900' }}>★</span> {parseFloat(p.rating || 0).toFixed(1)} ({p.review_count})
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ background: p.is_active ? '#e8f5e9' : '#ffebee', color: p.is_active ? '#2e7d32' : '#c62828', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                              {p.is_active ? 'Active' : 'Inactive'}
                            </span>
                            {p.is_featured && <span style={{ marginLeft: 6, background: '#fff8e1', color: '#f57c00', padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>⚡ Deal</span>}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <Link to={`/products/${p.id}`} style={{ padding: '5px 10px', background: '#e3f2fd', color: '#1565c0', borderRadius: 4, fontSize: 12, textDecoration: 'none', fontWeight: 600 }}>View</Link>
                              {p.is_active && (
                                <button onClick={() => handleDeleteProduct(p.id, p.title)}
                                  style={{ padding: '5px 10px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: 4, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                                  Disable
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {pagination.pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: 16, borderTop: '1px solid #f0f0f0' }}>
                  {[...Array(Math.min(pagination.pages, 8))].map((_, i) => (
                    <button key={i + 1} onClick={() => setCurrentPage(i + 1)}
                      style={{ width: 32, height: 32, borderRadius: 4, border: currentPage === i + 1 ? '2px solid #FF9900' : '1px solid #ddd', background: currentPage === i + 1 ? '#FF9900' : 'white', color: currentPage === i + 1 ? 'white' : '#111', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800 }}>Users Management</h1>
              <input placeholder="Search by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchUsers()}
                style={{ padding: '8px 14px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, width: 260, outline: 'none' }} />
            </div>

            <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead style={{ background: '#fafafa' }}>
                    <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                      {['User', 'Email', 'Role', 'Orders', 'Joined'].map(h => (
                        <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#555', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={5} style={{ padding: 60, textAlign: 'center' }}>
                        <div style={{ width: 36, height: 36, border: '3px solid #f0f0f0', borderTopColor: '#FF9900', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                      </td></tr>
                    ) : users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #f5f5f5' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                        onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FF9900', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600 }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#555' }}>{u.email}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ background: u.role === 'admin' ? '#fce4ec' : '#e3f2fd', color: u.role === 'admin' ? '#880e4f' : '#1565c0', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 600 }}>{u.order_count}</td>
                        <td style={{ padding: '12px 14px', color: '#888' }}>{new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pagination.pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: 16, borderTop: '1px solid #f0f0f0' }}>
                  {[...Array(Math.min(pagination.pages, 8))].map((_, i) => (
                    <button key={i + 1} onClick={() => setCurrentPage(i + 1)}
                      style={{ width: 32, height: 32, borderRadius: 4, border: currentPage === i + 1 ? '2px solid #FF9900' : '1px solid #ddd', background: currentPage === i + 1 ? '#FF9900' : 'white', color: currentPage === i + 1 ? 'white' : '#111', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default AdminDashboard;
