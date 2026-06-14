// =====================================================================
// AdVia Frontend — New Campaign Modal
// A 4-step wizard:
//   0. AI Advisor  — optional, free recommendation based on business
//                     type + budget (calls POST /api/ai/advisor)
//   1. Campaign basics — title + target area
//   2. Vehicle & duration — type, count (slider), duration
//   3. Review & launch — shows live estimated cost, then
//                         POST /api/campaigns {activate: true}
//
// The AI step can pre-fill steps 2 & 3 with one click ("Use this
// recommendation"), but the advertiser can always override every field.
// =====================================================================
import { useEffect, useState } from 'react';
import { FaMagic, FaLightbulb } from 'react-icons/fa';
import api, { getErrorMessage } from '../../api/client';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';

const TARGET_AREAS = ['Sangli City', 'Miraj', 'Kupwad', 'Kolhapur', 'Pune', 'City-wide', 'Custom Route'];
const VEHICLE_TYPES = ['Auto-rickshaw', 'Taxi', 'Bike', 'Delivery Van', 'Mix (Auto + Bike)'];
const RATE_CARD = { 'Auto-rickshaw': 900, Taxi: 1200, Bike: 600, 'Delivery Van': 1000, 'Mix (Auto + Bike)': 750 };

const TOTAL_STEPS = 4; // 0-indexed: 0,1,2,3

