import { Routes } from '@angular/router';

export const remoteRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/checkout-home').then((m) => m.CheckoutHomeComponent)
  },
  {
    path: 'review',
    loadComponent: () => import('./pages/checkout-review').then((m) => m.CheckoutReviewComponent)
  }
];

