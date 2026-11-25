# Backend integration contracts

The machine-readable development HTTP contract is `apps/api/openapi.json` (OpenAPI 3.1). `packages/contracts/index.ts` provides type-only shared exports. Domain quantities use up to three decimal places. Catalog prices are INR; order, gateway, refund, and database price fields are integer paise. PostgreSQL quantities use integer thousandths of a listing unit (`quantityMilli`). All stored timestamps are UTC; user-facing business times should use `Asia/Kolkata`.

## Web and native clients

Use `/api/v1` as the API prefix. Browse catalog without authentication. Check `/serviceability/{pin}` before displaying purchasability. POST `/auth/demo` is an explicitly labelled local development flow only. Keep the returned Bearer access token out of URLs and logs. Native stores tokens using the OS secure key store; web uses process memory and must reauthenticate after reload/token expiry. Production must replace this path with verified phone OTP and rotated/revocable sessions.

The development default is nationwide eligibility for PIN syntax `^[1-9][0-9]{5}$`, with no postal-existence or logistics verification. A serviceability response preserves `pin`, `serviceable`, `deliveryChargePaise`, `freeDeliveryAbovePaise`, `pickupAvailable`, and `message`, and adds:

```json
{"scope":"national","validation":"format-only","logisticsVerified":false,"reason":"eligible_development"}
```

`serviceable` and `pickupAvailable` describe development workflow eligibility only. Show the format-only/unverified distinction clearly; never translate them into a confirmed delivery or pickup promise. `reason` can also be `invalid_pin`, `explicitly_denied`, or `outside_pilot`. Invalid inputs return `serviceable: false` at the lookup endpoint and are rejected at checkout/RFQ submission. The API never treats a leading zero as an Indian PIN format.

Configuration is read at startup: `SERVICEABILITY_MODE=national|pilot`, `SERVICEABILITY_PILOT_PINS=400008`, `SERVICEABILITY_ALLOW_PINS=...`, and `SERVICEABILITY_DENY_PINS=...`. Deny wins. Pilot mode permits the pilot list and explicit allows; national mode permits any valid format except denials. Checkout, RFQ creation, and acceptance of an unaccepted quote use the same policy. Quotes are rechecked before a new order is created; historical accepted-quote retries remain idempotent. Clients should display current server policy rather than assume their offline demonstration eligibility is authoritative.

POST `/checkout` with a fresh 8–128-character `Idempotency-Key` and body:

```json
{"pin":"400008","fulfilment":"delivery","items":[{"listingId":"l-tomato","quantity":2}]}
```

Retry the exact body with the exact key after network failure. A changed body with the same key returns 409. Every seller order has its own amount and delivery allocation; a gateway checkout covers the parent total. Provider payment allocation and seller settlement must be integrated with an appropriately licensed marketplace payment product. Display `pending` until the backend confirms a signed capture. Never infer payment success from a browser redirect or a client-supplied payment ID.

Without credentials, `payment.available` is false and `reason` explains the blocked payment. Do not render an enabled Pay button. A configured test gateway returns `providerOrderId` for an actual Razorpay Checkout integration; the gateway UI/return handler has not been supplied or exercised by this reference API.

GET `/orders` is ownership-scoped. POST `/orders/{id}/transition` enforces ordered state changes. A seller cannot mark an unpaid reservation accepted. Delivery proof references must pass a real scanned-upload verifier; a syntactically plausible `proof/...` string alone is rejected. CSV exports, chat, policies, and administrative configuration are not backend endpoints in this phase.

## Razorpay

Environment: `RAZORPAY_KEY_ID` (`rzp_test_...` only), `RAZORPAY_KEY_SECRET`, and a separate `RAZORPAY_WEBHOOK_SECRET`. Configure the provider to send `payment.captured` and `refund.processed` to `/api/v1/payments/webhook`. The HTTP handler validates `x-razorpay-signature` using HMAC-SHA256 over the original raw bytes and requires `x-razorpay-event-id`.

Capture checks known provider order, amount, INR currency, and captured status before decrementing inventory. Refund completion checks the known refund ID, payment ID, requested amount, and processed status. Unknown or late captures fail closed and require reconciliation. Gateway order/refund network calls time out after 10 seconds. They never store raw card details. The adapter has not contacted the external gateway in this environment.

Demo event dedupe/request keys are process-local. Production needs the supplied SQL unique keys/outbox plus a reconciliation worker that regularly compares provider orders/payments/refunds and records exceptions. Crash recovery around gateway calls is a release blocker.

## Uploads, messaging, and notifications

Target contract: authenticated upload-intent request validates MIME/byte limits and purpose/ownership; return short-lived upload URL; object arrives in quarantine; malware/type/sniffing checks set MediaObject.scanStatus; only `clean` owned/context-authorized media can be attached as delivery/dispute evidence. Download uses short-lived private signed URLs. This adapter is not implemented; the runtime verifier defaults to denial.

OTP must enforce phone normalization, short expiry, attempt limits, replay protection, throttling by phone/device/IP, and non-enumerating responses. Push/email/SMS messages should be emitted from a committed outbox, idempotently queued, preference-checked, and retried with dead-letter handling. FCM/APNS, SMS, and email provider adapters are not implemented. No notification or successful OTP message is faked.

Logistics should expose serviceability, delivery quote, booking, cancellation, tracking-event verification, and private proof retrieval through a provider adapter. Platform delivery promises must come from configured routes, days, capacity, seller coverage, and produce handling. The nationwide demo policy and illustrative ₹49 amount are development configuration, not an operational carrier quote or delivery commitment. The PostgreSQL checkout path stays fail-closed: an exact active service area is required, and newly seeded regional candidates are inactive. Broader commercial availability must be enabled using verified operational coverage and applicable state requirements; a valid-looking PIN alone is insufficient.