export default function NewCampaignModal({ businessType, onClose, onCreated }) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  // --- AI advisor state ---
  const [budget, setBudget] = useState('');
  const [preferredArea, setPreferredArea] = useState('');
  const [advice, setAdvice] = useState(null);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [adviceError, setAdviceError] = useState('');

  // --- form state ---
  const [form, setForm] = useState({
    title: '',
    targetArea: TARGET_AREAS[0],
    vehicleType: VEHICLE_TYPES[0],
    vehicleCount: 10,
    durationMonths: 1,
  });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function fetchAdvice() {
    setAdviceLoading(true);
    setAdviceError('');
    try {
      const res = await api.post('/ai/advisor', {
        businessType,
        budget: budget ? Number(budget) : undefined,
        preferredArea,
      });
      setAdvice(res.data.recommendation);
    } catch (err) {
      setAdviceError(getErrorMessage(err));
    } finally {
      setAdviceLoading(false);
    }
  }

  function applyAdvice() {
    if (!advice) return;
    setForm((f) => ({
      ...f,
      vehicleType: advice.recommendedVehicleType,
      vehicleCount: advice.recommendedVehicleCount,
      durationMonths: advice.recommendedDuration,
      targetArea: TARGET_AREAS.includes(advice.recommendedArea) ? advice.recommendedArea : 'Custom Route',
    }));
    showToast('AI recommendation applied — adjust anything before launching.', 'success');
    setStep(1);
  }

  const estimatedCost = RATE_CARD[form.vehicleType] * Number(form.vehicleCount) * Number(form.durationMonths);

  async function handleLaunch() {
    setSubmitting(true);
    try {
      const res = await api.post('/campaigns', { ...form, activate: true });
      showToast(res.data.message, 'success');
      onCreated(res.data.campaign);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const stepTitles = ['AI Campaign Advisor', 'Campaign Basics', 'Vehicles & Duration', 'Review & Launch'];

  return (
    <Modal title={stepTitles[step]} onClose={onClose} maxWidth={560}>
      <div className="step-track">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} className={i <= step ? 'done' : ''} />
        ))}
      </div>

      {/* ---------------- STEP 0: AI ADVISOR ---------------- */}
      {step === 0 && (
        <div className="flex-col gap-2">
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            Tell us your monthly budget (optional) and AdVia&apos;s advisor will recommend the
            best vehicle type, count, and duration for a <strong>{businessType}</strong>.
          </p>

          <div className="grid grid-2" style={{ gap: 14 }}>
            <div className="field">
              <label>Monthly budget (₹, optional)</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 10000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Preferred area (optional)</label>
              <input
                placeholder="e.g. Station Road"
                value={preferredArea}
                onChange={(e) => setPreferredArea(e.target.value)}
              />
            </div>
          </div>

          <button className="btn btn-accent" onClick={fetchAdvice} disabled={adviceLoading}>
            {adviceLoading ? <Spinner size="sm" onDark /> : <><FaMagic /> Get AI Recommendation</>}
          </button>

          {adviceError && <div className="form-error">{adviceError}</div>}

          {advice && (
            <div className="card animate-fade-in-up" style={{ background: 'var(--c-primary-light)', border: 'none' }}>
              <div className="flex gap-1" style={{ alignItems: 'center', marginBottom: 10 }}>
                <FaLightbulb style={{ color: 'var(--c-primary-dark)' }} />
                <strong style={{ color: 'var(--c-primary-dark)' }}>Recommendation</strong>
              </div>
              <div className="grid grid-2" style={{ gap: 10, marginBottom: 12, fontSize: '0.88rem' }}>
                <Recommendation label="Vehicle type" value={advice.recommendedVehicleType} />
                <Recommendation label="Vehicle count" value={advice.recommendedVehicleCount} />
                <Recommendation label="Duration" value={`${advice.recommendedDuration} month(s)`} />
                <Recommendation label="Est. cost" value={`₹${advice.estimatedCost.toLocaleString('en-IN')}`} />
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--c-primary-dark)', marginBottom: 8 }}>
                {advice.recommendedArea}
              </p>
              <ul style={{ fontSize: '0.82rem', color: '#2D5043', paddingLeft: 18, marginBottom: 14 }}>
                {advice.tips.map((tip, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>{tip}</li>
                ))}
              </ul>
              <button className="btn btn-primary btn-sm" onClick={applyAdvice}>
                Use this recommendation →
              </button>
            </div>
          )}

          <div className="flex-between" style={{ marginTop: 8 }}>
            <span />
            <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>
              Skip — I&apos;ll set it up manually →
            </button>
          </div>
        </div>
      )}

      {/* ---------------- STEP 1: BASICS ---------------- */}
      {step === 1 && (
        <div className="flex-col gap-2">
          <div className="field">
            <label>Campaign title *</label>
            <input
              placeholder="e.g. Summer Offer — June"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              autoFocus
            />
          </div>
          <div className="field">
            <label>Target area *</label>
            <select value={form.targetArea} onChange={(e) => update('targetArea', e.target.value)}>
              {TARGET_AREAS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
          <StepNav
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
            nextDisabled={!form.title.trim()}
          />
        </div>
      )}

      {/* ---------------- STEP 2: VEHICLES & DURATION ---------------- */}
      {step === 2 && (
        <div className="flex-col gap-2">
          <div className="field">
            <label>Vehicle type</label>
            <select value={form.vehicleType} onChange={(e) => update('vehicleType', e.target.value)}>
              {VEHICLE_TYPES.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>
              Number of vehicles: <strong style={{ color: 'var(--c-primary)' }}>{form.vehicleCount}</strong>
            </label>
            <input
              type="range"
              min={1}
              max={100}
              step={1}
              value={form.vehicleCount}
              onChange={(e) => update('vehicleCount', Number(e.target.value))}
            />
            <div className="flex-between text-muted" style={{ fontSize: '0.75rem' }}>
              <span>1</span>
              <span>100</span>
            </div>
          </div>
          <div className="field">
            <label>Campaign duration</label>
            <select value={form.durationMonths} onChange={(e) => update('durationMonths', Number(e.target.value))}>
              {[1, 2, 3, 6, 12].map((m) => (
                <option key={m} value={m}>{m} month{m > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <StepNav onBack={() => setStep(1)} onNext={() => setStep(3)} />
        </div>
      )}

      {/* ---------------- STEP 3: REVIEW ---------------- */}
      {step === 3 && (
        <div className="flex-col gap-2">
          <div className="card" style={{ background: 'var(--c-bg)', border: 'none' }}>
            {[
              ['Title', form.title],
              ['Target Area', form.targetArea],
              ['Vehicle Type', form.vehicleType],
              ['No. of Vehicles', form.vehicleCount],
              ['Duration', `${form.durationMonths} month${form.durationMonths > 1 ? 's' : ''}`],
            ].map(([k, v]) => (
              <div key={k} className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--c-border)' }}>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>{k}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
          <div
            className="flex-between"
            style={{ background: 'var(--c-primary-light)', borderRadius: 10, padding: '14px 18px' }}
          >
            <span style={{ fontSize: '0.95rem', color: 'var(--c-primary-dark)', fontWeight: 500 }}>
              Estimated Total Cost
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--c-primary-dark)', fontFamily: 'var(--font-display)' }}>
              ₹{estimatedCost.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex gap-2" style={{ marginTop: 8 }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setStep(2)} disabled={submitting}>
              ← Back
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleLaunch} disabled={submitting}>
              {submitting ? <Spinner size="sm" onDark /> : '🚀 Launch Campaign'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Recommendation({ label, value }) {
  return (
    <div>
      <div className="text-muted" style={{ fontSize: '0.72rem' }}>{label}</div>
      <div style={{ fontWeight: 700, color: 'var(--c-primary-dark)' }}>{value}</div>
    </div>
  );
}

function StepNav({ onBack, onNext, nextDisabled }) {
  return (
    <div className="flex gap-2" style={{ marginTop: 8 }}>
      <button className="btn btn-outline" style={{ flex: 1 }} onClick={onBack}>
        ← Back
      </button>
      <button className="btn btn-primary" style={{ flex: 1 }} onClick={onNext} disabled={nextDisabled}>
        Continue →
      </button>
    </div>
  );
}
