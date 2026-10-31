# Owner workspace and backend

Implemented 31 October 2026. The owner workspace uses Next.js on Vercel, PostgreSQL on Neon, Better Auth, and Vercel Blob. Supabase was declined because of inactive-project pausing. Payload was an early candidate; the implementation now uses a focused custom dashboard with the existing typography and branding.

Neon automatically wakes idle compute; this differs from restoring a paused Supabase Free project. Free plans still have usage limits. No paid subscription is authorised. The existing Vercel commercial-plan restriction remains a launch consideration documented in VERCEL-DEPLOYMENT.md.

## What is implemented

- `/admin/`: connection status or authenticated owner dashboard.
- `/admin/preview/`: public, explicitly read-only design preview using fixtures. Never loads real admin records.
- `/admin/login/`: email/password login. Public signup is disabled. Owner membership is checked server-side on every private request, separately from having a valid session.
- Products: add/edit variants, integer stock counts, retail prices, scheduled variant sales, category, brand, product references, imagery, featured placement, drafts, publishing, unpublishing and reversible archival.
- Banners: home/deals placement, desktop/mobile artwork, live text, alt text, internal links, priority, enabled state and optional schedule.
- Settings: WhatsApp destination, announcement text/link, sample-content labels, owner password change and content export.
- Atomic version checks prevent stale forms overwriting another editor. Database triggers audit changes, including previous inventory counts and prices.
- Public reads use published snapshots only. Saving a draft does not alter the published version. Active sale and banner windows are evaluated on reads; visible pages refresh every minute and on focus. New enquiry dialogs fetch current product data before preparing a message.
- Uploaded JPEG/PNG/WebP files are decoded, resized, stripped of metadata and stored as WebP. Up to 3 MB per source image and 24 megapixels. Images are public website assets, not private document storage.

## Provisioning status

Neon Free project `soora-co` has been created in AWS Singapore: https://console.neon.tech/app/projects/frosty-grass-93934439. No broad Neon CLI access was granted; its sign-in timed out. The next connection uses only this project’s database credentials, entered privately into the ignored `.env.local` file. Owner account details belong in ignored `.env.owner`. Hosted Blob setup and Vercel environment configuration are still pending.

## Connect the services

1. In the existing Vercel project, connect a **Neon Free** database via Storage / Marketplace, or create a dedicated Neon Free project. Keep the database in a nearby region and use its pooled connection URL. Do not reuse another business's database.
2. Add `DATABASE_URL` as a server-side Vercel environment variable. Create a separate Neon branch or database for local/development testing; never point automated tests at the live catalog.
3. Add `BETTER_AUTH_SECRET`, a cryptographically random value of at least 32 characters. Add `BETTER_AUTH_URL=https://soora-co-website-bice.vercel.app` for the stable hosted origin. Use the actual local origin in local development. Do not add wildcard trusted origins.
4. Connect a public Vercel Blob store; Vercel supplies `BLOB_READ_WRITE_TOKEN`. Uploads remain disabled without it. No credentials use a `NEXT_PUBLIC_` prefix.
5. Copy `.env.example` to `.env.local`, add the intended database credentials privately, and run `npm run db:setup`. This explicitly runs Better Auth's installed-version migrations, then the store schema in a transaction. Build/deployment never runs migrations automatically.
6. Create an ignored `.env.owner` locally with `SOORA_OWNER_EMAIL`, `SOORA_OWNER_NAME` and `SOORA_OWNER_PASSWORD` (12–128 characters). Run `npm run owner:create`. Remove that temporary file after successful provisioning. Do not send passwords in chat. The registration-enabled auth instance exists only in the CLI, never in the web application. Additional owners require the same private provisioning workflow.
7. Keep `CATALOG_SOURCE=fixtures` while reviewing the preview. To test the integration, set `CATALOG_SOURCE=database` **on a separate preview environment connected to its own database**, redeploy, and publish one test watch and banner. Validate editing, stock, pricing, sale dates, image uploads and logout there.
8. Populate the intended catalog, set `CATALOG_SOURCE=database` for the stable deployment, and redeploy. An empty live database produces an empty catalog; it does not secretly show sample inventory. Database failures show an error, not fictitious stock.
9. Add the real WhatsApp number in Store settings. Disable sample-content labels only after replacing all sample inventory, photography and draft store copy. Indexing stays disabled until the separate launch review.

All schedules are entered as Sri Lanka time (UTC+05:30) and stored as UTC instants. Banner priority ties use most recently updated first. Sale prices must be below regular prices. No enquiry reserves stock or counts as a sale.

## Owner workflow

1. **Add a watch** → details → variants/images → stock/prices → Save draft.
2. Review the form, then **Publish changes**. All public catalogs and product pages read the published snapshot.
3. To run a sale, edit the variant, enable its sale, set the lower price and dates, then publish. Deals membership and badges follow automatically.
4. To change campaign artwork, create or edit a banner, choose placement and priority, check dates and publish.
5. After completing a WhatsApp sale, update stock and publish. Stock is not linked to a POS system.
6. **Unpublish** removes the public record while retaining the draft. **Archive** hides it from the active collection; it can be republished later. Product URLs are fixed after creation to preserve shared links.
7. If a save reports a revision conflict, keep a copy of your intended changes, reload the workspace and apply them to the latest record. Stale drafts are not silently merged.

The price displayed in the inventory table reflects the current draft. Its visibility badge indicates whether an older version is published; “Unpublished edits” distinguishes these states. Live-offer counts use published snapshots. Unit totals use current active draft stock.

## Recovery and handover

- Store settings → Export content downloads products, banners, settings and media references. This is **not a full backup**: it excludes auth data and image bytes.
- Before launch, establish a database backup/export schedule, download a copy of uploaded media and rehearse restore into a separate database. Neon recovery windows vary by plan; do not assume unlimited history.
- Account recovery currently requires the developer/provider operator. There is no configured transactional email service and no misleading “reset email sent” UI. Passwords can be changed from an authenticated owner's Settings page. A self-service recovery email workflow is future work.
- Staff roles, CSV imports, a visual audit-history browser, bulk stock operations, gallery reordering and editable policy/About pages are not included in this first admin increment.
- Source history and the database audit table are not substitutes for backups.

## Verification

`npm test` runs catalog and admin validation tests plus isolated PostgreSQL-compatible tests using PGlite. These verify draft isolation, atomic revisions, published snapshots, audit records, unpublish/archive behavior and schedule rules.

The integration test `scripts/test-admin-integration.mjs` only permits the explicitly named local QA database at `127.0.0.1:55437`. It is not a production healthcheck. It verifies actual Better Auth sessions and the Next.js request handlers against PostgreSQL. It must not be repointed at a hosted or real inventory database.

Sources: [Neon scale to zero](https://neon.com/docs/introduction/scale-to-zero), [Better Auth installation](https://better-auth.com/docs/installation), [Better Auth migrations](https://better-auth.com/docs/concepts/database), [Vercel Blob pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing).
