import { Component, computed, inject, isDevMode, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RemoteTelemetryService } from './remote-telemetry';
import { getCachedManifest } from './mfe-manifest-loader';
import { RemoteName } from './mfe-manifest';

@Component({
  selector: 'app-remote-fallback',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  styles: [`
    :host {
      display: block;
      max-width: 560px;
      margin: 2rem auto;
      padding: 1.25rem;
      border: 1px solid #d43934;
      border-radius: 8px;
      background: #fff5f5;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      font-size: 1.1rem;
      color: #b91c1c;
      margin-bottom: 0.75rem;
    }
    .header__icon {
      font-size: 1.25rem;
    }
    .detail {
      display: grid;
      grid-template-columns: 5rem 1fr;
      gap: 0.25rem 0.75rem;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
    .detail__label {
      color: #6b7280;
      text-align: right;
    }
    .detail__value {
      font-family: 'Consolas', 'Menlo', monospace;
      word-break: break-all;
    }
    .detail__value--error {
      color: #b91c1c;
    }
    .actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
    }
    .btn {
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      font-size: 0.875rem;
      cursor: pointer;
      text-decoration: none;
    }
    .btn--primary {
      background: #1d4ed8;
      color: #fff;
      border: none;
    }
    .btn--secondary {
      background: #fff;
      color: #374151;
      border: 1px solid #d1d5db;
    }
  `],
  template: `
    <div class="header">
      <span class="header__icon">⚠</span>
      <span>Remote unavailable: {{ remoteName() }}</span>
    </div>

    <div class="detail">
      <span class="detail__label">Error</span>
      <span class="detail__value detail__value--error">{{ errorMessage() }}</span>

      <span class="detail__label">Entry</span>
      <span class="detail__value">{{ entryUrl() }}</span>

      <span class="detail__label">Version</span>
      <span class="detail__value">{{ version() }}</span>

      <span class="detail__label">At</span>
      <span class="detail__value">{{ event()?.loadedAt | date:'HH:mm:ss' }}</span>

      <span class="detail__label">Duration</span>
      <span class="detail__value">{{ event()?.loadDurationMs | number:'1.0-0' }} ms</span>
    </div>

    <div class="actions">
      <button class="btn btn--primary" (click)="retry()">Retry</button>
      <a class="btn btn--secondary" routerLink="/">Go home</a>
    </div>
  `
})
export class RemoteFallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly telemetry = inject(RemoteTelemetryService);

  readonly remoteName = computed(() => (this.route.snapshot.data['remoteName'] as RemoteName) ?? 'unknown');

  /** Latest error event for this remote from the telemetry service */
  readonly event = computed(() => this.telemetry.latestByRemote().get(this.remoteName()));

  readonly errorMessage = computed(() => {
    const e = this.event()?.error;
    return e instanceof Error ? e.message : e ? String(e) : 'Unknown error';
  });

  readonly version = computed(() => this.event()?.version ?? 'unknown');

  readonly entryUrl = computed(() => {
    const manifest = getCachedManifest();
    return manifest?.remotes[this.remoteName()]?.entry ?? 'unknown';
  });

  ngOnInit(): void {
    if (isDevMode()) {
      const e = this.event();
      if (!e) return;
      console.group(`[MFE error boundary] ${this.remoteName()} failed to load`);
      console.log('remoteName:', this.remoteName());
      console.log('version:   ', this.version());
      console.log('entry:     ', this.entryUrl());
      console.log('duration:  ', `${e.loadDurationMs.toFixed(0)} ms`);
      console.log('at:        ', e.loadedAt.toISOString());
      console.error('error:     ', e.error);
      console.groupEnd();
    }
  }

  retry(): void {
    // Native Federation's initFederation() runs once during bootstrap.
    // If a remote was offline at that time, the runtime has no knowledge of it.
    // Router navigation alone won't re-run initFederation() — we need a full page reload.
    const path = this.remoteName();
    window.location.href = `/${path}`;
  }
}
