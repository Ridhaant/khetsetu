# KhetSetu product requirements

Planning baseline: 22 November 2026; nationwide scope revision: 25 November 2026. This document separates the current assisted sourcing release from the intended transactional marketplace. It is not a statement that every requirement is implemented or production-approved. The repository README and verification report record actual delivery status; historical checks retain their original scope.

## Product and launch

KhetSetu connects farmers, FPOs, aggregators and produce traders with households and business buyers. Buyers should understand what they are buying, from whom, in what quantity and at what total cost. Sellers should see clear actions from listing to settlement. Operations should be able to resolve exceptions with an audit trail.

The product scope is **all India**: discovery, buyer requirements and farmer availability can span Indian states and union territories. Mumbai PIN `400008` is a default example, not an exclusive area. A request is an invitation to source and review feasibility, not an order or delivery promise. Operations checks supplier origin, buyer destination, produce, quantity, timing, grade, packing and transport before confirming an arrangement.

Support English and Hindi, INR and business dates displayed in `Asia/Kolkata`; store timestamps in UTC. Precise location is optional; manual PIN entry must always work. A syntactically valid Indian PIN is sufficient for intake/demo eligibility, but it does not prove postal existence, provider coverage or legal/operational readiness. Future live delivery requires configured exact service areas plus seller/provider coverage and regional sign-off. Razorpay is retained as the planned replaceable payment adapter for future commerce, not a payment facility in the assisted release.

## Success criteria

| Outcome | Pilot measure | Initial target to confirm |
| --- | --- | --- |
| Reliable fulfilment | Accepted orders delivered within promised window | At least 95% |
| Accurate stock | Orders cancelled because inventory was unavailable | Under 1% |
| Trust | Quality disputes per delivered order | Track by category and seller; establish baseline |
| Payment integrity | Paid provider transactions matched to one checkout | 100% reconciliation, no duplicate charges/orders |
| Seller value | Verified sellers receiving repeat orders in 30 days | Establish baseline in first cohort |
| Accessible ordering | Completion on a low-cost Android device with intermittent data | Demonstrate before launch |

These are proposed operating targets, not measured results.

## Current assisted release

| Role | Workflow |
| --- | --- |
| Business buyer | Submit a produce requirement from an Indian PIN; retain a private receipt; see customer updates and entered supplier quotes; contact support or withdraw |
| Farmer/FPO | Submit availability and origin PIN for sourcing review; track the team's update using the private receipt |
| Owner operations | Sign in through the existing hosted identity gate; qualify the request, obtain real quotes, compare matching specifications, record the agreed quote and manually coordinate fulfilment |

The hosted website and native source share the Worker/D1 request API. Public submission does not require a ChatGPT account; operations remains restricted to the authorised owner. Contact details stay out of public receipts. A saved request, selected quotation or manually updated status is not proof of payment, stock reservation, verified identity or carrier delivery. Online payments, inventory-backed orders and authenticated multi-device customer accounts remain outside this release.

## Transactional marketplace target

The following is the intended next-stage product, not the current assisted release's implementation claim:

| Role | Required coherent workflow |
| --- | --- |
| Guest | Browse and search produce; inspect seller, grade, stock, MOQ and tiers; check PIN eligibility; choose English/Hindi |
| Buyer | Authenticate; maintain address and cart; submit checkout; pay through a real gateway test/production environment; see seller-specific orders; track delivery; report quality issues; leave a review after completion |
| Business buyer | Submit quantity, grade, unit, location and due date in an RFQ; compare quotations on the same basis; accept one valid quotation once; reorder |
| Seller | Submit identity/business evidence; receive approval or specific rejection reason; create and pause listings; update stock; quote; accept, pack and dispatch orders; view fee and payout breakdown |
| Operations | Review verification/listings; configure serviceability and fees by region; inspect orders; assign manual delivery; record proof; resolve cancellations and disputes |
| Finance | Reconcile payments and refunds with provider records; approve refunds within permissions; inspect settlements; export operational reports |
| Administrator | Manage staff permissions and configuration; inspect append-only critical-action audit history |

The first release should favour manual operational review and explicit status transitions. Do not silently approve sellers, manufacture payment success, infer delivery from a timer, or call a payout complete before provider confirmation.

## Exclusions and staged features

Outside the MVP: AI price prediction, lending/credit, insurance, auctions, warehouse ERP and a proprietary fleet. Nationwide reach does not mean guaranteed delivery to every PIN. Advanced negotiation, automated route optimisation, social login, universal tax automation, broad promotional tooling and fine-grained seller staff access may follow the validated core. Messaging, notifications, image uploads, invoice PDF generation and analytics need explicit implementation and integration status in the delivery report; listing them here does not mean they are complete.

## Business decisions

