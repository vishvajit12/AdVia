// =====================================================================
// AdVia Frontend — Driver Earnings Page
// Monthly earnings bar chart (pure CSS, animated bars) + full payment
// history table.
// =====================================================================
import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../../api/client';
import Spinner from '../../components/Spinner';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DriverEarningsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/drivers/earnings')
      .then((res) => setData(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading earnings..." />;
  if (error) return <div className="form-error">{error}</div>;

  const { monthly, history } = data;

  // Build a full Jan-Dec series, filling months with no payments as 0.
  const series = MONTH_NAMES.map((name, idx) => {
    const found = monthly.find((m) => Number(m.month) === idx + 1);
    return { name, total: found ? Number(found.total) : 0 };
  });
  const maxValue = Math.max(...series.map((s) => s.total), 1);

  const totalThisYear = series.reduce((sum, s) => sum + s.total, 0);
  const totalPaid = history.filter((h) => h.status === 'paid').reduce((sum, h) => sum + Number(h.amount), 0);
  const totalPending = history.filter((h) => h.status === 'pending').reduce((sum, h) => sum + Number(h.amount), 0);

  return (
    <div className="flex-col gap-3">
      <div>
        <h1 style={{ fontSize: '1.6rem' }}>Earnings</h1>
        <p className="text-muted" style={{ marginTop: 4 }}>Your monthly ad income breakdown.</p>
      </div>

      <div className="grid grid-3">
        <div className="stat-card">
          <div className="stat-label">This year (total)</div>
          <div className="stat-value" style={{ color: 'var(--c-primary)' }}>
            ₹{totalThisYear.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Paid out</div>
          <div className="stat-value">₹{totalPaid.toLocaleString('en-IN')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending payout</div>
          <div className="stat-value" style={{ color: 'var(--c-accent)' }}>
            ₹{totalPending.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="card">
        <h3 style={{ fontSize: '1.05rem', marginBottom: 20 }}>Monthly Earnings — {new Date().getFullYear()}</h3>
        <div className="flex gap-1" style={{ alignItems: 'flex-end', height: 160 }}>
          {series.map((s, i) => {
            const heightPct = (s.total / maxValue) * 100;
            const isCurrentMonth = i === new Date().getMonth();
            return (
              <div key={s.name} className="flex-col gap-1" style={{ flex: 1, alignItems: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--c-primary)', fontWeight: 600 }}>
                  {s.total > 0 ? `₹${(s.total / 1000).toFixed(1)}k` : ''}
                </div>
                <div
                  style={{
                    width: '100%',
                    height: `${Math.max(heightPct, 2)}%`,
                    background: isCurrentMonth ? 'var(--c-primary)' : 'var(--c-primary-light)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.6s ease',
                    minHeight: 4,
                  }}
                />
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>{s.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment history */}
      <div className="card">
        <h3 style={{ fontSize: '1.05rem', marginBottom: 16 }}>Payment History</h3>
        {history.length === 0 ? (
          <p className="text-muted text-center" style={{ padding: '24px 0' }}>
            No payments yet — accepted jobs will appear here once payouts are scheduled.
          </p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Advertiser</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td>{h.campaignTitle}</td>
                    <td>{h.business_name}</td>
                    <td>{new Date(h.paid_at || h.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td style={{ fontWeight: 600, color: 'var(--c-primary)' }}>₹{Number(h.amount).toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge ${h.status === 'paid' ? 'badge-green' : 'badge-orange'}`}>
                        {h.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
