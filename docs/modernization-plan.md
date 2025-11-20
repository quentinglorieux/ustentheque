# Modernization Strategy

## Goals

- Eliminate hardcoded Directus URLs; rely entirely on runtime config & proxy.
- Stabilize authentication (store refresh, logout cleanup, better error surfaces).
- Improve UI consistency; move PrimeVue-heavy areas toward Nuxt UI or modern PrimeFlex tokens.
- Prepare for Nuxt 4 migration once it reaches RC; keep dependencies compatible.

## Key Tracks

### 1. Runtime & Networking

- [x] Introduce runtime-config-driven Directus base + internal proxy.
- [x] Update remaining API utilities (`service/*.js`, stores) to consume `useDirectusBase` or server proxy.
- [x] Centralize HTTP interactions in composables (e.g., `useDirectusClient`).
- [x] Add health check endpoint to verify remote Directus availability (`Convert ad-hoc Directus instantiations to a shaserver/api/health/directus`).

### 2. Authentication & Stores

- [x] Kick off `stores/auth.js` refactor with token persistence, Directus client sync, and structured session helpers (follow-up: migrate persistence to secure cookies).
- [ ] Add refresh-token handling + auto-logout on 401 (refresh endpoint exists; need retry/guard wiring in UI).
- [x] red client injected via plugin for SSR safety.
- [ ] Expand Toast coverage for auth failures.

### 3. UI & UX Cleanup

- [ ] Audit pages for duplicated markup; extract shared components (cards, action bars).
	- [x] Introduced `SectionCard` component and applied it to MesPrêts, MesEmprunts, MesOutils layouts.
- [ ] Replace inline style utility strings with SCSS tokens where practical.
	- [x] Moved the login hero gradient + border radii into reusable `.auth-card-*` classes within `assets/styles.scss`.
- [x] Evaluate Nuxt UI adoption for forms/dialogs; keep PrimeVue where feature-rich components are needed.
  - Nuxt UI works well for lightweight auth/profile forms and confirmation dialogs (Login, Signup, Profil) while PrimeVue stays for DataTable/DataView heavy screens.
  - Pilot plan: replace `pages/auth/Login.vue` form shell with `<UForm>` + `<UFormGroup>` and migrate the CRUD confirmation dialog to `<UModal>` once Nuxt UI is added.
  - PrimeVue remains the source for complex widgets (DataTable, Tree, FileUpload) until equivalent Nuxt UI patterns mature.
- [ ] Improve empty/loading states (spinners, skeletons).

### 4. Nuxt Upgrade Path

- [ ] Track Nuxt 4 timeline; test upgrade in feature branch.
- [ ] Ensure dependencies (`nuxt-directus`, `pinia`, PrimeVue) support Nuxt 4/Vite 6.
- [ ] Add minimal E2E smoke tests (Playwright) to detect regressions before migration.

## Immediate Next Steps

- [x] Finish removing hardcoded Directus URLs in `service/` and `stores/` directories.
- [x] Create `useDirectusClient` composable + plugin that memoizes the SDK instance per request.
- [x] Start auth-store refactor (token storage, refresh flow, proxy-based login endpoint).
