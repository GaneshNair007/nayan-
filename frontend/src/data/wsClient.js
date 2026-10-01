/**
 * NAYAN WebSocket Connection Manager
 * Subscribes to real-time event deltas with auto-reconnect.
 */

class NayanWebSocketClient {
  constructor() {
    this.ws = null;
    this.subscribers = new Set();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.isManualClosed = false;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isManualClosed = false;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/events`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyStatus(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const envelope = JSON.parse(event.data);
          this.subscribers.forEach((callback) => callback(envelope));
        } catch (e) {
          console.warn('[wsClient] Message parse error:', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.notifyStatus(false);
        if (!this.isManualClosed) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        if (this.ws) this.ws.close();
      };
    } catch (err) {
      console.warn('[wsClient] Connect error:', err);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 8000);
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  onStatusChange(callback) {
    this.statusCallback = callback;
    callback(this.isConnected);
  }

  notifyStatus(connected) {
    if (this.statusCallback) this.statusCallback(connected);
  }

  disconnect() {
    this.isManualClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsClient = new NayanWebSocketClient();
export default wsClient;
