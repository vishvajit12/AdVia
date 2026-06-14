// =====================================================================
// AdVia Frontend — Footer (marketing pages)
// =====================================================================
import AdViaLogo from '../assets/AdViaLogo.svg';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--c-navy)', borderTop: '1px solid var(--c-navy-border)', padding: '28px 0' }}>
      <div className="container flex-between" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div className="flex gap-1" style={{ alignItems: 'center', color: 'var(--c-navy-text)' }}>
          <img src={AdViaLogo} alt="AdVia" style={{ width: '24px', height: '24px' }} />
          <strong style={{ fontFamily: 'var(--font-display)' }}>AdVia</strong>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--c-navy-muted)' }}>
          © {new Date().getFullYear()} AdVia · Built for Sangli. Scaling India.
        </p>
      </div>
    </footer>
  );
}
