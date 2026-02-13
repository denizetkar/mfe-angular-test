import { Routes } from '@angular/router';

// This is the only thing the shell needs to know about this remote:
// a route subtree that can be mounted under /catalog.
export const remoteRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/catalog-home').then((m) => m.CatalogHomeComponent)
  },
  {
    path: 'details/:id',
    loadComponent: () => import('./pages/catalog-details').then((m) => m.CatalogDetailsComponent)
  }
];
