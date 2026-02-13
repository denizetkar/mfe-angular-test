# Step 4 — Hands-on implementation plan (to execute in 💻 Code mode)

Baseline choice for this repo:

- Workspace tooling: **plain Angular CLI multi-project workspace** (no Nx initially)
- Package manager: **pnpm**
- Rendering: CSR only
- Federation: `@angular-architects/native-federation`

Rationale: This keeps the learning path focused on microfrontend mechanics (contracts, runtime manifest, shared deps) rather than monorepo tooling. Nx can be an optional follow-up exercise.

Important constraint for this repo: we will **install the core toolchain as dev dependencies** (Angular CLI, and later `@angular-architects/native-federation`) and run it via `pnpm exec`, rather than relying on ephemeral runners (`npx`/`pnpm dlx`) for everyday development.

## 0) Target end state

- `shell` (host)
- `catalog` (remote)
- `checkout` (remote)
- `ui` (shared design system library)

All three apps:

- run independently in dev
- can be composed via the shell at runtime
- share Angular + RxJS as singletons via native federation config

## 1) Scaffold the Angular workspace (in repo root)

Commands (PowerShell) will be chosen to guarantee Angular CLI v21 (for reproducibility). In Code mode we’ll run them and confirm output.

Expected artifacts:

- `package.json`
- `angular.json`
- `projects/` or `apps/` style structure (depending on CLI defaults)

## 2) Generate projects

Generate:

- Applications: `shell`, `catalog`, `checkout`
- Library: `ui`

Set default dev ports (example):

- shell: 4200
- catalog: 4201
- checkout: 4202

## 3) Add Native Federation

Apply `@angular-architects/native-federation` schematics/config to:

- Shell as host
- Each remote as remote

Configure each remote to expose one entry for its route subtree.

## 4) Implement the integration contract (route subtree export)

In each remote:

- Create a `routes` entry module exporting `remoteRoutes` (typed `Routes`)
- Add a couple of pages so navigation is visible (`home`, `details`)
- Use the `ui` library components so we prove shared UI works

In the shell:

- Add routes `/catalog` and `/checkout`
- Lazy-load the remote route subtree from the federation runtime
- Add a shell-owned fallback component for load failures

## 5) Implement runtime manifest loading

Add manifest files under shell assets:

- `/assets/mfe.manifest.json` (default)
- `/assets/mfe.manifest.dev.json` (optional)

Implement manifest selection rules (as specified in [`plans/step3-hands-on-architecture-and-contract.md`](plans/step3-hands-on-architecture-and-contract.md)):

- query param override
- `localStorage` override
- last-known-good fallback

## 6) Enforce shared dependency policy

Verify via configuration + simple runtime checks:

- Angular core and router are singletons
- no duplicate Angular runtimes are loaded

Add lightweight diagnostics page in the shell showing:

- which manifest is active
- remote versions from the manifest
- which remotes successfully loaded

## 7) Minimal quality gates

- Unit test per app (smoke)
- Contract test: both remotes export the expected route entry
- One e2e smoke: shell loads and can navigate into both remotes

## 8) Documentation

- Add a runbook: how to start shell+remotes, how to override manifest, and how to add a new remote
