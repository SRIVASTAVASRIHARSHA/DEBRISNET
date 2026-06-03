import React from 'react';
import './ModuleCard.css';

const ModuleCard = ({ title, status }) => {
    return (
        <div className="module-card">
            <h3 className="module-title">{title}</h3>
            <div className={`module-status ${status.toLowerCase()}`}>
                <span className="status-indicator"></span>
                {status}
            </div>
        </div>
    );
};

export default ModuleCard;
