# Soora & Co.: website design and build plan

Status: Manrope typography approved and milestones 1–2 frontend implemented for local preview on 31 October 2026. The application uses sample data; confirmed client content, broader launch QA, backend/admin and production launch remain pending. External private preview publication awaits explicit export approval following automatic review rejection. See MILESTONES.md and storefront/QA.md.

Selected layout reference: Concept 02, Everyday, elevated. Following receipt of the Soora & Co. logo, retain its modern white layout, product photography, visible prices and WhatsApp enquiries, but replace cobalt branding with restrained gold accents and charcoal. Use the approved Manrope typography system below instead of the heavy bold lettering in the initial raster mockups. The ivory/olive concept is not selected. See section 11 for the brand adaptation and proposed wholesale journey.

## 1. Product objective and working assumptions

Help visitors find an available watch, understand its price and specifications, and open a relevant WhatsApp conversation. Give the store owner control of catalog, prices, promotions, imagery, merchandising and store information.

Working assumptions: one store, one main WhatsApp number, English at launch, LKR pricing, no online checkout or customer account requirement. Confirm catalog size, variants, physical-store stock workflow, actual branding and monthly hosting budget before infrastructure procurement. Use realistic sample records until real inventory is provided; label preview content as illustrative.

## 2. Improve the selected design

- Preserve the selected concept's clean composition. Use white and charcoal with restrained gold branding; reserve green for WhatsApp actions. Check readable contrast across every state. Pale gold is decorative, not small body text on white.
- Replace image-baked text with real responsive headings and buttons. Let the owner change text separately from photography.
- Home hero: one strong campaign, short headline, primary Explore watches/deals action, secondary Browse all watches. Supply separate desktop/mobile crops and focal points. Avoid auto-rotating content at launch.
- Reduce the Deals page hero height: returning deal hunters should reach products quickly.
- Standardise cards across home, catalog and Deals: consistent image aspect ratio, brand, model, relevant size/variant, current price, old price when discounted, availability, details link and WhatsApp action.
- Make card imagery and model names link to product details. A distinct WhatsApp action permits a faster path for informed shoppers. Avoid nested links.
- Keep brand discovery, Men/Women/Unisex browsing and sale badges restrained and readable. Do not repeat sale marks excessively.
- Separate unisex categorisation from demographic assumptions: Unisex is an explicit category; Men/Women listings include it only if that rule is intentionally configured.
- Use actual supplied product photography for launch. Display warranty, authenticity, delivery or testimonial claims only when supplied and verified by the client.
- Mobile: compact sticky header, search, two-column catalog, filter drawer with Apply/Clear and result count, and a product-page bottom bar showing price plus WhatsApp action.
- No-results, empty Deals, unavailable products, failed images, loading, network errors and missing content are designed states.
- Aim for WCAG 2.2 AA: keyboard navigation, visible focus, descriptive image text, accessible filter dialog, reduced motion, clear labels and comfortable touch targets. Verify during implementation.

## 3. Public sitemap and page design

| Route | Page design | Primary customer journey |
|---|---|---|
| `/` | Campaign hero; brand strip; category entry points; selected inventory; current deals; brief store information and footer | Discover a collection, narrow choices, open a watch |
| `/watches` | Compact heading, search, product count, filters, sort, grid and pagination | Browse inventory by brand, budget, gender, stock and watch attributes |
| `/watches/men`, `/watches/women`, `/watches/unisex` | Shared catalog template with category fixed in the page context | Start from preferred category, filter further, open a watch |
| `/watches/[slug]` | Breadcrumbs; gallery; brand/model/reference; variant selectors; current/old price; availability; prominent WhatsApp CTA; specifications; relevant store policies; related available watches | Inspect the exact watch and enquire with selected variant identified |
| `/deals` | Short campaign header; sale-only grid; brand/gender/price filters; savings and stock labels | Discover a genuine current offer and enquire |
| `/brands` | Logo/name directory, A-Z browsing and search if needed | Select a familiar brand |
| `/brands/[slug]` | Brand introduction plus shared catalog grid and filters | Explore one brand with consistent catalog tools |
| `/search?q=...` | Search input, matching watches, clear empty state and spelling guidance | Find an exact model, SKU, brand or reference number |
| `/about` | Real store photography, story and relevant service information | Establish trust before contacting the store |
| `/contact` | WhatsApp, phone, hours, address and map link if applicable | Reach or visit the store |
| `/faq` | Searchable or grouped concise answers about enquiries, availability and fulfilment | Resolve hesitation and return to browsing/contact |
| `/privacy`, `/terms`, `/delivery-returns` | Readable client-approved policy templates | Understand store practices; publish only applicable policies |
| 404 / unavailable states | Plain explanation, search and relevant catalog links | Recover without reaching a dead end |

