import { useState, useEffect, useCallback } from 'react';
import apiClient from './apiClient';
import wsClient from './wsClient';

/**
 * useNayanState: Single authoritative source of truth for NAYAN frontend.
 * Manages initial snapshot and realtime WebSocket updates.
 */
export function useNayanState() {
  const [capabilities, setCapabilities] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [videoCatalogue, setVideoCatalogue] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [corridors, setCorridors] = useState([]);
  const [junctions, setJunctions] = useState([]);
  const [resources, setResources] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [aiStatus, setAiStatus] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSnapshot = useCallback(async () => {
    try {
      const [caps, ready, vids, incs, cams, corrs, jncs, res, audits, ai, metrics] = await Promise.all([
        apiClient.getCapabilities(),
        apiClient.getReadiness(),
        apiClient.getVideos(),
        apiClient.getIncidents(),
        apiClient.getCameras(),
        apiClient.getCorridors(),
        apiClient.getJunctions(),
        apiClient.getResources(),
        apiClient.getAuditTrail(),
        apiClient.getAiStatus(),
        apiClient.getModelMetrics()
      ]);

      if (caps) setCapabilities(caps);
      if (ready) setReadiness(ready);
      if (vids?.videos) setVideoCatalogue(vids.videos);
      if (incs) setIncidents(incs);
      if (cams) setCameras(cams);
      if (corrs) setCorridors(corrs);
      if (jncs) setJunctions(jncs);
      if (res) setResources(res);
      if (audits) setAuditEvents(audits);
      if (ai) setAiStatus(ai);
      if (metrics) setModelMetrics(metrics);
    } catch (err) {
      console.warn('[useNayanState] Snapshot error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mount: Connect WS and fetch initial snapshot
  useEffect(() => {
    refreshSnapshot();
    wsClient.connect();

    wsClient.onStatusChange(setWsConnected);

    const unsubscribe = wsClient.subscribe((envelope) => {
      // Whenever an event delta arrives, refresh relevant entities
      refreshSnapshot();
    });

    // 4-second background poll as safety net
    const interval = setInterval(refreshSnapshot, 4000);

    return () => {
      unsubscribe();
      clearInterval(interval);
      wsClient.disconnect();
    };
  }, [refreshSnapshot]);

  return {
    capabilities,
    readiness,
    videoCatalogue,
    incidents,
    cameras,
    corridors,
    junctions,
    resources,
    auditEvents,
    aiStatus,
    modelMetrics,
    wsConnected,
    isLoading,
    refreshSnapshot
  };
}

export default useNayanState;
