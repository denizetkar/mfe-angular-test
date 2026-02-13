import { Routes } from '@angular/router';

// Keep the remote runnable as a standalone app too.
// The shell will NOT use this file; it loads `remoteRoutes` from the exposed entrypoint.
import { remoteRoutes } from './remote-routes';

export const routes: Routes = remoteRoutes;
