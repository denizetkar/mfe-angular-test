import { Injectable, computed, signal } from '@angular/core';
import { RemoteName } from './mfe-manifest';

export interface RemoteLoadEvent {
  remoteName: RemoteName;
  /** Version string from the manifest, or 'unknown' if manifest had no version field */
  version: string;
  /** Wall-clock duration of the loadRemoteModule() call in milliseconds */
  loadDurationMs: number;
  loadedAt: Date;
  status: 'ok' | 'error';
  /** Only present when status === 'error' */
  error?: unknown;
}

@Injectable({ providedIn: 'root' })
export class RemoteTelemetryService {
  /** Full ordered log of every load attempt (oldest first) */
  readonly events = signal<RemoteLoadEvent[]>([]);

  /**
   * Map of remoteName → most recent event for that remote.
   * Used by the status bar to show one row per remote.
   */
  readonly latestByRemote = computed(() => {
    const map = new Map<RemoteName, RemoteLoadEvent>();
    for (const event of this.events()) {
      map.set(event.remoteName, event);
    }
    return map;
  });

  record(event: RemoteLoadEvent): void {
    this.events.update(prev => [...prev, event]);
    // Always emit to the browser console so DevTools Network timeline aligns easily
    const badge = event.status === 'ok' ? '✓' : '✗';
    console.debug(
      `[MFE telemetry] ${badge} ${event.remoteName} v${event.version} — ` +
      `${event.loadDurationMs.toFixed(0)} ms`,
      event.status === 'error' ? event.error : ''
    );
  }
}
