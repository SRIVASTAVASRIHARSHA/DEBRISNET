import React, { useState, useEffect } from 'react';
import { jsPDF } from "jspdf";
import { analyzeConjunction } from '../services/api';
import './ConjunctionPanel.css';

// ─── PDF Generator ────────────────────────────────────────────────────────────

const generatePDF = (result, satA, satB) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  
  let y = margin + 20;

  const checkPageBreak = (neededHeight) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin + 20;
    }
  };

  const addText = (text, x, isBold, fontSize, color = 0) => {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(color);
    
    const lines = doc.splitTextToSize(String(text || "N/A"), contentWidth - (x - margin));
    checkPageBreak(lines.length * (fontSize * 1.2));
    
    doc.text(lines, x, y);
    y += lines.length * (fontSize * 1.2) + 5;
  };

  const addLine = () => {
    checkPageBreak(10);
    y += 5;
    doc.setLineWidth(1);
    doc.setDrawColor(150); // Gray line
    doc.line(margin, y, pageWidth - margin, y);
    y += 15;
  };

  const addSectionHeader = (title) => {
    addLine();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0);
    checkPageBreak(25);
    doc.text(title, margin, y);
    y += 20;
  };

  const addKeyValue = (key, value) => {
    checkPageBreak(15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text(`${key}:`, margin, y);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    const keyWidth = doc.getTextWidth(`${key}: `);
    
    const lines = doc.splitTextToSize(String(value || "N/A"), contentWidth - keyWidth - 5);
    checkPageBreak(lines.length * 12);
    doc.text(lines, margin + keyWidth + 5, y);
    y += lines.length * 12 + 5;
  };

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(0);
  doc.text("DEBRISNET", margin, y);
  y += 25;

  doc.setFontSize(14);
  doc.text("Orbital Conjunction Assessment Report", margin, y);
  y += 15;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Space Situational Awareness & Collision Intelligence System", margin, y);
  y += 30;

  doc.setTextColor(0);
  addKeyValue("Report ID", `DBN-${Date.now()}`);
  addKeyValue("Generated Time", new Date().toUTCString());
  addKeyValue("Classification", "AUTOMATED ORBITAL SAFETY ANALYSIS");

  // 1. MISSION OVERVIEW
  addSectionHeader("1. MISSION OVERVIEW");
  addKeyValue("Primary Object NORAD ID", satA);
  addKeyValue("Secondary Object NORAD ID", satB);
  addKeyValue("Analysis Type", "Orbital Conjunction Assessment");

  // 2. CLOSE APPROACH ANALYSIS
  addSectionHeader("2. CLOSE APPROACH ANALYSIS");
  addKeyValue("Time of closest approach", result.closest_approach?.time);
  addKeyValue(
    "Minimum separation distance (km)", 
    result.closest_approach?.distance_km != null ? Number(result.closest_approach.distance_km).toFixed(4) : "N/A"
  );

  // 3. COLLISION RISK EVALUATION
  addSectionHeader("3. COLLISION RISK EVALUATION");
  addKeyValue("Risk Level", result.risk_assessment?.risk_level);
  addKeyValue("Severity Classification", result.risk_assessment?.severity);
  addKeyValue("Operational Recommendation", result.risk_assessment?.recommendation);

  // 4. MISSION INTELLIGENCE SUMMARY
  addSectionHeader("4. MISSION INTELLIGENCE SUMMARY");
  addKeyValue("Title", result.mission_report?.title);
  y += 10;
  addText(result.mission_report?.summary, margin, false, 10, 0);
  y += 10;
  addText(result.mission_report?.details || result.mission_report?.detail, margin, false, 10, 0);

  // 5. AI MISSION ANALYST ASSESSMENT
  addSectionHeader("5. AI MISSION ANALYST ASSESSMENT");
  
  if (result.ai_analysis?.confidence != null) {
      addKeyValue("Confidence Level", `${(Number(result.ai_analysis.confidence) * 100).toFixed(1)}%`);
  }
  y += 10;
  addText(result.ai_analysis?.analysis, margin, false, 10, 0);
  
  const points = result.ai_analysis?.summary_points || result.ai_analysis?.summaryPoints || [];
  if (points.length > 0) {
      y += 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Key Points:", margin, y);
      y += 15;
      
      points.forEach(pt => {
          doc.setFont("helvetica", "normal");
          const ptLines = doc.splitTextToSize(`• ${pt}`, contentWidth - 15);
          checkPageBreak(ptLines.length * 12);
          doc.text(ptLines, margin + 10, y);
          y += ptLines.length * 12 + 5;
      });
  }

  // 6. COLLISION AVOIDANCE ADVISOR
  if (result.avoidance_plan) {
    addSectionHeader("6. COLLISION AVOIDANCE ADVISOR");
    addKeyValue("Maneuver Required", result.avoidance_plan.maneuver_required ? "Yes" : "No");
    addKeyValue("Recommended Action", result.avoidance_plan.recommended_action);
    addKeyValue("Maneuver Type", result.avoidance_plan.maneuver_type);
    addKeyValue("Estimated Delta-V", result.avoidance_plan.estimated_delta_v);
    addKeyValue("Priority", result.avoidance_plan.priority);
    y += 10;
    addText(result.avoidance_plan.explanation, margin, false, 10, 0);
  }

  // 7. FINAL SYSTEM STATEMENT
  addSectionHeader("7. FINAL SYSTEM STATEMENT");
  addText("This report was generated using deterministic orbital mechanics calculations combined with automated mission intelligence analysis.", margin, false, 10, 80);

  doc.save(`DebrisNet_Conjunction_Report_${satA}_${satB}.pdf`);
};

