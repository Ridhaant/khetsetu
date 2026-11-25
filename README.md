# KhetSetu

**KhetSetu** connects farmers and FPOs directly with wholesalers, kirana shops, restaurants, and caterers across India. Buyers and growers submit requirements or harvest availability using any six-digit Indian PIN code, and the operations team verifies grade, landed pricing, and route transport before anything is confirmed.

Live preview (GitHub Pages): **https://ridhaant.github.io/khetsetu/**

Support: **+91 70216 10641** · **redantthakur@gmail.com**

---

## How it works

1. **Public enquiry & bilingual UI (English / हिंदी):** Buyers post produce requirements and farmers list available stock across India. No online payment or stock lock is created by the form.
2. **Private receipt tracking:** Each submission issues a `KS-...` reference and a secret key stored in the user's browser (or Expo SecureStore on mobile) to inspect status updates, compare landed supplier quotes, or withdraw and erase contact details.
3. **Operations desk:** Coordinators review requests by PIN, enter integer-paise supplier quotes (produce, packing, delivery, fees), compare totals for matching grades/units, record agreed quotes, and export CSVs.
4. **Static GitHub Pages mode vs. full backend:**
   - When hosted statically on **GitHub Pages**, the web app runs cleanly in browser-backed preview mode with one-click **WhatsApp** and **Email** handoff buttons on confirmation.
   - When run locally with `npm run dev` (or deployed to Cloudflare Workers + D1), the frontend automatically connects to the `/api/pilot` Worker backend and SQLite/D1 storage.

## Quick start (local)

Requires **Node.js 24+**.

```powershell
# 1. Install web dependencies
npm --prefix apps/web ci

# 2. Build the web app and Worker bundle
npm run build

# 3. Start the local preview server + SQLite database
npm run dev
```

Open `http://127.0.0.1:4173`. Local SQLite data is stored in `.sites-runtime/` (gitignored). To test the Operations inbox locally against SQLite, visit `http://127.0.0.1:4173/__local/signin` (a loopback-only QA route absent from the production Worker bundle).

## Validation and tests

Run all checks across web, Worker, development API, and mobile:

```powershell
npm run db:generate
npm run build
npm run typecheck
npm run lint
npm run pilot:test
npm test
npm --prefix apps/api run build
npm --prefix apps/api run lint
npm --prefix apps/api test
npm --prefix apps/mobile test
```

## Repository structure

| Path | Purpose |
| --- | --- |
| `apps/web` | React + TypeScript + Vite web application (bilingual EN/HI intake, tracking, Operations desk, and static fallback store) |
| `worker` | Cloudflare Worker API (`worker/pilot.mjs`) with D1/SQLite persistence, idempotency, rate limits, and 90-day retention cleanup |
| `db` & `drizzle` | SQLite/D1 schema and immutable initial migration (`0000_assisted_pilot.sql`) |
| `apps/mobile` | React Native / Expo client sharing `/api/pilot` with SecureStore receipt persistence |
| `apps/api` | Retained transactional marketplace prototype (Node 24 TypeScript API + Prisma/PostGIS schema) |
| `packages/contracts` | Shared API type exports |
| `infra` | Local Docker Compose definition for Postgres/PostGIS, Redis, and MinIO |
| `docs` | Product specs, API reference, compliance review notes, and verification logs |

## Production notes & boundaries

- Requests are enquiries for manual team review—not automated orders, stock holds, or online payments.
- Required secrets for Cloudflare Worker deployment (never committed): `OPS_ADMIN_EMAIL`, `RATE_LIMIT_SALT`, and `SITE_ORIGIN`.
- See [`docs/PILOT-OPERATIONS.md`](docs/PILOT-OPERATIONS.md), [`docs/PILOT-API.md`](docs/PILOT-API.md), and [`docs/VERIFICATION.md`](docs/VERIFICATION.md) for detailed workflows and test records.
