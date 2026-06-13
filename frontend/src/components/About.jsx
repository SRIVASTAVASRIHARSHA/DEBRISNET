import React from 'react';
import './About.css';

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="about-header">
        <h2 className="about-title">ABOUT DEBRISNET</h2>
        <div className="about-subtitle">Orbital Intelligence & Space Situational Awareness Platform</div>
      </div>

      <div className="about-block">
        <h3>WHAT IS DEBRISNET?</h3>
        <p className="about-text">
          DebrisNet is an orbital intelligence platform designed to track satellites, predict orbital motion, and analyze possible close approaches between objects in Earth orbit.
        </p>
        <p className="about-text">
          As the number of satellites and space debris objects increases, understanding orbital traffic becomes important for safer space operations.
        </p>
        <p className="about-text">
          DebrisNet transforms complex orbital mechanics into an interactive mission-control experience.
        </p>
      </div>

      <div className="about-block">
        <h3>HOW TO USE THE PLATFORM</h3>
        <div className="about-steps">
          <div className="about-step glass-panel glowing-border">
            <h4>1. SATELLITE TRACKING</h4>
            <p className="about-text">Search and monitor satellites using real orbital data.</p>
          </div>
          <div className="about-step glass-panel glowing-border">
            <h4>2. ORBIT ANALYSIS</h4>
            <p className="about-text">Visualize satellite paths around Earth and understand future movement.</p>
          </div>
          <div className="about-step glass-panel glowing-border">
            <h4>3. CONJUNCTION ANALYSIS</h4>
            <p className="about-text">Select two orbital objects.<br/><br/>DebrisNet predicts closest approach distance, encounter time, and collision risk.</p>
          </div>
          <div className="about-step glass-panel glowing-border">
            <h4>4. MISSION REPORTS</h4>
            <p className="about-text">Generate readable intelligence reports from orbital analysis results.</p>
          </div>
        </div>
      </div>

      <div className="about-block">
        <h3>TECHNOLOGY BEHIND DEBRISNET</h3>
        <div className="about-cards">
          <div className="about-card glass-panel glowing-border">
            <h4>LIVE TLE DATA</h4>
            <p className="about-text">Uses Two Line Element orbital data to understand satellite positions.</p>
          </div>
          <div className="about-card glass-panel glowing-border">
            <h4>SGP4 PROPAGATION ENGINE</h4>
            <p className="about-text">DebrisNet uses the SGP4 (Simplified General Perturbations 4) orbital model used in real aerospace systems to calculate satellite trajectories.</p>
          </div>
          <div className="about-card glass-panel glowing-border">
            <h4>CONJUNCTION INTELLIGENCE</h4>
            <p className="about-text">The system compares future orbital paths to detect possible close approaches between satellites.</p>
          </div>
          <div className="about-card glass-panel glowing-border">
            <h4>3D ORBIT VISUALIZATION</h4>
            <p className="about-text">Interactive Earth simulation showing orbital paths, satellite motion, and mission scenarios.</p>
          </div>
          <div className="about-card glass-panel glowing-border">
            <h4>AI MISSION ANALYST</h4>
            <p className="about-text">Converts technical orbital results into understandable mission intelligence.</p>
          </div>
          <div className="about-card glass-panel glowing-border">
            <h4>SIMULATED MISSION TIME</h4>
            <p className="about-text">DebrisNet uses accelerated mission time simulation.<br/><br/>Earth rotation and satellite motion remain physically proportional while allowing users to observe orbital behavior faster.</p>
          </div>
        </div>
      </div>

      <div className="about-block">
        <h3>WHY DEBRISNET MATTERS</h3>
        <p className="about-text">
          Modern space contains thousands of active satellites and debris objects.
        </p>
        <p className="about-text">
          Collision prediction and orbital awareness are important challenges for future space missions.
        </p>
        <p className="about-text">
          DebrisNet demonstrates how computer science, orbital physics, and artificial intelligence can work together to support next-generation space operations.
        </p>
      </div>

      <div className="about-footer">
        <p>Designed & Developed By</p>
        <span>SRI VASTAVA SRI HARSHA</span>
      </div>
    </section>
  );
};

export default About;
