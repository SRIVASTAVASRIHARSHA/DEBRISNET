import React, { useState, useEffect } from 'react';
import { getOrbitPrediction } from '../services/api';
import './OrbitPanel.css';

const OrbitPanel = ({ onPredict, onOrbitPath, trackedNoradId }) => {
  const [noradId, setNoradId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Loading messages for OrbitPanel
  const orbitMessages = [
    "Acquiring orbital elements...",
    "Propagating trajectory using SGP4...",
    "Computing orbital path..."
  ];
  const [orbitMsgIdx, setOrbitMsgIdx] = useState(0);
  const [orbitLoadingMsg, setOrbitLoadingMsg] = useState(orbitMessages[0]);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setOrbitMsgIdx(prev => {
          const next = (prev + 1) % orbitMessages.length;
          setOrbitLoadingMsg(orbitMessages[next]);
          return next;
        });
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setOrbitMsgIdx(0);
      setOrbitLoadingMsg(orbitMessages[0]);
    }
  }, [loading]);

  // When SatelliteExplorer fires a selection, auto-populate and predict
  useEffect(() => {
    if (trackedNoradId) {
      setNoradId(String(trackedNoradId));
      // small delay so state settles before the fetch
      setTimeout(() => triggerPredict(String(trackedNoradId)), 50);
    }
  }, [trackedNoradId]); // eslint-disable-line react-hooks/exhaustive-deps

  const triggerPredict = async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await getOrbitPrediction(id);
      // Handle case where API returns no positions (object not found)
      if (!result || !result.positions || result.positions.length === 0) {
        setError('Orbital object not found in public catalog.');
        setLoading(false);
        return;
      }
      setData(result);
      if (result.positions && result.positions.length > 0) {
        // Send first position to satellite marker
        if (onPredict) {
          const { latitude, longitude, altitude } = result.positions[0];
          onPredict({ latitude, longitude, altitude });
        }
        // Send full positions array for orbit trail rendering
        if (onOrbitPath) {
          onOrbitPath(result.positions);
        }
      }
    } catch (err) {
      setError('Failed to fetch orbit data');
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    // Validation for NORAD ID input
    if (!noradId) {
      setError('Please enter NORAD catalog ID.');
      return;
    }
    if (!/^\d+$/.test(noradId)) {
      setError('Invalid NORAD ID. NORAD catalog numbers contain digits only.');
      return;
    }
    if (noradId.length > 6) {
      setError('NORAD catalog ID format is invalid.');
      return;
    }
    // Clear previous errors before proceeding
    setError(null);
    triggerPredict(noradId);
  };

  return (
    <div className="orbit-panel mission-module">
      <div className="module-header">
        <span className="module-id">MODULE DBN-02</span>
        <h2 className="section-title">ORBIT PROPAGATION CONSOLE</h2>
      </div>

      <div className="module-status-area">
        <div className="status-item">
          <span className="status-label">ENGINE</span>
          <span className="status-value">SGP4</span>
        </div>
        <div className="status-item">
          <span className="status-label">REFERENCE FRAME</span>
          <span className="status-value">TEME</span>
        </div>
        <div className="status-item">
          <span className="status-label">STATUS</span>
          <span className="status-value trackable">READY</span>
        </div>
      </div>

      <div className="orbit-input-area">
        <label className="search-label">CATALOG OBJECT ID</label>
        <div className="orbit-input-row">
          <input
            type="text"
            className="orbit-search-input"
            placeholder="[NORAD ID]"
            value={noradId}
            onChange={(e) => setNoradId(e.target.value)}
          />
          <button className="orbit-predict-btn" onClick={handlePredict} disabled={loading}>
            [COMPUTE]
          </button>
        </div>
      </div>

      {/* Empty state when no data */}
      {!data && !loading && !error && (
        <p className="empty-state">
          Awaiting Orbital Target<br />
          Enter a NORAD catalog ID or select a satellite from the live catalog to begin SGP4 orbit propagation.
        </p>
      )}

      {loading && (
        <p className="orbit-status-msg">● {orbitLoadingMsg}</p>
      )}
      
      {error && <p className="orbit-error-msg">⚠ {error}</p>}

      {data && (
        <div className="orbit-result">
          <p className="telemetry-header">TELEMETRY DATA // ID: {data.norad_id || noradId}</p>
          {data.positions && data.positions.length > 0 ? (
            <div className="telemetry-grid">
              <div className="telemetry-card blueprint-card">
                <span className="data-label">LATITUDE</span>
                <span className="data-value telemetry-value">{Number(data.positions[0].latitude).toFixed(4)}°</span>
              </div>
              <div className="telemetry-card blueprint-card">
                <span className="data-label">LONGITUDE</span>
                <span className="data-value telemetry-value">{Number(data.positions[0].longitude).toFixed(4)}°</span>
              </div>
              <div className="telemetry-card blueprint-card">
                <span className="data-label">ALTITUDE</span>
                <span className="data-value telemetry-value">{Number(data.positions[0].altitude).toFixed(2)} KM</span>
              </div>
              <div className="telemetry-card blueprint-card">
                <span className="data-label">TIMESTAMP</span>
                <span className="data-value telemetry-value">{new Date(data.positions[0].time).toLocaleTimeString()}</span>
              </div>
            </div>
          ) : (
            <p className="empty-state">No orbit positions available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default OrbitPanel;
