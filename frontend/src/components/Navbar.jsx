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
          <a href="#mission" className="nav-link">Mission</a>
          <a href="#tracking" className="nav-link">Tracking</a>
          <a href="#conjunction" className="nav-link">Conjunction</a>
          <a href="#analyst" className="nav-link">AI Analyst</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
