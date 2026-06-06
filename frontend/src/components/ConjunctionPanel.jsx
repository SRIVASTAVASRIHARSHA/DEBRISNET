import React, { useState } from 'react';
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

  // 6. FINAL SYSTEM STATEMENT
  addSectionHeader("6. FINAL SYSTEM STATEMENT");
  addText("This report was generated using deterministic orbital mechanics calculations combined with automated mission intelligence analysis.", margin, false, 10, 80);

  doc.save(`DebrisNet_Conjunction_Report_${satA}_${satB}.pdf`);
};

// ─── Component ────────────────────────────────────────────────────────────────

const ConjunctionPanel = () => {
  console.log("CONJUNCTION PANEL VERSION TEST 123");
  const [satA, setSatA] = useState('');
  const [satB, setSatB] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [exporting, setExporting] = useState(false);

  const handleAnalyze = async () => {
    console.log("Starting conjunction request");
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analyzeConjunction(satA, satB);
      console.log("Conjunction result:", data);
      setResult(data);
    } catch (e) {
      console.error(e);
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
          <p><strong>Closest Approach Distance:</strong> {result.closest_approach?.distance_km != null ? `${Number(result.closest_approach.distance_km).toFixed(2)} km` : 'N/A'}</p>
          <p><strong>Time:</strong> {result.closest_approach?.time || 'N/A'}</p>
          <p><strong>Risk Level:</strong> {result.risk_assessment?.risk_level || 'N/A'}</p>
          <p><strong>Severity:</strong> {result.risk_assessment?.severity || 'N/A'}</p>
          <p><strong>Recommendation:</strong> {result.risk_assessment?.recommendation || 'N/A'}</p>
          <p><strong>Mission Summary:</strong> {result.mission_report?.summary || 'N/A'}</p>
          <p><strong>AI Analysis:</strong> {result.ai_analysis?.analysis || 'Analysis data unavailable'}</p>

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
