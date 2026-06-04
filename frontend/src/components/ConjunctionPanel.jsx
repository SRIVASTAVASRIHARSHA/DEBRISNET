import React, { useState } from 'react';
import { analyzeConjunction } from '../services/api';
import './ConjunctionPanel.css';

const ConjunctionPanel = () => {
  const [satA, setSatA] = useState('');
  const [satB, setSatB] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analyzeConjunction(satA, satB);
      setResult(data);
    } catch (e) {
      setError('Backend unavailable or request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="conjunction-panel glass-panel">
      <h2 className="panel-title">Collision Analysis</h2>
      <div className="inputs">
        <input
          type="text"
          placeholder="Satellite A NORAD ID"
          value={satA}
          onChange={e => setSatA(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Satellite B NORAD ID"
          value={satB}
          onChange={e => setSatB(e.target.value)}
          className="input-field"
        />
        <button onClick={handleAnalyze} disabled={loading} className="analyze-btn">
          {loading ? 'Analyzing...' : 'Analyze Collision'}
        </button>
      </div>
      {error && <p className="error-msg">{error}</p>}
      {result && (
        <div className="result">
          <p><strong>Closest Approach Distance:</strong> {result.closest_approach?.distance_km ? `${result.closest_approach.distance_km.toFixed(2)} km` : 'N/A'}</p>
          <p><strong>Time:</strong> {result.closest_approach?.time || 'N/A'}</p>
          <p><strong>Risk Level:</strong> {result.risk_assessment?.risk_level || 'N/A'}</p>
          <p><strong>Severity:</strong> {result.risk_assessment?.severity || 'N/A'}</p>
          <p><strong>Recommendation:</strong> {result.risk_assessment?.recommendation || 'N/A'}</p>
          <p><strong>Mission Summary:</strong> {result.mission_report?.summary || 'N/A'}</p>
          <p><strong>AI Analysis:</strong> {result.ai_analysis?.analysis || 'Analysis data unavailable'}</p>
        </div>
      )}
    </div>
  );
};

export default ConjunctionPanel;
