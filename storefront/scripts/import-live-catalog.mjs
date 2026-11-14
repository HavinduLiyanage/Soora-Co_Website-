import { readFile, stat } from "node:fs/promises";
import { Pool } from "pg";
import { productSchema } from "../lib/admin/schema.ts";

// One-time, repeatable migration. Never overwrite edits made in the dashboard.
const products = JSON.parse(await readFile(new URL("../lib/inventory.json", import.meta.url), "utf8"))
  .map(product => productSchema.parse(product));
if (products.length !== 38 || new Set(products.map(p => p.id)).size !== 38 || new Set(products.map(p => p.slug)).size !== 38)
  throw new Error("Expected the 38 unique watches in the approved starter catalog.");
const images = [];
for (const product of products) for (const variant of product.variants) {
  if (!variant.image.startsWith("/images/products/")) throw new Error("Expected a bundled product photo.");
  images.push({ url: variant.image, name: product.id, bytes: (await stat(new URL("../public" + variant.image, import.meta.url))).size });
}
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 15000 });
const client = await pool.connect();
try {
  await client.query("begin");
  await client.query("select pg_advisory_xact_lock(7286401)");
  // Audit identity only: no password, authentication account, session, or owner privileges.
  const actor = "soora-starter-import-v1";
  await client.query(`insert into auth_user(id,name,email,"emailVerified")
    values($1,'Starter inventory import','starter-import@soora.invalid',false) on conflict(id) do nothing`, [actor]);
  let inserted = 0, skipped = 0;
  for (const product of products) {
    const existing = await client.query("select data->>'id' as reference,data->>'slug' as slug from store_products where data->>'id'=$1 or data->>'slug'=$2", [product.id, product.slug]);
    if (existing.rows.length) {
      if (existing.rows.length !== 1 || existing.rows[0].reference !== product.id || existing.rows[0].slug !== product.slug)
        throw new Error(`Conflicting product reference or URL: ${product.id}`);
      skipped++;
      continue;
    }
    await client.query("insert into store_products(data,published_data,status,updated_by) values($1,$1,'published',$2)", [JSON.stringify(product), actor]);
    inserted++;
  }
  for (const image of images) await client.query(
    "insert into store_media(url,name,bytes,created_by) values($1,$2,$3,$4) on conflict(url) do nothing",
    [image.url, image.name, image.bytes, actor],
  );
  await client.query(`update store_settings set data=jsonb_set(data,'{previewMode}','false'),
    version=version+1,updated_at=now(),updated_by=$1 where id=1 and data->>'previewMode' is distinct from 'false'`, [actor]);
  await client.query("commit");
  console.log(`Live catalog imported: ${inserted} published, ${skipped} existing records preserved. ${images.length} photos available in the media library.`);
} catch (error) {
  await client.query("rollback");
  console.error("Import rolled back:", error.code || error.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
