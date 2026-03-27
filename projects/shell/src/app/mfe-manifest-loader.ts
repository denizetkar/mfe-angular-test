import { MfeManifest } from './mfe-manifest';

// NOTE: Native Federation schematics configure the Angular dev-server assets
// to serve `projects/*/public/**` at the web root.
// Hence, we put the MFE manifest into `projects/shell/public/mfe.manifest.json`.
const DEFAULT_MANIFEST_URL = '/mfe.manifest.json';
const MANIFEST_URL_LS_KEY = 'mfe:manifestUrl';
const LAST_GOOD_MANIFEST_LS_KEY = 'mfe:lastGoodManifest';

/**
 * Synchronously returns the last successfully loaded manifest that was
 * persisted to localStorage during `loadMfeManifest()`.
 * Returns null if no manifest has been stored yet.
 * Used by the telemetry layer to look up remote versions at route-load time
 * without triggering another network request.
 */
export function getCachedManifest(): MfeManifest | null {
  const raw = localStorage.getItem(LAST_GOOD_MANIFEST_LS_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return isValidManifest(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function resolveManifestUrl(locationSearch = window.location.search): string {
  const url = new URLSearchParams(locationSearch).get('manifest');
  if (url) return url;

  const ls = localStorage.getItem(MANIFEST_URL_LS_KEY);
  if (ls) return ls;

  return DEFAULT_MANIFEST_URL;
}

function isValidManifest(m: unknown): m is MfeManifest {
  if (!m || typeof m !== 'object') return false;
  const anyM = m as any;
  return typeof anyM.manifestVersion === 'number' && typeof anyM.remotes === 'object';
}

export async function loadMfeManifest(): Promise<MfeManifest> {
  const url = resolveManifestUrl();

  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Manifest request failed: ${res.status} ${res.statusText}`);

    const json = await res.json();
    if (!isValidManifest(json)) throw new Error('Manifest schema validation failed');

    localStorage.setItem(LAST_GOOD_MANIFEST_LS_KEY, JSON.stringify(json));
    return json;
  } catch (e) {
    const parsed = getCachedManifest();
    if (!parsed) throw e;
    return parsed;
  }
}
