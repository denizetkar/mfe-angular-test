import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { HomeComponent } from './home';
import { RemoteFallbackComponent } from './remote-fallback';
import { RemoteName } from './mfe-manifest';
import { getCachedManifest } from './mfe-manifest-loader';
import { RemoteTelemetryService } from './remote-telemetry';

async function loadRemoteRoutes(remoteName: RemoteName): Promise<Routes> {
  // inject() works here because loadChildren is called inside Angular's injection context
  const telemetry = inject(RemoteTelemetryService);
  const version = getCachedManifest()?.remotes[remoteName]?.version ?? 'unknown';

  const t0 = performance.now();
  try {
    const m = await loadRemoteModule(remoteName, './routes');
    const loadDurationMs = performance.now() - t0;
    telemetry.record({ remoteName, version, loadDurationMs, loadedAt: new Date(), status: 'ok' });
    return (m as any).remoteRoutes as Routes;
  } catch (error) {
    const loadDurationMs = performance.now() - t0;
    telemetry.record({ remoteName, version, loadDurationMs, loadedAt: new Date(), status: 'error', error });
    throw error;
  }
}

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent },
  {
    path: 'catalog',
    loadChildren: () =>
      loadRemoteRoutes('catalog').catch(() => [
        {
          path: '',
          component: RemoteFallbackComponent,
          data: { remoteName: 'catalog' },
        },
      ]),
  },
  {
    path: 'checkout',
    loadChildren: () =>
      loadRemoteRoutes('checkout').catch(() => [
        {
          path: '',
          component: RemoteFallbackComponent,
          data: { remoteName: 'checkout' },
        },
      ]),
  },
  { path: '**', redirectTo: '' },
];
