# KhetSetu documentation

Scope revised 25 November 2026: KhetSetu accepts **assisted buyer requirements and farmer availability from across India**. Mumbai `400008` remains a default example, not an exclusive service area. Submission and discovery do not establish deliverability; operations reviews each origin, destination, produce and fulfilment request before committing.

| Document | Contents |
| --- | --- |
| [Current pilot operations](PILOT-OPERATIONS.md) | Hosted assisted-intake, quotation and manual fulfilment workflow |
| [Current pilot API](PILOT-API.md) | Durable request/tracking API and owner-only operations |
| [PRD](PRD.md) | Product scope, confirmed decisions, business defaults, rules and acceptance evidence |
| [UX](UX.md) | Journeys, information architecture, screen states, mobile-first components and accessibility |
| [Architecture](ARCHITECTURE.md) | Implementation boundaries, topology, ER diagram and transaction/integration contracts |
| [Operations](OPERATIONS.md) | Development, environments, deployment, monitoring, restoration and mobile release gates |
| [India launch review](COMPLIANCE.md) | Official-source review and accountable sign-off checklist |
| [Roadmap](ROADMAP.md) | Phased implementation and priorities |

The repository README and verification report are the source for what was actually implemented, executed, tested and blocked. Product requirements, diagrams and checklists are not proof that an integration is production-ready.

The hosted release uses a Worker and D1 for durable assisted requests, private receipt tracking and owner-only operations. The older Node/Razorpay/PostgreSQL marketplace is a separate development path, documented in [Legacy development](LEGACY-DEVELOPMENT.md). It is not the hosted backend. Razorpay remains the proposed payment provider for future transactional commerce; online payment is outside the assisted release.

A formatted six-digit Indian PIN can be used for demonstration/intake; format validation does not prove that the PIN exists or that a carrier/seller serves it. Real transactional delivery must depend on configured exact service areas, provider/seller coverage and a state-specific operational review.
