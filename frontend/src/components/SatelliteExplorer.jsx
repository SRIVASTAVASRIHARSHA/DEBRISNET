import React, { useState, useEffect } from 'react';
import { getSatellites } from '../services/api';
import './SatelliteExplorer.css';

const SatelliteExplorer = ({ onSelectSatellite }) => {
  const [satellites, setSatellites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
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
      .filter((sat) => sat.name && sat.name.toLowerCase().includes(q))
      .slice(0, 20);
    setFilteredResults(matches);
  }, [searchQuery, satellites]);

  const handleTrack = (satellite) => {
    if (onSelectSatellite) {
      onSelectSatellite(satellite);
    }
  };

  return (
    <div className="satellite-explorer glass-panel">
      <h2 className="section-title">Satellite Explorer</h2>
      <p className="explorer-subtitle">
        Search the live catalog and track any satellite by name.
      </p>

      <div className="explorer-search-row">
        <input
          id="satellite-search-input"
          type="text"
          className="explorer-search-input"
          placeholder="Search satellites by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoComplete="off"
        />
        {searchQuery && (
          <button
            className="explorer-clear-btn"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
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
                <div key={sat.norad_id} className="explorer-card">
                  <div className="explorer-card-info">
                    <span className="explorer-sat-name">{sat.name}</span>
                    <span className="explorer-norad-id">NORAD #{sat.norad_id}</span>
                  </div>
                  <button
                    id={`track-btn-${sat.norad_id}`}
                    className="explorer-track-btn"
                    onClick={() => handleTrack(sat)}
                  >
                    Track
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
