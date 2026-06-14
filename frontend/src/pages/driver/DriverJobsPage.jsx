// =====================================================================
// AdVia Frontend — Driver Job Offers Page
// Lists all job offers (new, accepted, declined). Accept/Decline calls
// PUT /api/drivers/jobs/:jobId and optimistically updates the row.
// =====================================================================
import { useEffect, useState } from 'react';
import { FaMapMarkerAlt, FaClock, FaTruck } from 'react-icons/fa';
import api, { getErrorMessage } from '../../api/client';
import Spinner from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';
import { EmptyState } from './DriverDashboardPage';

const STATUS_BADGE = {
  offered: 'badge-orange',
  accepted: 'badge-green',
  declined: 'badge-gray',
  completed: 'badge-blue',
};

export default function DriverJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [respondingId, setRespondingId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  function fetchJobs() {
    setLoading(true);
    api
      .get('/drivers/jobs')
      .then((res) => setJobs(res.data.jobs))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  async function respond(jobId, action) {
    setRespondingId(jobId);
    try {
      const res = await api.put(`/drivers/jobs/${jobId}`, { action });
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: res.data.status } : j)));
      showToast(
        action === 'accept' ? 'Job accepted — it now appears on your dashboard!' : 'Job declined.',
        action === 'accept' ? 'success' : 'info'
      );
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setRespondingId(null);
    }
  }

  if (loading) return <Spinner label="Loading job offers..." />;
  if (error) return <div className="form-error">{error}</div>;

  const newOffers = jobs.filter((j) => j.status === 'offered');
  const otherJobs = jobs.filter((j) => j.status !== 'offered');

  return (
    <div className="flex-col gap-3">
      <div>
        <h1 style={{ fontSize: '1.6rem' }}>Job Offers</h1>
        <p className="text-muted" style={{ marginTop: 4 }}>
          Campaigns looking for vehicles matching your route and type.
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="card">
          <EmptyState text="No job offers yet. Check back soon — new campaigns are matched automatically!" />
        </div>
      ) : (
        <div className="flex-col gap-2">
          {newOffers.map((job) => (
            <JobCard key={job.id} job={job} onRespond={respond} responding={respondingId === job.id} highlight />
          ))}
          {otherJobs.map((job) => (
            <JobCard key={job.id} job={job} onRespond={respond} responding={respondingId === job.id} />
          ))}
        </div>
      )}
    </div>
  );
}

function JobCard({ job, onRespond, responding, highlight }) {
  return (
    <div className="card card-hover" style={highlight ? { borderColor: 'var(--c-accent)' } : undefined}>
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div className="flex gap-1" style={{ alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>{job.business_name}</span>
            <span className={`badge ${STATUS_BADGE[job.status]}`}>
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </span>
          </div>
          <div className="text-muted flex-col gap-1" style={{ fontSize: '0.88rem' }}>
            <span className="flex gap-1" style={{ alignItems: 'center' }}>
              <FaMapMarkerAlt /> {job.target_area}
            </span>
            <span className="flex gap-1" style={{ alignItems: 'center' }}>
              <FaTruck /> Vehicle: {job.vehicle_type} &nbsp;·&nbsp; <FaClock /> Duration: {job.duration_months} month
              {job.duration_months > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="flex-col gap-2" style={{ alignItems: 'flex-end' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--c-primary)', fontFamily: 'var(--font-display)' }}>
            ₹{Number(job.monthly_pay).toLocaleString('en-IN')}/mo
          </div>
          {job.status === 'offered' && (
            <div className="flex gap-1">
              <button
                className="btn btn-primary btn-sm"
                disabled={responding}
                onClick={() => onRespond(job.id, 'accept')}
              >
                {responding ? <Spinner size="sm" onDark /> : 'Accept'}
              </button>
              <button
                className="btn btn-ghost btn-sm"
                disabled={responding}
                onClick={() => onRespond(job.id, 'decline')}
              >
                Decline
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