Header: All watches, Men, Women, Unisex, Brands, Deals, Search. Secondary store and policy links live in the footer. New arrivals can initially be a catalog sort and home section rather than another independent page.

Shareable filters and sorting live in the URL, preserving context on browser Back. Build stable category and brand landing pages; avoid indexing every filter combination. Use server-rendered public content, descriptive metadata, canonical URLs, sitemap and product availability/pricing metadata that agree with visible content. Validate structured data eligibility before enabling specific search features.

## 4. Journey details

Discovery: Home -> category or brand -> filters -> product -> variant -> WhatsApp.

Offer shopper: Hero/Deals link -> filtered current offers -> product -> WhatsApp. All surfaces show the same active price and savings.

Known product: Search -> matching reference -> product -> WhatsApp. Exact reference matches rank ahead of broad brand matches.

Direct arrival: Shared product link -> price/specifications/stock -> WhatsApp without needing to visit Home.

Unavailable watch: Retain useful product information and explicit stock status; offer Ask about restocking plus similar available watches. Do not imply it can be purchased immediately.

WhatsApp message: store-specific greeting, watch name, reference/SKU, selected variant, displayed price and canonical product link. Visitor reviews and sends the message in WhatsApp; opening the link is neither a confirmed enquiry nor a completed purchase. Keep a visible phone/contact fallback. A click must never reserve stock automatically.

## 5. Frontend-first implementation

Recommended foundation: Next.js, React and TypeScript; a small shared styling system, with Tailwind CSS if useful. Define content types and pricing/availability rules before detailed UI work.

1. Design tokens and component states: typography, spacing, colours, buttons, form fields, image ratios, cards, badges and navigation.
2. Responsive homepage and catalog using structured sample data, including full-price, sale, sold-out, reserved, variant and missing-image examples.
3. Product details and WhatsApp journey, then Deals, brand pages and search; reuse catalog components.
4. About/contact/FAQ/policy templates, errors and empty states; finish responsive and accessibility refinement.
5. Admin workflows and real data integration against the same content contracts.

Use a data access boundary (catalog queries, product lookup, homepage content, store settings). Start with a fixture-backed implementation and replace it with CMS queries. Components never embed stock or promotion decisions independently. Public routes receive only approved public fields.

Frontend review deliverable: a responsive preview with all primary navigation, filters, sorting, variant selection, representative states and WhatsApp links. It uses sample data until connected to the backend.

## 6. Backend recommendation and architecture

Proposed stack: Payload CMS in the Next.js application, managed PostgreSQL for durable records, and supported persistent object storage for uploaded images. Use a compatible Node.js hosting environment; select providers after checking recurring cost, job execution, backup/restore and required runtime support. Keep source, domain and production accounts under client ownership.

Payload supplies an admin foundation, content schemas, authentication and configurable access control, drafts/versioning and preview facilities. We must configure these and implement the watch-specific inventory, pricing, campaign and audit workflows; they are not all turnkey features.

Flow: Owner admin -> validated published records in database + media storage -> public data queries -> shared storefront components. Publishing changes triggers affected content refresh. A separately configured scheduled runner handles timed publishing and housekeeping; deployed infrastructure must actually execute it.

Core records:

