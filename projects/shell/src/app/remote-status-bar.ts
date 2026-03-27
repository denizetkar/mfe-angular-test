import { Component, inject, isDevMode } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RemoteTelemetryService } from './remote-telemetry';

@Component({
  selector: 'app-remote-status-bar',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  styles: [
    `
      :host {
        display: block;
      }
      .status-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(15, 15, 20, 0.92);
        color: #c9d1d9;
        font-family: 'Consolas', 'Menlo', monospace;
        font-size: 11px;
        line-height: 1.5;
        padding: 4px 12px;
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        z-index: 9999;
      }
      .status-bar__label {
        opacity: 0.5;
        margin-right: 6px;
      }
      .entry {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .badge {
        font-weight: bold;
        padding: 0 4px;
        border-radius: 3px;
      }
      .badge--ok {
        color: #3fb950;
      }
      .badge--error {
        color: #f85149;
      }
      .dim {
        opacity: 0.5;
      }
    `,
  ],
  template: `
    @if (isVisible) {
      <div class="status-bar" role="status" aria-label="MFE telemetry">
        <span class="status-bar__label">🔭 MFE</span>
        @for (entry of entries(); track entry.remoteName) {
          <span class="entry">
            <strong>[{{ entry.remoteName }}]</strong>
            <span class="dim">v{{ entry.version }}</span>
            @if (entry.status === 'ok') {
              <span class="badge badge--ok">✓ ok</span>
            } @else {
              <span class="badge badge--error">✗ error</span>
            }
            <span class="dim">{{ entry.loadDurationMs | number: '1.0-0' }} ms</span>
            <span class="dim">@ {{ entry.loadedAt | date: 'HH:mm:ss' }}</span>
          </span>
        }
      </div>
    }
  `,
})
export class RemoteStatusBarComponent {
  private readonly telemetry = inject(RemoteTelemetryService);

  /** Only show in dev mode (ng serve) or when ?debug=1 is in the URL */
  protected readonly isVisible =
    isDevMode() || new URLSearchParams(window.location.search).get('debug') === '1';

  /** Derived array from the latestByRemote map, sorted alphabetically by remoteName */
  protected readonly entries = () =>
    [...this.telemetry.latestByRemote().values()].sort((a, b) =>
      a.remoteName.localeCompare(b.remoteName),
    );
}
