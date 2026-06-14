// =====================================================================
// AdVia Frontend — Landing Page
// The public marketing page: hero, live stats, feature grid, how it
// works (driver + advertiser flows), pricing, and a closing CTA.
// Built with scroll-reveal animations via useReveal().
// =====================================================================
import { Link } from 'react-router-dom';
import {
  FaMapMarkedAlt,
  FaBell,
  FaMoneyBillWave,
  FaChartLine,
  FaPrint,
  FaShieldAlt,
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useReveal from '../hooks/useReveal';

const STATS = [
  { value: '2,400+', label: 'Vehicles registered' },
  { value: '340+', label: 'Active advertisers' },
  { value: '18M+', label: 'Daily impressions' },
  { value: '₹40L+', label: 'Paid to drivers' },
];

const FEATURES = [
  { icon: <FaMapMarkedAlt />, title: 'Route Targeting', desc: 'Advertisers pick specific areas, routes, and vehicle types for precision reach.' },
  { icon: <FaBell />, title: 'Job Notifications', desc: 'Drivers get instant alerts for new campaigns matching their route — accept in one tap.' },
  { icon: <FaMoneyBillWave />, title: 'Instant Payouts', desc: 'Vehicle owners receive timely payments directly to their UPI account, automatically.' },
  { icon: <FaChartLine />, title: 'Live Analytics', desc: 'Track impressions, QR scans, and campaign reach in real time on your dashboard.' },
  { icon: <FaPrint />, title: 'AI Campaign Advisor', desc: 'Get an instant, free recommendation on vehicle type, count, and budget for your business.' },
  { icon: <FaShieldAlt />, title: 'Verified Network', desc: 'Driver KYC, RC and license verification builds trust for every advertiser.' },
];

const ADVERTISER_STEPS = [
  { step: '01', title: 'Create an account', desc: 'Sign up as a business and tell us about your target audience.' },
  { step: '02', title: 'Get an AI recommendation', desc: 'Our advisor suggests the best vehicle type, count, and area for your budget.' },
  { step: '03', title: 'Launch & track', desc: 'Activate your campaign, then watch impressions and QR scans roll in live.' },
];

const DRIVER_STEPS = [
  { step: '01', title: 'Register your vehicle', desc: 'Submit your vehicle number, type, and usual route online — takes minutes.' },
  { step: '02', title: 'Get matched to campaigns', desc: 'Receive job notifications that match your route and vehicle type.' },
  { step: '03', title: 'Display & earn', desc: 'Accept the job, we install the ad, and payments land in your UPI automatically.' },
];

function Reveal({ children, delay = 0, className = '' }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ '--delay': `${delay}s` }}>
      {children}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--c-navy)', color: 'var(--c-navy-text)' }}>
      <Navbar />

      {/* ---------------------------------------------------------- HERO */}
      <section className="container" style={{ paddingTop: 72, paddingBottom: 56 }}>
        <div
          className="grid grid-2"
          style={{ gap: 56, alignItems: 'center' }}
        >
          <div className="animate-fade-in-up">
            <span className="badge badge-green" style={{ marginBottom: 16 }}>
              🟢 Live in Sangli, Kolhapur &amp; Pune
            </span>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', marginBottom: 18, color: '#fff' }}>
              Your brand on <br />
              <span style={{ color: 'var(--c-primary)' }}>every street</span> in town
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--c-navy-muted)', marginBottom: 32, maxWidth: 480 }}>
              AdVia connects local businesses with auto-rickshaws, taxis, and delivery
              vehicles — turning daily routes into powerful, trackable advertisements.
            </p>
            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
              <Link to="/register?role=advertiser" className="btn btn-primary">
                Launch a Campaign
              </Link>
              <Link to="/register?role=driver" className="btn btn-on-dark btn-outline">
                Register My Vehicle
              </Link>
            </div>
          </div>

          {/* Hero preview card */}
          <div className="animate-float">
            <div
              style={{
                background: 'var(--c-navy-card)',
                border: '1px solid var(--c-navy-border)',
                borderRadius: 20,
                padding: 28,
              }}
            >
              <div
                style={{
                  background: 'linear-gradient(135deg, var(--c-primary), var(--c-primary-dark))',
                  borderRadius: 14,
                  padding: '16px 20px',
                  marginBottom: 16,
                  color: '#fff',
                }}
              >
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: 4 }}>Active Campaign</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>Sharma Medicals — Sangli City</div>
                <div className="flex gap-2" style={{ marginTop: 10, fontSize: '0.85rem', opacity: 0.9 }}>
                  <span>🚗 24 vehicles</span>
                  <span>👁 12,400 views today</span>
                </div>
              </div>

              {[
                { id: 'MH11-AK-4521', type: 'Auto', area: 'Miraj Road', status: 'Active', pay: '₹900/mo' },
                { id: 'MH11-BT-7832', type: 'Taxi', area: 'Station Rd', status: 'Active', pay: '₹1,200/mo' },
                { id: 'MH11-CC-1190', type: 'Bike', area: 'Vishrambaug', status: 'Pending', pay: '₹500/mo' },
              ].map((v, i) => (
                <div
                  key={i}
                  className="flex-between"
                  style={{
                    padding: '12px 0',
                    borderBottom: i < 2 ? '1px solid var(--c-navy-border)' : 'none',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>{v.id}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--c-navy-muted)' }}>
                      {v.type} · {v.area}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${v.status === 'Active' ? 'badge-green' : 'badge-orange'}`}>
                      {v.status}
                    </span>
                    <div style={{ fontSize: '0.8rem', color: 'var(--c-primary)', fontWeight: 600, marginTop: 4 }}>
                      {v.pay}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- STATS */}
      <section style={{ background: 'var(--c-primary)' }}>
        <Reveal>
          <div className="container" style={{ padding: '40px 24px' }}>
            <div className="grid grid-4" style={{ textAlign: 'center' }}>
              {STATS.map((s, i) => (
                <div key={i}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.1rem', fontWeight: 700, color: '#fff' }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------- FEATURES */}
      <section className="section">
        <div className="container">
          <Reveal className="text-center" delay={0}>
            <span className="badge badge-green" style={{ marginBottom: 14 }}>Platform Features</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#fff', marginBottom: 48 }}>
              Everything you need to run moving ads
            </h2>
          </Reveal>
          <div className="grid grid-3">
            {FEATURES.map((f, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div
                  className="card card-hover"
                  style={{ background: 'var(--c-navy-card)', border: '1px solid var(--c-navy-border)', height: '100%' }}
                >
                  <div style={{ fontSize: '1.6rem', color: 'var(--c-primary)', marginBottom: 12 }}>{f.icon}</div>
                  <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--c-navy-muted)', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- HOW IT WORKS */}
      <section className="section" style={{ background: 'var(--c-navy-card)' }}>
        <div className="container">
          <Reveal className="text-center">
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#fff', marginBottom: 48 }}>
              How AdVia works
            </h2>
          </Reveal>
          <div className="grid grid-2" style={{ gap: 56 }}>
            <Reveal>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--c-primary)',
                  letterSpacing: 1.5,
                  marginBottom: 20,
                }}
              >
                FOR ADVERTISERS
              </div>
              {ADVERTISER_STEPS.map((s, i) => (
                <div key={i} className="flex gap-2" style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      background: 'var(--c-primary)',
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      flexShrink: 0,
                    }}
                  >
                    {s.step}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', marginBottom: 4 }}>{s.title}</div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--c-navy-muted)', lineHeight: 1.6 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </Reveal>
            <Reveal delay={0.1}>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--c-accent)',
                  letterSpacing: 1.5,
                  marginBottom: 20,
                }}
              >
                FOR VEHICLE OWNERS
              </div>
              {DRIVER_STEPS.map((s, i) => (
                <div key={i} className="flex gap-2" style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      background: 'var(--c-accent)',
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      flexShrink: 0,
                    }}
                  >
                    {s.step}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', marginBottom: 4 }}>{s.title}</div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--c-navy-muted)', lineHeight: 1.6 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- AI ADVISOR TEASER */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, var(--c-navy-card), var(--c-navy-card-light))',
                border: '1px solid var(--c-navy-border)',
                padding: '40px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 28,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ maxWidth: 520 }}>
                <span className="badge badge-orange" style={{ marginBottom: 14 }}>Free · No sign-up needed for a preview</span>
                <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)', color: '#fff', marginBottom: 12 }}>
                  Not sure where to start? Ask the AI Campaign Advisor.
                </h2>
                <p style={{ color: 'var(--c-navy-muted)', lineHeight: 1.6 }}>
                  Tell us your business type and budget — our advisor instantly recommends
                  the best vehicle type, count, area, and duration for your first campaign.
                </p>
              </div>
              <Link to="/register?role=advertiser" className="btn btn-primary">
                Try the AI Advisor →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- CTA */}
      <section className="section text-center" style={{ background: '#0A1620' }}>
        <Reveal>
          <div className="container">
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#fff', marginBottom: 14 }}>
              Ready to put your brand in motion?
            </h2>
            <p style={{ color: 'var(--c-navy-muted)', marginBottom: 32 }}>
              Join hundreds of businesses already advertising on AdVia.
            </p>
            <div className="flex gap-2" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register?role=advertiser" className="btn btn-primary">
                Start a Campaign
              </Link>
              <Link to="/register?role=driver" className="btn btn-on-dark btn-outline">
                Register Vehicle
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
