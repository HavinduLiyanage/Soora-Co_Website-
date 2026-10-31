# Soora & Co. delivery milestones

Updated: 31 October 2026. Approved identity: white, charcoal and restrained gold; Manrope 400/500/600; original logo artwork. Catalog with visible prices and WhatsApp enquiries, no checkout.

| Milestone | Deliverable | Completion criteria | Status |
|---|---|---|---|
| 1. Frontend foundation and prototype | Next.js/TypeScript project, reusable design system, fixture catalog, responsive Home/catalog/product/Deals pages, Manrope and brand assets | Build passes; browsing, filters, variant pricing and enquiry preview work; desktop/mobile reviewed | Implemented locally; external publication awaits approval |
| 2. Complete customer experience | Final brand/category landing pages, search refinement, store/contact/FAQ/policy content, full mobile/accessibility/performance pass | Every approved customer journey and edge state works; supplied content replaces placeholders | Implemented for local preview; client content and broader launch QA pending |
| 3. Owner admin and backend | Payload, PostgreSQL, media storage, staff permissions, products/variants, stock movements, pricing, scheduled sales, banners, homepage blocks | Owner can manage routine operations without code; preview/publish and access rules verified | Planned |
| 4. Live integration | Replace fixture repository with CMS queries, shared availability/pricing, publish invalidation, scheduled refresh, media delivery | An admin change updates every applicable storefront surface; no draft/internal data leaks | Planned |
| 5. Production launch and handover | Real catalog/photos, WhatsApp destination, policies, domain, analytics, backups, restore check, owner guide | Production journeys and recovery verified; client owns accounts and is trained | Planned |

## Hosting decision — 31 October 2026

User selected Vercel. The GitHub repository is `HavinduLiyanage/Soora-Co_Website-`; a Vercel project has not been connected yet. Local server-build preparation is in `storefront/VERCEL-DEPLOYMENT.md`. The $0 budget remains a constraint: Vercel Hobby supports the required code execution but excludes commercial use; no paid service is authorized. The previously suggested Cloudflare/Sanity path is not selected. Backend and persistent storage implementation remain pending.

## Current step

Milestones 1 and 2 are implemented for local review in `storefront/`. The customer experience now includes dedicated Men/Women/Unisex routes, four brand pages, multiword search, mobile filter Apply/Cancel, removable filters, FAQ, a local wholesale enquiry composer and a clearly marked draft policy center. Images use responsive WebP assets; the approved Manrope typography and original logo remain in place.

Nine domain tests and the final production export pass. Targeted desktop/mobile, keyboard, search, filter and enquiry checks are recorded in `storefront/QA.md`. Real client content and a broader production accessibility/device pass remain outstanding, so milestone 2 is not yet content-complete for launch.

Next development milestone: build the owner admin and backend. Start with authenticated staff access, media, brands, products/variants, stock and prices; then scheduled sales, banners and store settings. Keep the fixture repository boundary until published CMS queries are connected in milestone 4. Gather real catalog data, approved copy, policies and contact details in parallel.

Private publication was attempted through the Sites skill but automatic approval review rejected the source/asset upload because explicit permission to export the client's logo and project to the external Sites repository was absent. A private Site identity has been reserved; no source push or publication occurred. Obtain explicit approval before retrying that upload. Do not create a second Site; reuse `storefront/.openai/hosting.json`.

## Inputs required later

- Real product data, original photography, brand/model references and stock process.
- Owner's WhatsApp number and business contact details.
- Confirmed wholesale scope and enquiry rules.
- Store information and approved policies.
- Hosting budget, production accounts and domain access.

Missing live contact details must never be replaced by an invented number. The prototype shows an enquiry-message preview until configured. Enquiry clicks do not decrement stock or prove a sale.
