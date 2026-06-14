// =====================================================================
// AdVia Frontend — Driver Dashboard (Home)
// Stats overview + active ad campaigns with progress bars.
// =====================================================================
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBriefcase, FaWallet, FaBell, FaChartLine } from 'react-icons/fa';
import api, { getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';
import useNotifications from '../../hooks/useNotifications';

function formatCurrency(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

export default function DriverDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { unread } = useNotifications();

  useEffect(() => {
    api
      .get('/drivers/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading your dashboard..." />;
  if (error) return <div className="form-error">{error}</div>;

  const { stats, activeJobs } = data;
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="flex-col gap-3">
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Good to see you, {firstName} 👋</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>Here&apos;s how your vehicle is earning today.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-4">
        <StatCard
          icon={<FaWallet />}
          label="This month earnings"
          value={formatCurrency(stats.thisMonthEarnings)}
          sub="From your accepted campaigns"
        />
        <StatCard
          icon={<FaChartLine />}
          label="Active campaigns"
          value={stats.activeCampaigns}
          sub={stats.activeCampaigns === 1 ? 'Currently running' : 'Currently running'}
        />
        <StatCard
          icon={<FaBriefcase />}
          label="Pending job offers"
          value={stats.pendingOffers}
          sub="Review in Job Offers tab"
          accent
        />
        <StatCard
          icon={<FaWallet />}
          label="Total earned"
          value={formatCurrency(stats.totalEarned)}
          sub="All-time paid out"
        />
      </div>

      {/* Unread notifications banner */}
      {unread > 0 && (
        <div
          className="flex-between animate-fade-in-up"
          style={{ background: 'var(--c-accent-light)', borderRadius: 12, padding: '14px 18px', flexWrap: 'wrap', gap: 10 }}
        >
          <div className="flex gap-1" style={{ alignItems: 'center' }}>
            <FaBell style={{ color: 'var(--c-accent)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#7A2E10' }}>
              You have {unread} unread notification{unread > 1 ? 's' : ''}
            </span>
          </div>
          <Link to="/driver/notifications" className="btn btn-ghost btn-sm" style={{ color: 'var(--c-accent)' }}>
            View all →
          </Link>
        </div>
      )}

      {/* Active campaigns */}
      <div className="card">
        <h3 style={{ fontSize: '1.05rem', marginBottom: 16 }}>Active Ad Campaigns</h3>
        {activeJobs.length === 0 ? (
          <EmptyState
            text="No active campaigns yet. Accept a job offer to get started!"
            ctaLabel="View Job Offers"
            ctaTo="/driver/jobs"
          />
        ) : (
          activeJobs.map((job, i) => {
            const progress = computeProgress(job.start_date, job.end_date, job.duration_months);
            return (
              <div
                key={job.jobId}
                style={{
                  padding: '16px 0',
                  borderBottom: i < activeJobs.length - 1 ? '1px solid var(--c-border)' : 'none',
                }}
              >
                <div className="flex-between" style={{ marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{job.campaignTitle}</div>
                    <div className="text-muted" style={{ fontSize: '0.82rem' }}>{job.business_name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${job.status === 'completed' ? 'badge-gray' : 'badge-green'}`}>
                      {job.status === 'completed' ? 'Completed' : 'Active'}
                    </span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--c-primary)', marginTop: 4 }}>
                      ₹{Number(job.monthly_pay).toLocaleString('en-IN')}/mo
                    </div>
                  </div>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="text-muted" style={{ fontSize: '0.78rem', marginTop: 4 }}>
                  {progress}% of campaign duration
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="stat-card">
      <div className="flex-between" style={{ marginBottom: 6 }}>
        <span className="stat-label" style={{ margin: 0 }}>{label}</span>
        <span style={{ color: accent ? 'var(--c-accent)' : 'var(--c-primary)', fontSize: '0.95rem' }}>{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}

export function EmptyState({ text, ctaLabel, ctaTo }) {
  return (
    <div className="text-center" style={{ padding: '32px 16px' }}>
      <p className="text-muted" style={{ marginBottom: ctaLabel ? 14 : 0 }}>{text}</p>
      {ctaLabel && (
        <Link to={ctaTo} className="btn btn-primary btn-sm">
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}

/** Compute % of campaign duration elapsed, clamped 0-100. */
export function computeProgress(startDate, endDate, durationMonths) {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + (durationMonths || 1) * 30 * 86400000);
  const now = new Date();
  const total = end - start;
  const elapsed = now - start;
  if (total <= 0) return 100;
  return Math.min(Math.max(Math.round((elapsed / total) * 100), 0), 100);
}
