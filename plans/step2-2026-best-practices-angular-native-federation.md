# Step 2 — 2026 best practices distilled (Angular 21 + `@angular-architects/native-federation`)

This distills the research into concrete guidance we’ll apply in the hands-on repo.

> Scope: CSR-focused learning repo, but we still design it like a production setup (runtime manifest, strict boundaries, shared deps policy).

## A. Architecture defaults (what to standardize)

### A1) Composition: route-level first

- Prefer **route-level composition**: the shell owns top-level navigation and delegates route subtrees to remotes.
- Avoid starting with component-level composition unless you have a clear reason (it increases coupling).

### A2) Shell responsibilities (keep it thin)

Shell owns:

- App frame: layout, header/nav, top-level router
- Cross-cutting plumbing: auth/session wiring, telemetry, global error boundaries
- Remote discovery: fetching + validating runtime manifest
- Shared UI primitives: design tokens (CSS variables) and a small design system package

Shell avoids:

- Business logic for remote domains
- Deep shared state across domains

### A3) Remote responsibilities (domain ownership)

Each remote:

- Owns a **business domain** and a route subtree
- Exposes a minimal integration surface (routes or a feature entry)
- Can fail independently; shell provides a fallback UX

## B. Runtime remote discovery (manifest-driven)

Even in a monorepo, treat remotes as independently deployed by implementing a **runtime manifest**.

### B1) Manifest goals

- Shell can switch dev/stage/prod without rebuild
- Shell can pin or roll back remote versions
- Shell can show clear diagnostics if a remote is missing/incompatible

### B2) Minimal manifest shape (learning-friendly)

We’ll use a simple JSON file first (can evolve later):

```json
{
  "remotes": {
    "catalog": {
      "entry": "http://localhost:4201/remoteEntry.js",
      "version": "0.0.0-local"
    },
    "checkout": {
      "entry": "http://localhost:4202/remoteEntry.js",
      "version": "0.0.0-local"
    }
  }
}
```

Production-grade add-ons (we’ll mention, not implement initially): signature/JWS, integrity hashes, compatibility ranges, channel support (canary/stable).

## C. Shared dependencies policy (avoid multiple Angular runtimes)

The most common real-world failure mode: accidentally running multiple Angular runtimes.

Practical policy:

- Treat `@angular/*` and `rxjs` as **shared singletons**.
- Keep shell + all remotes on the **same Angular major** (21.x).
- Share **as little as possible** beyond runtime + the design system.

## D. Integration contract (keep it explicit and versionable)

For route-level composition, the remote should expose something stable, for example:

- A `routes` export (Angular Routes array), or
- A `FeatureEntry` with a `loadChildren`/`loadComponent` hook

We will implement a contract that supports:

- Lazy loading
- Mount-time diagnostics (remote name/version)
- Graceful fallback if the remote fails to load

## E. Security and hardening (what to adopt early)

In a learning repo, we won’t implement full supply-chain hardening, but we’ll design for it:

- Prefer **immutable, content-hashed assets** for remotes in real deployments
- Keep a place in the manifest for:
  - `integrity` (SRI)
  - `publishedAt`
  - compatibility metadata
- Plan for a strict CSP (practically, you’ll need to allow remote origins in `script-src` and `connect-src`)

## F. Performance guidance (CSR)

- Route-level lazy loading is your primary performance lever.
- Avoid shipping duplicate frameworks by enforcing the shared-deps policy.
- Preload/prefetch remote chunks only when you have measured a UX benefit.

## G. Repo strategy: what’s “industry standard” in 2026

Both are standard:

- **Monorepo** (often Nx) is common where platform teams want consistency and easy local dev.
- **Polyrepo** is common where teams are fully autonomous and releases are decoupled.

For learning, we’ll use a **single repo / multi-project workspace**, but we’ll still implement runtime manifest loading so the architecture maps to a polyrepo deployment model.

