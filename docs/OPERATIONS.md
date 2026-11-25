# Development, deployment and operational guide

Use the repository README for the exact commands validated in the delivered snapshot. Scope revised 25 November 2026: the hosted assisted release accepts requests across India, with manual sourcing and delivery feasibility review. Mumbai `400008` is a default example, not an exclusive area. Historical verification records retain their original scope and are not new nationwide test results.

## Current hosted assisted release

The website and native assisted source share the Worker/D1 request API. Requests are durable intake records, not inventory reservations, orders or payments. Public visitors can submit; private receipt credentials protect tracking/withdrawal. Operations continues to require the existing owner sign-in and server-side owner check. Keep these permissions unchanged when broadening intake.

From the repository root, `npm run dev` runs the local assisted preview at `http://127.0.0.1:4173`. Its ignored local SQLite store is separate from hosted D1. Follow the README for `db:generate`, build, typecheck, `pilot:test` and native test commands; record actual outputs rather than inferring a pass from this guide. Local operations identity simulation must remain loopback-only and must never be added to the production Worker.

Deploy the complete Worker artifact and D1 migrations through the retained Sites workflow. Publishing only frontend assets would omit the request API. Keep runtime owner allowlist, rate-limit salt and origin settings in the existing secret configuration. Nationwide scope does not change admin access or make contact information public.

Daily operations qualifies both buyer and supplier, confirms origin/destination PINs, quantity/unit/grade, timing, packing, transport and terms, obtains real quotes, records the agreed arrangement and manually follows fulfilment. A formatted PIN only allows intake; it is not a carrier or quality guarantee. Use [Pilot operations](PILOT-OPERATIONS.md) and [Pilot API](PILOT-API.md) for current status/quote rules.

## State and route activation

Maintain a readiness record for each intended state/UT and route: accountable operator, supplier capacity, permitted produce/handling, local compliance review, tax/invoice decision, coverage evidence, delivery windows/charges, support language and escalation owner. Review perishable transit limits and customer expectations before committing. Keep requests requiring review in a noncommittal operational status; contact the customer when a route cannot be served.

For future transactional checkout, activate exact service areas only after the readiness record is approved and seller/provider coverage is verified. Test uncovered/unknown routes and disable ordering when coverage is absent. Nationally formatted PINs in the complementary demo API must not be copied into a production delivery allowlist.

## Retained Node development service

The remainder covers the older Node demonstration and future transactional infrastructure. It is not the hosted D1 backend. Never reuse sample passwords, demo tokens or seeded identities for production.

The API package is independently runnable from `apps/api`:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Use Node.js 24 or later. The API scripts load `.env` when present. The example API port is `4000`, bound to `127.0.0.1`. `DEMO_MODE=true` enables in-memory fixtures and demo role sessions; state is process-local and resets on restart. It is suitable for inspecting workflows, not storing real orders. The delivered API refuses production startup until the production repository, OTP, upload verification and workers are integrated. Confirm `NODE_ENV` and demo guards before exposing any endpoint.

The retained marketplace client is React/TypeScript/Vite: Next.js was unavailable in the local package cache and the registry could not be reached. It does not provide Next.js server-rendered SEO. The current web/native entry points mount the assisted experience, so setting the old `VITE_API_URL` does not turn the published site into the commerce demo. Any intentional legacy development entry point must use a loopback-only environment and match the exact browser origin in the Node API's `CORS_ORIGINS`; do not expose selectable demo identities publicly.

Configure web and native clients for the same backend when testing shared state. A phone cannot reach a computer's `localhost`, and the default loopback API binding is not reachable over LAN. An intentional API host configuration and appropriate firewall settings, or a secure development endpoint, are required before device testing. Do not disable certificate verification as a workaround. The current native build and cross-device shared-state status must be taken from the verification report, not assumed from these instructions.

The demonstration can accept formatted Indian PINs for nationwide exploration; `400008` remains a default example. Demo seller origins may be Pune/Nashik or elsewhere. All addresses, people and business data in fixtures remain illustrative, and demo eligibility does not establish delivery coverage.

## Environment variables

| Variable class | Where it belongs | Handling |
| --- | --- | --- |
| Public API URL, app environment label | Web/native build configuration | Public; may be visible in bundles |
| Database/Redis connection | API/worker environment | Secret store, per environment |
| Access/session secret | API environment | Strong generated secret, rotation procedure |
| Razorpay key ID | Server; public checkout value only where required | Separate test/live accounts and labels |
| Razorpay key secret/webhook secret | API secret store | Never client-exposed or committed |
| S3 access/secret, signing credentials | API/upload worker environment | Least-privilege private bucket access |
| SMS/email/push credentials | API/worker secret store | Separate sandbox/production providers |
| CORS origins | API configuration | Exact production domains, not wildcard credentials |

Use `.env.example` with empty external secrets, and ignore real `.env` files. A configured variable does not prove that an adapter has been implemented or tested. Missing credentials must produce an explicit unavailable state, not an automatic success response.

## Database preparation

From the API package, the intended Prisma workflow is:

```powershell
npm run prisma:generate
npm run db:migrate
npm run db:seed
```

Run these only against an intentionally selected development/staging database using its `DATABASE_URL`. Migration deployment and seed execution are distinct operations; never run demonstration seeding against production. Review the checked-in SQL for required PostgreSQL/PostGIS extensions and install with an appropriately scoped operator account. The runtime API account should not be a database superuser.

