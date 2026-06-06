import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { analyzeConjunction } from '../services/api';
import './ConjunctionPanel.css';

// ─── PDF Generator ────────────────────────────────────────────────────────────

const generatePDF = (result, satA, satB) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 50;
  const colW = pageW - margin * 2;
  let y = 0;

  // ── Helpers ────────────────────────────────────────────────────────────────

  const hex = (h) => {
    const r = parseInt(h.slice(1, 3), 16);
    const g = parseInt(h.slice(3, 5), 16);
    const b = parseInt(h.slice(5, 7), 16);
    return [r, g, b];
  };

  const addWrappedText = (text, x, startY, maxWidth, lineHeight) => {
    const lines = doc.splitTextToSize(String(text || 'N/A'), maxWidth);
    lines.forEach((line) => {
      doc.text(line, x, startY);
      startY += lineHeight;
    });
    return startY;
  };

  const checkNewPage = (needed = 60) => {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin + 20;
    }
  };

  const sectionHeader = (title) => {
    checkNewPage(50);
    y += 18;
    doc.setFillColor(...hex('#0a0a1a'));
    doc.rect(margin - 10, y - 14, colW + 20, 22, 'F');
    doc.setDrawColor(...hex('#3b82f6'));
    doc.setLineWidth(2);
    doc.line(margin - 10, y - 14, margin - 10, y + 8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...hex('#93c5fd'));
    doc.text(title, margin + 4, y);
    y += 18;
    doc.setLineWidth(0.5);
    doc.setDrawColor(...hex('#1e3a5f'));
    doc.line(margin, y, margin + colW, y);
    y += 10;
  };

  const field = (label, value, indent = 0) => {
    checkNewPage(28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...hex('#60a5fa'));
    doc.text(`${label}:`, margin + indent, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hex('#e2e8f0'));
    const labelW = doc.getTextWidth(`${label}: `);
    y = addWrappedText(value, margin + indent + labelW + 4, y, colW - indent - labelW - 4, 14);
    y += 4;
  };

  const multiLineField = (label, value, indent = 0) => {
    checkNewPage(40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...hex('#60a5fa'));
    doc.text(`${label}:`, margin + indent, y);
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hex('#cbd5e1'));
    doc.setFontSize(9);
    y = addWrappedText(value, margin + indent + 8, y, colW - indent - 8, 13);
    y += 6;
  };

  // ── Cover / Header ─────────────────────────────────────────────────────────

  // Dark navy background banner
  doc.setFillColor(...hex('#020817'));
  doc.rect(0, 0, pageW, 120, 'F');

  // Accent gradient bar (simulated with rectangles)
  const accentColors = ['#1e40af', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa'];
  accentColors.forEach((c, i) => {
    doc.setFillColor(...hex(c));
    doc.rect((pageW / accentColors.length) * i, 0, pageW / accentColors.length + 1, 4, 'F');
  });

  // Logo text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(...hex('#3b82f6'));
  doc.text('DEBRISNET', pageW / 2, 52, { align: 'center' });

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...hex('#94a3b8'));
  doc.text('Space Situational Awareness Report', pageW / 2, 74, { align: 'center' });

  // Divider
  doc.setDrawColor(...hex('#1e3a5f'));
  doc.setLineWidth(1);
  doc.line(margin, 88, pageW - margin, 88);

  // Report meta
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...hex('#64748b'));
  const now = new Date().toUTCString();
  doc.text(`Generated: ${now}`, margin, 108);
  doc.text(`CLASSIFICATION: UNCLASSIFIED`, pageW - margin, 108, { align: 'right' });

  y = 138;

  // ── Section 1: Mission Overview ─────────────────────────────────────────────

  sectionHeader('1.  MISSION OVERVIEW');
  field('Satellite A (NORAD ID)', satA);
  field('Satellite B (NORAD ID)', satB);
  field('Analysis Time', result.closest_approach?.time || new Date().toISOString());
  field('Report ID', `DBN-${Date.now().toString(36).toUpperCase()}`);

  // ── Section 2: Closest Approach ─────────────────────────────────────────────

  sectionHeader('2.  CLOSEST APPROACH');
  field('Conjunction Time', result.closest_approach?.time || 'N/A');
  field(
    'Miss Distance',
    result.closest_approach?.distance_km != null
      ? `${Number(result.closest_approach.distance_km).toFixed(4)} km`
      : 'N/A'
  );

  // ── Section 3: Risk Assessment ──────────────────────────────────────────────

  sectionHeader('3.  RISK ASSESSMENT');

  const riskLevel = result.risk_assessment?.risk_level || 'N/A';
  const riskColors = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#22c55e',
    MINIMAL: '#22c55e',
  };
  const riskColor = riskColors[riskLevel.toUpperCase()] || '#94a3b8';

  // Risk badge
  checkNewPage(36);
  doc.setFillColor(...hex(riskColor));
  doc.roundedRect(margin, y - 12, 80, 18, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(riskLevel.toUpperCase(), margin + 40, y, { align: 'center' });
  y += 18;

  field('Severity', result.risk_assessment?.severity || 'N/A');
  multiLineField('Recommendation', result.risk_assessment?.recommendation || 'N/A');

  // ── Section 4: Mission Report ────────────────────────────────────────────────

  sectionHeader('4.  MISSION REPORT');
  field('Title', result.mission_report?.title || 'Conjunction Analysis');
  multiLineField('Summary', result.mission_report?.summary || 'N/A');
  multiLineField('Details', result.mission_report?.details || result.mission_report?.detail || 'N/A');

  // ── Section 5: AI Analyst ────────────────────────────────────────────────────

  sectionHeader('5.  AI ANALYST');

  const confidence = result.ai_analysis?.confidence;
  if (confidence !== undefined && confidence !== null) {
    checkNewPage(30);
    // Confidence bar
    const barW = colW * 0.5;
    const confVal = Math.min(Math.max(Number(confidence), 0), 1);
    doc.setFillColor(...hex('#0f172a'));
    doc.roundedRect(margin, y - 10, barW, 12, 3, 3, 'F');
    doc.setFillColor(...hex('#3b82f6'));
    doc.roundedRect(margin, y - 10, barW * confVal, 12, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...hex('#e2e8f0'));
    doc.text(`Confidence: ${(confVal * 100).toFixed(1)}%`, margin + barW + 8, y);
    y += 18;
  }

  multiLineField('Analysis', result.ai_analysis?.analysis || 'N/A');

  // Summary points
  const points = result.ai_analysis?.summary_points || result.ai_analysis?.summaryPoints || [];
  if (Array.isArray(points) && points.length > 0) {
    checkNewPage(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...hex('#60a5fa'));
    doc.text('Key Points:', margin, y);
    y += 14;
    points.forEach((pt) => {
      checkNewPage(18);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...hex('#94a3b8'));
      doc.text('•', margin + 4, y);
      y = addWrappedText(pt, margin + 16, y, colW - 16, 13);
      y += 3;
    });
  }

  // ── Footer on every page ─────────────────────────────────────────────────────

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const ph = doc.internal.pageSize.getHeight();
    doc.setDrawColor(...hex('#1e3a5f'));
    doc.setLineWidth(0.5);
    doc.line(margin, ph - 30, pageW - margin, ph - 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...hex('#475569'));
    doc.text('DEBRISNET — Space Situational Awareness Platform', margin, ph - 16);
    doc.text(`Page ${i} of ${totalPages}`, pageW - margin, ph - 16, { align: 'right' });
  }

  // ── Save ─────────────────────────────────────────────────────────────────────

  const filename = `DebrisNet_Report_${satA}_${satB}.pdf`;
  doc.save(filename);
};

