# Step 5 — What you have now (and why it works)

This step documents the *current working state* of the repo after the scaffold + integration.

## 1) Running topology (CSR)

You currently have three running Angular apps:

- Shell (host): `http://localhost:4200`
- Catalog remote: `http://localhost:4201`
- Checkout remote: `http://localhost:4202`

## 2) The key mechanism: Native Federation runtime initialization

The shell does *two* runtime steps before bootstrapping Angular:

1. Load an MFE manifest (your own JSON, not the native-federation default manifest)
2. Call native federation’s `initFederation(remotesMap)` with the resolved remoteEntry URLs

See [`projects/shell/src/main.ts`](projects/shell/src/main.ts) and [`initMfeFederation()`](projects/shell/src/app/federation-init.ts).

### Why we moved the manifest to `projects/shell/public/`

Native Federation’s schematic configures assets to be served from `projects/*/public/**` at the web root.
That’s why the default manifest URL is `/mfe.manifest.json` and the file lives at:

- [`projects/shell/public/mfe.manifest.json`](projects/shell/public/mfe.manifest.json)

## 3) Integration contract: "remote exposes routes"

Each remote exposes **one entrypoint** called `./routes`.

- Catalog expose is configured in [`projects/catalog/federation.config.js`](projects/catalog/federation.config.js)
- Checkout expose is configured in [`projects/checkout/federation.config.js`](projects/checkout/federation.config.js)

Both exports provide:

- `remoteRoutes: Routes` (route subtree owned by the remote)

See [`projects/catalog/src/app/remote-routes.ts`](projects/catalog/src/app/remote-routes.ts) and [`projects/checkout/src/app/remote-routes.ts`](projects/checkout/src/app/remote-routes.ts).

## 4) Route-level composition in the shell

The shell owns top-level routes and lazy-loads the remote route subtree via:

- [`loadRemoteModule()`](node_modules/@angular-architects/native-federation/README.md:284)

Implementation: [`projects/shell/src/app/app.routes.ts`](projects/shell/src/app/app.routes.ts)

### Failure behavior

If a remote fails to load, the shell falls back to a shell-owned component:

- [`RemoteFallbackComponent`](projects/shell/src/app/remote-fallback.ts)

This models production reality where remotes can be unavailable or incompatible.

## 5) Remotes still run standalone

Even though the shell consumes `remoteRoutes` via federation, each remote also uses the same route subtree when running standalone:

- Catalog routes: [`projects/catalog/src/app/app.routes.ts`](projects/catalog/src/app/app.routes.ts)
- Checkout routes: [`projects/checkout/src/app/app.routes.ts`](projects/checkout/src/app/app.routes.ts)

This is an important MFE ergonomics pattern: remotes must be testable and runnable in isolation.

## 6) Shared UI library + design tokens

You have a shared Angular library `ui` and both remotes import it.

- Component: [`projects/ui/src/lib/ui.ts`](projects/ui/src/lib/ui.ts)

The shell provides CSS-token defaults (design tokens) via:

- [`projects/shell/src/styles.scss`](projects/shell/src/styles.scss)

Remotes consume tokens using CSS variables, so they don’t hardcode brand colors.

## 7) Next step

Next we should:

- Document the dev workflow (commands, ports, manifest override)
- Add basic observability hooks (remote name/version + load timings)
- Add a minimal contract test to ensure each remote exports `remoteRoutes`

