import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  isDevMode,
  resource,
} from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet, Routes } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { RemoteName } from './mfe-manifest';
import { getCachedManifest } from './mfe-manifest-loader';
import { RemoteLoadEvent, RemoteTelemetryService } from './remote-telemetry';

/**
 * Wrapper component that owns the full MFE load lifecycle.
 *
 * Used as `component` (not `loadChildren`) so Angular's router resolves the
 * route synchronously — enabling retry without a page reload.
 *
 * Data flow:
 *   remoteConfig (manifest signal)
 *     → remoteLoad resource  (async; manages loading/error/abort/retry)
 *       → route injection effect  (mutates routeConfig once on first success)
 */
@Component({
  selector: 'app-remote-host',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, DatePipe, DecimalPipe],
  styles: [
    `
      :host {
        display: block;
        position: relative;
        min-height: 4rem;
      }

      .overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: flex-start;
      }
      .spinner {
        margin: 2rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: #6b7280;
        font-size: 0.9rem;
      }
      .spinner__icon {
        width: 18px;
        height: 18px;
        border: 2px solid currentColor;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .error-card {
        max-width: 560px;
        margin: 2rem;
        padding: 1.25rem;
        border: 1px solid #d43934;
        border-radius: 8px;
        background: #fff5f5;
      }
      .error-card__header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        font-size: 1.1rem;
        color: #b91c1c;
        margin-bottom: 0.75rem;
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
        text-decoration: none;
      }
    `,
  ],
  template: `
    <router-outlet />

    @if (remoteLoad.isLoading() || remoteLoad.error()) {
      <div class="overlay">
        @if (remoteLoad.isLoading()) {
          <div class="spinner">
            <div class="spinner__icon"></div>
            Loading {{ remoteName() }}…
          </div>
        } @else {
          <div class="error-card">
            <div class="error-card__header">⚠ Remote unavailable: {{ remoteName() }}</div>
            <div class="detail">
              <span class="detail__label">Error</span>
              <span class="detail__value detail__value--error">{{ errorMessage() }}</span>
              <span class="detail__label">Entry</span>
              <span class="detail__value">{{ entryUrl() }}</span>
              <span class="detail__label">Version</span>
              <span class="detail__value">{{ lastFailedEvent()?.version ?? 'unknown' }}</span>
              <span class="detail__label">At</span>
              <span class="detail__value">{{
                lastFailedEvent()?.loadedAt | date: 'HH:mm:ss'
              }}</span>
              <span class="detail__label">Duration</span>
              <span class="detail__value"
                >{{ lastFailedEvent()?.loadDurationMs | number: '1.0-0' }} ms</span
              >
            </div>
            <div class="actions">
              <button class="btn btn--primary" (click)="remoteLoad.reload()">Retry</button>
              <a class="btn btn--secondary" href="/">Go home</a>
            </div>
          </div>
        }
      </div>
    }
  `,
})
export class RemoteHostComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly telemetry = inject(RemoteTelemetryService);

  // ── Manifest-derived context (single source of truth) ──────────────────
  protected readonly remoteName = computed(
    () => this.route.snapshot.data['remoteName'] as RemoteName,
  );
  private readonly remoteConfig = computed(() => getCachedManifest()?.remotes[this.remoteName()]);
  protected readonly entryUrl = computed(() => this.remoteConfig()?.entry ?? 'unknown');

  // ── Async resource: manages loading/error/abort/retry automatically ────
  protected readonly remoteLoad = resource({
    params: this.remoteConfig,
    loader: async ({ params: config }) => {
      // If a previous component instance already injected routes, reuse them
      const existing = this.route.routeConfig?.children as Routes | undefined;
      if (existing?.length) return existing;

      const remoteName = this.remoteName();
      const entryUrl = config?.entry;
      const version = config?.version ?? 'unknown';
      if (!entryUrl) throw new Error(`No entry URL for "${remoteName}" in manifest`);

      const t0 = performance.now();
      try {
        const m = await loadRemoteModule({ remoteEntry: entryUrl, exposedModule: './routes' });
        const loadDurationMs = performance.now() - t0;
        const routes: Routes = (m as any).remoteRoutes;
        this.telemetry.record({
          remoteName,
          version,
          loadDurationMs,
          loadedAt: new Date(),
          status: 'ok',
        });
        return routes;
      } catch (error) {
        const event: RemoteLoadEvent = {
          remoteName,
          version,
          loadDurationMs: performance.now() - t0,
          loadedAt: new Date(),
          status: 'error',
          error,
        };
        this.telemetry.record(event);
        if (isDevMode()) this.devLog(event);
        throw error; // re-throw so resource captures it in error()
      }
    },
  });

  // ── Error display ───────────────────────────────────────────────────────
  protected readonly lastFailedEvent = computed(() =>
    this.telemetry.latestByRemote().get(this.remoteName()),
  );
  protected readonly errorMessage = computed(() => {
    const e = this.remoteLoad.error();
    return e instanceof Error ? e.message : String(e ?? 'Unknown error');
  });

  // ── Side effect: inject routes once resolved; capture URL before ────────
  private readonly initialUrl = this.router.url;

  constructor() {
    // Inject child routes once resolved; re-navigate to activate them.
    // Guard prevents re-injection when a new instance is created by the router
    // after the navigateByUrl call (children already === routes).
    effect(() => {
      const routes = this.remoteLoad.value();
      if (!routes?.length || this.route.routeConfig?.children === routes) return;
      this.route.routeConfig!.children = routes;
      this.router.resetConfig(this.router.config);
      this.router.navigateByUrl(this.initialUrl, { replaceUrl: true });
    });
  }

  private devLog(event: RemoteLoadEvent): void {
    console.group(`[MFE error boundary] ${event.remoteName} failed to load`);
    console.log('version:  ', event.version);
    console.log('entry:    ', this.entryUrl());
    console.error('error:    ', event.error);
    console.groupEnd();
  }
}
