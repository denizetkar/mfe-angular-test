import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { HomeComponent } from './home';
import { RemoteFallbackComponent } from './remote-fallback';
import { RemoteName } from './mfe-manifest';

async function loadRemoteRoutes(remoteName: RemoteName): Promise<Routes> {
  // remotes expose: './routes' which exports `remoteRoutes`
  const m = await loadRemoteModule(remoteName, './routes');
  return (m as any).remoteRoutes as Routes;
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