// ─── Component ────────────────────────────────────────────────────────────────

const ConjunctionPanel = () => {
  // Loading messages for Collision Analysis
  const conjMessages = [
    "🛰️ Propagating satellite trajectories...",
    "📡 Calculating closest approach...",
    "🤖 Generating mission intelligence...",
    "🚀 Preparing avoidance analysis..."
  ];
  const [conjMsgIdx, setConjMsgIdx] = useState(0);
  const [conjLoadingMsg, setConjLoadingMsg] = useState(conjMessages[0]);

  const [satA, setSatA] = useState('');
const [satB, setSatB] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [result, setResult] = useState(null);
const [exporting, setExporting] = useState(false);

useEffect(() => {
  if (loading) {
    const interval = setInterval(() => {
      setConjMsgIdx(prev => {
        const next = (prev + 1) % conjMessages.length;
        setConjLoadingMsg(conjMessages[next]);
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  } else {
    setConjMsgIdx(0);
    setConjLoadingMsg(conjMessages[0]);
  }
}, [loading]);

  

  const handleAnalyze = async () => {
    // Validation for Satellite A NORAD ID
    if (!satA) {
      setError('Please enter NORAD catalog ID.');
      return;
    }
    if (!/^\d+$/.test(satA)) {
      setError('Invalid NORAD ID. NORAD catalog numbers contain digits only.');
      return;
    }
    if (satA.length > 6) {
      setError('NORAD catalog ID format is invalid.');
      return;
    }
    // Validation for Satellite B NORAD ID
    if (!satB) {
      setError('Please enter NORAD catalog ID.');
      return;
    }
    if (!/^\d+$/.test(satB)) {
      setError('Invalid NORAD ID. NORAD catalog numbers contain digits only.');
      return;
    }
    if (satB.length > 6) {
      setError('NORAD catalog ID format is invalid.');
      return;
    }
    // Clear any previous errors before proceeding
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const data = await analyzeConjunction(satA, satB);
      // If backend returns no data or missing expected fields
      if (!data || !data.closest_approach) {
        setError('Orbital object not found in public catalog.');
        setLoading(false);
        return;
      }
      setResult(data);
    } catch (e) {
      setError('Backend unavailable or request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!result) {
      console.error("No report data available");
      return;
    }
    generatePDF(result, satA, satB);
  };

  return (
    <div className="conjunction-panel glass-panel">
      {loading && (<p className="status-msg">{conjLoadingMsg}</p>)}
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
      {/* Empty state when no result */}
      {!result && !loading && !error && (
        <p className="empty-state" style={{ textAlign: 'center', color: '#aaa', marginTop: '1rem' }}>
          Awaiting Conjunction Assessment<br />
          Select two orbital objects to calculate closest approach distance and collision probability.
        </p>
      )}  

      {error && (<p className="error-msg">{error}</p>)}
        


      {result && (
        <div className="result">
          <p><strong>Closest Approach Distance:</strong> {result.closest_approach?.distance_km != null ? `${Number(result.closest_approach.distance_km).toFixed(2)} km` : 'N/A'}</p>
          <p><strong>Time:</strong> {result.closest_approach?.time || 'N/A'}</p>
          <p><strong>Risk Level:</strong> {result.risk_assessment?.risk_level || 'N/A'}</p>
          <p><strong>Severity:</strong> {result.risk_assessment?.severity || 'N/A'}</p>
          <p><strong>Recommendation:</strong> {result.risk_assessment?.recommendation || 'N/A'}</p>
          <p><strong>Mission Summary:</strong> {result.mission_report?.summary || 'N/A'}</p>
          <p><strong>AI Analysis:</strong> {result.ai_analysis?.analysis || 'Analysis data unavailable'}</p>

          {result.avoidance_plan && (
            <div className="avoidance-section" style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid #3b82f6' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#60a5fa' }}>Collision Avoidance Advisor</h3>
              <p><strong>Maneuver Required:</strong> {result.avoidance_plan?.maneuver_required ? 'Yes' : 'No'}</p>
              <p><strong>Recommended Action:</strong> {result.avoidance_plan?.recommended_action}</p>
              <p><strong>Maneuver Type:</strong> {result.avoidance_plan?.maneuver_type}</p>
              <p><strong>Estimated Delta-V:</strong> {result.avoidance_plan?.estimated_delta_v}</p>
              <p><strong>Priority:</strong> {result.avoidance_plan?.priority}</p>
              <p style={{ marginTop: '0.5rem' }}><strong>Explanation:</strong> {result.avoidance_plan?.explanation}</p>
            </div>
          )}

          <button
            type="button"
            className="export-btn"
            onClick={handleExport}
          >
            Export Mission Report
          </button>
        </div>
      )}
    </div>
  );
};

export default ConjunctionPanel;
