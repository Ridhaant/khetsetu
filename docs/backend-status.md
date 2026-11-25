# Backend implementation and verification

This is a tested development reference, **not a production-ready service**. The HTTP application uses a volatile in-memory store and explicitly refuses production startup. The PostgreSQL repository is source for the next implementation phase and is not mounted by the demo server.

## Run the development API

Node.js 24 or later is required. The demo runtime and tests use only Node built-ins; installing Prisma is not necessary to run the API.

```powershell
Set-Location apps/api
Copy-Item .env.example .env
npm run build
npm start
```

The example sets `DEMO_MODE=true`. Alternatively set that environment variable and use `npm run dev`. The server binds to `127.0.0.1:4000` by default. `HOST=0.0.0.0` is necessary inside the development container; the Compose port is still bound to local loopback.

`POST /api/v1/auth/demo` accepts `{ "role": "buyer" }`, `{ "role": "seller", "sellerId": "s1" }`, or `{ "role": "admin" }`. These are openly selectable **development identities**, not verified accounts. Tokens last 15 minutes, are kept in memory by web or secure storage by native clients, and become invalid on restart unless `ACCESS_TOKEN_SECRET` is stable. There is no production OTP, refresh rotation, revocation, or recovery implementation. OTP routes return 503 honestly.

The development marketplace now defaults to **all-India scope**. A six-digit PIN starting with 1–9 is eligible for development checkout/RFQs unless explicitly denied. This checks format only: it does not establish that the postal PIN exists or that a seller, pickup point, or delivery partner serves it. Responses explicitly contain `validation: "format-only"` and `logisticsVerified: false`. Nashik/Pune sellers remain fixture growing origins, not evidence of nationwide fulfilment.

`SERVICEABILITY_MODE=national` is the default. Set `SERVICEABILITY_MODE=pilot` to restrict eligibility to `SERVICEABILITY_PILOT_PINS` (default `400008`) plus `SERVICEABILITY_ALLOW_PINS`. `SERVICEABILITY_DENY_PINS` always wins over national scope, pilot membership, and explicit allows. Lists are comma-separated; malformed entries fail startup. Restart the demo after changing environment settings. The same policy is used by serviceability, checkout, RFQ creation, and acceptance of an unaccepted quotation. No administrative configuration-write endpoint is invented.

Demo seller IDs are `s1`, `s2`, and `s3`; the user IDs are `buyer-demo`, `seller-demo`, and `admin-demo`. `sellerId` controls seller ownership in the demo token. These identities must never be used in production. Demonstration role changes do not represent identity verification.

## Implemented and exercised

- Public catalog, seller directory, and configurable national/pilot development PIN eligibility with explicit deny/allow controls.
- Listing creation for seeded verified sellers; own-listing price/title/stock/MOQ/status/expiry edits. Stock cannot drop below existing reservations.
- Input validation, bounded JSON requests, Bearer sessions, ownership/role authorization, origin allowlist, basic per-process IP rate limiting, security headers, and non-sensitive error responses.
- Multi-seller checkout with one order per seller, independent delivery allocation, immutable copied line prices/titles/units/grades, 15-minute inventory holds, request fingerprints, and retry keys scoped to the buyer. No taxes or commissions are charged in the demo; zero fees are explicit defaults pending business/tax review.
- In-process serialization prevents overselling within **one process**. It does not provide multi-instance or durable consistency.
- Illustrative development delivery calculation: ₹49 per seller order; free above ₹1,000, or pickup. These are demonstration workflow amounts, not nationwide carrier quotes or an operational pickup/delivery commitment.
- Real Razorpay HTTP adapter source for provider orders/refunds; exact-byte HMAC webhook verification, known provider-order matching, INR amount matching, event replay protection, reservation consumption, and payment transition logic.
- The development HTTP app accepts **only `rzp_test_` key IDs**. Live or unknown Razorpay keys fail startup before demo identities can take payment. Without test credentials, checkout returns pending/unavailable and takes no payment. The source does not simulate a successful payment page.
- Seller order transitions, buyer cancellation, capture/expiry rules, and completion ownership. Delivery requires photo proof verified by an injected evidence adapter; the default adapter **rejects all proof** with 503 until object storage validation and malware scanning exist.
- RFQ creation, seller-owned quotes, two-quote comparison data, and acceptance that creates at most one checkout, including retries with a different client key.
- Verified reviews after completed orders only, duplicate-review protection, perishable quality disputes within 24 hours, support resolution records, bounded refund amounts, admin/finance refund permission, retry-safe in-process refund requests, and provider-webhook refund reconciliation.
- Hash-linked demo audit trail returned only to admin/finance. The returned records are copies; process state remains mutable and volatile. The database migration additionally supplies append-only triggers for audit rows.

## Verification performed

On 22 November 2026:

