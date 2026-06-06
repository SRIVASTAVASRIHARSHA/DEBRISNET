import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container">
        <div className="navbar-logo">
          DebrisNet
        </div>
        <div className="navbar-links">
          <button className="nav-link" onClick={() => document.getElementById("mission")?.scrollIntoView({behavior:"smooth"})}>Mission</button>
          <button className="nav-link" onClick={() => document.getElementById("dashboard")?.scrollIntoView({behavior:"smooth"})}>Tracking</button>
          <button className="nav-link" onClick={() => document.getElementById("conjunction")?.scrollIntoView({behavior:"smooth"})}>Conjunction</button>
          <button className="nav-link" onClick={() => document.getElementById("ai")?.scrollIntoView({behavior:"smooth"})}>AI Analyst</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