- Products: title, slug, brand, model/reference, description, categories, specifications, gallery, merchandising flags, publication state and SEO fields.
- Variants: SKU, optional dial/strap/size options, optional images, regular price, sale price/window and stock records. Simple watches have one default variant. Money stored as integer minor units with explicit currency.
- Brands: name, slug, logo, description, published status and display order.
- Categories/collections: stable gender categories, optional style collections, editorial title and product criteria/selection.
- Campaigns: title, date window, selected product/variant set, banner references, destination and lifecycle state. Variant sale pricing remains authoritative; a campaign coordinates products without introducing a competing price source.
- Media: images, alternatives/crops, focal point, alt text and usage references.
- Homepage/Pages: constrained section blocks, copy, product selections, ordering, visibility and publish state.
- Store settings: business name/logo, contacts, main WhatsApp number, hours, address, social links, currency and timezone.
- Admin users, change audit and stock movements: authorised staff, attributable changes and inventory adjustment history.

Public users can read only published, explicitly exposed content. Internal cost prices, stock movement history, drafts, credentials and staff records never appear in public payloads. Enforce permissions server-side, including local API calls that may otherwise bypass access rules. Secure draft previews independently from public content.

## 7. Client admin experience

| Area | Client capabilities |
|---|---|
| Overview | Available products, low/out-of-stock items, current/upcoming deals, scheduled banners and shortcuts |
| Inventory | Create, duplicate, edit, draft, preview, publish, unpublish or archive products; manage variants, photos and specifications |
| Stock | Record incoming stock, reservations, completed offline sales, returns and corrections, with quantity and reason; release reservations; prevent negative availability |
| Pricing | Change regular price; set lower sale price or calculate one from a percentage; schedule start/end; preview saving; bulk update with a review screen |
| Campaigns | Select discounted products, set dates, preview affected items and link to an appropriate catalog view |
| Banners | Upload desktop/mobile images; set headline/body/button/destination; choose safe layout preset, placement, priority, schedule and visibility |
| Homepage | Show/hide/reorder approved sections; select featured products/brands/collections; edit section titles and links |
| Brands and content | Manage brand logos/pages, category copy, About, FAQ, contact and applicable policy content |
| Media | Reuse uploads, reorder gallery images, add alt text and crop/focal settings; warn if deleting an image used on a published page |
| Staff and recovery | Owner and limited editor roles; version restore for editorial content; explicit compensating changes for live inventory |
| Measurement | Product views, search interest, no-result searches, banner clicks and WhatsApp clicks, clearly labelled as interest rather than completed sales |

Admin product form tabs: Essentials; Images; Variants and stock; Pricing and sale; Specifications; Visibility and SEO. Provide clear required fields, inline validation, draft saving and preview. Offer full operational control using stable layout presets; arbitrary visual redesign remains development work.

## 8. Automatic UI rules

| Admin/data event | Expected public behaviour |
|---|---|
| Publish a valid product | Appears in applicable catalogs, brand page and search; has a shareable detail page |
| Change price | Product, cards, sort/filter results and WhatsApp message agree after refresh |
| Valid sale starts | New price + struck-through regular price + computed discount; enters eligible Deals views |
| Sale ends or is disabled | Regular price returns; old price/badge disappear; removed from Deals |
| Selected variant changes | Images where supplied, price, stock status and WhatsApp message update together |
| Available stock reaches zero | Sold-out state; remove from available-deal promotions; restock enquiry and alternatives remain |
| Product unpublished | Removed from public discovery and public API access; old URL receives appropriate unavailable/404 treatment |
| Banner schedule expires | Next eligible campaign or evergreen fallback appears; no empty hero |
| No active available deals | Honest empty state and Browse all watches action; homepage deals section hides |

Sale eligibility: published record, sale enabled, valid lower non-negative sale price, current server time inside the start/end window, and available stock for promotional listings. Price visibility on sold-out detail pages must remain explicitly labelled with stock status. Never infer a sale from a manually typed badge. Discount percentages are derived and rounded consistently.

Multi-variant cards show an honest From price and, where applicable, Selected variants on sale. Never compare one variant's regular price with another variant's sale price. An enquiry requires variant selection when more than one exists.

Evaluate schedules using server time; enter and display scheduling in the store timezone (initial assumption Asia/Colombo), storing instants in UTC. Publish hooks refresh affected cached views; time-based expiry and scheduled refresh cover promotions starting/ending without edits. Design for a bounded stale interval and refresh already-open pages at promotion boundaries or tab focus. Scheduled job failures must not make expired discounts authoritative. Read current price/stock before constructing a fresh enquiry; if changed, show it before handing off.

