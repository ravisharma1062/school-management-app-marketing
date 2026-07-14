# School Management — Marketing Site

Public marketing site + signup request form (MT-4 of the multi-tenant SaaS plan). Deliberately a separate
deployable from both the school-facing app (`school-management-app-ui`) and the operator console
(`school-management-app-operator`) — marketing edits should never risk either app, per the plan's MT-4 design.

## What it does

- Home page describing the product and its features.
- Pricing page sourced from the three seeded plans (Basic/Standard/Premium) — keep `src/data/plans.ts` in sync
  with the backend's `PlanDefaults.java` / `V18` seed migration if either changes.
- "Request an account" form → `POST /api/v1/public/signup-requests` on the backend, protected by Cloudflare
  Turnstile and rate-limited server-side. Submissions land directly in the operator console's signup queue.

## CAPTCHA is dev-ready, not yet live

Leave `VITE_TURNSTILE_SITE_KEY` unset for local development — the signup form then skips rendering the
Turnstile widget and submits a placeholder token, which the backend's equally-unconfigured `CaptchaVerifier`
accepts (see that class's Javadoc in the backend repo). Set a real Turnstile site key (and the matching
`CAPTCHA_TURNSTILE_SECRET_KEY` on the backend) before any non-local deployment.

## Local development

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your backend
npm run dev             # http://localhost:5175
```

## Known gaps

- No dedicated feature-detail pages yet — the home page's feature grid is the whole pitch for now.
- Not yet deployed to a real marketing domain (no domain has been decided/purchased).
