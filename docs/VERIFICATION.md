# Verification and release status

## Humanized web, Produce Directory & GitHub Pages checks, 26 November 2026

| Check | Result |
| --- | --- |
| `npm run db:generate` | Passed (`Pilot schema and immutable initial SQL migration match`) |
| `npm run build` | Passed (Vite built `apps/web/dist` with relative `./` base and bundled Worker `dist/server/index.js` with 5 embedded assets) |
| `npm run typecheck` | Passed (`tsc --noEmit -p apps/web`, 0 errors) |
| `npm run lint` | Passed (`14` web modules, 0 syntax or safety errors) |
| `npm run pilot:test` | `20` passed, `0` failed, `0` skipped |
| `npm test` | `12` passed, `0` failed, `0` skipped (6 marketplace domain + 4 static preview store + 2 produce catalog tests covering 87 Indian fruits, vegetables & staples) |
| `npm --prefix apps/api run build` / `lint` / `test` | Build & lint passed across `10` modules; `22` tests passed, `0` failed, `0` skipped |
| `npm --prefix apps/mobile test` | `9` passed, `0` failed, `0` skipped |

Total automated tests passing: **63** (`20` Worker + `12` Web + `22` API + `9` Mobile).

## Humanized web & GitHub Pages checks, 25 November 2026

| Check | Result |
| --- | --- |
| `npm run db:generate` | Passed (`Pilot schema and immutable initial SQL migration match`) |
| `npm run build` | Passed (Vite built `apps/web/dist` with relative `./` base and bundled Worker `dist/server/index.js` with 5 embedded assets) |
| `npm run typecheck` | Passed (`tsc --noEmit -p apps/web`, 0 errors) |
| `npm run lint` | Passed (`13` web modules, 0 syntax or safety errors) |
| `npm run pilot:test` | `20` passed, `0` failed, `0` skipped |
| `npm test` | `10` passed, `0` failed, `0` skipped (6 marketplace domain + 4 static preview store tests) |
| `npm --prefix apps/api run build` / `lint` / `test` | Build & lint passed across `10` modules; `22` tests passed, `0` failed, `0` skipped |
| `npm --prefix apps/mobile test` | `9` passed, `0` failed, `0` skipped |
| Playwright browser (Worker `127.0.0.1:4173`) | Full Hindi switch verified; submitted buyer request for PIN `560001` (`KS-A664E20FF05B`), verified private `#track`, and viewed record in `/__local/signin` Operations with `0` console errors |
| Playwright browser (Static subpath `127.0.0.1:4174/khetsetu/`) | Static preview banner, relative `produce.svg` (`225px`), mobile viewport `390×844` (`overflow: false`), buyer submission (`KS-4C502FD2A3A0`), WhatsApp/Email handoff links, and Demo Operations Desk verified |

Total automated tests passing: **61** (`20` Worker + `10` Web + `22` API + `9` Mobile).

## India-wide assisted sourcing, 25 November 2026

KhetSetu’s assisted website and native app accept buyer and farmer requests with Indian PIN formats nationwide. The operations team confirms the location and available transport before agreeing delivery. Neither the hosted intake nor the separate development API queries a postal directory or carrier.

| Check | Result |
| --- | --- |
| Hosted Worker and web build | Passed, including strict web TypeScript checking and local migration consistency |
| Assisted sourcing Worker | 20 tests passed, including buyer requests across seven regional PINs, receipt and inbox persistence, and malformed PIN rejection |
| Browser against the built Worker | Submitted a local buyer request for PIN 560001, opened its private receipt, and found it using PIN search in the local operations inbox |
| Web marketplace rules | 6 tests passed, including national PIN formats and malformed PIN rejection |
| Development marketplace API | 22 tests passed. Build, lint and strict TypeScript checking passed. Geographic coverage tests include national mode, restricted pilot mode, PIN overrides and quote acceptance. |
| Native assisted app and retained marketplace | 9 tests and full Expo TypeScript checking passed. Metro exported Android and iOS Hermes bundles. Signed binaries and device tests remain separate. |

The current checks total **57 automated tests**. The assisted Worker uses the existing D1 schema. The separate development API applies a configurable PIN policy. Its future PostgreSQL checkout still requires an active exact service-area record. The new scope does not establish automatic delivery, payments or live carrier coverage.

## Historical development marketplace checks, 22 November 2026

Verified on **22 November 2026** for the confirmed KhetSetu / Mumbai **400008** / Razorpay pilot.

## Executed checks

