# Milestone 1 verification

31 October 2026.

- Production export: Next.js build passed and generated the homepage, catalog, Deals, brands, information pages, eight product detail pages and 404.
- TypeScript: typecheck passed.
- Domain tests: 6 passed (sale boundaries, invalid prices, available sale variants, sold-out exclusions, filter composition and selected-variant enquiry content).
- Browser: reviewed desktop homepage at 1440px and mobile layout at 390px using the connected browser. Confirmed Manrope Variable is applied. Checked document width against viewport on mobile; no horizontal overflow detected on the product page.
- Catalog: 8 sample watches initially; Seiko filter returns 2; in-stock filter reduces that to 1.
- Product: selecting the unavailable Champagne variant updates the price to LKR 65,000 and changes the action to Ask about restocking. The enquiry preview includes that variant, price, reference and product URL. No message was sent.
- Mobile Deals: 4 eligible products; mobile price filter under LKR 30,000 returns the LKR 16,000 Casio example. Drawer opens and closes successfully.
- Sale badge calculations and unavailable-product exclusion are shared functions rather than independent page logic.

## Limits and next pass

This is not a full accessibility or performance certification. Milestone 2 covers the complete keyboard/screen-reader pass, all browser/device combinations, content polish and image optimisation. Generated photography and fixture descriptions do not represent real model specifications. Live messaging, admin, stock mutations and scheduled server execution remain later milestones. Static preview prices will require a rebuild after fixture edits; live CMS invalidation is not connected yet.

# Milestone 2 verification

31 October 2026. Local changes only; no external upload or publication.

## Automated checks

- Production static export passes, including the three category routes, four brand routes, search, FAQ, policies and wholesale pages. The sandboxed export initially encountered Windows EPERM on an output directory; the same build passed outside the sandbox. Final export passed after responsive CSS adjustments.
- TypeScript check passes independently and as part of the final build.
- Nine domain tests pass. New coverage: independent keyword matching across product fields, references without punctuation, and expired deals reverting to regular prices and leaving the Deals collection.
- Responsive assets: five source PNGs total 8,402,156 bytes. The five medium WebP candidates total 217,942 bytes (97% smaller). All 15 responsive candidates together total 676,932 bytes. These are file-size measurements, not a Lighthouse score or a measured page-load improvement.

## Browser checks

- Dedicated Men route shows three watches; mobile Seiko draft filter shows one prospective result. Cancel leaves three watches and the URL unchanged; Apply shows one and adds `?brand=Seiko`. Category switch links retain optional filters.
- Global search autofocus works. `Seiko automatic` opens the dedicated search page with one result; a missing watch search shows zero, helpful recovery text, Reset filters and Browse all watches.
- Seiko brand route shows two watches. In-stock filtering returns one; Clear all restores two while preserving the Seiko collection.
- Wholesale composer prepares the requested quantity and styles in an editable message. No message sent and no customer data submitted.
- FAQ disclosure expands with Enter. Mobile navigation closes with Escape and focus returns to its toggle.
- Reviewed desktop collection layouts at 1440px and mobile at 390px. DOM width checks showed no horizontal overflow on the mobile category page (390px), wholesale page (320px) and FAQ page (320px).
- Verified visible collection images load from responsive WebP candidates; the original client logo remains unchanged.
- Screenshot: `../designs/milestone-02/brand-desktop.png`.

## Remaining before production

This is targeted browser and keyboard QA, not a complete accessibility certification or an all-device test matrix. Final client inventory, photos, copy, contact details, WhatsApp number and approved delivery/returns/warranty/privacy/terms are still required. Policy content is explicitly marked draft. No real admin, database, stock updates, messaging destination or CMS publishing has been connected. Browser/platform coverage and production performance measurements belong in final launch QA.

# Vercel preparation verification

31 October 2026. `npm run build:server` (invoked through its Node script) passes compilation, TypeScript and page generation. The generated server manifest exists and its configuration does not enable static export. Initial sandbox attempt hit the same Windows EPERM output-directory error as the earlier export; rerunning the unchanged build outside the sandbox passed. No cloud deployment, backend API, admin authentication, live database or file upload flow was tested: those remain unimplemented. No UI changes were made in this preparation step.

# First Vercel deployment fix

The first cloud build failed during `npm install` with `Invalid Version`. The previous lockfile contained optional platform packages without versions. Regenerated the lockfile from the pinned package manifest in an isolated directory, confirmed Linux SWC/Sharp/TypeScript entries and verified no previously versioned package changed version. A clean `npm ci --ignore-scripts --no-audit --no-fund` completed successfully (32 packages on Windows). Vercel now uses `npm ci` for deterministic installation; the cloud build remains the Linux validation.


## Owner workspace and backend — 31 October 2026

- Built custom admin with drafts/publishing, variants/stock/prices, scheduled sales, home/deals banners, image uploads, owner authentication and settings.
- Fourteen automated tests pass, including actual PostgreSQL semantics via PGlite for revision conflicts, audit triggers, published snapshot isolation and archive/unpublish behavior.
- Thirty integration assertions pass against an isolated PostgreSQL 17 database and the built Next.js server: owner login/logout, anonymous access denial, disabled public signup, origin protection, input validation, draft isolation, stale saves, price/sale publishing, public Deals reads, banner integration, settings conflicts, export, immediate membership revocation and database-backed auth rate limiting.
- Found and fixed Better Auth endpoint routing with Next trailingSlash, then reran the actual HTTP suite.
- Production build passes. Local Turbopack required an unsandboxed build to create Windows junctions for sharp; this was an environment permission issue.
- Desktop and mobile dashboard/editor reviewed; mobile inventory uses stacked rows and search controls preserve their horizontal layout.
- Hosted Neon connection, real owner onboarding and Vercel Blob upload smoke test remain pending. No private credentials or local QA database are committed.
