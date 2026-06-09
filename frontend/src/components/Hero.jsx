import React from 'react';
import './Hero.css';
import HeroEarth from './HeroEarth';

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
        <p className="hero-subtitle">Space Situational Awareness System</p>

        <p className="hero-description">
          Real-time satellite tracking,
          orbital propagation,
          conjunction assessment,
          and mission intelligence platform.
        </p>

        {/* ── Mission Stats ── */}
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-value">20K+</span>
            <span className="hero-stat-label">TRACKED OBJECTS</span>
            <span className="hero-stat-sub">Public orbital catalog</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <span className="hero-stat-value">SGP4</span>
            <span className="hero-stat-label">PROPAGATION ENGINE</span>
            <span className="hero-stat-sub">Physics-based model</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <span className="hero-stat-value">LIVE TLE</span>
            <span className="hero-stat-label">DATA SOURCE</span>
            <span className="hero-stat-sub">Orbital element feed</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <span className="hero-stat-value">ACTIVE</span>
            <span className="hero-stat-label">MISSION STATUS</span>
            <span className="hero-stat-sub">Monitoring enabled</span>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="hero-actions">
          <button
            className="btn-primary"
            onClick={() => handleScroll('dashboard')}
          >
            INITIALIZE MISSION
          </button>
          <button
            className="btn-secondary"
            onClick={() => handleScroll('conjunction')}
          >
            OPEN ANALYSIS CONSOLE
          </button>
        </div>
      </div>

      {/* ── RIGHT: Orbital Blueprint Diagram ── */}
      <div className="hero-visual">
        <HeroEarth />
      </div>

    </section>
  );
};

export default Hero;
