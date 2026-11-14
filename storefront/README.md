# Soora & Co. storefront and owner workspace

Next.js catalog with an authenticated owner dashboard, Neon PostgreSQL and Vercel Blob. Customers enquire through WhatsApp; there is no checkout or payment processing.

## Current status — 14 November 2026

- 38 client watches, with model-matched product photos, have been imported into Neon and the admin media library.
- Vercel production database/auth settings and a dedicated public Blob store are configured. The production catalog uses published database records after redeployment.
- A temporary owner account is provisioned; credentials are stored only in ignored .env.owner. WhatsApp is configured to 94777363079, as requested. Hosted login, draft creation, price/sale editing and image uploads have been verified.
- Stock tracking is optional. Keep “Confirm availability on WhatsApp” enabled to publish a watch or run a sale without entering quantities. Sale prices, badges and Deals membership use the active schedule. Quantities are never displayed on the storefront.
- Existing data remains unchanged when rerunning the starter import. No sample products or fabricated discounts are published.
- Policies/store contact copy, account recovery and backup handover remain launch tasks.

## Run

```sh
npm ci
npm run dev
npm test
npm run build:server
```

The npm scripts call Node directly to avoid Windows command-shim issues with the ampersand in the workspace path. See [BACKEND-SETUP.md](BACKEND-SETUP.md) for provisioning and owner workflows. Never commit local environment files or expose server secrets with NEXT_PUBLIC_.

## Live data import

```sh
node --env-file=.env.local scripts/import-live-catalog.mjs
```

This validates all 38 products and their local images, publishes missing records in one transaction, registers reusable photos and disables sample labels. Existing records are preserved; conflicting references abort the transaction. A non-login migration identity provides audit attribution and has no owner access. The workbook import and image provenance remain in scripts/import-starter.py and lib/product-image-sources.json.

## Verification

17 automated tests pass, including sale scheduling without quantities, price formatting, inventory validation, draft isolation, atomic updates, audit records and archival. The server build passes. See QA.md for prior browser and integration checks. A temporary owner was used to verify hosted login, private draft editing, optional-stock sales and image uploads.

## Historical design assets

The following provenance and milestone notes describe the earlier prototype. Its generated watch images and sample catalog are no longer used by the public collection.

## Asset provenance

`public/images/logo-original.png` is the client-supplied logo reference. The five other files in `public/images/` were created with the built-in image-generation tool for this prototype. Replace them with the client's original product images before production. They are not evidence of real branded models or stock.

### Exact image-generation prompts

#### hero.png

Use case: product-mockup. Asset for a watch retailer website frontend prototype. Landscape 16:9 premium watch campaign photograph, close-up polished stainless steel analog wristwatch with champagne-gold dial on rugged dark charcoal stone. Watch fills right half of composition tilted slightly, luxurious restrained soft side lighting. Left half very dark empty matte charcoal negative space for webpage white heading overlay. Golden hour glints, highly detailed realistic materials, sophisticated minimalist product photography. No text, no logos, no numbers outside dial, no watermarks, no graphics. Brand-neutral watch. Photorealistic.

#### steel.png

Use case: product-mockup. Asset for a watch retailer website frontend prototype. Single stainless steel automatic sport wristwatch with black dial and dark bezel, steel bracelet, face-on slight angle, whole watch visible including bracelet curved behind, isolated on uniform warm light grey background #f6f5f2, soft studio lighting, refined professional product photo, vertically centered, generous space around watch, portrait 4:5. No brand text, no logo, no watermark. Realistic detailed hands and indices.

#### dress.png

Use case: product-mockup. Asset for a watch retailer website frontend prototype. Single elegant gold-tone dress wristwatch, small rectangular ivory dial, polished gold linked bracelet, full watch visible, upright slight angle, isolated uniform warm light grey #f6f5f2 background, soft natural studio lighting, centered editorial product photograph with breathing room. Portrait 4:5. No brand text, no logo, no watermark.

#### digital.png

Use case: product-mockup. Asset for a watch retailer website frontend prototype. Single classic vintage silver stainless steel digital wristwatch, rectangular digital LCD face, fine silver linked bracelet, full watch visible upright slight angle on uniform warm light grey #f6f5f2 background, beautifully realistic product photography, soft studio shadows and detail, centered generous space, portrait 4:5. No brand text, no logo, no watermark.

#### leather.png

Use case: product-mockup. Asset for a watch retailer website frontend prototype. Single refined round analog watch, white dial, narrow silver case, dark brown textured leather strap, whole watch visible upright slight angle with strap curved behind. Isolated uniform warm light grey #f6f5f2 background, soft studio lighting, highly realistic elegant editorial product photograph, centered breathing room portrait 4:5. No brand text, no logo, no watermark.


## Milestone 2 delivery notes

Search matches independent keywords across brand, model, reference, style, movement, strap, category and variant colour. Category and brand routes retain their fixed scope when optional filters are reset. Mobile filter edits remain a draft until Apply; Cancel discards them. The wholesale form prepares a message locally and never submits or stores customer details.

Responsive WebP images are committed under `public/images/optimized/`. Run `npm run images` to regenerate them from the retained source PNGs. Sharp is pinned as a development dependency. Hero images use 640/1280/1920px candidates and product images use 320/640/960px candidates. `WatchImage` supplies responsive sizes and prioritizes the main image; secondary images are lazy-loaded. The original logo is unchanged.

The current policy center is explicitly a draft checklist, not final legal or store terms. Real inventory, imagery, contact details, approved store copy and policies remain necessary before production. The owner admin and published-data integration are now implemented; hosted service setup and client content are the next steps. No external upload or publication occurred during milestone 2.
## Vercel direction

Vercel is the selected application hosting target. Run `npm run build:server` for the standard Next.js server build; `vercel.json` uses this command. Keep the Vercel Root Directory at `storefront` and leave Output Directory on the framework default. Both build commands use the server runtime. See [VERCEL-DEPLOYMENT.md](VERCEL-DEPLOYMENT.md) for architecture, new-account setup, plan restrictions and what remains unimplemented. The Vercel storefront preview is deployed. The new hosted backend still requires credentials and migrations.
