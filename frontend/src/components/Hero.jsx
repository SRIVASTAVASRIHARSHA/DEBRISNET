import React from 'react';
import './Hero.css';

const Hero = () => {
  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-section" id="mission">

      {/* ── LEFT: Mission Overview ── */}
      <div className="hero-content">

        {/* Mission designation label */}
        <div className="hero-mission-label">
          <span className="hero-label-dot"></span>
          MISSION OVERVIEW — SSA PLATFORM
        </div>

        <h1 className="hero-title">DEBRISNET</h1>
        <p className="hero-subtitle">Space Situational Awareness Platform</p>

        <p className="hero-description">
          Physics-based orbital propagation, real-time conjunction analysis, and
          AI-powered mission intelligence for space debris monitoring and
          spacecraft safety operations.
        </p>

        {/* ── Mission Stats ── */}
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-value">20K+</span>
            <span className="hero-stat-label">Tracked Objects</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <span className="hero-stat-value">SGP4</span>
            <span className="hero-stat-label">Propagation Engine</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <span className="hero-stat-value">REAL-TIME</span>
            <span className="hero-stat-label">Analysis Mode</span>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="hero-actions">
          <button
            className="btn-primary"
            onClick={() => handleScroll('dashboard')}
          >
            Initialize Mission
          </button>
          <button
            className="btn-secondary"
            onClick={() => handleScroll('conjunction')}
          >
            View Analysis Console
          </button>
        </div>
      </div>

      {/* ── RIGHT: Orbital Blueprint Diagram ── */}
      <div className="hero-visual">

        {/* Schematic label */}
        <div className="schematic-label schematic-label-top">
          ORBITAL SCHEMATIC — LOW EARTH ORBIT
        </div>

        {/* Axis cross-hairs */}
        <div className="schematic-crosshair schematic-h"></div>
        <div className="schematic-crosshair schematic-v"></div>

        {/* Tick marks */}
        <div className="schematic-tick t1"></div>
        <div className="schematic-tick t2"></div>
        <div className="schematic-tick t3"></div>
        <div className="schematic-tick t4"></div>

        {/* Rotating diagram */}
        <div className="visual-placeholder">
          <div className="particle-earth">
            <span className="earth-label">EARTH</span>
          </div>

          <div className="orbit-ring ring-1">
            <span className="ring-label">LEO 550km</span>
          </div>
          <div className="orbit-ring ring-2"></div>
          <div className="orbit-ring ring-3">
            <span className="ring-label ring-label-right">MEO 2000km</span>
          </div>

          <div className="satellite dot-1">
            <span className="sat-label">ISS</span>
          </div>
          <div className="satellite dot-2"></div>
          <div className="satellite dot-3"></div>
        </div>

        {/* Bottom data strip */}
        <div className="schematic-label schematic-label-bottom">
          PROPAGATION: SGP4 / TLE EPOCH — LIVE DATA
        </div>
      </div>

    </section>
  );
};

export default Hero;
