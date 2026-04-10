import axios from 'axios';

// Change this to your backend URL (e.g., http://localhost:5000/api)
const API_BASE_URL = '/api'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * GET DASHBOARD SUMMARY
 * Fallback data provided so the UI doesn't crash if backend is down.
 */
export const getSummary = async () => {
  try {
    const response = await api.get('/summary');
    return response.data;
  } catch (error) {
    console.warn("API Error (Summary): Backend not reached. Using Mock Data.");
    return {
      districts_count: 22,
      high_risk_count: 5,
      alerts_sent_today: 12,
    };
  }
};

/**
 * GET ALL DISTRICTS (For Map and Tables)
 */
export const getAllDistricts = async () => {
  try {
    const response = await api.get('/districts');
    return response.data;
  } catch (error) {
    console.warn("API Error (Districts): Backend not reached. Using Mock Data.");
    return [
      { id: 1, name: 'Ludhiana', lat: 30.901, lng: 75.8573, risk_score: 85, risk_level: 'CRITICAL', primary_disease: 'Dengue' },
      { id: 2, name: 'Amritsar', lat: 31.634, lng: 74.8723, risk_score: 72, risk_level: 'HIGH', primary_disease: 'Malaria' },
      { id: 3, name: 'Jalandhar', lat: 31.326, lng: 75.5762, risk_score: 45, risk_level: 'MEDIUM', primary_disease: 'Cholera' },
      { id: 4, name: 'Patiala', lat: 30.3398, lng: 76.3869, risk_score: 30, risk_level: 'LOW', primary_disease: 'Dengue' },
    ];
  }
};

/**
 * GET RECENT ALERTS
 */
export const getAlerts = async () => {
  try {
    const response = await api.get('/alerts');
    return response.data;
  } catch (error) {
    return [
      { id: 101, district_name: 'Ludhiana', risk_score: 85, risk_level: 'CRITICAL', message: 'Dengue outbreak predicted' },
      { id: 102, district_name: 'Amritsar', risk_score: 72, risk_level: 'HIGH', message: 'Malaria cases rising' }
    ];
  }
};

/**
 * GET SPECIFIC DISTRICT STATS (For the Sidebar/Panel)
 */
export const getDistrictStats = async (id) => {
  try {
    const response = await api.get(`/districts/${id}/stats`);
    return response.data;
  } catch (error) {
    return {
      stats: {
        temp: 32,
        humidity: 65,
        hospital_load: 78,
        historical_scores: [60, 65, 70, 85]
      }
    };
  }
};

export default api;