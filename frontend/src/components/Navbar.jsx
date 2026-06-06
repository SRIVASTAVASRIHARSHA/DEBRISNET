import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* LEFT — Brand identity */}
        <div className="navbar-brand">
          <div className="navbar-brand-mark"></div>
          <div className="navbar-brand-text">
            <span className="navbar-brand-name">DEBRISNET</span>
            <span className="navbar-brand-sub">Orbital Intelligence Platform</span>
          </div>
        </div>

        {/* CENTER — Mission navigation */}
        <div className="navbar-links">
          <button className="nav-link" onClick={() => document.getElementById("mission")?.scrollIntoView({behavior:"smooth"})}>
            Mission
          </button>
          <button className="nav-link" onClick={() => document.getElementById("dashboard")?.scrollIntoView({behavior:"smooth"})}>
            Tracking
          </button>
          <button className="nav-link" onClick={() => document.getElementById("conjunction")?.scrollIntoView({behavior:"smooth"})}>
            Conjunction
          </button>
          <button className="nav-link" onClick={() => document.getElementById("ai")?.scrollIntoView({behavior:"smooth"})}>
            AI Analyst
          </button>
        </div>

        {/* RIGHT — System telemetry */}
        <div className="navbar-telemetry">
          <div className="telemetry-item">
            <span className="telemetry-dot"></span>
            <span className="telemetry-label">LIVE TLE</span>
          </div>
          <div className="telemetry-item">
            <span className="telemetry-label">SGP4 ACTIVE</span>
          </div>
          <div className="telemetry-item telemetry-online">
            <span className="telemetry-dot green"></span>
            <span className="telemetry-label">ONLINE</span>
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
