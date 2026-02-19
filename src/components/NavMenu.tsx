import { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function NavMenu() {
  const [open, setOpen] = useState(false);

  return (
    <header className="nav-header">
      <h1 className="nav-title">💊 Medicine Reminder</h1>
      <button
        className="nav-hamburger"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        ☰
      </button>
      {open && (
        <nav className="nav-menu" onClick={() => setOpen(false)}>
          <NavLink to="/" className="nav-link">
            Upcoming
          </NavLink>
          <NavLink to="/medicines" className="nav-link">
            Manage Medicines
          </NavLink>
          <NavLink to="/audit" className="nav-link">
            History
          </NavLink>
          <NavLink to="/settings" className="nav-link">
            Settings
          </NavLink>
        </nav>
      )}
    </header>
  );
}
