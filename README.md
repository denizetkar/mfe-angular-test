# mfe-angular-test

A learning workspace demonstrating **Angular 21 microfrontends** using
[`@angular-architects/native-federation`](https://github.com/angular-architects/native-federation).

## Workspace layout

```
mfe-angular-test/            ← monorepo root (single package.json)
├── projects/
│   ├── shell/               ← host app  → http://localhost:4200
│   ├── catalog/             ← remote MFE → http://localhost:4201
│   ├── checkout/            ← remote MFE → http://localhost:4202
│   └── ui/                  ← shared Angular library (design tokens + Ui component)
├── plans/                   ← architecture & learning notes
├── angular.json
├── package.json
└── tsconfig.json
```

## Prerequisites

| Tool        | Version                                                             |
| ----------- | ------------------------------------------------------------------- |
| Node.js     | 20 LTS or later                                                     |
| pnpm        | 10.x (`corepack enable && corepack prepare pnpm@latest --activate`) |
| Angular CLI | included — use `pnpm ng …` or `npx ng …`                            |

Install all dependencies (one command from the repo root):

```bash
pnpm install
```

---

## Starting the local dev servers

The shell composes both remotes at runtime via a manifest file
(`projects/shell/public/mfe.manifest.json`). **All three servers must be
running at the same time.**

Open **three terminal tabs** and run one command per tab:

```bash
# Tab 1 — catalog remote  (http://localhost:4201)
pnpm start:catalog

# Tab 2 — checkout remote (http://localhost:4202)
pnpm start:checkout

# Tab 3 — shell host      (http://localhost:4200)
pnpm start:shell
```

Then open **http://localhost:4200** in your browser.

> **Order matters on first run.** The shell reads `remoteEntry.json` from each
> remote during bootstrap. Start the remotes before (or immediately after) the
> shell so the federation initialisation can resolve them.

### Single-command alternative (requires a terminal multiplexer or parallel runner)

```bash
# with npm-run-all (not installed by default — add if you like):
pnpm add -D npm-run-all
# then:
npx run-p start:catalog start:checkout start:shell
```

---

## Runtime manifest

The shell discovers remote URLs from:

```
projects/shell/public/mfe.manifest.json
```

This file is served at `http://localhost:4200/mfe.manifest.json` by the Angular
dev server. The default content points to localhost ports 4201/4202.

### Overriding the manifest URL at runtime

You can point the shell at a different manifest without rebuilding:

| Method       | Example                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------- |
| Query param  | `http://localhost:4200/?manifest=http://my-server/mfe.manifest.json`                        |
| localStorage | `localStorage.setItem('mfe:manifestUrl', 'http://my-server/mfe.manifest.json')` then reload |

The shell also stores the last successfully loaded manifest as
`localStorage['mfe:lastGoodManifest']` and falls back to it if the next fetch
fails (last-known-good strategy).

---

## Observability debug bar

When running via `ng serve` (dev mode), a fixed footer is shown at the bottom
of the shell listing every loaded remote:

```
🔭 MFE  [catalog] v0.0.0-local ✓ ok  342 ms @ 14:01:05  [checkout] v0.0.0-local ✓ ok  289 ms @ 14:01:11
```

The bar is hidden in production builds. To force it on in any environment add
`?debug=1` to the URL.

Load events are also logged to the browser console:

```
[MFE telemetry] ✓ catalog v0.0.0-local — 342 ms
```

---

## Building for production

```bash
pnpm build           # shell
pnpm build:catalog   # catalog remote
pnpm build:checkout  # checkout remote
```

Artifacts are written to `dist/<project>/browser/`. Deploy each project
independently behind its own origin/path and update `mfe.manifest.json` with
the production `remoteEntry.json` URLs before deploying the shell.

---

## Running unit tests

```bash
pnpm test            # all projects (sequential)
pnpm test:shell
pnpm test:catalog
pnpm test:checkout
```

Tests run with [Vitest](https://vitest.dev/) via `@angular/build:unit-test`.

---

## Adding a new remote

1. Generate a new Angular app: `pnpm ng generate application my-remote`
2. Add Native Federation: `pnpm ng add @angular-architects/native-federation --project my-remote --port 4203 --type remote`
3. Create `projects/my-remote/src/app/remote-routes.ts` and export `remoteRoutes: Routes`
4. In `federation.config.js` expose `'./routes': './projects/my-remote/src/app/remote-routes.ts'`
5. Add `sharedMappings: ['ui']` and `features: { ignoreUnusedDeps: false }` (same pattern as catalog/checkout)
6. Add the entry to `projects/shell/public/mfe.manifest.json`
7. Add a `loadChildren` route in `projects/shell/src/app/app.routes.ts`
8. Add `start:my-remote` script in `package.json`

---

## Learning notes

Detailed architecture decisions, dependency-sharing rules, and 2026 best
practices are documented in [`plans/`](plans/):

| File                            | Topic                                       |
| ------------------------------- | ------------------------------------------- |
| `step1-theory-…`                | MFE theory & native-federation mental model |
| `step2-2026-best-practices-…`   | Research notes: 2026 guidance               |
| `step3-hands-on-architecture-…` | Architecture & integration contract         |
| `step4-implementation-plan.md`  | Build plan                                  |
| `step5-what-you-have-now-…`     | Current state explanation                   |
