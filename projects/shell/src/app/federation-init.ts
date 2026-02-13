import { initFederation } from '@angular-architects/native-federation';
import { loadMfeManifest } from './mfe-manifest-loader';

// Step 1: Load our runtime manifest (dev/prod switchable)
// Step 2: Initialize Native Federation using a remotes map
export async function initMfeFederation(): Promise<void> {
  const manifest = await loadMfeManifest();

  const remotesMap: Record<string, string> = {
    catalog: manifest.remotes.catalog.entry,
    checkout: manifest.remotes.checkout.entry
  };

  await initFederation(remotesMap);
}

