export interface NetworkAttempt {
  id: string;
  timestamp: number;
  apiName: 'fetch' | 'xhr' | 'beacon' | 'websocket' | 'eventsource';
  targetOrigin: string; // Origin only! Never URL, query, or body
  classification: 'same-origin' | 'unexpected';
}

export interface CSPViolationRecord {
  id: string;
  timestamp: number;
  blockedOrigin: string;
  violatedDirective: string;
}

export interface ResourceTimingRecord {
  name: string;
  origin: string;
  initiatorType: string;
  isSameOrigin: boolean;
}

export interface PrivacyMonitorState {
  totalAttempts: number;
  unexpectedAttempts: number;
  attemptsByApi: Record<string, number>;
  attempts: NetworkAttempt[];
  cspViolations: CSPViolationRecord[];
  isInstalled: boolean;
}

class PrivacyMonitor {
  private state: PrivacyMonitorState = {
    totalAttempts: 0,
    unexpectedAttempts: 0,
    attemptsByApi: {
      fetch: 0,
      xhr: 0,
      beacon: 0,
      websocket: 0,
      eventsource: 0,
    },
    attempts: [],
    cspViolations: [],
    isInstalled: false,
  };

  private listeners: Set<() => void> = new Set();

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  public getState(): PrivacyMonitorState {
    return {
      ...this.state,
      attempts: [...this.state.attempts],
      cspViolations: [...this.state.cspViolations],
    };
  }

  public extractOrigin(input: string | URL | Request): string {
    try {
      if (typeof input === 'string') {
        if (input.startsWith('/') || input.startsWith('.')) {
          return typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
        }
        const base = typeof window !== 'undefined' ? window.location.href : 'http://localhost';
        const parsed = new URL(input, base);
        return parsed.origin;
      } else if (input instanceof URL) {
        return input.origin;
      } else if (typeof Request !== 'undefined' && input instanceof Request) {
        return new URL(input.url).origin;
      }
    } catch {
      // Fallback
    }
    return 'unknown-origin';
  }

  public recordAttempt(apiName: NetworkAttempt['apiName'], target: string | URL | Request): void {
    const origin = this.extractOrigin(target);
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const isSameOrigin = origin === currentOrigin || origin === 'same-origin';
    const classification: NetworkAttempt['classification'] = isSameOrigin
      ? 'same-origin'
      : 'unexpected';

    this.state.totalAttempts++;
    this.state.attemptsByApi[apiName] = (this.state.attemptsByApi[apiName] ?? 0) + 1;
    if (classification === 'unexpected') {
      this.state.unexpectedAttempts++;
    }

    const record: NetworkAttempt = {
      id: `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      apiName,
      targetOrigin: origin,
      classification,
    };

    // Store up to last 100 attempts in memory only
    this.state.attempts.unshift(record);
    if (this.state.attempts.length > 100) {
      this.state.attempts.pop();
    }

    this.notify();
  }

  public install(): void {
    if (this.state.isInstalled || typeof window === 'undefined') return;
    this.state.isInstalled = true;

    // 1. Wrap window.fetch
    const originalFetch = window.fetch;
    if (typeof originalFetch === 'function') {
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        this.recordAttempt('fetch', input as string);
        return originalFetch.call(window, input, init);
      };
    }

    // 2. Wrap XMLHttpRequest
    if (typeof XMLHttpRequest !== 'undefined') {
      const originalOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function (
        this: XMLHttpRequest,
        method: string,
        url: string | URL,
        ...rest: unknown[]
      ) {
        privacyMonitor.recordAttempt('xhr', url);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (originalOpen as any).apply(this, [method, url, ...rest]);
      };
    }

    // 3. Wrap navigator.sendBeacon
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const originalSendBeacon = navigator.sendBeacon;
      navigator.sendBeacon = (url: string | URL, data?: BodyInit | null) => {
        privacyMonitor.recordAttempt('beacon', url);
        return originalSendBeacon.call(navigator, url, data);
      };
    }

    // 4. Wrap WebSocket
    if (typeof WebSocket !== 'undefined') {
      const OriginalWebSocket = window.WebSocket;
      // @ts-expect-error WebSocket wrapper
      window.WebSocket = function (url: string | URL, protocols?: string | string[]) {
        privacyMonitor.recordAttempt('websocket', url);
        return new OriginalWebSocket(url, protocols);
      };
      window.WebSocket.prototype = OriginalWebSocket.prototype;
    }

    // 5. Wrap EventSource
    if (typeof EventSource !== 'undefined') {
      const OriginalEventSource = window.EventSource;
      // @ts-expect-error EventSource wrapper
      window.EventSource = function (url: string | URL, eventSourceInitDict?: EventSourceInit) {
        privacyMonitor.recordAttempt('eventsource', url);
        return new OriginalEventSource(url, eventSourceInitDict);
      };
      window.EventSource.prototype = OriginalEventSource.prototype;
    }

    // 6. Listen for securitypolicyviolation events
    window.addEventListener('securitypolicyviolation', (e: SecurityPolicyViolationEvent) => {
      let blockedOrigin = 'unknown';
      try {
        blockedOrigin = new URL(e.blockedURI).origin;
      } catch {
        blockedOrigin = e.blockedURI || 'inline/eval';
      }

      this.state.cspViolations.unshift({
        id: `csp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        blockedOrigin,
        violatedDirective: e.violatedDirective,
      });

      if (this.state.cspViolations.length > 50) {
        this.state.cspViolations.pop();
      }
      this.notify();
    });
  }

  public getLoadedResources(): ResourceTimingRecord[] {
    if (typeof performance === 'undefined' || typeof performance.getEntriesByType !== 'function') {
      return [];
    }
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return entries.map((entry) => {
      let origin = '';
      try {
        origin = new URL(entry.name).origin;
      } catch {
        origin = 'self';
      }
      const isSameOrigin = origin === window.location.origin || origin === 'self';
      return {
        name: entry.name.split('/').pop() || entry.name,
        origin,
        initiatorType: entry.initiatorType,
        isSameOrigin,
      };
    });
  }

  public resetStats(): void {
    this.state.totalAttempts = 0;
    this.state.unexpectedAttempts = 0;
    this.state.attempts = [];
    this.state.cspViolations = [];
    for (const key of Object.keys(this.state.attemptsByApi)) {
      this.state.attemptsByApi[key] = 0;
    }
    this.notify();
  }
}

export const privacyMonitor = new PrivacyMonitor();
