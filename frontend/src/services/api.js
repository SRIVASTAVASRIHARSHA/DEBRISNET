const API_BASE_URL = '';

export const checkHealth = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            return 'ONLINE';
        }
        return 'OFFLINE';
    } catch (error) {
        return 'OFFLINE';
    }
};

export const getSatellites = async () => {
    try {
        console.log("Requesting:", `${API_BASE_URL}/api/satellites`);
        const response = await fetch(`${API_BASE_URL}/api/satellites`);
        console.log("Status:", response.status);
        if (!response.ok) throw new Error('Failed to fetch satellites');
        const data = await response.json();
        console.log("Received:", data);
        return data;
    } catch (error) {
        console.error("REAL API ERROR:", error);
        throw error;
    }
};

export const getOrbitPrediction = async (noradId) => {
    try {
        console.log("Requesting:", `${API_BASE_URL}/api/orbit/${noradId}`);
        const response = await fetch(`${API_BASE_URL}/api/orbit/${noradId}`);
        console.log("Status:", response.status);
        if (!response.ok) throw new Error('Orbit prediction failed');
        const data = await response.json();
        console.log("Received:", data);
        return data;
    } catch (error) {
        console.error("REAL API ERROR:", error);
        throw error;
    }
};

export const analyzeConjunction = async (idA, idB) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/conjunction/${idA}/${idB}`);
        if (!response.ok) throw new Error('Conjunction analysis failed');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const fetchModulesStatus = async () => {
    const status = await checkHealth();
    return {
        satelliteTracking: status,
        orbitPrediction: status,
        collisionIntelligence: status,
        aiMissionAnalyst: status
    };
};

export default {
    API_BASE_URL,
    checkHealth,
    fetchModulesStatus,
    getSatellites,
    getOrbitPrediction,
    analyzeConjunction
};
