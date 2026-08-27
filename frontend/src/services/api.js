/**
 * RiskGuard AI API Service
 * Centralized HTTP client for backend and ML services.
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json'
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error ${response.status}`);
    }

    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // System Health
  getHealth: () => request('/health'),
  reseedData: () => request('/seed', { method: 'POST' }),

  // Transactions
  getTransactions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/transactions${query ? `?${query}` : ''}`);
  },
  getTransactionById: (id) => request(`/transactions/${id}`),
  analyzeTransaction: (payload) => request('/transactions', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  reanalyzeTransaction: (id) => request(`/transactions/${id}/analyze`, {
    method: 'POST'
  }),
  takeAction: (id, { action, reason, actor }) => request(`/transactions/${id}/action`, {
    method: 'POST',
    body: JSON.stringify({ action, reason, actor })
  }),

  // Analytics
  getAnalytics: () => request('/analytics'),

  // AI Risk Agent
  investigateWithAgent: (payload) => request('/agent/investigate', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Model Evaluation
  getModelPerformance: () => request('/model-performance'),

  // Audit Logs
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/audit-logs${query ? `?${query}` : ''}`);
  }
};

export default api;
