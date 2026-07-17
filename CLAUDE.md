# CLAUDE.md — marketing

Public marketing site for the School Management App — the only fully public-facing surface, no login at all. Home page, pricing, and the two ways a school gets provisioned. See `README.md` for local setup/run — this file is about how the code is organized and conventions worth knowing before changing it.

**Sibling repos** (same backend, different clients — not shared code, not in this repo): `school-management-app-backen` (the API), `school-management-app-ui` (tenant-facing web), `school-management-app-android` (tenant-facing mobile), `school-management-app-operator` (internal platform-team console). Backend DTOs are hand-mirrored here in `src/types/index.ts` with no shared schema/codegen.

**If you're editing `src/types/index.ts` or `src/data/plans.ts` because a backend DTO/plan changed:** this repo's scope is narrow — only `PublicSignupRequest`, `PublicTrialSignupRequest`, and plan pricing shape. It never needs the core school-domain or platform-console DTOs the other clients carry (see backend's `CLAUDE.md` "Cross-repo checklist" for the full breakdown).

## What it does

- Home page describing the product and its features — hero CTA leads with **"Start free trial"**.
- Pricing page sourced from the three seeded plans (Basic/Standard/Premium) — keep `src/data/plans.ts` in sync with the backend's `PlanDefaults.java` / `V18` seed migration if either changes.
- Two distinct signup paths, both CAPTCHA-protected and rate-limited server-side:
  - **`/start-trial`** (`TrialSignupPage.tsx`) → `POST /api/v1/public/trial-signups` — provisions a real `TRIAL` school **immediately**, no operator review, always on the Basic plan. Success screen says the trial is live.
  - **`/request-account`** (`SignupPage.tsx`) → `POST /api/v1/public/signup-requests` — lands in the operator console's signup queue for manual review/approval. Success screen says "we'll be in touch."

## Stack

React 18.3 + TypeScript 5.5, Vite 5.3, Tailwind 3.4, React Router DOM 6.24, axios 1.7, Vitest + React Testing Library for tests. No React Query (no authenticated/cached data — just two POST calls). No login of any kind.

## Folder structure (`src/`)

- `api/` — `client.ts`, `signup.ts` (posts to `/public/signup-requests` and `/public/trial-signups`).
- `components/ui/` — `Button`, `Card`, `Field`.
- `components/layout/` — `Layout.tsx`, `TurnstileWidget.tsx` (Cloudflare Turnstile CAPTCHA).
- `data/plans.ts` — pricing data **manually kept in sync** with the backend's `PlanDefaults.java` — no shared source of truth.
- `pages/` — `HomePage`, `PricingPage`, `SignupPage` (`/request-account`), `TrialSignupPage` (`/start-trial`), `NotFoundPage`.

## The "dev-ready CAPTCHA" pattern

Neither side treats a missing CAPTCHA secret as a hard failure (unlike every other external-service provider in the backend, which throws `NotConfiguredException`/503): the backend's `TurnstileCaptchaVerifier` passes every token through (loud log warning) when `CAPTCHA_TURNSTILE_SECRET_KEY` is unset; this frontend skips rendering the Turnstile widget entirely when `VITE_TURNSTILE_SITE_KEY` is unset and submits a placeholder token instead. **Both must be set together before any non-local/production deployment** — nothing enforces that automatically.

## Rate limits (backend-side, worth knowing when testing signup flows)

`/public/signup-requests`: 5/hour/IP. `/public/trial-signups`: 3/hour/IP. Both Bucket4j in-memory — single-instance only, would need Redis behind a multi-instance deployment.

## Testing

Vitest + React Testing Library + jsdom (`vitest.config.ts`, `src/test/setup.ts`). `npm test` / `npm run test:watch`. 11 files / 83 tests: both signup API calls, `TurnstileWidget`'s unset-key fallback vs. set-key path, `SignupPage`/`TrialSignupPage` (validation, success, 409/429/generic error paths), `PricingPage`/`data/plans.ts` sanity checks, `HomePage`, `NotFoundPage`, and an `App.tsx` routing smoke test. `Layout.tsx`'s active-link styling is only indirectly covered. Mock `api/*.ts` with `vi.mock` rather than adding MSW.
