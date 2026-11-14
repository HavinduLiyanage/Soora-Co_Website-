# Client starter catalog

Imported 38 rows from `Watch Inventory!A5:K42` in the client-supplied `soora_inventory_starter.xlsx` on 14 November 2026.

- Public prices use column I, Your Selling Price (LKR), converted to integer minor units.
- Quantities use column G (all zero). Per the user's instruction, quantities are private. Availability is unconfirmed; customers are asked to check with the store.
- No competitor comparison prices, sale campaigns, costs, or stock valuations were published.
- No photos were supplied. Missing photos are explicitly labelled, without substitute watch imagery.
- Only specifications explicitly present in the product name are mapped. Unknown categories are Unspecified, not Unisex.
- The workbook describes its source as publicly indexed third-party listings. The user supplied it as the store's initial catalog; stock and missing details still need client confirmation.

`lib/inventory.json` is the website's supplied-catalog snapshot while hosted database configuration is incomplete. Database mode remains explicit (`CATALOG_SOURCE=database`) and never silently falls back on errors. The read-only admin preview uses the same snapshot. Import these records into the authenticated database workflow before switching modes; the snapshot is not an admin-managed database.

The extraction script reads the workbook without modifying it. Run it with a Python environment containing openpyxl. It never exports cost or competitor fields.

## Product photography

All 38 products now have local WebP photographs matched to the exact model reference in the source product-page title. `lib/product-image-sources.json` records the page and original image for every model. Sources: Ranasinghe Watch Works (the workbook source) and Casio for F-91WM-3A. Images were visually reviewed; a watermarked retailer image was replaced with the manufacturer image. These are third-party product photos, not photographs of the client’s physical stock. Source attribution does not establish a reuse licence; the client should confirm permission for commercial reuse. The import script preserves the sourced images on subsequent workbook imports.
