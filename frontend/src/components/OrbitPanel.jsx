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
