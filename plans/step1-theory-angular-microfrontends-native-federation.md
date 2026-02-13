# Step 1 — Theory: Microfrontends with Angular (CSR) and `@angular-architects/native-federation`

This note builds a shared mental model we will use for the research and the hands-on implementation.

## 1) What microfrontends are (in practice)

Microfrontends (MFEs) are an architectural approach where a user-facing web application is composed from multiple independently built (and ideally independently deployed) frontend applications.

Instead of one Angular app owning everything, you typically have:

- **Shell/Host**: the “container” app responsible for bootstrapping, layout, global navigation, and composition.
- **Remotes**: independently built apps that expose features to be loaded into the shell at runtime.

The goal is **team and release independence**, not “more repos” or “more build tools”.

## 2) When MFEs make sense (and when they don’t)

MFEs are a trade-off. They help when:

- Multiple teams need autonomy over **different business domains**.
- You need to scale development without coordinating every release.
- The application is large and long-lived.

They are often not worth it when:

- A single team owns the product and releases together.
- The app is small/medium or early-stage and changing rapidly.
- You can solve the problem with **feature modules + good boundaries** in one app.

## 3) Frontend composition patterns (how you “stitch” pieces together)

Common patterns, from loosest to tightest integration:

1. **Links + independent apps**
   - Navigation between apps (separate SPAs) via URLs.
   - Easiest ops-wise; weakest UX continuity.

2. **Route-level composition (most common with Angular MFEs)**
   - The shell owns the router.
   - Remotes contribute routes that are lazy-loaded at runtime.
   - Clean mental model: “each remote owns a route subtree”.

3. **Component-level composition**
   - Shell renders a remote component inside a page.
   - More integration surface area (styles, change detection boundaries, state).

4. **iFrames**
   - Strong isolation; weak integration; often used for legacy or strict security isolation.

For learning and for most Angular MFEs, we’ll start with **route-level composition**.

## 4) What Module Federation (and Native Federation) give you

At a high level, federation provides:

- **Runtime loading** of code from another build output (a remote).
- A mechanism for **sharing dependencies** so you don’t ship multiple copies of Angular/RxJS (when configured appropriately).
- A way for the shell and remotes to agree on **exposed entry points** (what the remote makes available).

`@angular-architects/native-federation` is a federation approach aligned with modern Angular tooling where the ecosystem has moved away from custom webpack setups. The key idea is to enable federation using **standards-friendly loading of ES modules** (rather than requiring webpack runtime coupling).

We’ll validate the up-to-date best-practices and recommended APIs in the research step.

## 5) Core architectural decisions you must make

### 5.1 Domain boundaries (the most important decision)

Pick boundaries aligned to the business, not to technical layers.

- Good: `catalog`, `checkout`, `account`, `admin`.
- Risky: `ui`, `shared`, `components`, `services` as “remotes”. Those become coordination bottlenecks.

### 5.2 Ownership model

- Shell team owns: global UX frame, navigation, cross-cutting concerns integration.
- Remote team owns: feature UX, domain state, domain API integration.

### 5.3 How remotes integrate

Prefer contracts that are:

- **Explicit**: a remote exposes a route config or a top-level feature component.
- **Versionable**: shell can tolerate a remote being updated independently.

### 5.4 Shared dependencies strategy

You want to avoid:

- Multiple Angular runtimes on the page.
- Multiple copies of RxJS.
- Incompatible versions across shell/remotes.

The usual strategies are:

- **Singleton shared core libs** (Angular, RxJS) with compatible versions.
- **Share as little as possible** beyond core runtime.
- Put your **design system** behind a stable API, and treat it like a product.

### 5.5 Cross-MFE communication

Avoid creating a giant shared state that couples everything.

Better options:

- **URL as state** (route params, query params) for navigation and deep-linking.
- **Typed events** (DOM events, event bus) for coarse-grained interactions.
- **Backend as source of truth** for domain state.
- A small shell-owned “app services” layer for cross-cutting concerns.

## 6) Operational concerns (CSR-focused)

Even with client-side rendering, MFEs introduce operational complexity:

- **Remote discovery**: how does the shell know where remotes live?
  - Static config (simple)
  - Runtime config / manifest (more flexible)

- **Independent deployments**:
  - Coordinate compatibility
  - Rollback strategy per remote
  - Cache/CDN strategy (avoid breaking clients)

- **Observability**:
  - Track which remote loaded, version, load time
  - Error boundaries and reporting per remote

## 7) A concrete mental model for our hands-on implementation

We will implement:

- **CSR-only** shell + multiple remotes.
- **Route-level composition** where each remote owns a route subtree.
- **Runtime remote URL configuration** so dev/prod can differ without rebuilding the shell.
- A minimal **shared design system** library (or shared UI package) with strict boundaries.

This gives you the “real” MFE experience (composition + dependency sharing + runtime loading) without SSR complexity.

## 8) Next step

Next we’ll do best-practices research for 2026 (Angular + federation + runtime config + sharing + security + performance), then turn that into an implementation plan and start coding.

