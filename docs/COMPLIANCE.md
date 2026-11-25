# India launch review

Source check: 22 November 2026; nationwide scope revision: 25 November 2026. This is an engineering launch checklist based on selected primary sources, not legal certification. The cited legal sources have not been re-researched for this scope edit. Recheck current consolidated central rules, amendments, commencement notifications, each relevant state's requirements and the actual operating model before committing to trade. Mumbai `400008` is a default example rather than an exclusive area.

The current hosted release accepts assisted buyer requirements and farmer availability across India. Intake does not promise sourcing or delivery. Operations must review the origin, destination, activity, produce and proposed fulfilment before confirming an arrangement. Online orders/payments are outside this assisted release; requirements for the future transactional model need their own sign-off.

## Privacy and personal data

The notified DPDP Rules, 2025 contain staged commencement periods. Do not describe all provisions as simultaneously effective: the Gazette separates immediate, one-year and eighteen-month groups. Confirm the corresponding Act commencement notification, corrigenda and subsequent orders against the launch date. The product should implement clear purpose notices, consent records, limited collection, security, retention controls and rights handling regardless of staged rollout. [MeitY Gazette: DPDP Rules, 2025](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf), [MeitY official documents and corrigendum](https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa?pageTitle=Digital-Personal-Data-Protection-Rules-2025%C3%AF%C2%BF%C2%BC).

Engineering tasks: publish English/Hindi purpose notices; keep verification documents private; separate optional marketing/location consent; record notice version and withdrawal; define retention by data class; provide authenticated export/deletion requests with lawful financial-record retention exceptions; document processors, access reviews and incident response. A checkbox alone does not establish compliance. Precise GPS is optional; never block manual address entry.

## Food-business obligations

FSSAI's official operationalisation direction distinguishes a directory-only model from a platform facilitating food orders/transactions and describes licensing/display responsibilities for e-commerce food businesses. Assess the current assisted sourcing activity and any future order/transaction model on their actual facts. The team must determine applicable platform licensing and seller eligibility for each activity/category rather than assume that calling sellers farmers removes all obligations. [FSSAI e-commerce licensing direction](https://fssai.gov.in/upload/advisories/2021/03/60548f92da45dDirection_Operationalisation_FSS_Licensing_Registration_19_03_2021.pdf).

Engineering tasks: configurable FSSAI registration/licence fields and applicability reasons; document type/issuer/expiry; review status and rejection reasons; seller agreements; required display/invoice fields; category-specific storage, food safety and complaint handling. Do not invent licence numbers in public seed data or label an identity check as a food-quality certification.

## GST and invoices

Do not require a GSTIN from every seller as a universal rule. Notification 34/2023 provides a conditional exemption from registration for certain small goods suppliers through e-commerce operators; conditions include restrictions on interstate/multiple-state supply and portal enrolment. Applicability, subsequent changes, product classification and the platform's own obligations need a tax professional's review. [Official Notification 34/2023–Central Tax](https://gstcouncil.gov.in/sites/default/files/2024-05/gst-ct-34-2023.pdf).

Engineering tasks: represent registered, eligible enrolled and other reviewed statuses; store GSTIN or applicable enrolment details only when appropriate; maintain HSN/category/rate configuration with effective dates; separate goods, delivery and platform fees; support bill of supply/tax invoice as advised; snapshot tax treatment on orders; implement reporting/reconciliation for applicable collection obligations. Seed tax rates are examples and must not be treated as verified production rates.

## Legal Metrology and product declarations

The Legal Metrology (Packaged Commodities) framework addresses package declarations and e-commerce displays. Applicability differs for prepacked goods, loose produce, package size and transaction type; use current consolidated rules and amendments rather than treating every produce unit the same. [Government-hosted Packaged Commodities Rules, including Rule 6](https://thc.nic.in/Central%20Governmental%20Rules/Legal%20Metrology%20%28Package%20Commodities%29%20Rules%2C%202011.pdf), [Department of Consumer Affairs declaration advisory](https://consumeraffairs.gov.in/public/upload/admin/cmsfiles/whatsnews/Declaration_of_mandatory_information_on_the_outer_retail_package_-_reg._whatsnews.pdf).

Engineering tasks: configurable generic name, seller/packer/importer details, country of origin where relevant, declared net quantity/unit, retail/unit price, consumer-care contact and dates when applicable. A box/crate listing must define its quantity basis. Support measured-weight discrepancies and preserve ordered versus delivered quantity with an agreed adjustment/refund trail.

## Agricultural marketing: state-specific review

Maharashtra's Directorate of Marketing identifies distinct direct-market, private-market, farmer-consumer-market and single-trade licence categories. The correct requirement depends on who purchases, where, what produce is covered and the marketplace's activity. This is an example for Maharashtra routes, not a rule for all India. Confirm each relevant origin/destination state's requirements and current exemptions with qualified local advice/authorities. [Maharashtra Directorate of Marketing: Market Reform](https://mahapanan.maharashtra.gov.in/SITE/Information/directmarketing.aspx).

Engineering tasks: seller type, origin/destination state, market area, licence applicability/number/expiry and review evidence. Keep buyer intake independent from delivery commitment. Adding live fulfilment in another state requires deliberate compliance/configuration review, not only accepting a formatted PIN.

## State and route readiness register

Maintain one review row per intended state/UT and operating route, with no automatic approval inherited from Maharashtra. Record the actual role performed by KhetSetu and each counterparty; produce/category and handling; origin/destination; reviewer and review date; applicable documentation or reason for non-applicability; supplier/logistics evidence; customer terms; tax/invoice treatment; support owner; and approval/hold status.

Nationwide assisted intake can collect a request while that row is on hold. Operations should tell the customer feasibility is being checked and should not confirm unavailable routes. For future online ordering, only approved exact service areas with verified seller/provider coverage become purchasable. Re-review when the operating model, produce, route, state or supplier changes. This is an operational control, not a new assertion about any state's law.

## Consumer protection, payments and support

Before launch, review the then-current Consumer Protection (E-Commerce) Rules and amendments, grievance/contact disclosures, cancellation/refund transparency and category policies. No claim is made here that a particular draft policy satisfies those requirements. Publish the legal entity, support channel, fee breakdown, seller information and resolution process approved for this business.

Use the contracted payment provider for collection, refunds and any approved split settlement. The software must not claim to operate an internal escrow. Confirm provider onboarding, merchant terms, KYC, payment method availability, refund/settlement handling and any RBI/payment-law obligations for the chosen model. Do not store raw card details. A successful sandbox test is not production financial approval.

## Sign-off register

| Area | Accountable owner | Evidence required before real trade |
| --- | --- | --- |
| Entity and seller-of-record model | Founder/legal | Approved contracts and responsibility map |
| State-specific agricultural marketing | Local legal/operations for each origin/destination | Written applicability review and licences/exemptions for the actual activity |
| Food business | Compliance | Platform/seller licence decisions and evidence |
| GST/invoicing | Finance/tax | Category/rate matrix, registration/enrolment and invoice examples |
| Product declarations/weights | Operations/compliance | Listing templates and packing/measurement procedure |
| Privacy/security | Privacy/security owner | Notices, records, processors, retention and incident plan |
| Payment/settlement | Finance | Provider-approved model and reconciled test/production evidence |
| Consumer policies/support | Operations/legal | Published policies, contact route and escalation ownership |
| Region and route readiness | Regional operations/compliance | Approved review row, supplier/provider coverage, handling capacity and customer terms |

Leave unresolved items marked open. The existence of fields, documents or a published site does not satisfy these sign-offs.
