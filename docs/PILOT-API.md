# Assisted pilot API

Base: `/api/pilot`. JSON responses use `Cache-Control: no-store`. Mutations require JSON at most 16 KB and reject cross-site browser origins. Native clients use HTTPS; no permissive browser CORS policy is added.

| Method/path | Authority and purpose |
| --- | --- |
| `GET /config` | Public intake scope, fulfilment model, and support contacts |
| `GET /health` | Public storage/schema readiness, no customer data |
| `GET /new-request` | Random idempotency/receipt keys for native clients |
| `GET /session` | Optional identity/owner booleans |
| `POST /requests` | Public buyer requirement/farmer availability |
| `GET /receipts/:id` | Private status/quotes with bearer receipt secret |
| `DELETE /receipts/:id` | Withdraw/anonymise using receipt secret |
| `GET /admin/requests` | Owner-only latest 500 records/quotes |
| `PATCH /admin/requests/:id` | Owner-only versioned status/notes |
| `POST /admin/requests/:id/quotes` | Owner-only versioned quote |
| `POST /admin/requests/:id/select-quote` | Owner-only confirmation of a current buyer quote |

Submission fields: kind, name, phone, businessName, businessType, pin, produce, quantity (number), unit, grade, neededBy (YYYY-MM-DD), frequency, notes, consent (true), website (empty honeypot), receiptSecret (random UUID). Header: `Idempotency-Key: <different random UUID>`.

On ambiguous failure retry the same key and exact body. Identical retries return the saved reference; changed body under the same key returns 409. Success means stored, not ordered. New submissions are limited to 15 per hashed source-IP hourly window; saved retries remain usable.

Buyer types: retailer/wholesaler/restaurant/caterer/other. Farmer types: farmer/fpo/other. Units: kg/quintal/tonne/crate/box. Grades: A/B/mixed. Frequencies: once/daily/weekly. Both roles can submit with six digits starting with 1–9. Dates follow Asia/Kolkata calendar rules within 180 days. Quantities are positive with at most three decimals. The server enforces its field limits.

`GET /config` reports `intakeCountry: "IN"`, `pinValidation: "format-only"`, and `fulfilment: "manual-review"`. The former single `pilotPin` field has been replaced by these coverage fields. Intake eligibility comes from the PIN format. Operations confirms the actual location and the availability of supply, pickup, or delivery before confirming an agreement.

Save receipt ID/reference/secret on the device. `Authorization: Bearer <receiptSecret>` protects receipt endpoints. Secrets are hashed at rest; receipts omit contact/private notes. A public reference alone grants no access. Recovery is manual via support.

Admin bodies include `version`. Quotes contain supplierName, quantity, unit, grade, unitPricePaise, deliveryPaise, packingPaise, feePaise, validUntil and notes. Amounts are integer paise; unit price positive. Quote quantity/unit must match the request. Total = rounded quantity × unitPricePaise + delivery + packing + fees, capped at ₹5,00,000. Select only a current quote on that buyer request. Discuss grade changes offline and compare matching specifications.

Errors: `{ "error": { "code": "VERSION_CONFLICT", "message": "..." } }`. Storage/configuration failures never return accepted success. Local SQLite tests verify this interface but do not prove hosted D1 publication or native device behaviour.
