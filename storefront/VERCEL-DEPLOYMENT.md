# Vercel deployment direction

Updated 31 October 2026. User selected Vercel; the user has supplied the GitHub repository `https://github.com/HavinduLiyanage/Soora-Co_Website-.git`. Vercel project creation is pending. No paid plan, database, storage service or deployment has been provisioned.

## Technical capability and plan eligibility

Vercel supports the Next.js storefront, authenticated admin UI and backend request handlers in one project. Persistent inventory requires a database integration, and uploaded images require persistent object storage. Hosting application code does not provide these automatically.

Hobby has server functionality, but Vercel restricts it to personal, non-commercial use. The client's store is a commercial project even without checkout. Local implementation can proceed without purchasing hosting. Do not describe Hobby as an eligible free production plan or assume client preview work is exempt. The user has not authorized any paid subscription. A Vercel commercial launch requires a suitable plan or confirmation from Vercel that the intended use is permitted.

## Proposed integrated architecture

- Existing Next.js UI and future backend request handlers: Vercel.
- Owner dashboard: integrated CMS/admin under `/admin`; Payload is a candidate, subject to testing its supported Next.js/React versions against this project before installation.
- Inventory, variants, prices, sale dates, staff accounts and content: managed PostgreSQL, provisioned through a provider such as Neon via Vercel Marketplace. Database provider quotas and charges are separate.
- Uploaded product/banner media: Vercel Blob, with authenticated upload/delete handling and its own usage limits.
- Customer flow: catalog to WhatsApp deep links; no cart, checkout, stock reservation or stock decrement from enquiry clicks.
- Publishing: authenticated mutations plus storefront cache invalidation. Validate sale windows on reads so correct pricing does not depend solely on a cron job. Review cache lifetime and sale transitions together.
- Do not save production inventory or uploaded media in the deployment filesystem. Never expose database credentials or write tokens to the browser.

This architecture aims to keep application hosting together in Vercel. PostgreSQL remains a separate managed service; it is not part of the frontend bundle or automatically included as an unlimited database.

## Prepared locally

`npm run build:server` builds in standard Next.js server mode. `vercel.json` selects that command and the Next.js framework. Vercel also enables server mode through its `VERCEL` environment variable. The ordinary local build retains static export for the existing review workflow. Images remain pre-optimized; this change does not enable a new paid image pipeline.

This is hosting preparation only. Fixture data is still active. Admin login, live database, uploads, write APIs, publishing and live WhatsApp destination are not implemented by this change.

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