| Check | Result |
| --- | --- |
| Web production asset build and strict TypeScript check | Passed; React/TypeScript/Vite, about 92 KB gzipped application JavaScript |
| Web source lint | Passed; syntax plus unsafe-pattern checks for eight source modules, not full ESLint |
| Web domain tests | 6 passed; service PIN, MOQ/stock/status boundaries, bulk tier boundaries, seller grouping, composed search/filter/sort, INR paise |
| API runtime build | Passed; Node 24 native TypeScript transformation of nine modules |
| API source lint | Passed; syntax/unsafe-pattern checks |
| API strict typing | Passed, including the unmounted PostgreSQL repository, with web TypeScript compiler and bundled Node typings |
| API domain and real HTTP integration tests | 15 passed; see `apps/api/test` and `docs/backend-status.md` |
| Native domain tests | 4 passed; multi-seller tiers, stock/MOQ, corrupt offline storage and exact service PIN |
| Native pure domain/seed strict typing and syntax | Passed; full Expo dependency typecheck is separate and unverified |
| Database migration/seed | NOT RUN: Docker daemon unavailable and local PostgreSQL 18 lacks PostGIS |
| Expo native bundles/APK/AAB/iOS archive | NOT RUN: registry DNS failed and cached Expo CLI/dependencies were incomplete |
| Real Razorpay sandbox transaction | NOT RUN: provider credentials and reachable signed webhook not supplied |

Total automated tests: **25 passed, 0 failed, 0 skipped** in the final run. Windows execution sandbox initially denied loopback; HTTP tests passed after authorized local network execution. No failing test was hidden or skipped.

## Browser checks actually observed

The responsive UI was inspected at desktop and a 390 × 844 phone viewport. The phone document width matched the viewport without horizontal page overflow. A fresh state read was used after responsive reflow. Core forms and product controls were exercised through the browser UI.

| Workflow | Observed outcome |
| --- | --- |
| Search for spinach | Nine API listings filtered to one matching result |
| Save produce | Saved count updated and item marked saved |
| Tomato + onion checkout | Basket split into Sahyadri and Patil seller groups; API created two seller orders, cleared basket, showed pending payment |
| Server pricing | ₹60 produce subtotal became ₹158 API total with two ₹49 delivery charges; neither order was marked confirmed or paid |
| RFQ | Buyer submitted a 100 kg tomato requirement to the API |
| Seller quotation | Seller s1 submitted ₹24/kg quote; buyer saw the actual quote and accepted it |
| Quote acceptance | One pending-payment API order for ₹2,400; acceptance disabled after success |
| Unsupported PIN | 110001 could browse, but checkout displayed the 400008-only rule and created no order |
| Admin cancellation | A locally created test reservation was cancelled; actual hash-linked audit history displayed the cancellation |
| Basket keyboard | Escape closed the basket; focus and scroll locking are implemented for basket, dialogs and mobile menu |

Browser checks used a **local development API**, not a published production service. The API process is volatile. The published private preview, if publication succeeds, uses browser-local sample data and does not expose demonstration admin authentication.

## Implemented vs test doubles vs unfinished

- **Implemented and tested locally:** catalog, seller ownership, exact PIN checks, listing CRUD subset, inventory reservations, idempotent seller-split orders and snapshots, state transitions, RFQs/quotes, signed webhook domain validation, bounded refunds, review/dispute guards, demo audit history and connected UI operations.
- **Explicit test doubles:** successful payment capture/refund responses and verified evidence adapters inside automated tests. No browser control makes a fake payment successful.
- **Integration code, not provider-verified:** Razorpay HTTP order/refund adapter, raw signature verification and browser checkout handoff; Postgres SERIALIZABLE checkout/capture repository; schema/migration/seed; native Expo build/release configuration.
- **Fail closed:** production API startup, OTP, arbitrary delivery/quality evidence, unserviceable PINs and live Razorpay keys. Missing credentials do not turn into success responses.
- **Not complete:** durable production backend, production auth/session rotation, seller onboarding approval, malware-scanned S3 uploads, live logistics/proof, notification workers, chat, invoices/tax engines, configurable fees/service-area admin, settlement onboarding, complete Hindi screens, Next.js SEO and real Android/iOS builds.

## Acceptance criteria from the brief

| Brief criterion | Exact status |
| --- | --- |
| Seller registration → verification → listing/inventory | Seeded verified seller listing/inventory works; real registration and verification approval unfinished |
| Buyer discovers → cart → checkout → sandbox pay | Browser reservation flow verified; actual Razorpay sandbox payment blocked by credentials/webhook |
| Reservation, duplicate checkout/webhook | Passed domain and HTTP tests; PostgreSQL/multi-instance proof pending |
| Seller fulfilment → proof | State/proof gates pass with explicit test evidence adapter; real upload/scanning integration missing |
| Completion → verified review | Domain test passed after verified test proof; real device/provider chain not executed |
| RFQ → two quotes → one order | Two-quote domain test passed; one real development quote-to-order chain observed in browser |
| Admin cancellation/refund/dispute | Cancellation and audit observed in browser; refund/dispute domain and HTTP rules tested with test adapters |
| Unsupported PIN/expired stock rejected | Passed; unsupported-PIN browser checkout also observed |
| Same web/Android/iOS account/order state | Shared API client architecture supplied; native builds/device interoperability NOT verified |

No production-readiness claim is made. The source and documentation are a development handoff with explicit release gates.
