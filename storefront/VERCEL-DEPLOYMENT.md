# Vercel deployment direction

Updated 31 October 2026. Vercel project `soora-co-website` is connected to `https://github.com/HavinduLiyanage/Soora-Co_Website-.git`. The storefront preview is deployed at https://soora-co-website-bice.vercel.app/. No paid plan has been activated. The separate Neon Free project `soora-co` has been created in Singapore (project `frosty-grass-93934439`). Its application connection and image-store setup remain pending.

## Technical capability and plan eligibility

Vercel supports the Next.js storefront, authenticated admin UI and backend request handlers in one project. Persistent inventory requires a database integration, and uploaded images require persistent object storage. Hosting application code does not provide these automatically.

Hobby has server functionality, but Vercel restricts it to personal, non-commercial use. The client's store is a commercial project even without checkout. Local implementation can proceed without purchasing hosting. Do not describe Hobby as an eligible free production plan or assume client preview work is exempt. The user has not authorized any paid subscription. A Vercel commercial launch requires a suitable plan or confirmation from Vercel that the intended use is permitted.

## Proposed integrated architecture

- Existing Next.js UI and future backend request handlers: Vercel.
- Owner dashboard: custom integrated workspace under `/admin`, with Better Auth sessions and explicit owner membership. Payload was considered but is not used in this implementation.
- Inventory, variants, prices, sale dates, staff accounts and content: managed PostgreSQL, provisioned through a provider such as Neon via Vercel Marketplace. Database provider quotas and charges are separate.
- Uploaded product/banner media: Vercel Blob, with authenticated upload/delete handling and its own usage limits.
- Customer flow: catalog to WhatsApp deep links; no cart, checkout, stock reservation or stock decrement from enquiry clicks.
- Publishing: authenticated mutations plus storefront cache invalidation. Validate sale windows on reads so correct pricing does not depend solely on a cron job. Review cache lifetime and sale transitions together.
- Do not save production inventory or uploaded media in the deployment filesystem. Never expose database credentials or write tokens to the browser.

This architecture aims to keep application hosting together in Vercel. PostgreSQL remains a separate managed service; it is not part of the frontend bundle or automatically included as an unlimited database.

## Prepared locally

`npm run build:server` builds in standard Next.js server mode. `vercel.json` selects that command, `npm ci` and the Next.js framework. Static export is no longer used because authentication, admin mutations and current inventory reads require a server. Existing images remain pre-optimized; uploads are converted to WebP before Blob storage.

The backend and admin implementation is documented in `BACKEND-SETUP.md`. Without environment configuration, `/admin` shows setup status and `/admin/preview` provides a read-only fixture preview. `CATALOG_SOURCE=database` explicitly enables published database reads; until then the public storefront keeps its sample inventory.

## New account setup and deployment sequence

1. Client owns the GitHub repository and Vercel project, with developer access as needed. No secrets committed.
2. Push the reviewed project to the intended repository after account access is available. Import into Vercel with Root Directory `storefront`, Next.js preset and automatic output settings (do not override output directory to `out`).
3. Settle commercial plan eligibility and costs before enabling production hosting; do not activate paid services without authorization.
4. Confirm compatible CMS/database versions, then implement authentication, inventory/media editing and published queries locally.
5. Provision database/media resources within the approved account and budget; store secrets in Vercel environment settings. Use separate preview and production data.
6. Run migrations as an explicit controlled step, then verify one product and one banner end to end before expanding the admin.
7. Connect the existing domain, real WhatsApp number and approved content after testing; verify backup/export and restore procedures.

## Sources checked

- https://vercel.com/docs/plans/hobby
- https://vercel.com/docs/functions
- https://vercel.com/docs/storage
- https://vercel.com/docs/vercel-blob/usage-and-pricing
- https://vercel.com/pricing