Free-form banner artwork may contain obsolete prices: structured text and campaign-derived claims are preferred. Link campaign banners to campaign windows, preview discounted products, and warn about banners without qualifying inventory. Avoid automatic maximum-discount headlines that cannot be justified by eligible stock.

## 9. Build stages and acceptance criteria

| Stage | Output | Ready when |
|---|---|---|
| A: Foundation | Confirmed direction, sitemap, data contract and responsive design system | Key page/state designs support the chosen customer and admin journeys |
| B: Frontend preview | All primary public templates with realistic fixture data | Navigation, filters, Back behaviour, variant selection, mobile layout and enquiry messages work |
| C: Backend/admin | Database/media setup, schemas, permission rules and owner workflows | Owner can add a watch, publish, update price/stock, schedule a sale and replace a banner without code |
| D: Integration | Public views driven by live published data and schedule rules | A single edit updates all dependent surfaces; draft/internal content remains private |
| E: Launch/handover | Real content, domain, production configuration, backup plan and owner guide | Core journeys and restore procedure verified; client controls accounts and understands stock recording |

Meaningful verification includes sale boundary transitions, variant pricing, permissions/draft leakage, concurrent stock adjustment, bulk-update validation, banner fallback and WhatsApp encoding. Visually verify main templates at mobile/tablet/desktop widths. Check keyboard/filter dialog behaviour, image performance, metadata, indexing and broken links. Back up and restore both database and uploaded media; neither substitutes for the other.

Launch essentials: catalog/detail/Deals/brands/search; WhatsApp; owner admin; product/variant/stock/price editing; sale windows; banners; structured homepage editing; basic informational pages; backups and simple interest analytics.

Later enhancements: CSV import with validation/dry-run; extended bulk merchandising; richer campaign reporting; saved shortlist without account; multi-language content; POS inventory integration; optional enquiry workflow integration. Do not introduce loyalty accounts, customer checkout or automatic WhatsApp sales attribution unless requirements change.

## 10. Inputs needed before production content and hosting

Store name/logo, real catalog and photos, stock count/process, variant requirements, approved contact details, real policies, staff access requirements, domain access and monthly operating budget. These do not block the initial frontend design and fixture-data preview.

Update: the store name and a raster logo reference have now been supplied: Soora & Co., with the descriptor Wholesale and Retail. Original vector/transparent artwork remains desirable for production. Do not infer wholesale minimum quantities, pricing tiers or eligibility from the descriptor alone.

## 11. Brand adaptation after receiving the logo

### Visual direction

Modern watch retailer: white product galleries, charcoal campaign photography and restrained gold. Keep the chosen concept's strong sans-serif hierarchy and browsing clarity. Brand gold connects the website to the logo; it should not dominate product imagery.

Provisional palette, visually informed by the supplied reference rather than an exact sampled brand specification:

| Token | Starting colour | Role |
|---|---|---|
| White | #FFFFFF | Main background |
| Soft neutral | #F6F5F2 | Product tiles and section separation |
| Charcoal | #242120 | Text, primary browse buttons and dark campaign areas |
| Brand gold | #C9AA52 | Logo-related accents, fine rules and decorative details |
| Pale gold | #F5ECCE | Sale badge background with dark text |
| WhatsApp green | #166534 | Enquiry controls, subject to contrast verification |

Use solid, readable interface colours. Avoid metallic effects behind text. Selected filters use dark fill/light text or a clear border; do not communicate selection by gold colour alone.

### Approved typography — 31 October 2026

Use Manrope throughout the public website. This decision supersedes generic bold sans-serif guidance in the original concept prompts.

| Role | Font and weight |
|---|---|
| Hero and section headings | Manrope Medium, 500 |
| Product names | Manrope Medium, 500 |
| Descriptions and supporting copy | Manrope Regular, 400 |
| Navigation, labels and buttons | Manrope Medium, 500 |
| Current prices and important savings | Manrope Semibold, 600 |
| Original struck-through prices | Manrope Regular, 400 |

