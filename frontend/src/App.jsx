import React, { useEffect, useState } from 'react';
import './App.css';
import ModuleCard from './components/ModuleCard';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SystemCard from './components/SystemCard';
import OrbitPanel from './components/OrbitPanel';
import ConjunctionPanel from './components/ConjunctionPanel';
import api from './services/api';
import EarthViewer from './components/EarthViewer';
import SatelliteExplorer from './components/SatelliteExplorer';
import About from './components/About';

function App() {
  const [moduleStatus, setModuleStatus] = useState({
    satelliteTracking: 'OFFLINE',
    orbitPrediction: 'OFFLINE',
    collisionIntelligence: 'OFFLINE',
    aiMissionAnalyst: 'OFFLINE'
  });

  // Satellite position state (latitude, longitude, altitude)
  const [satellitePos, setSatellitePos] = useState({
    latitude: 0,
    longitude: 0,
    altitude: 0
  });
  // Search query state for satellite filtering
  const [searchQuery, setSearchQuery] = useState('');

  // NORAD ID selected via SatelliteExplorer Track button
  const [trackedNoradId, setTrackedNoradId] = useState('');

  // Full orbit positions array for trail rendering
  const [orbitPath, setOrbitPath] = useState([]);

  // Conjunction state
  const [activeConjunction, setActiveConjunction] = useState(null);

  // Called when user clicks Track in SatelliteExplorer
  const handleSelectSatellite = (satellite) => {
    setTrackedNoradId(String(satellite.norad_id));
    // Scroll to orbit panel so user sees the result
    const el = document.getElementById('orbit');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Fetch module statuses on component mount
    const loadStatus = async () => {
      try {
        const statuses = await api.fetchModulesStatus();
        setModuleStatus(statuses);
      } catch (error) {
        console.error('Failed to fetch module statuses:', error);
      }
    };
    loadStatus();
  }, []);

  return (
    <div className="app-container">
      <Navbar />
      <Hero />

      {/* Mission Systems Section */}
      <section id="mission" className="mission-section">
        <h2 className="section-title">MISSION OPERATIONS CENTER</h2>
        <div className="systems-grid">
          <SystemCard
            title="Satellite Tracking"
            description="Live orbital object monitoring using TLE data"
          />
          <SystemCard
            title="Orbit Prediction"
            description="SGP4 powered trajectory forecasting"
          />
          <SystemCard
            title="Collision Intelligence"
            description="Closest approach and risk assessment engine"
          />
          <SystemCard
            title="AI Mission Analyst"
            description="Human‑readable mission intelligence reports"
          />
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section id="ai" className="dashboard-section">
        <h2 className="section-title">SYSTEM TELEMETRY</h2>
        <div className="modules-grid">
          <ModuleCard
            title="Satellite Tracking"
            status="LIVE TRACKING"
          />
          <ModuleCard
            title="Orbit Prediction"
            status="SGP4 ACTIVE"
          />
          <ModuleCard
            title="Collision Intelligence"
            status="READY"
          />
          <ModuleCard
            title="AI Mission Analyst"
            status="ONLINE"
          />
        </div>
      </section>

      {/* Pass satellite position to EarthViewer */}
      <EarthViewer
          latitude={satellitePos.latitude}
          longitude={satellitePos.longitude}
          altitude={satellitePos.altitude}
          orbitPath={orbitPath}
          noradId={trackedNoradId}
          searchQuery={searchQuery}
          selectedNoradId={trackedNoradId}
          activeConjunction={activeConjunction}
          onExitConjunction={() => setActiveConjunction(null)}
        />

      {/* Satellite Explorer – search by name, click Track to predict orbit */}
      <div id="dashboard">
        <SatelliteExplorer
          onSelectSatellite={handleSelectSatellite}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* OrbitPanel notifies EarthViewer via callback; accepts trackedNoradId from explorer */}
        <div id="orbit">
          <OrbitPanel
            onPredict={setSatellitePos}
            onOrbitPath={setOrbitPath}
            trackedNoradId={trackedNoradId}
          />
        </div>
      </div>
      
      <div id="conjunction">
        <ConjunctionPanel onConjunctionResult={setActiveConjunction} />
      </div>

      <About />
    </div>
  );
}

export default App;
