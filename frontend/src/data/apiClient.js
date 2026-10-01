/**
 * NAYAN Authoritative Centralized API Client
 * Zero hardcoded literals. Graceful fallback on offline/degraded backend.
 */

async function fetchJson(endpoint, options = {}) {
  try {
    const res = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    if (!res.ok) {
      console.warn(`[apiClient] HTTP ${res.status} on ${endpoint}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`[apiClient] Network error on ${endpoint}:`, err.message);
    return null;
  }
}

export const apiClient = {
  getCapabilities: () => fetchJson('/api/capabilities'),
  getReadiness: () => fetchJson('/api/ready'),
  getVideos: () => fetchJson('/api/videos'),
  getIncidents: () => fetchJson('/api/incidents'),
  getIncidentById: (id) => fetchJson(`/api/incidents/${id}`),
  getCameras: () => fetchJson('/api/cameras'),
  getCorridors: () => fetchJson('/api/corridors'),
  getJunctions: () => fetchJson('/api/junctions'),
  getResources: () => fetchJson('/api/resources'),
  getAuditTrail: () => fetchJson('/api/audit'),
  getAiStatus: () => fetchJson('/api/ai/status'),
  getModelMetrics: () => fetchJson('/api/model/metrics'),
  
  // AI Assistance (Operator Decision Support)
  requestAiAssist: (mode, incidentId, notes = null) => fetchJson('/api/ai/assist', {
    method: 'POST',
    body: JSON.stringify({ mode, incident_id: incidentId, operator_notes: notes })
  }),

  // Scenario Triggers (SCENARIOS + drawer)
  runScenario: (type) => fetchJson(`/api/demo/scenarios/${type}/start`, { method: 'POST' }),
  resetDemo: () => fetchJson('/api/demo/reset', { method: 'POST' }),

  // Operator Authorization Execution
  authorizeIncidentDispatch: (incidentId, reason = 'Operator authorized response') => fetchJson(`/api/incidents/${incidentId}/response`, {
    method: 'POST',
    body: JSON.stringify({ new_state: 'DISPATCHED', reason })
  })
};

export default apiClient;
