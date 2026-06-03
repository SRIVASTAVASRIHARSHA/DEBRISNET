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
          <p><strong>Closest Approach:</strong> {result.closest_approach_distance || 'N/A'}</p>
          <p><strong>Time:</strong> {result.time || 'N/A'}</p>
          <p><strong>Risk Level:</strong> {result.risk_level || 'N/A'}</p>
          <p><strong>Severity:</strong> {result.severity || 'N/A'}</p>
          <p><strong>Recommendation:</strong> {result.recommendation || 'N/A'}</p>
          <p><strong>Mission Report:</strong> {result.mission_report || 'N/A'}</p>
          <p><strong>AI Analysis:</strong> {result.ai_analysis || 'N/A'}</p>
        </div>
      )}
    </div>
  );
};

export default ConjunctionPanel;
