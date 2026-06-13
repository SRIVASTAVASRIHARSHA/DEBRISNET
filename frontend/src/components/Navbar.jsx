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
        <div className="navbar-mission-id">
          <span className="mission-label">MISSION ID:</span>
          <span className="mission-value">DBN-OPS-01</span>
        </div>
      </div>

      {/* CENTER — Mission navigation */}
      <div className="navbar-links">
        <button className="nav-link" onClick={() => document.getElementById("mission")?.scrollIntoView({behavior:"smooth"})}>
          MISSION
        </button>
        <button className="nav-link" onClick={() => document.getElementById("dashboard")?.scrollIntoView({behavior:"smooth"})}>
          TRACKING
        </button>
        <button className="nav-link" onClick={() => document.getElementById("ai")?.scrollIntoView({behavior:"smooth"})}>
          ORBIT ANALYSIS
        </button>
        <button className="nav-link" onClick={() => document.getElementById("conjunction")?.scrollIntoView({behavior:"smooth"})}>
          CONJUNCTION
        </button>
        <button className="nav-link" onClick={() => document.getElementById("reports")?.scrollIntoView({behavior:"smooth"})}>
          REPORTS
        </button>
        <button className="nav-link" onClick={() => document.getElementById("about")?.scrollIntoView({behavior:"smooth"})}>
          ABOUT
        </button>
      </div>

      {/* RIGHT — System telemetry */}
      <div className="navbar-telemetry">
        <div className="telemetry-group">
          <span className="telemetry-group-label">SYSTEM</span>
          <div className="telemetry-item telemetry-online">
            <span className="telemetry-dot green"></span>
            <span className="telemetry-label">ONLINE</span>
          </div>
        </div>
        <div className="telemetry-group">
          <span className="telemetry-group-label">DATA SOURCE</span>
          <div className="telemetry-item">
            <span className="telemetry-label">LIVE TLE</span>
          </div>
        </div>
        <div className="telemetry-group">
          <span className="telemetry-group-label">ENGINE</span>
          <div className="telemetry-item">
            <span className="telemetry-label">SGP4 ACTIVE</span>
          </div>
        </div>
      </div>

      </div>
    </nav>
  );
};

export default Navbar;
