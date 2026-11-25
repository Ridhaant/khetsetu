# KhetSetu

A farm-to-buyer marketplace development MVP for **Mumbai PIN 400008**, with Razorpay test integration code, a responsive React web client, a native Expo application, and a TypeScript API.

**This is not a production-ready release.** The runnable API uses volatile development data and openly selectable demo identities. Production startup is deliberately disabled. The hosted site is a private, browser-local sample-data preview; it does not host the API or collect payments.

## Try the included web build

Requires Node.js **24+**. From the extracted `khetsetu` folder:

```powershell
npm run dev
```

Open `http://127.0.0.1:4173`. The source archive includes the built `dist/` folder, so this preview needs no dependency installation. It uses clearly labelled sample produce, orders and operational metrics. Baskets, favourites and listing/support drafts are local to that browser. Product imagery and optional web fonts load from external hosts; a bundled illustration and system fonts provide fallbacks.

## Run the connected buyer, seller and admin workflows

Terminal 1:

```powershell
Set-Location apps/api
Copy-Item .env.example .env
npm run build
npm start
```

The demo server runs at `http://127.0.0.1:4000`. It needs no runtime package install. Its `.env` must contain `DEMO_MODE=true`; no secrets are included. Do not use this API with real funds or expose it publicly.

Terminal 2, from the repository root:

```powershell
npm --prefix apps/web ci
Copy-Item apps/web/.env.example apps/web/.env.local
# Set VITE_API_URL=http://127.0.0.1:4000/api/v1 in .env.local
npm --prefix apps/web run dev
```

Open the printed Vite URL, normally `http://127.0.0.1:5173`. The account menu switches buyer/seller/admin workspaces; on a phone, navigation includes the seller and admin previews. These are development role switches, not production sign-in. Seller IDs are `s1`, `s2`, `s3`; all use the same API records, inventory and orders. API records disappear on restart.

For a physical mobile device, configure a reachable development API address and its CORS/host settings intentionally. `127.0.0.1` on a phone is the phone itself. See [native setup](apps/mobile/README.md).

## Payment behaviour

Without credentials, checkout **reserves inventory and returns payment pending/unavailable**. It never invents payment success. The hold expires after 15 minutes. Successful reservations clear the basket; retry keys prevent duplicate checkout requests.

To exercise an actual sandbox payment, configure matching **Razorpay test** credentials on the API, a signed webhook endpoint, and the public `VITE_RAZORPAY_KEY_ID` on the client. The browser can open Razorpay's hosted checkout. Only a validated signed server webhook can mark orders paid. This complete external-provider workflow was **not executed** here. Live keys are rejected by the demo API/client.

No raw card data is stored. Payout/escrow capability must use a licensed provider product after onboarding. No internal escrow is implemented.

## Repository

| Path | What is supplied |
| --- | --- |
| `apps/web` | React/TypeScript/Vite responsive marketplace, sample preview, API-connected buyer/seller/admin flows, browser payment handoff, local drafts and tests |
| `apps/api` | Node 24 TypeScript REST API, protected state machine, Razorpay adapter/webhooks, OpenAPI, tests, Prisma schema/migration/seed, unmounted Postgres repository |
| `apps/mobile` | Expo/React Native native screens, API adapter, secure session storage, offline basket, Android/iOS release configuration and tests |
| `packages/contracts` | Shared reference contracts |
| `infra` | Development Docker Compose for PostGIS, Redis and S3-compatible storage |
| `docs` | PRD, scope/assumptions, journeys, design system, ER diagram, integration contracts, compliance sources, operations and roadmap |

React/Vite was used for the verified web build because the registry was unreachable and Next.js was absent from the local cache. Next.js server rendering, route SEO, product structured data, sitemap and complete bilingual coverage remain deferred. The included English/Hindi dictionary demonstrates core buyer strings; it is not a finished Hindi translation of every workspace.

## Verification

See [the exact verification report](docs/VERIFICATION.md) and [backend implementation boundaries](docs/backend-status.md).

```powershell
npm run build
npm run typecheck
npm run lint
npm test
npm --prefix apps/api run build
npm --prefix apps/api run lint
npm --prefix apps/api test
npm --prefix apps/mobile test
```

Web/API lint commands are explicit syntax and unsafe-pattern checks, not a full ESLint ruleset. API strict typing passed using the installed web compiler and bundled Node types. Normally install API development dependencies and run `npm --prefix apps/api run typecheck`.

**25 automated tests passed**: web 6, API 15, mobile domain 4. Browser checks exercised connected reservations, RFQs, quotations, admin cancellation and responsive layout. API test gateways/evidence adapters are explicit test doubles; they do not establish real provider or upload success.

## Required next gates

The PostgreSQL schema/migration/seed and repository source have **not been applied or integrated**. Docker's daemon was unavailable; local PostgreSQL lacked PostGIS. Complete and verify durable repositories, real OTP/session rotation, seller/document verification, private scanned uploads, real gateway sandbox reconciliation, notifications, logistics, settlements, invoices/tax rules, full translations, native builds/device accessibility, and restore/monitoring procedures before launch.

Do not mistake planned screens or schema entities for completed modules. Chat, notifications, seller onboarding approval, invoices, promotions, staff accounts, and production service-area administration are not complete implementations. See [scope and release gates](docs/PRD.md), [operations](docs/OPERATIONS.md), [India review](docs/COMPLIANCE.md), and [roadmap](docs/ROADMAP.md).
