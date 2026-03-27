import { initFederation } from '@angular-architects/native-federation';
import { loadMfeManifest } from './mfe-manifest-loader';

/**
 * Initialize Native Federation for the shell.
 *
 * We pass an empty object `{}` to initFederation because we use the
 * direct-URL form of loadRemoteModule() in app.routes.ts. This means:
 * - No upfront network requests for remoteEntry.json at bootstrap
 * - Each remote is discovered lazily on first navigation
 * - Retry works without a full page reload (no registry dependency)
 *
 * The manifest is still loaded so we can read entry URLs and versions
 * from getCachedManifest() at route-load time.
 */
export async function initMfeFederation(): Promise<void> {
  await loadMfeManifest();
  await initFederation({});
}
