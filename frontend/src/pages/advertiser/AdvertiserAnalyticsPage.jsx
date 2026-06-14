// =====================================================================
// AdVia Frontend — Advertiser Analytics Page
// Aggregate impressions, QR scans, average daily reach, and a
// breakdown of impressions by target area (animated progress bars).
// =====================================================================
import { useEffect, useState } from 'react';
import { FaEye, FaQrcode, FaChartLine } from 'react-icons/fa';
import api, { getErrorMessage } from '../../api/client';
import Spinner from '../../components/Spinner';

export default function AdvertiserAnalyticsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/advertisers/analytics')
      .then((res) => setData(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading analytics..." />;
  if (error) return <div className="form-error">{error}</div>;

  const { totalImpressions, qrScans, avgDailyReach, impressionsByArea } = data;

  return (
    <div className="flex-col gap-3">
      <div>
        <h1 style={{ fontSize: '1.6rem' }}>Analytics</h1>
        <p className="text-muted" style={{ marginTop: 4 }}>
          Live-estimated reach across your active and completed campaigns.
        </p>
      </div>

      <div className="grid grid-3">
        <StatCard icon={<FaEye />} label="Total impressions" value={totalImpressions.toLocaleString('en-IN')} />
        <StatCard icon={<FaQrcode />} label="QR code scans (est.)" value={qrScans.toLocaleString('en-IN')} accent="orange" />
        <StatCard icon={<FaChartLine />} label="Avg daily reach" value={avgDailyReach.toLocaleString('en-IN')} accent="blue" />
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.05rem', marginBottom: 18 }}>Impressions by Area</h3>
        {impressionsByArea.length === 0 ? (
          <p className="text-muted text-center" style={{ padding: '24px 0' }}>
            No data yet — activate a campaign to start seeing impressions here.
          </p>
        ) : (
          impressionsByArea.map((row) => (
            <div key={row.area} style={{ marginBottom: 16 }}>
              <div className="flex-between" style={{ fontSize: '0.88rem', marginBottom: 6 }}>
                <span style={{ fontWeight: 500 }}>{row.area}</span>
                <span className="text-muted">
                  {row.impressions.toLocaleString('en-IN')} &nbsp;({row.pct}%)
                </span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${row.pct}%` }} />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card" style={{ background: 'var(--c-primary-light)', border: 'none' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--c-primary-dark)' }}>
          💡 <strong>How impressions are estimated:</strong> AdVia calculates impressions as{' '}
          <code>active vehicles × ~1,500 daily views × days running</code>. QR scans are estimated at ~2% of impressions.
          As GPS/QR hardware rolls out across the fleet, these numbers will be replaced with live telemetry.
        </p>
      </div>
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