Record whether the migration actually ran, its target version and logs. A schema file or successful client generation is not a successful database migration. Before release, verify a fresh install and an upgrade from the prior schema with representative data. Test repository integration and concurrent inventory transactions against real PostgreSQL.

## Verification workflow

Run the commands available in each package and retain outputs in the verification report:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

Describe each check accurately: the API's delivered lint command checks TypeScript syntax transformation and a small set of unsafe patterns; it is not a full ESLint/security audit. Type-check results are separate. Run provider sandbox tests and end-to-end browser/device journeys in addition to unit/domain tests. Record operating system, runtime/package versions, environment mode, database version, test counts, failures and unrun gates.

Required integration cases include duplicate checkout keys, conflicting retry payload, duplicate/out-of-order signed webhooks, amount/currency mismatch, provider timeout, late capture after reservation expiry, invalid role/owner access, competing inventory requests, quote acceptance races, partial refund limits and expired/unserviceable listings. Restart the API during pending operations to prove durable recovery before production.

## Staging and production deployment

1. Provision managed PostgreSQL with required extensions, encrypted backups and point-in-time recovery; private object storage; queue/rate-limit infrastructure; secret manager; logging/monitoring.
2. Build immutable API and web artifacts from a recorded commit and lockfile. Scan dependencies and container images. Configure health/readiness endpoints and graceful shutdown.
3. Disable demo mode and seed accounts. Configure real authentication, authorised staff, provider adapters and allowlisted origins. A server that refuses production startup while integrations are incomplete is behaving correctly.
4. Review database changes and take/verify a recovery point. Apply migrations through a controlled deployment job, not every API process.
5. Deploy staging, run smoke/integration/provider tests and the acceptance journeys in `PRD.md`. Verify privacy of uploads, token expiry/revocation, permissions and rate limits.
6. Complete the sign-offs in `COMPLIANCE.md` for each activated region/route; publish approved policies, exact serviceability, support contacts and fees. Verify provider/seller coverage and ensure unconfigured routes cannot place real orders.
7. Deploy a small pilot cohort behind a release flag. Watch payment mismatch, stock contention, API errors, delivery failures and unresolved disputes. Roll back application code on a threshold breach while preserving financial state.

The hosted assisted Worker/D1 release and the future PostgreSQL commerce deployment are separate systems. Existing publication does not establish that the PostgreSQL API, native binaries, payment provider or notification service is deployed. Preserve the existing Site audience and owner identity checks while applying the requested nationwide scope.

## Monitoring and reconciliation

Track request rate/latency/error codes, authentication abuse, queue age, failed jobs, database saturation, reservation expiry, payment-provider mismatches, refund failures, unpaid captures, fulfilment lateness and dispute ageing. Redact personal/payment data and secrets from logs. Give every operation a request/correlation ID that support can use safely.

Reconcile provider orders, captures, refunds and settlements with local records at a scheduled interval and on demand. Keep unmatched/late events in an exception queue with assigned ownership. Audit every manual resolution. Do not mutate an order to paid/refunded solely to make a dashboard balance.

## Backup and restoration

Proposed pilot objectives to confirm: recovery point at most 15 minutes for database state and recovery time at most four hours. These are targets until measured by a drill.

- Enable managed continuous recovery and daily encrypted snapshots with a documented retention period and restricted restore access.
- Version private object storage where appropriate; retain evidence according to approved policy. Back up required configuration, migration history and provider reconciliation references separately from secrets.
- Perform an isolated restoration at least before launch and after major schema changes. Restore database and relevant objects; run integrity checks; verify orders, payments, reservations and audit history; compare counts and provider references.
- Record recovery duration and recovered timestamp. Never point test workers or restored notification jobs at production recipients/provider operations.
- Document a human-led reconciliation step after recovery, because external provider events may have occurred after the restored recovery point.

## Incident and rollback runbook

For inventory or payment corruption, pause new checkout with a server-side switch, preserve read access, stop unsafe background jobs and notify the incident owner. Capture redacted evidence and the affected operation IDs. Reconcile with the provider before issuing retries or refunds. Communicate through the approved support process.

Roll back application code to a compatible known artifact; do not blindly reverse destructive database migrations. Prefer forward corrective migrations. Restore only after the impact and reconciliation plan are understood. Keep an incident timeline, customer impact, resolution and corrective actions. Use the privacy incident plan for personal-data incidents and obtain the required legal assessment of notification duties.

## Mobile release gates

The Expo package contains the native configuration and Android/iOS build guidance. The current assisted app uses private device-held receipts rather than authenticated multi-device customer accounts. Before store release, use real signing identities, identifiers and store accounts; remove demo defaults; use the HTTPS hosted API; verify intake/tracking on web and each native build; test low memory/network interruptions, permission denial, accessibility and Hindi layouts. Cross-device account/order synchronisation remains a future commerce gate.

Explain each requested permission at the point of use. Manual PIN entry needs no location permission. Photos/evidence need selected-photo/camera permission only when the implemented flow uses them; notifications should be optional. Avoid unnecessary background location. Complete Google Play Data Safety and Apple App Privacy disclosures from actual SDK/data behaviour, provide account deletion/support/privacy links, and review payment/provider rules for physical goods. Do not claim Android/iOS binaries were built or store-approved without evidence.
