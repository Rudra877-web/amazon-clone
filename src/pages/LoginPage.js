import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const AuthPage = ({ mode = 'login' }) => {
  const { login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);

  const isLogin = mode === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isLogin && form.password !== form.confirmPassword) {
      setError('Passwords do not match'); return;
    }
    if (!isLogin && form.password.length < 6) {
      setError('Password must be at least 6 characters'); return;
    }
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email: form.email, password: form.password } : { name: form.name, email: form.email, password: form.password };
      const { data } = await API.post(endpoint, payload);
      login(data.user, data.token);
      toast.success(isLogin ? `Welcome back, ${data.user.name}!` : `Account created! Welcome, ${data.user.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || `${isLogin ? 'Login' : 'Registration'} failed`);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid #a6a6a6', borderRadius: 4,
    fontSize: 14, outline: 'none', marginBottom: 12, boxSizing: 'border-box',
    transition: 'box-shadow 0.15s'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40 }}>
      <Link to="/" style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-2px', color: '#111' }}>amazon</span>
        <span style={{ fontSize: 10, color: '#FF9900', letterSpacing: 2, marginTop: -6 }}>CLONE</span>
      </Link>

      <div style={{ width: '100%', maxWidth: 360, border: '1px solid #ddd', borderRadius: 8, padding: '24px 28px', marginBottom: 16 }}>
        <h1 style={{ fontSize: 26, fontWeight: 400, marginBottom: 20 }}>{isLogin ? 'Sign in' : 'Create account'}</h1>

        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #fac', color: '#c00', padding: '10px 14px', borderRadius: 4, fontSize: 13, marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 4 }}>Your name</label>
              <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="First and last name" style={inputStyle}
                onFocus={e => e.target.style.boxShadow = '0 0 0 3px rgba(228,121,17,0.3)'}
                onBlur={e => e.target.style.boxShadow = 'none'} />
            </div>
          )}

          <div>
            <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 4 }}>Email</label>
            <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com" style={inputStyle}
              onFocus={e => e.target.style.boxShadow = '0 0 0 3px rgba(228,121,17,0.3)'}
              onBlur={e => e.target.style.boxShadow = 'none'} />
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 4 }}>Password</label>
            <input type={showPwd ? 'text' : 'password'} required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder={isLogin ? 'Enter your password' : 'At least 6 characters'}
              style={{ ...inputStyle, paddingRight: 40 }}
              onFocus={e => e.target.style.boxShadow = '0 0 0 3px rgba(228,121,17,0.3)'}
              onBlur={e => e.target.style.boxShadow = 'none'} />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              style={{ position: 'absolute', right: 10, top: 34, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#666' }}>
              {showPwd ? '🙈' : '👁'}
            </button>
          </div>

          {!isLogin && (
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 4 }}>Re-enter password</label>
              <input type="password" required value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="Re-enter password" style={inputStyle}
                onFocus={e => e.target.style.boxShadow = '0 0 0 3px rgba(228,121,17,0.3)'}
                onBlur={e => e.target.style.boxShadow = 'none'} />
            </div>
          )}

          {isLogin && (
            <div style={{ fontSize: 12, color: '#555', marginBottom: 16 }}>
              By continuing, you agree to Amazon Clone's{' '}
              <a href="#!" style={{ color: '#007185' }}>Terms of Use</a> and{' '}
              <a href="#!" style={{ color: '#007185' }}>Privacy Policy</a>.
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '10px', background: 'linear-gradient(to bottom, #f7dfa5, #f0c14b)', border: '1px solid #a88734', borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}>
            {loading ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign in' : 'Create your Amazon account')}
          </button>
        </form>
      </div>

      <div style={{ width: '100%', maxWidth: 360, textAlign: 'center' }}>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <div style={{ borderTop: '1px solid #e0e0e0', position: 'absolute', top: '50%', width: '100%' }} />
          <span style={{ background: 'white', padding: '0 8px', fontSize: 12, color: '#767676', position: 'relative' }}>
            {isLogin ? 'New to Amazon Clone?' : 'Already have an account?'}
          </span>
        </div>
        <Link to={isLogin ? '/register' : '/login'}
          style={{ display: 'block', padding: '10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, color: '#111', textDecoration: 'none', textAlign: 'center', transition: 'background 0.15s' }}
          onMouseEnter={e => e.target.style.background = '#f7f7f7'}
          onMouseLeave={e => e.target.style.background = 'white'}>
          {isLogin ? 'Create your Amazon account' : 'Sign in to your account'}
        </Link>
      </div>
    </div>
  );
};

export const LoginPage = () => <AuthPage mode="login" />;
export const RegisterPage = () => <AuthPage mode="register" />;

export default AuthPage;
