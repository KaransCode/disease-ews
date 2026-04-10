import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const MOCK_MODE = process.env.REACT_APP_MOCK_MODE === 'true';

const client = axios.create({ baseURL: BASE_URL, timeout: 8000 });

// ── Mock Data ──────────────────────────────────────────────────────────────────
const MOCK_DISTRICTS = [
  { id: 1,  name: 'Amritsar',          lat: 31.6340, lng: 74.8723, score: 61, risk_level: 'HIGH',     primary_disease: 'Dengue',  confidence: 84 },
  { id: 2,  name: 'Barnala',           lat: 30.3780, lng: 75.5492, score: 32, risk_level: 'LOW',      primary_disease: 'Dengue',  confidence: 79 },
  { id: 3,  name: 'Bathinda',          lat: 30.2110, lng: 74.9455, score: 48, risk_level: 'MODERATE', primary_disease: 'Malaria', confidence: 76 },
  { id: 4,  name: 'Faridkot',          lat: 30.6742, lng: 74.7557, score: 29, risk_level: 'LOW',      primary_disease: 'Dengue',  confidence: 82 },
  { id: 5,  name: 'Fatehgarh Sahib',   lat: 30.6480, lng: 76.3886, score: 37, risk_level: 'LOW',      primary_disease: 'Cholera', confidence: 71 },
  { id: 6,  name: 'Fazilka',           lat: 30.4019, lng: 74.0277, score: 44, risk_level: 'MODERATE', primary_disease: 'Malaria', confidence: 78 },
  { id: 7,  name: 'Ferozepur',         lat: 30.9236, lng: 74.6200, score: 55, risk_level: 'MODERATE', primary_disease: 'Dengue',  confidence: 80 },
  { id: 8,  name: 'Gurdaspur',         lat: 32.0394, lng: 75.4049, score: 41, risk_level: 'MODERATE', primary_disease: 'Malaria', confidence: 74 },
  { id: 9,  name: 'Hoshiarpur',        lat: 31.5293, lng: 75.9116, score: 35, risk_level: 'LOW',      primary_disease: 'Dengue',  confidence: 77 },
  { id: 10, name: 'Jalandhar',         lat: 31.3260, lng: 75.5762, score: 68, risk_level: 'HIGH',     primary_disease: 'Dengue',  confidence: 88 },
  { id: 11, name: 'Kapurthala',        lat: 31.3790, lng: 75.3800, score: 43, risk_level: 'MODERATE', primary_disease: 'Cholera', confidence: 73 },
  { id: 12, name: 'Ludhiana',          lat: 30.9010, lng: 75.8573, score: 82, risk_level: 'HIGH',     primary_disease: 'Dengue',  confidence: 91 },
  { id: 13, name: 'Malerkotla',        lat: 30.5293, lng: 75.8794, score: 27, risk_level: 'LOW',      primary_disease: 'Dengue',  confidence: 69 },
  { id: 14, name: 'Mansa',             lat: 29.9901, lng: 75.3972, score: 38, risk_level: 'LOW',      primary_disease: 'Malaria', confidence: 75 },
  { id: 15, name: 'Moga',              lat: 30.8184, lng: 75.1730, score: 52, risk_level: 'MODERATE', primary_disease: 'Dengue',  confidence: 81 },
  { id: 16, name: 'Mohali',            lat: 30.7046, lng: 76.7179, score: 46, risk_level: 'MODERATE', primary_disease: 'Dengue',  confidence: 77 },
  { id: 17, name: 'Muktsar',           lat: 30.4739, lng: 74.5148, score: 31, risk_level: 'LOW',      primary_disease: 'Malaria', confidence: 72 },
  { id: 18, name: 'Nawanshahr',        lat: 31.1240, lng: 76.1155, score: 24, risk_level: 'LOW',      primary_disease: 'Cholera', confidence: 68 },
  { id: 19, name: 'Pathankot',         lat: 32.2643, lng: 75.6509, score: 39, risk_level: 'LOW',      primary_disease: 'Dengue',  confidence: 74 },
  { id: 20, name: 'Patiala',           lat: 30.3398, lng: 76.3869, score: 77, risk_level: 'HIGH',     primary_disease: 'Malaria', confidence: 87 },
  { id: 21, name: 'Rupnagar',          lat: 30.9644, lng: 76.5292, score: 33, risk_level: 'LOW',      primary_disease: 'Dengue',  confidence: 70 },
  { id: 22, name: 'Tarn Taran',        lat: 31.4518, lng: 74.9281, score: 58, risk_level: 'MODERATE', primary_disease: 'Dengue',  confidence: 83 },
];

