const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('enersense_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is FormData, delete Content-Type to allow browser boundary setup
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({ success: false, message: 'Server communication error' }));

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  // Auth
  register: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request<any>('/auth/logout', { method: 'POST' }),
  getMe: () => request<any>('/auth/me'),

  // Meters
  getMeters: () => request<any>('/meters'),
  createMeter: (body: any) => request<any>('/meters', { method: 'POST', body: JSON.stringify(body) }),
  updateMeter: (id: string, body: any) => request<any>(`/meters/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteMeter: (id: string) => request<any>(`/meters/${id}`, { method: 'DELETE' }),

  // Readings
  getReadings: (params: string = '') => request<any>(`/readings${params ? `?${params}` : ''}`),
  createReading: (body: any) => request<any>('/readings', { method: 'POST', body: JSON.stringify(body) }),
  updateReading: (id: string, body: any) => request<any>(`/readings/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteReading: (id: string) => request<any>(`/readings/${id}`, { method: 'DELETE' }),

  // OCR
  scanMeter: (formData: FormData) => request<any>('/meter-scanner/extract', { method: 'POST', body: formData }),
  scanMeterBase64: (imageBase64: string) =>
    request<any>('/meter-scanner/extract', {
      method: 'POST',
      body: JSON.stringify({ imageBase64 }),
    }),

  // Tariffs
  getTariffs: () => request<any>('/tariffs'),
  estimateBill: (body: any) => request<any>('/tariffs/estimate', { method: 'POST', body: JSON.stringify(body) }),

  // Appliances
  getAppliances: () => request<any>('/appliances'),
  createAppliance: (body: any) => request<any>('/appliances', { method: 'POST', body: JSON.stringify(body) }),
  updateAppliance: (id: string, body: any) => request<any>(`/appliances/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteAppliance: (id: string) => request<any>(`/appliances/${id}`, { method: 'DELETE' }),

  // Dashboard
  getDashboardSummary: () => request<any>('/dashboard/summary'),
  getDashboardConsumption: () => request<any>('/dashboard/consumption'),
  getDashboardAppliances: () => request<any>('/dashboard/appliances'),

  // AI Recommendations
  getRecommendations: () => request<any>('/recommendations'),
  generateRecommendations: () => request<any>('/recommendations/generate', { method: 'POST' }),
  updateRecommendationStatus: (id: string, status: string) =>
    request<any>(`/recommendations/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Forecast
  getForecast: (days = 30) => request<any>(`/forecast?days=${days}`),
  getForecastHistory: () => request<any>('/forecast/history'),

  // Savings Goals
  getGoals: () => request<any>('/goals'),
  createGoal: (body: any) => request<any>('/goals', { method: 'POST', body: JSON.stringify(body) }),
  updateGoal: (id: string, body: any) => request<any>(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteGoal: (id: string) => request<any>(`/goals/${id}`, { method: 'DELETE' }),

  // Reports
  getReportSummary: (params: string = '') => request<any>(`/reports/summary${params ? `?${params}` : ''}`),
  getReportCsvUrl: () => `${API_BASE}/reports/export`,

  // Settings
  getSettings: () => request<any>('/settings'),
  updateSettings: (body: any) => request<any>('/settings', { method: 'PUT', body: JSON.stringify(body) }),
  deleteAccount: () => request<any>('/settings/account', { method: 'DELETE' }),

  // IoT
  getIotDevices: () => request<any>('/iot/devices'),
  registerIotDevice: (body: any) => request<any>('/iot/devices', { method: 'POST', body: JSON.stringify(body) }),
  ingestTelemetry: (body: any) => request<any>('/iot/telemetry', { method: 'POST', body: JSON.stringify(body) }),
};
