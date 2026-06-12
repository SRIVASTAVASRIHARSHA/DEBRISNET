import React, { useState, useEffect } from 'react';
import { getSatellites } from '../services/api';
import './SatelliteExplorer.css';

const SatelliteExplorer = ({ onSelectSatellite, searchQuery, onSearchChange }) => {
  const [satellites, setSatellites] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  // searchQuery and onSearchChange are controlled via props
  const [error, setError] = useState(null);

  // Fetch all satellites on mount
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getSatellites();
        setSatellites(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load satellite catalog.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter whenever query or satellite list changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredResults(satellites.slice(0, 20));
      return;
    }
    const q = searchQuery.toLowerCase();
    const matches = satellites
      .filter((sat) => sat.name && sat.name.toLowerCase().startsWith(q))
      .slice(0, 20);
    setFilteredResults(matches);
  }, [searchQuery, satellites]);

  const handleTrack = (satellite) => {
    if (onSelectSatellite) {
      onSelectSatellite(satellite);
    }
  };

  return (
    <div className="satellite-explorer mission-module">
      <div className="module-header">
        <span className="module-id">MODULE DBN-01</span>
        <h2 className="section-title">SATELLITE CATALOG TERMINAL</h2>
      </div>

      <div className="module-status-area">
        <div className="status-item">
          <span className="status-label">DATA FEED</span>
          <span className="status-value live">● LIVE TLE</span>
        </div>
        <div className="status-item">
          <span className="status-label">OBJECT DATABASE</span>
          <span className="status-value">20K+ OBJECTS</span>
        </div>
      </div>

      <div className="explorer-search-area">
        <label className="search-label">CATALOG QUERY</label>
        <div className="explorer-search-row">
          <input
            id="satellite-search-input"
            type="text"
            className="explorer-search-input"
            placeholder="[NORAD / Satellite Name]"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            autoComplete="off"
          />
          {searchQuery && (
            <button
              className="explorer-clear-btn"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {loading && (
        <p className="explorer-status-msg">Loading satellite catalog...</p>
      )}
      {error && <p className="explorer-error-msg">{error}</p>}

      {!loading && !error && (
        <>
          <p className="explorer-count">
            Showing {filteredResults.length} result
            {filteredResults.length !== 1 ? 's' : ''}
            {searchQuery ? ` for "${searchQuery}"` : ' (top 20)'}
          </p>

          {filteredResults.length === 0 ? (
            <p className="explorer-empty-msg">No satellites match your search.</p>
          ) : (
            <div className="explorer-results">
              {filteredResults.map((sat) => (
                <div key={sat.norad_id} className="explorer-card blueprint-card">
                  <div className="card-data-row">
                    <span className="data-label">OBJECT NAME</span>
                    <span className="data-value">{sat.name}</span>
                  </div>
                  <div className="card-data-row">
                    <span className="data-label">NORAD ID</span>
                    <span className="data-value">{sat.norad_id}</span>
                  </div>
                  <div className="card-data-row">
                    <span className="data-label">STATUS</span>
                    <span className="data-value trackable">TRACKABLE</span>
                  </div>
                  <button
                    id={`track-btn-${sat.norad_id}`}
                    className="explorer-track-btn"
                    onClick={() => handleTrack(sat)}
                  >
                    [TRACK OBJECT]
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SatelliteExplorer;
