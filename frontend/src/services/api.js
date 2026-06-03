const API_BASE_URL = 'http://127.0.0.1:8000';

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
        const response = await fetch(`${API_BASE_URL}/api/satellites`);
        if (!response.ok) throw new Error('Failed to fetch satellites');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getOrbitPrediction = async (noradId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/orbit/${noradId}`);
        if (!response.ok) throw new Error('Orbit prediction failed');
        return await response.json();
    } catch (error) {
        console.error(error);
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
