// =====================================================================
// AdVia Frontend — Advertiser Billing Page
// Lists invoices generated whenever a campaign is activated.
// =====================================================================
import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../../api/client';
import Spinner from '../../components/Spinner';

export default function AdvertiserBillingPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/advertisers/billing')
      .then((res) => setInvoices(res.data.invoices))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading invoices..." />;
  if (error) return <div className="form-error">{error}</div>;

  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0);
  const totalPending = invoices.filter((i) => i.status === 'pending').reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div className="flex-col gap-3">
      <div>
        <h1 style={{ fontSize: '1.6rem' }}>Billing</h1>
        <p className="text-muted" style={{ marginTop: 4 }}>Invoices generated when a campaign is activated.</p>
      </div>

      <div className="grid grid-2">
        <div className="stat-card">
          <div className="stat-label">Total paid</div>
          <div className="stat-value" style={{ color: 'var(--c-primary)' }}>₹{totalPaid.toLocaleString('en-IN')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending</div>
          <div className="stat-value" style={{ color: 'var(--c-accent)' }}>₹{totalPending.toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.05rem', marginBottom: 16 }}>Invoices</h3>
        {invoices.length === 0 ? (
          <p className="text-muted text-center" style={{ padding: '24px 0' }}>
            No invoices yet — these are created automatically when you activate a campaign.
          </p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Campaign</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 600 }}>INV-{String(inv.id).padStart(4, '0')}</td>
                    <td>{inv.campaignTitle}</td>
                    <td>{new Date(inv.issued_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td style={{ fontWeight: 600 }}>₹{Number(inv.amount).toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge ${inv.status === 'paid' ? 'badge-green' : 'badge-orange'}`}>
                        {inv.status === 'paid' ? 'Paid' : 'Pending'}
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
