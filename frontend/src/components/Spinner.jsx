// =====================================================================
// AdVia Frontend — Spinner
// The "route dot" loading indicator (see .spinner in index.css).
// =====================================================================
export default function Spinner({ size = 'md', onDark = false, label }) {
  const sizeClass = size === 'sm' ? 'spinner-sm' : '';
  const darkClass = onDark ? 'spinner-on-dark' : '';

  if (label) {
    return (
      <div className="page-loader">
        <div className={`spinner ${sizeClass} ${darkClass}`} />
        <span>{label}</span>
      </div>
    );
  }

  return <div className={`spinner ${sizeClass} ${darkClass}`} />;
}
