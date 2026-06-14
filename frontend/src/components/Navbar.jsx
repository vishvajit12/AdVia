// =====================================================================
// AdVia Frontend — Navbar (public/marketing pages)
// =====================================================================
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import AdViaLogo from '../assets/AdViaLogo.svg';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleDashboard() {
    navigate(user ? `/${user.role}/dashboard` : '/login');
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 1180 }}>
        <Link to="/" className="brand">
          <img src={AdViaLogo} alt="AdVia" className="brand-logo" />
          AdVia
        </Link>

        <button
          className="btn btn-ghost"
          style={{ display: 'none', color: '#fff' }}
          id="navbar-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>

        <div className="flex gap-2" id="navbar-links" style={open ? { display: 'flex' } : undefined}>
          {user ? (
            <>
              <button className="btn btn-on-dark btn-outline" onClick={handleDashboard}>
                My Dashboard
              </button>
              <button className="btn btn-ghost" style={{ color: '#fff' }} onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost" style={{ color: '#fff' }}>
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started →
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
