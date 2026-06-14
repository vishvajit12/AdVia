// =====================================================================
// AdVia Frontend — Advertiser "My Campaigns" Page
// Lists all campaigns with status badges. Draft campaigns can be
// activated (matches drivers + creates invoice) or cancelled.
// =====================================================================
import { useEffect, useState } from 'react';
import { FaPlus, FaMapMarkerAlt, FaCar, FaEye } from 'react-icons/fa';
import api, { getErrorMessage } from '../../api/client';
import Spinner from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';
import NewCampaignModal from './NewCampaignModal';

const STATUS_BADGE = {
  draft: 'badge-gray',
  active: 'badge-green',
  completed: 'badge-blue',
  cancelled: 'badge-red',
};

export default function AdvertiserCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [actingId, setActingId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  function fetchData() {
    setLoading(true);
    Promise.all([api.get('/campaigns'), api.get('/advertisers/profile')])
      .then(([campRes, profRes]) => {
        setCampaigns(campRes.data.campaigns);
        setProfile(profRes.data.profile);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  async function activate(id) {
    setActingId(id);
    try {
      const res = await api.put(`/campaigns/${id}/activate`);
      showToast(res.data.message, 'success');
      fetchData();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setActingId(null);
    }
  }

  async function cancel(id) {
    setActingId(id);
    try {
      await api.put(`/campaigns/${id}/cancel`);
      showToast('Campaign cancelled', 'info');
      fetchData();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setActingId(null);
    }
  }

  function handleCreated() {
    setShowModal(false);
    fetchData();
  }

  if (loading) return <Spinner label="Loading campaigns..." />;
  if (error) return <div className="form-error">{error}</div>;

  return (
    <div className="flex-col gap-3">
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>My Campaigns</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>All campaigns you&apos;ve created on AdVia.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FaPlus /> New Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="card text-center" style={{ padding: '40px 16px' }}>
          <p className="text-muted" style={{ marginBottom: 14 }}>
            No campaigns yet. Create your first one — our AI advisor can help you choose the right setup.
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <FaPlus /> New Campaign
          </button>
        </div>
      ) : (
        campaigns.map((c) => (
          <div key={c.id} className="card card-hover">
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div className="flex gap-1" style={{ alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>{c.title}</span>
                  <span className={`badge ${STATUS_BADGE[c.status]}`}>
                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                  </span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.88rem' }}>
                  <FaMapMarkerAlt /> {c.target_area}
                </div>
                <div className="text-muted" style={{ fontSize: '0.88rem', marginTop: 2 }}>
                  <FaCar /> {c.acceptedVehicles}/{c.vehicle_count} {c.vehicle_type} &nbsp;·&nbsp;
                  <FaEye /> {c.impressions > 0 ? `${Math.round(c.impressions / 1000)}K impressions` : 'Not started'} &nbsp;·&nbsp; Ends{' '}
                  {c.end_date ? new Date(c.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                  ₹{Number(c.estimated_cost).toLocaleString('en-IN')}
                </div>
                <div className="text-muted" style={{ fontSize: '0.78rem', marginBottom: 8 }}>Total spend</div>
                <div className="flex gap-1" style={{ justifyContent: 'flex-end' }}>
                  {c.status === 'draft' && (
                    <>
                      <button className="btn btn-primary btn-sm" disabled={actingId === c.id} onClick={() => activate(c.id)}>
                        {actingId === c.id ? <Spinner size="sm" onDark /> : 'Activate'}
                      </button>
                      <button className="btn btn-danger-outline btn-sm" disabled={actingId === c.id} onClick={() => cancel(c.id)}>
                        Cancel
                      </button>
                    </>
                  )}
                  {c.status === 'active' && (
                    <button className="btn btn-danger-outline btn-sm" disabled={actingId === c.id} onClick={() => cancel(c.id)}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      {showModal && (
        <NewCampaignModal
          businessType={profile?.business_type || 'Other'}
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
