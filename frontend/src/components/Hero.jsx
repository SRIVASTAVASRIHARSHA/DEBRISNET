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
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">DebrisNet</h1>
        <h2 className="hero-subtitle">AI-Powered Space Debris Intelligence System</h2>
        <p className="hero-description">
          Tracking orbital objects, predicting trajectories, and analyzing collision risks using physics-based models and intelligent mission analysis.
        </p>
        
        <div className="hero-actions">
          <button className="btn-primary glowing-border" onClick={() => handleScroll('dashboard')}>
            Launch Dashboard
          </button>
          <button className="btn-secondary" onClick={() => handleScroll('analysis')}>
            Analyze Orbit
          </button>
        </div>
      </div>
      
      <div className="hero-visual">
        <div className="visual-placeholder">
          <div className="particle-earth"></div>
          <div className="orbit-ring ring-1"></div>
          <div className="orbit-ring ring-2"></div>
          <div className="orbit-ring ring-3"></div>
          <div className="satellite dot-1"></div>
          <div className="satellite dot-2"></div>
          <div className="satellite dot-3"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
