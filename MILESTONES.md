# Soora & Co. delivery milestones

Updated: 31 October 2026. Approved identity: white, charcoal and restrained gold; Manrope 400/500/600; original logo artwork. Catalog with visible prices and WhatsApp enquiries, no checkout.

| Milestone | Deliverable | Completion criteria | Status |
|---|---|---|---|
| 1. Frontend foundation and prototype | Next.js/TypeScript project, reusable design system, fixture catalog, responsive Home/catalog/product/Deals pages, Manrope and brand assets | Build passes; browsing, filters, variant pricing and enquiry preview work; desktop/mobile reviewed | Deployed to Vercel; sample content |
| 2. Complete customer experience | Final brand/category landing pages, search refinement, store/contact/FAQ/policy content, full mobile/accessibility/performance pass | Every approved customer journey and edge state works; supplied content replaces placeholders | Deployed for review; client content and broader launch QA pending |
| 3. Owner admin and backend | Custom admin, Better Auth, Neon PostgreSQL, Blob uploads, products/variants, stock and prices, scheduled sales and banners | Owner can manage routine operations without code; preview/publish and access rules verified | Hosted setup / remaining scope pending |
| 4. Live integration | Replace fixture repository with CMS queries, shared availability/pricing, publish invalidation, scheduled refresh, media delivery | An admin change updates every applicable storefront surface; no draft/internal data leaks | Planned |
| 5. Production launch and handover | Real catalog/photos, WhatsApp destination, policies, domain, analytics, backups, restore check, owner guide | Production journeys and recovery verified; client owns accounts and is trained | Planned |

## Current step — 31 October 2026

The frontend preview is deployed at https://soora-co-website-bice.vercel.app/. GitHub and Vercel are connected.

Milestone 3's first admin increment is implemented: owner login, private drafts, publishing/unpublishing/archiving, variants, stock/prices, sale windows, banners, image upload, announcement/WhatsApp settings and content export. Supabase was declined; use a dedicated Neon Free project with automatic idle wake-up, Better Auth and Vercel Blob. No paid subscription is authorised.

Milestone 4's data adapter is implemented behind CATALOG_SOURCE=database. It only reads published snapshots, supports new brands/product URLs, and rechecks product data before enquiries. Default deployment retains fixtures until the dedicated database is connected and migrated.

Validation: 14 automated domain/database tests, 30 actual local PostgreSQL/HTTP integration assertions, production build and desktop/mobile review. Hosted image upload and final Neon connection still require service provisioning.

A separate Neon Free project `soora-co` has been created in Singapore (`frosty-grass-93934439`). Next: connect it and a Blob store, create the owner's private account, run the schema migration, and verify one real watch and banner end to end in a separate preview database. See storefront/BACKEND-SETUP.md. Production launch, actual inventory/photos, policy copy, account recovery/backup drill and full client handover remain open. Staff roles, bulk import and broader editorial controls are later admin increments.

## Inputs required later

- Real product data, original photography, brand/model references and stock process.
- Owner's WhatsApp number and business contact details.
- Confirmed wholesale scope and enquiry rules.
- Store information and approved policies.
- Hosting budget, production accounts and domain access.

Missing live contact details must never be replaced by an invented number. The prototype shows an enquiry-message preview until configured. Enquiry clicks do not decrement stock or prove a sale.
