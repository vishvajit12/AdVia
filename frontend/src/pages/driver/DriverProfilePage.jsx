// =====================================================================
// AdVia Frontend — Driver Vehicle Profile Page
// View + edit route area, UPI ID, and vehicle type. Vehicle number and
// verification status are read-only (set during registration / by admin).
// =====================================================================
import { useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import api, { getErrorMessage } from '../../api/client';
import Spinner from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';

const VEHICLE_TYPES = ['Auto-rickshaw', 'Taxi', 'Bike', 'Delivery Van'];

export default function DriverProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ routeArea: '', upiId: '', vehicleType: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    api
      .get('/drivers/profile')
      .then((res) => {
        const p = res.data.profile;
        setProfile(p);
        setForm({ routeArea: p.route_area, upiId: p.upi_id || '', vehicleType: p.vehicle_type });
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/drivers/profile', form);
      setProfile((p) => ({ ...p, route_area: form.routeArea, upi_id: form.upiId, vehicle_type: form.vehicleType }));
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner label="Loading your profile..." />;
  if (error) return <div className="form-error">{error}</div>;

  const verificationItems = [
    { item: 'Vehicle RC', done: true },
    { item: 'Driver License', done: true },
    { item: 'Aadhaar Verified', done: !!profile.is_verified },
    { item: 'UPI Linked', done: !!profile.upi_id },
    { item: 'Ad Space Photo', done: false },
  ];

  return (
    <div className="flex-col gap-3">
      <div>
        <h1 style={{ fontSize: '1.6rem' }}>My Vehicle Profile</h1>
        <p className="text-muted" style={{ marginTop: 4 }}>Manage your route, UPI, and vehicle details.</p>
      </div>

      <div className="grid grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Editable details */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', marginBottom: 16 }}>Vehicle Details</h3>
          <form onSubmit={handleSave} className="flex-col gap-2">
            <div className="field">
              <label>Vehicle Number</label>
              <input value={profile.vehicle_number} disabled />
              <span className="field-hint">Contact support to change this</span>
            </div>
            <div className="field">
              <label>Vehicle Type</label>
              <select value={form.vehicleType} onChange={(e) => setForm((f) => ({ ...f, vehicleType: e.target.value }))}>
                {VEHICLE_TYPES.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Primary Route / Area</label>
              <input
                value={form.routeArea}
                onChange={(e) => setForm((f) => ({ ...f, routeArea: e.target.value }))}
                required
              />
            </div>
            <div className="field">
              <label>UPI ID (for payouts)</label>
              <input value={form.upiId} onChange={(e) => setForm((f) => ({ ...f, upiId: e.target.value }))} placeholder="yourname@upi" />
            </div>
            <div className="grid grid-2" style={{ gap: 14 }}>
              <div className="field">
                <label>Owner Name</label>
                <input value={profile.name} disabled />
              </div>
              <div className="field">
                <label>Phone</label>
                <input value={profile.phone || '—'} disabled />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: 4 }}>
              {saving ? <Spinner size="sm" onDark /> : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Verification + rating */}
        <div className="flex-col gap-2">
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', marginBottom: 12 }}>Verification Status</h3>
            {verificationItems.map((v, i) => (
              <div
                key={v.item}
                className="flex-between"
                style={{ padding: '9px 0', borderBottom: i < verificationItems.length - 1 ? '1px solid var(--c-border)' : 'none' }}
              >
                <span style={{ fontSize: '0.9rem' }}>{v.item}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: v.done ? 'var(--c-primary)' : 'var(--c-accent)' }}>
                  {v.done ? '✓ Verified' : '⚠ Pending'}
                </span>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.05rem', marginBottom: 8 }}>Rating</h3>
            <div className="flex gap-1" style={{ alignItems: 'baseline' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--c-primary)', fontFamily: 'var(--font-display)' }}>
                {Number(profile.rating).toFixed(1)}
              </span>
              <FaStar style={{ color: '#F2A516' }} />
            </div>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: 6 }}>
              Based on completed campaigns
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
