import React, { useState } from 'react';
import { getOrbitPrediction } from '../services/api';
import './OrbitPanel.css';

const OrbitPanel = () => {
  const [noradId, setNoradId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async () => {
    if (!noradId) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await getOrbitPrediction(noradId);
      setData(result);
    } catch (err) {
      setError('Failed to fetch orbit data');
    } finally {
      setLoading(false);
    }
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
      {loading && <p className="status-msg">Analyzing...</p>}
      {error && <p className="error-msg">{error}</p>}
      {data && (
        <div className="orbit-result">
          <p><strong>Satellite ID:</strong> {data.satellite_id || noradId}</p>
          <p><strong>Latitude:</strong> {data.latitude}</p>
          <p><strong>Longitude:</strong> {data.longitude}</p>
          <p><strong>Altitude:</strong> {data.altitude}</p>
          {/* Additional fields can be displayed as needed */}
        </div>
      )}
    </div>
  );
};

export default OrbitPanel;