const generateTrend = (baseScore, days = 14) =>
  Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().slice(0, 10),
    opd_cases: Math.max(5, Math.round(baseScore * 0.8 + (Math.random() - 0.4) * 30)),
    rainfall_mm: parseFloat((Math.random() * 15).toFixed(1)),
    temp_max: parseFloat((32 + Math.random() * 8).toFixed(1)),
    humidity: parseFloat((60 + Math.random() * 25).toFixed(1)),
    hospital_load: Math.min(100, Math.round(baseScore * 0.75 + Math.random() * 20)),
  }));

const generateScoreHistory = (currentScore, days = 14) =>
  Array.from({ length: days }, (_, i) => {
    const s = Math.max(10, Math.min(100, Math.round(currentScore - (days - 1 - i) * 1.5 + (Math.random() - 0.5) * 10)));
    return {
      date: new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().slice(0, 10),
      score: s,
      risk_level: s >= 75 ? 'HIGH' : s >= 50 ? 'MODERATE' : 'LOW',
    };
  });

const MOCK_ALERTS = [
  { id: 1, district_name: 'Ludhiana',  sent_at: new Date(Date.now() - 1800000).toISOString(), risk_score: 82, risk_level: 'HIGH',     message: 'Dengue surge predicted — CMO notified' },
  { id: 2, district_name: 'Patiala',   sent_at: new Date(Date.now() - 3600000).toISOString(), risk_score: 77, risk_level: 'HIGH',     message: 'Malaria risk elevated — Vector control deployed' },
  { id: 3, district_name: 'Jalandhar', sent_at: new Date(Date.now() - 7200000).toISOString(), risk_score: 68, risk_level: 'HIGH',     message: 'Dengue cases rising — Hospitals on alert' },
  { id: 4, district_name: 'Amritsar',  sent_at: new Date(Date.now() - 14400000).toISOString(), risk_score: 61, risk_level: 'HIGH',    message: 'Dengue risk detected — Preventive measures activated' },
];

const MOCK_SUMMARY = {
  districts_monitored: 22,
  high_risk_count: 4,
  alerts_sent_today: 3,
  last_updated: new Date().toISOString(),
};

// ── API Functions ──────────────────────────────────────────────────────────────
const withMockFallback = async (apiCall, mockData) => {
  if (MOCK_MODE) return mockData;
  try {
    return await apiCall();
  } catch {
    console.warn('[API] Falling back to mock data');
    return mockData;
  }
};

export const getAllDistricts = () =>
  withMockFallback(
    async () => (await client.get('/api/districts')).data,
    MOCK_DISTRICTS
  );

export const getDistrictScores = (id) =>
  withMockFallback(
    async () => (await client.get(`/api/districts/${id}/scores`)).data,
    {
      district: MOCK_DISTRICTS.find(d => d.id === Number(id)) || MOCK_DISTRICTS[0],
      scores: generateScoreHistory(MOCK_DISTRICTS.find(d => d.id === Number(id))?.score || 50),
    }
  );

export const getDistrictStats = (id) =>
  withMockFallback(
    async () => (await client.get(`/api/districts/${id}/stats`)).data,
    {
      district: MOCK_DISTRICTS.find(d => d.id === Number(id)) || MOCK_DISTRICTS[0],
      stats: generateTrend(MOCK_DISTRICTS.find(d => d.id === Number(id))?.score || 50),
    }
  );

export const getAlerts = () =>
  withMockFallback(
    async () => (await client.get('/api/alerts')).data,
    MOCK_ALERTS
  );

export const getSummary = () =>
  withMockFallback(
    async () => (await client.get('/api/scoring/summary')).data,
    MOCK_SUMMARY
  );

export const runScoring = () =>
  withMockFallback(
    async () => (await client.post('/api/run-scoring')).data,
    { status: 'ok', message: 'Scoring pipeline triggered (mock)' }
  );

export { MOCK_DISTRICTS };
