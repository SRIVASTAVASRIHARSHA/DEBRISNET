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
    "🛰️ Acquiring orbital elements...",
    "🌎 Propagating trajectory using SGP4...",
    "📡 Computing orbital path..."
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
    <div className="orbit-panel glass-panel">
      <h2 className="section-title">Orbit Prediction</h2>
      <div className="input-group">
        <input
          type="text"
          placeholder="NORAD ID"
          value={noradId}
          onChange={(e) => setNoradId(e.target.value)}
        />
        <button className="btn-primary" onClick={handlePredict} disabled={loading}>
          Predict Orbit
        </button>
      </div>
      {/* Empty state when no data */}
      {!data && !loading && !error && (
        <p className="empty-state" style={{ textAlign: 'center', color: '#aaa', marginTop: '1rem' }}>
          Awaiting Orbital Target<br />
          Enter a NORAD catalog ID or select a satellite from the live catalog to begin SGP4 orbit propagation.
        </p>
      )}
      {loading && (
          <p className="status-msg">{orbitLoadingMsg}</p>
        )}{error && <p className="error-msg">{error}</p>}
      {data && (
          <div className="orbit-result">
            <p><strong>Satellite ID:</strong> {data.norad_id || noradId}</p>
            {data.positions && data.positions.length > 0 ? (
              <>
                <p><strong>Latitude:</strong> {data.positions[0].latitude}</p>
                <p><strong>Longitude:</strong> {data.positions[0].longitude}</p>
                <p><strong>Altitude:</strong> {data.positions[0].altitude} km</p>
                <p><strong>Timestamp:</strong> {data.positions[0].time}</p>
              </>
            ) : (
              <p>No orbit positions available</p>
            )}
          </div>
        )}
    </div>
  );
};

export default OrbitPanel;