- `npm run build`: passed, native Node TypeScript transformation of all API source including the PostgreSQL repository.
- `npm run lint`: passed, syntax validation and a small unsafe-pattern check; this is not a full ESLint ruleset.
- Strict `tsc --noEmit`: passed for all API source, including `postgres-repository.ts`, using the installed web TypeScript compiler and bundled Node typings. In a normally installed package run `npm run typecheck`.
- `npm test`: **15 tests passed**. Tests include real local HTTP requests, authorization and validation, live-key rejection, exact HMAC verification, concurrent inventory reservation, duplicate checkout, immutable snapshots, expired/paused listings and unsupported PINs, unpaid transition rejection, payment amount mismatch/replay, proof gating, completed-order review, quality dispute resolution, RFQ two-quote acceptance, refund replay/over-refund protection, partial-refund states, and signed HTTP webhook replay.
- Tests use an **explicit test gateway** and test evidence verifier where necessary. They do not establish real Razorpay sandbox success, provider reconciliation, real proof upload, mobile/device behavior, or PostgreSQL concurrency.

Local loopback tests initially failed because the execution sandbox denied network access; the same suite passed with authorized loopback access. This was an execution constraint, not a hidden/skipped test.

### National-scope revision verified on 25 November 2026

- API build and syntax/unsafe-pattern lint passed across 10 modules.
- Strict TypeScript checking passed across all API source, including the new serviceability policy and the PostgreSQL repository. The app runtime update moved the bundled Node typings; checking passed using the updated runtime path.
- `npm test`: **22 tests passed**. Added representative regional checkout, RFQ, and quote-acceptance flows; zero-leading/malformed PIN rejection; configurable pilot areas; allow exceptions; deny precedence; invalid environment configuration; and area-policy revalidation before accepting an unaccepted quote. Real local HTTP checks cover the new response metadata and a Delhi development checkout.
- The fixtures include Mumbai, Delhi, Bengaluru, Chennai, Kolkata, Ahmedabad, Guwahati, and Andaman examples. These are format-policy examples, not a verified postal directory or evidence of carrier service. No real nationwide logistics, external payment, or database claim was added.

## Database work supplied but not executed

`apps/api/prisma/schema.prisma` defines 36 models for identity, profiles, addresses, sessions, sellers, verification, taxonomy, products, listings, inventory, tiers, carts, negotiations, checkouts, seller orders/items, payments/refunds/payouts, webhooks, RFQs/quotes, shipments, reviews/disputes, conversations/messages, notifications, promotions, commissions, service areas, media, support, outbox jobs, and audit records.

The checked-in initial SQL migration includes PostGIS/pgcrypto, relational keys/indexes, nonnegative/constrained reservations, positive pricing/quantities, immutable commercial order snapshots/order items, append-only audit triggers, and a geographic index. It was emitted by the one-time checked-in schema emitter; **Prisma schema validation, migration application, drift checks, and database integration tests have not run**.

`PostgresCheckoutRepository` contains parameter-bound SQL with SERIALIZABLE transactions, stable inventory row-lock ordering, durable buyer/request idempotency, owner-address snapshots, price-tier snapshots, per-seller totals, provider-capture matching, webhook payload hashes, and transactional outbox insertion. It is not a complete production adapter: expiry/cancellation/refund/fulfilment/review repositories, worker consumption, durable reconciliation, ownership authorization, and API mounting still need implementation and integration tests.

To validate when Docker and package downloads are available:

```powershell
docker compose -f infra/docker-compose.yml up -d postgres redis storage
Set-Location apps/api
npm install
npm run prisma:generate
npx prisma validate
npm run db:migrate
npm run db:seed
```

The seed creates fixture users without production OTP identities, taxonomy, three sellers, nine listings with stock/tiers, a buyer address in Mumbai 400008, eight regional candidate service areas, and configurable unit records. New database service-area candidates are **inactive by default**; rerunning the seed preserves existing operational configuration. The persistent checkout repository still requires an exact, explicitly active `ServiceArea` row and does not adopt the format-only national demo policy. Real launch additionally requires validated seller coverage, actual carrier/pickup serviceability, capacity, costs, perishable handling, and applicable central/state compliance. No successful real payments are seeded. The seed was not run against a database here. Docker Desktop's daemon was unavailable, and Prisma packages were absent from the offline package cache. Do not treat the migration or seed as verified.

## Remaining launch blockers

Production identity/OTP/session security; durable repository integration; database migration verification and genuine concurrency tests; independent seller onboarding/document verification; real scanned uploads and signed private URLs; gateway sandbox checkout and actual signed callbacks; expiry and reconciliation workers; licensed marketplace settlement/seller onboarding; logistics and proof integration; notification queues/providers; staff permissions and assignment; invoices and tax/compliance policy approval; distributed rate limiting, operational logging, monitoring, backup restoration, and incident procedures.

The demo reserves stock even when the payment adapter is unconfigured, then releases it after 15 minutes. An expired/cancelled reservation receiving a late capture is rejected for manual reconciliation. No background refund is invented. Restarting the demo loses orders, keys, provider identifiers, and audit state; never point a public/live payment webhook at it.
