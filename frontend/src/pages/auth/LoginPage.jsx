// =====================================================================
// AdVia Frontend — Login Page
// =====================================================================
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(form.email, form.password);

    if (result.success) {
      navigate(`/${result.user.role}/dashboard`);
    } else {
      setError(result.message);
    }
    setLoading(false);
  }

  function fillDemo(role) {
    if (role === 'driver') {
      setForm({ email: 'rajesh.driver@advia.in', password: 'password123' });
    } else {
      setForm({ email: 'sharma@advia.in', password: 'password123' });
    }
  }

  return (
    <div style={{ background: 'var(--c-navy)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="flex-center" style={{ flex: 1, padding: '48px 20px' }}>
        <div
          className="card animate-fade-in-up"
          style={{ background: 'var(--c-navy-card)', border: '1px solid var(--c-navy-border)', width: '100%', maxWidth: 420 }}
        >
          <h2 style={{ color: '#fff', marginBottom: 6 }}>Welcome back</h2>
          <p style={{ color: 'var(--c-navy-muted)', fontSize: '0.9rem', marginBottom: 24 }}>
            Log in to your AdVia dashboard.
          </p>

          {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

          <form onSubmit={handleSubmit} className="flex-col gap-2">
            <div className="field">
              <label style={{ color: '#fff' }}>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label style={{ color: '#fff' }}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? <Spinner size="sm" onDark /> : 'Log In'}
            </button>
          </form>

          <div className="flex gap-1" style={{ marginTop: 18, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--c-navy-muted)' }} onClick={() => fillDemo('driver')}>
              Use demo driver
            </button>
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--c-navy-muted)' }} onClick={() => fillDemo('advertiser')}>
              Use demo advertiser
            </button>
          </div>

          <p style={{ marginTop: 20, fontSize: '0.88rem', color: 'var(--c-navy-muted)', textAlign: 'center' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" style={{ color: 'var(--c-primary)', fontWeight: 600 }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
