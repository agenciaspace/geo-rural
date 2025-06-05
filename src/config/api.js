// Configuração da API para diferentes ambientes
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

export const API_ENDPOINTS = {
  uploadGnss: `${API_BASE_URL}/api/upload-gnss`,
  calculateBudget: `${API_BASE_URL}/api/calculate-budget`,
  generatePdf: `${API_BASE_URL}/api/generate-proposal-pdf`
};

export default API_ENDPOINTS;