// ─── Component ────────────────────────────────────────────────────────────────

const ConjunctionPanel = () => {
  const [satA, setSatA] = useState('');
  const [satB, setSatB] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [exporting, setExporting] = useState(false);

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

  const handleExport = () => {
    if (!result) return;
    setExporting(true);
    try {
      generatePDF(result, satA, satB);
    } finally {
      setExporting(false);
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
          <p><strong>Closest Approach Distance:</strong> {result.closest_approach?.distance_km != null ? `${Number(result.closest_approach.distance_km).toFixed(2)} km` : 'N/A'}</p>
          <p><strong>Time:</strong> {result.closest_approach?.time || 'N/A'}</p>
          <p><strong>Risk Level:</strong> {result.risk_assessment?.risk_level || 'N/A'}</p>
          <p><strong>Severity:</strong> {result.risk_assessment?.severity || 'N/A'}</p>
          <p><strong>Recommendation:</strong> {result.risk_assessment?.recommendation || 'N/A'}</p>
          <p><strong>Mission Summary:</strong> {result.mission_report?.summary || 'N/A'}</p>
          <p><strong>AI Analysis:</strong> {result.ai_analysis?.analysis || 'Analysis data unavailable'}</p>

          <button
            className="export-btn"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <span className="export-btn__inner">
                <span className="export-spinner" /> Generating PDF…
              </span>
            ) : (
              <span className="export-btn__inner">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v13M5 14l7 7 7-7" />
                  <path d="M3 21h18" />
                </svg>
                Export Mission Report
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ConjunctionPanel;
