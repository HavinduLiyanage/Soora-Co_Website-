# Soora & Co. frontend prototype

Milestones 1–2: a Next.js App Router / TypeScript storefront with real Manrope font files, approved white/charcoal/gold branding, and structured sample inventory. This is a review build, not a live store.

## Run

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
```

The npm scripts call Node directly to avoid Windows command-shim problems with the ampersand in the workspace path. Dependency versions are pinned in package.json and the lockfile. The frontend currently uses a static export in `out/` for private review hosting; remove export mode and select a compatible Node host when introducing Payload/server functionality.

## Included

- Responsive homepage, catalog, Deals, product details and a basic brand directory.
- Brand/category/price/stock filters, price sorting, model/brand/reference search and URL-preserved state.
- Eight fixture products, including sale, unavailable and multi-variant examples.
- Shared pricing, sale eligibility, variant selection and enquiry formatting in `lib/catalog.ts`.
- Data boundary in `lib/repository.ts` to replace with published CMS queries later.
- Native dialogs for search, mobile filters with Apply/Cancel, and enquiry-message previews; keyboard focus and Escape behavior reviewed in representative journeys.
- Dedicated Men/Women/Unisex and four brand collection pages, a dedicated search page, FAQ, wholesale enquiry composer, draft policy center, About/contact scaffolds and a 404 recovery page.
- No carts, checkout, customer accounts, invented contact numbers or outbound messaging.

## Not yet connected

No backend, admin authentication, live stock, scheduler, analytics or real WhatsApp destination. Messages can be copied but are not sent. Sample stock never changes from an enquiry click. All imagery and model descriptions are illustrative, and the sample IDs are explicitly prefixed DEMO. Original business logo artwork is preserved through CSS positioning.

## Verification

Nine meaningful domain tests cover sale boundaries, invalid discounts, stock eligibility, eligible variant selection, combined filters and selected-variant enquiry content. Browser QA and the build results are recorded in `QA.md`.

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

The current policy center is explicitly a draft checklist, not final legal or store terms. Real inventory, imagery, contact details, approved store copy and policies remain necessary before production. The next development milestone is owner admin and backend, followed by CMS integration. No external upload or publication occurred during milestone 2.
## Vercel direction

Vercel is the selected application hosting target. Run `npm run build:server` for the standard Next.js server build; `vercel.json` uses this command. Keep the Vercel Root Directory at `storefront` and leave Output Directory on the framework default. The ordinary local `npm run build` still exports the static preview unless server mode is selected. See [VERCEL-DEPLOYMENT.md](VERCEL-DEPLOYMENT.md) for architecture, new-account setup, plan restrictions and what remains unimplemented. No live backend or cloud deployment has been created by this configuration change.