Confirmed: KhetSetu name; nationwide scope; assisted sourcing with manual fulfilment review; Razorpay as the future payment provider. Mumbai `400008` remains an example. Proposed transactional defaults below require business-owner approval before real trade:

1. The seller remains seller of record; KhetSetu operates the marketplace. Confirm legal entity, invoicing responsibilities and merchant agreement.
2. Prepaid checkout is the initial path; COD stays disabled until fraud, collection and settlement controls exist.
3. A cart creates one order and fulfilment record per seller. One provider checkout may cover the group only when provider reconciliation and refund attribution are supported.
4. Prices use integer paise. Quantities use decimal base units with explicit conversion rules. Crate, bag and box require declared content/weight; they must not imply a universal kilogram conversion.
5. Fees and tax rules are versioned and snapshotted into an order. Seed values are illustrative, not commercial policy or tax advice.
6. Failed/expired payments release reservations exactly once. Paid-but-cancelled orders enter a refund workflow; they never simply revert to unpaid.
7. Perishable dispute windows, evidence requirements, cancellation cut-offs and resolution authority are category policies published before payment.
8. Pilot operations assign delivery manually. A partner adapter can be added without creating fleet management.

## Transactional marketplace rules

- Only approved, active, unexpired listings from eligible sellers can be purchased. Validate availability again at checkout; browser stock is advisory.
- Require MOQ and valid unit multiples. Apply a tier only after its quantity threshold is met. Never trust client-submitted price, seller or fee values.
- Reserve stock transactionally and reject competing demand that exceeds remaining stock. Maintain `onHand`, `reserved` and sold/adjusted movements with traceable reasons.
- Preserve immutable title, grade, quantity, unit, price, fee, tax, buyer, seller and delivery snapshots on orders. Later listing edits must not rewrite history.
- Deduplicate checkout requests, provider events, refunds and quote acceptance using scoped keys and stored results. A repeated key with a different request must conflict.
- Fulfilment transitions require the right role and ownership. Dispatch requires prior acceptance/packing; delivery requires valid proof. Reviews require a completed owned order.
- Validate live serviceability on the server at checkout, quote acceptance and delivery-address changes against exact configured areas and seller/provider coverage. A formatted PIN alone must never authorise a real order. An uncovered PIN can browse or submit an assisted sourcing enquiry without a delivery guarantee.
- Quotation comparisons show quantity, unit, grade, delivery charge, fees/tax, total, fulfilment window and expiry. Acceptance must be atomic and reserve inventory.
- A refund decision and a provider refund are separate records. Refund amounts cannot exceed the remaining captured amount attributable to that seller order.

## Safety and privacy requirements

Every protected API checks identity, role and record ownership. Demo identities are isolated from production. OTP issuance/verification is throttled with expiry and attempt limits; sessions rotate and can be revoked. Production authentication must fail closed if provider configuration is missing.

Never store raw card details or treat a browser redirect as proof of payment. Verify Razorpay signatures on the raw request body; compare provider order, amount and currency; process duplicate and out-of-order events safely; reconcile when a webhook is missing.

Collect only necessary profile, address and verification information. Keep verification evidence private with restricted signed access. Document purposes, retention, deletion/export procedures, processor contracts and incident response. Never publish real personal details in seed data or logs.

## Acceptance evidence

For the assisted release, verify nationally formatted buyer/farmer PIN intake, stored idempotent requests, private receipt protection, unchanged owner-only operations, quotation/fulfilment rules and clear manual-review language. Record actual results separately; this scope revision does not create new test evidence. The original transactional gates below remain future release requirements.

Use the following as release gates, recording actual commands, environments and evidence rather than a generic pass label:

| ID | Scenario | Required proof |
| --- | --- | --- |
| A1 | Seller onboarding, approval, listing and inventory change | Role/ownership tests and complete UI/API journey |
| A2 | Discovery → cart → payment | Browser journey plus provider test payment, signed event and persisted order |
| A3 | Concurrency and retries | Competing inventory requests; duplicate checkout/event; changed-payload conflict |
| A4 | Accept → pack → dispatch → proof → complete | Invalid transitions rejected; timestamps and proof retained |
| A5 | Verified review | Only purchaser of completed order accepted; repeat review rejected |
| A6 | RFQ → two quotations → one acceptance | Comparison; expired/foreign quote rejection; exactly one resulting order |
| A7 | Cancellation, quality dispute and refund | Ownership/permission tests, evidence, decision audit and real provider refund test |
| A8 | Availability restrictions | Malformed or unconfigured delivery PIN, paused/expired listing and insufficient stock rejected server-side; nationwide enquiries do not bypass live coverage |
| A9 | Same account/order across web and native | Both clients against one API/database; native Android/iOS evidence |

Unit tests or a browser-only demonstration cannot substitute for provider, database, device or release tests. Outstanding gates stay visible in the final verification report.
