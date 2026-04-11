import axios from 'axios';

// Backend URL - automatically uses production URL in production
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * GET DASHBOARD SUMMARY
 */
export const getSummary = async () => {
  try {
    const response = await api.get('/scoring/summary');
    return response.data;
  } catch (error) {
    console.warn("API Error (Summary): Backend not reached. Using Mock Data.");
    return {
      districts_monitored: 22,
      high_risk_count: 5,
      medium_risk_count: 8,
      alerts_sent_today: 12,
      last_updated: new Date().toISOString(),
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
      { id: 1, name: 'Ludhiana', lat: 30.901, lng: 75.8573, score: 85, risk_level: 'CRITICAL', primary_disease: 'Dengue' },
      { id: 2, name: 'Amritsar', lat: 31.634, lng: 74.8723, score: 72, risk_level: 'HIGH', primary_disease: 'Malaria' },
      { id: 3, name: 'Jalandhar', lat: 31.326, lng: 75.5762, score: 45, risk_level: 'MEDIUM', primary_disease: 'Cholera' },
      { id: 4, name: 'Patiala', lat: 30.3398, lng: 76.3869, score: 30, risk_level: 'LOW', primary_disease: 'Dengue' },
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

/**
 * GET DISTRICT RISK SCORES (Historical)
 */
export const getDistrictScores = async (id) => {
  try {
    const response = await api.get(`/districts/${id}/scores`);
    return response.data;
  } catch (error) {
    console.warn("API Error (Scores): Backend not reached. Using Mock Data.");
    return {
      scores: [
        { date: '2026-04-01', score: 60, risk_level: 'MODERATE' },
        { date: '2026-04-05', score: 65, risk_level: 'MODERATE' },
        { date: '2026-04-10', score: 85, risk_level: 'HIGH' },
      ]
    };
  }
};

/**
 * RUN ML SCORING
 */
export const runScoring = async () => {
  try {
    const response = await api.post('/run-scoring');
    return response.data;
  } catch (error) {
    console.error("API Error (Scoring):", error);
    throw error;
  }
};

/**
 * SIMULATE ALERT
 */
export const simulateAlert = async () => {
  try {
    const response = await api.get('/alerts/simulate');
    return response.data;
  } catch (error) {
    console.error("API Error (Simulate Alert):", error);
    throw error;
  }
};

/**
 * GET AGGREGATE DISEASE STATISTICS (For DiseaseBreakdownChart)
 */
export const getAggregateStats = async () => {
  try {
    const response = await api.get('/districts/stats/aggregate');
    return response.data;
  } catch (error) {
    console.warn("API Error (Aggregate Stats): Backend not reached. Using Mock Data.");
    return {
      dengue_cases: 245,
      malaria_cases: 189,
      cholera_cases: 67,
      opd_cases: 1523,
      avg_rainfall: 45.2,
      avg_temp: 32.5,
      avg_humidity: 68.3,
      avg_hospital_load: 72.4,
    };
  }
};

/**
 * GET ML MODEL METRICS (For ModelAccuracyPanel)
 */
export const getModelMetrics = async () => {
  try {
    const response = await api.get('/model/metrics');
    return response.data;
  } catch (error) {
    console.warn("API Error (Model Metrics): Backend not reached. Using Mock Data.");
    return {
      accuracy: 85.61,
      precision: 84.2,
      recall: 81.5,
      f1_score: 82.8,
      model_type: "XGBoost + RandomForest Ensemble",
      version: "2.1",
      trained_date: "2026-04-11",
      feature_importance: [
        { feature: "Anomaly Flag", importance: 0.31 },
        { feature: "Rainfall (mm)", importance: 0.24 },
        { feature: "WoW Change %", importance: 0.19 },
        { feature: "Population Density", importance: 0.12 },
        { feature: "Temperature (°C)", importance: 0.08 },
        { feature: "Humidity %", importance: 0.06 },
      ]
    };
  }
};

export default api;