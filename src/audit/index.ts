import { EntityCategory, RedactionMode } from '../engine/types';

export const DETECTION_RULE_VERSION = '1.0.0';

export interface AuditEvent {
  id: string;
  timestamp: number;
  type: 'sanitize' | 'export' | 'privacy' | 'memory-clear';
  mode?: RedactionMode;
  ruleVersion: string;
  enabledCategories?: EntityCategory[];
  categoryCounts?: Record<EntityCategory, number>;
  detectedCount?: number;
  redactedCount?: number;
  rejectedCount?: number;
  durationMs?: number;
  exportType?: 'txt' | 'csv' | 'json';
  exportBytes?: number;
  // NOTE: Strict invariant: NO text, NO filenames, NO sensitive values, NO mapping keys
}

class AuditStore {
  private events: AuditEvent[] = [];
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

  public getEvents(): AuditEvent[] {
    return [...this.events];
  }

  public logEvent(event: Omit<AuditEvent, 'id' | 'timestamp' | 'ruleVersion'>): void {
    const fullEvent: AuditEvent = {
      ...event,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      ruleVersion: DETECTION_RULE_VERSION,
    };

    this.events.unshift(fullEvent);
    if (this.events.length > 500) {
      this.events.pop();
    }
    this.notify();
  }

  public clearLog(): void {
    this.events = [];
    this.notify();
  }

  public exportAuditJSON(): string {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        ruleVersion: DETECTION_RULE_VERSION,
        eventCount: this.events.length,
        events: this.events,
      },
      null,
      2
    );
  }
}

export const auditStore = new AuditStore();