Preserve the original logo artwork and lettering. Use clear scale and spacing for hierarchy rather than extra-heavy font weights. Verify wrapping and legibility on mobile. Use the actual font files in implementation; image-generated lettering is not an exact font specimen. Source: https://fonts.google.com/specimen/Manrope.

The existing round-01 PNGs remain historical visual concepts and have not been regenerated with this font decision. Their layout and branding guide implementation; this specification governs actual typography.

### Logo asset preparation

The supplied image is a wide branded composition with a central logo, descriptor and decorative corners. Use the central brand mark for navigation, not the entire rectangular image at a tiny scale. Preserve the watch symbol, lettering and brand proportions.

Production asset plan: central transparent logo for the header, full lockup for footer/About, and an approved watch-symbol icon for favicon/mobile use. Obtain the original SVG/transparent artwork where available; treat any extraction from the supplied raster as a provisional derivative and preserve the source. Verify legibility at actual header sizes. Existing gold corner geometry can appear very subtly in a campaign or footer, with no interference with content.

### Homepage composition

1. Optional editable announcement strip: a real current offer or store message; collapses if disabled.
2. White header with the compact logo, catalog navigation and search.
3. Charcoal photographic hero with a watch close-up, white headline, small gold accent and Explore watches/Explore deals action. Copy is live text and mobile crop is independent.
4. Compact brand strip containing only stocked brands.
5. Men, Women and Unisex category links or photo tiles.
6. Selected/new watches using consistent catalog cards.
7. Current deals with clear original/current prices; hide when none qualify.
8. Optional wholesale introduction, contingent on confirmed business workflow.
9. Brief store/contact information and footer with the full logo lockup.

Keep sections compact enough that inventory is not buried below a long promotional page. On mobile, bring category browsing and initial products close to the hero.

### Proposed wholesale extension, pending business rules

The logo suggests wholesale is relevant, but its operating terms have not been supplied. Proposed default: public prices are retail prices, with a separate Wholesale enquiries link and optional `/wholesale` page. No invented volume discounts or public wholesale price list.

Wholesale page design: short introduction, confirmed eligibility/minimum-order information if supplied, brand/category interests and a short enquiry composer for business name, intended quantity and optional models. Show a preview and send the enquiry through WhatsApp. Do not collect/store a separate lead record unless requested; do not label a WhatsApp click as a submitted enquiry.

Optional product-level bulk-enquiry link can prefill the selected model and requested quantity. A separate wholesale phone number may be configured only if the client provides one. Quote acceptance and stock allocation remain manual.

Admin extension: editable wholesale page, visibility toggle, wholesale contact destination and confirmed FAQ/terms. Public wholesale pricing, customer login, quantity-based tiers and automatic quotations are separate scope decisions. A shared stock pool remains authoritative unless the client explicitly uses separate retail/wholesale inventory.

### Next design/build deliverables

1. Brand-ready component board and logo sizing tests; document provisional colours and typography.
2. Revised Soora & Co. homepage concept at desktop and mobile sizes.
3. Product-detail and Deals concepts, including full-price, sale, sold-out and variant states.
4. Responsive frontend with structured sample data; proceed through the existing phased build plan.
5. CMS/admin integration, real content, verification and owner handover as already planned.

Resolve before wholesale implementation: whether wholesale belongs in launch scope, whether prices are enquiry-only, minimum quantities/eligibility, and which WhatsApp destination should receive enquiries. These decisions do not block the retail frontend.

## Technical references checked

- Payload admin: https://payloadcms.com/docs/admin/overview
- Payload versions/drafts: https://payloadcms.com/docs/versions/overview
- Payload preview: https://payloadcms.com/docs/live-preview/overview
- Payload permissions: https://payloadcms.com/docs/access-control/overview
- Payload PostgreSQL: https://payloadcms.com/docs/database/postgres
- Payload media storage: https://payloadcms.com/docs/upload/storage-adapters
- Payload job execution: https://payloadcms.com/docs/jobs-queue/overview
- Next.js revalidation: https://nextjs.org/docs/app/getting-started/revalidating

Implementation must check the selected package versions and deployment documentation before setup. Provider selection and recurring costs remain open.
