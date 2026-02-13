import { initMfeFederation } from './app/federation-init';

initMfeFederation()
  .catch((err) => console.error(err))
  .then(() => import('./bootstrap'))
  .catch((err) => console.error(err));
