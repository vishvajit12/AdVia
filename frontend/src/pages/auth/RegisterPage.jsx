// =====================================================================
// AdVia Frontend — Register Page
// A single form that adapts its extra fields based on the selected
// role (driver vs advertiser). Reads ?role= from the URL so landing
// page CTAs can pre-select the right tab.
// =====================================================================
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';

const VEHICLE_TYPES = ['Auto-rickshaw', 'Taxi', 'Bike', 'Delivery Van'];
const BUSINESS_TYPES = [
  'Restaurant',
  'Medical / Pharmacy',
  'Hotel',
  'Retail Shop',
  'Gym / Salon',
  'School / Tuition',
  'Startup / Brand',
  'Other',
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'driver' ? 'driver' : 'advertiser';

  const [role, setRole] = useState(initialRole);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    // driver
    vehicleNumber: '',
    vehicleType: VEHICLE_TYPES[0],
    routeArea: '',
    upiId: '',
    // advertiser
    businessName: '',
    businessType: BUSINESS_TYPES[0],
    address: '',
  });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      role,
    };

    if (role === 'driver') {
      Object.assign(payload, {
        vehicleNumber: form.vehicleNumber,
        vehicleType: form.vehicleType,
        routeArea: form.routeArea,
        upiId: form.upiId,
      });
    } else {
      Object.assign(payload, {
        businessName: form.businessName,
        businessType: form.businessType,
        address: form.address,
      });
    }

    const result = await register(payload);
    if (result.success) {
      navigate(`/${result.user.role}/dashboard`);
    } else {
      setError(result.message);
    }
    setLoading(false);
  }

  return (
    <div style={{ background: 'var(--c-navy)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="flex-center" style={{ flex: 1, padding: '40px 20px' }}>
        <div
          className="card animate-fade-in-up"
          style={{ background: 'var(--c-navy-card)', border: '1px solid var(--c-navy-border)', width: '100%', maxWidth: 480 }}
        >
          <h2 style={{ color: '#fff', marginBottom: 6 }}>Join AdVia</h2>
          <p style={{ color: 'var(--c-navy-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
            Choose how you&apos;d like to use AdVia.
          </p>

          {/* Role toggle */}
          <div className="flex gap-1" style={{ marginBottom: 22, background: 'var(--c-navy)', borderRadius: 10, padding: 4 }}>
            {['advertiser', 'driver'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className="btn btn-sm"
                style={{
                  flex: 1,
                  background: role === r ? 'var(--c-primary)' : 'transparent',
                  color: role === r ? '#fff' : 'var(--c-navy-muted)',
                  transition: 'all 0.2s ease',
                }}
              >
                {r === 'advertiser' ? '📢 I want to advertise' : '🚗 I have a vehicle'}
              </button>
            ))}
          </div>

          {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

          <form onSubmit={handleSubmit} className="flex-col gap-2">
            <div className="grid grid-2" style={{ gap: 14 }}>
              <div className="field">
                <label style={{ color: '#fff' }}>Full name</label>
                <input value={form.name} onChange={(e) => update('name', e.target.value)} required />
              </div>
              <div className="field">
                <label style={{ color: '#fff' }}>Phone</label>
                <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" />
              </div>
            </div>

            <div className="field">
              <label style={{ color: '#fff' }}>Email</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
            </div>

            <div className="field">
              <label style={{ color: '#fff' }}>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                minLength={6}
                required
              />
              <span className="field-hint" style={{ color: 'var(--c-navy-muted)' }}>At least 6 characters</span>
            </div>

            {/* Role-specific fields */}
            {role === 'driver' ? (
              <div className="flex-col gap-2 animate-fade-in-up">
                <div className="grid grid-2" style={{ gap: 14 }}>
                  <div className="field">
                    <label style={{ color: '#fff' }}>Vehicle number</label>
                    <input
                      value={form.vehicleNumber}
                      onChange={(e) => update('vehicleNumber', e.target.value.toUpperCase())}
                      placeholder="MH11-AK-1234"
                      required
                    />
                  </div>
                  <div className="field">
                    <label style={{ color: '#fff' }}>Vehicle type</label>
                    <select value={form.vehicleType} onChange={(e) => update('vehicleType', e.target.value)}>
                      {VEHICLE_TYPES.map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label style={{ color: '#fff' }}>Primary route / area</label>
                  <input
                    value={form.routeArea}
                    onChange={(e) => update('routeArea', e.target.value)}
                    placeholder="e.g. Miraj Road, Sangli"
                    required
                  />
                </div>
                <div className="field">
                  <label style={{ color: '#fff' }}>UPI ID (for payouts)</label>
                  <input value={form.upiId} onChange={(e) => update('upiId', e.target.value)} placeholder="yourname@upi" />
                </div>
              </div>
            ) : (
              <div className="flex-col gap-2 animate-fade-in-up">
                <div className="grid grid-2" style={{ gap: 14 }}>
                  <div className="field">
                    <label style={{ color: '#fff' }}>Business name</label>
                    <input value={form.businessName} onChange={(e) => update('businessName', e.target.value)} required />
                  </div>
                  <div className="field">
                    <label style={{ color: '#fff' }}>Business type</label>
                    <select value={form.businessType} onChange={(e) => update('businessType', e.target.value)}>
                      {BUSINESS_TYPES.map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label style={{ color: '#fff' }}>Business address</label>
                  <input value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Street, City" />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? <Spinner size="sm" onDark /> : 'Create Account'}
            </button>
          </form>

          <p style={{ marginTop: 18, fontSize: '0.88rem', color: 'var(--c-navy-muted)', textAlign: 'center' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--c-primary)', fontWeight: 600 }}>
              Log in
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
