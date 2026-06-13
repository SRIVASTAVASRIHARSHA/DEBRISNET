import React from 'react';
import './ModuleCard.css';

const ModuleCard = ({ title = "UNKNOWN", status = "UNKNOWN" }) => {
  const safeStatus = (status || "UNKNOWN").toString();
  const safeTitle = (title || "UNKNOWN").toString();
  return (
    <div className="module-card">
      <h3 className="module-title">{safeTitle}</h3>
      <div className={`module-status ${safeStatus.toLowerCase()}`}>
        <span className="status-indicator"></span>
        {safeStatus}
      </div>
    </div>
  );
};

export default ModuleCard;
