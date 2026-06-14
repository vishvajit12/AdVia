// =====================================================================
// AdVia Frontend — Advertiser Dashboard (Home)
// Overview stats + active campaign progress + quick actions, including
// launching the New Campaign modal.
// =====================================================================
import { useEffect, useState } from 'react';
import { FaBullhorn, FaCar, FaEye, FaWallet, FaPlus, FaFileDownload, FaPaintBrush } from 'react-icons/fa';
import api, { getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';
import NewCampaignModal from './NewCampaignModal';

export default function AdvertiserDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  function fetchData() {
    setLoading(true);
    Promise.all([api.get('/advertisers/dashboard'), api.get('/advertisers/profile')])
      .then(([dashRes, profRes]) => {
        setData(dashRes.data);
        setProfile(profRes.data.profile);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  function handleCreated() {
    setShowModal(false);
    fetchData();
  }

  if (loading) return <Spinner label="Loading your dashboard..." />;
  if (error) return <div className="form-error">{error}</div>;

  const { stats, activeCampaign } = data;

  return (
    <div className="flex-col gap-3">
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>{profile?.business_name} {businessEmoji(profile?.business_type)}</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>Advertiser account · {profile?.address || 'AdVia Network'}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FaPlus /> New Campaign
        </button>
      </div>

      <div className="grid grid-4">
        <StatCard icon={<FaBullhorn />} label="Active campaigns" value={stats.activeCampaigns} />
        <StatCard icon={<FaCar />} label="Total vehicles" value={stats.totalVehicles} accent="blue" />
        <StatCard icon={<FaEye />} label="Impressions this month" value={formatNumber(stats.impressionsThisMonth)} accent="orange" />
        <StatCard icon={<FaWallet />} label="Total ad spend" value={`₹${formatNumber(stats.totalSpend)}`} />
      </div>

      <div className="grid grid-2" style={{ alignItems: 'flex-start' }}>
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', marginBottom: 16 }}>Active Campaign</h3>
          {activeCampaign ? (
            <div style={{ background: 'var(--c-bg)', borderRadius: 10, padding: '16px 18px' }}>
              <div className="flex-between" style={{ marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontWeight: 600 }}>{activeCampaign.title}</span>
                <span className="badge badge-green">Active</span>
              </div>
              <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 12 }}>
                📍 {activeCampaign.target_area} &nbsp;·&nbsp; 🚗 {activeCampaign.acceptedVehicles} vehicle
                {activeCampaign.acceptedVehicles !== 1 ? 's' : ''} &nbsp;·&nbsp; Ends{' '}
                {activeCampaign.end_date ? new Date(activeCampaign.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
              </p>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${activeCampaign.progressPct}%` }} />
              </div>
              <div className="flex-between text-muted" style={{ marginTop: 6, fontSize: '0.78rem' }}>
                <span>{activeCampaign.progressPct}% done</span>
                <span>{formatNumber(activeCampaign.impressions)} impressions</span>
              </div>
            </div>
          ) : (
            <div className="text-center" style={{ padding: '24px 0' }}>
              <p className="text-muted" style={{ marginBottom: 14 }}>
                No active campaigns yet. Launch your first one to start seeing your ads on the road!
              </p>
              <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                <FaPlus /> New Campaign
              </button>
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.05rem', marginBottom: 14 }}>Quick Actions</h3>
          <div className="flex-col gap-1">
            <QuickAction icon={<FaPlus />} label="Launch new campaign" onClick={() => setShowModal(true)} />
            <QuickAction icon={<FaFileDownload />} label="Download report" onClick={() => setShowModal(false)} to="/advertiser/analytics" />
            <QuickAction icon={<FaCar />} label="Add more vehicles" onClick={() => setShowModal(true)} />
            <QuickAction icon={<FaPaintBrush />} label="View campaigns" to="/advertiser/campaigns" />
          </div>
        </div>
      </div>

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

function StatCard({ icon, label, value, accent }) {
  const colorMap = { blue: 'var(--c-info)', orange: 'var(--c-accent)' };
  return (
    <div className="stat-card">
      <div className="flex-between" style={{ marginBottom: 6 }}>
        <span className="stat-label" style={{ margin: 0 }}>{label}</span>
        <span style={{ color: colorMap[accent] || 'var(--c-primary)', fontSize: '0.95rem' }}>{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

function QuickAction({ icon, label, onClick, to }) {
  const content = (
    <>
      <span style={{ color: 'var(--c-primary)' }}>{icon}</span> {label}
    </>
  );
  if (to) {
    return (
      <a href={to} className="nav-link" style={{ textDecoration: 'none' }}>
        {content}
      </a>
    );
  }
  return (
    <button className="nav-link" onClick={onClick}>
      {content}
    </button>
  );
}

function formatNumber(n) {
  return Number(n || 0).toLocaleString('en-IN');
}

function businessEmoji(type) {
  const map = {
    Restaurant: '🍽️',
    'Medical / Pharmacy': '🏥',
    Hotel: '🏨',
    'Retail Shop': '🛍️',
    'Gym / Salon': '💪',
    'School / Tuition': '🎓',
    'Startup / Brand': '🚀',
  };
  return map[type] || '🏢';
}
