# KhetSetu sourcing operations

## Confirmed decisions

KhetSetu’s public website accepts buyer and supplier requests across India. The team checks the delivery or pickup PIN, supply and transport options before confirming a quote. Support is available at +91 7021610641 and redantthakur@gmail.com.

## Daily workflow

1. Open Operations and sign in with the authorised operator account (or use `/__local/signin` during local preview QA). Check regularly; no automatic notification is sent.
2. Search the inbox by PIN when grouping requests geographically. Call submitted numbers and confirm business identity, PIN and exact locality, variety, quantity/unit, grade, date, packing and delivery constraints. Phone verification is manual.
3. Move qualified requests to Reviewing. Private notes stay separate from customer updates visible in private tracking.
4. Obtain real supplier quotes for the full requested quantity/unit. Enter supplier, grade, price, packing, delivery, fees and validity. Never add invented offers to live operations.
5. Compare delivered totals for the same quantity, unit and grade. No market-wide cheapest-price guarantee is made.
6. Confirm supplier, quality, charges, payment recipient, invoice and cancellation/delivery terms directly with the buyer. Select the agreed current quote. This records manual confirmation, not payment or proof of acceptance.
7. Arrange pickup/delivery, check actual weight/grade, and update the customer. Mark Fulfilled after your team confirms fulfilment. Handle changes, cancellations and quality issues through support.
8. Customer withdrawal erases contact fields and quotes. Coordinate any previously agreed transaction separately.

## Status rules

New → Reviewing/Cancelled. Reviewing → Quoted/Confirmed/Cancelled. Quoted → Reviewing/Confirmed/Cancelled. Confirmed → Fulfilled/Cancelled. Buyer confirmation requires a selected current quote; farmer availability can be manually confirmed. Fulfilled/Cancelled allow only same-status notes. Withdrawn/Expired cannot be reactivated. Concurrent updates require the current version.

## Data handling

Receipts omit name, phone, business name and private notes. Do not share receipt secrets. Web keys remain in that browser; native keys use secure device storage. Support must verify the person's relationship to a request before recovery or disclosure.

The inbox lists the latest 500 requests; add pagination before higher sustained volume. CSV exports contain personal information. Cleanup anonymises records older than 90 days during the next intake, receipt or operations check; no scheduled purge exists. Check the queue regularly.

Handle correction/export/removal through support when a device receipt is unavailable. Notices describe this limited pilot; future transaction policies need review for the actual business and service model.

## Expansion gates

Complete supplier onboarding, business-specific policy/compliance review, delivery/quality procedures, backup/restore and monitoring drills, and notifications. Add customer OTP/accounts and access recovery before multi-device order management. Prove database-backed orders/inventory, gateway sandbox/webhooks/reconciliation, refunds and invoices before payments. Complete signed device builds and distribution tests before advertising native downloads. Confirm each route with the supplier and carrier, and enable automatic fulfilment only for approved routes and PINs.
