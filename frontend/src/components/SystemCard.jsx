import React from 'react';
import './SystemCard.css';

const SystemCard = ({ title, description }) => {
  return (
    <div className="system-card glass-panel glowing-border">
      <div className="system-card-icon"></div>
      <h3 className="system-card-title">{title}</h3>
      <p className="system-card-desc">{description}</p>
    </div>
  );
};

export default SystemCard;
