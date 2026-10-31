# Soora & Co.

Watch catalog for Soora & Co., with visible prices, brand and category collections, Deals and WhatsApp enquiry preparation. No online checkout.

The Next.js application is in [`storefront/`](storefront/README.md). It currently uses sample inventory and illustrative product images. Live admin, database, uploads and WhatsApp sending are not connected yet.

## Local development

```sh
cd storefront
npm ci
npm run dev
```

## Vercel import settings

- Repository: `HavinduLiyanage/Soora-Co_Website-`
- Root Directory: `storefront`
- Framework Preset: Next.js
- Build Command: configured in `storefront/vercel.json` as `npm run build:server`
- Output Directory: leave on the Next.js default; do not set it to `out`

Read the [deployment guide](storefront/VERCEL-DEPLOYMENT.md) for backend architecture and plan eligibility. No cloud services are provisioned automatically by this repository. A successful storefront deployment alone does not provide a database or working admin.

## Project documentation

- [Milestones](MILESTONES.md)
- [Build plan](WEBSITE-BUILD-PLAN.md)
- [Verification notes](storefront/QA.md)

Local design-review artifacts are excluded from Git; the images used by the application are included in `storefront/public/`.
