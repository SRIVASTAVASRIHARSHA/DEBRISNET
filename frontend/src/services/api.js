const API_BASE_URL = "https://debrisnet-backend.onrender.com";

export const checkHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
};

export const getSatellites = async () => {
  const response = await fetch(`${API_BASE_URL}/api/satellites`);
  return response.json();
};

export const getOrbitPrediction = async (noradId) => {
  const response = await fetch(`${API_BASE_URL}/api/orbit/${noradId}`);
  return response.json();
};

export const analyzeConjunction = async (primaryId, secondaryId, predictionWindowHours, timezone) => {
  // Prepare payload matching backend ConjunctionRequest model
  const payload = {
    primary_id: Number(primaryId),
    secondary_id: Number(secondaryId),
    prediction_hours: Number(predictionWindowHours),
    timezone: timezone || "UTC",
  };
  console.log("Sending conjunction payload:", payload);
  try {
    const response = await fetch(`${API_BASE_URL}/api/conjunction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Conjunction API failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Conjunction analysis failed:", error);
    throw error;
  }
};

// Fetch status of all modules (plural) – used by App.jsx
export const fetchModulesStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/status`);
    if (!response.ok) {
      throw new Error("Status request failed");
    }
    return await response.json();
  } catch (error) {
    console.error("Module status fetch failed:", error);
    throw error;
  }
};

// Alias for backward compatibility (singular name)
export const fetchModuleStatus = fetchModulesStatus;

export default {
  checkHealth,
  getSatellites,
  getOrbitPrediction,
  analyzeConjunction,
  fetchModulesStatus,
  fetchModuleStatus,
};
