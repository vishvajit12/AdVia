// =====================================================================
// AdVia Frontend — Modal
// A simple, reusable modal shell with overlay click-to-close and an
// optional title bar with a close (×) button.
// =====================================================================
import { useEffect } from 'react';

export default function Modal({ title, onClose, children, maxWidth }) {
  // Close on Escape key.
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={maxWidth ? { maxWidth } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex-between" style={{ marginBottom: 18 }}>
            <h3 style={{ fontSize: '1.25rem' }}>{title}</h3>
            <button className="modal-close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
