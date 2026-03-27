import { Routes } from '@angular/router';
import { HomeComponent } from './home';
import { RemoteHostComponent } from './remote-host';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent },
  {
    path: 'catalog',
    component: RemoteHostComponent,
    data: { remoteName: 'catalog' },
    // children are injected at runtime by RemoteHostComponent once the remote loads
  },
  {
    path: 'checkout',
    component: RemoteHostComponent,
    data: { remoteName: 'checkout' },
    // children are injected at runtime by RemoteHostComponent once the remote loads
  },
  { path: '**', redirectTo: '' },
];
