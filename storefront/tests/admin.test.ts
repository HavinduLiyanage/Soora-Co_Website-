import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  productSchema,
  bannerSchema,
  imageSchema,
  linkSchema,
  colomboInput,
  colomboInstant,
  activeBanner,
  type Banner,
} from "../lib/admin/schema.ts";
import {
  saveContent,
  ContentError,
  type Query,
} from "../lib/admin/content-store.ts";
import { priceOf, isDeal, type Product } from "../lib/catalog.ts";

const product: Product = {
  id: "TEST-001",
  slug: "test-watch",
  brand: "Test brand",
  name: "Test watch",
  gender: "Unisex",
  style: "Dress",
  movement: "Quartz",
  strap: "Steel",
  description: "A watch used only by automated tests.",
  featured: false,
  variants: [
    {
      id: "v1",
      colour: "Black",
      swatch: "#222222",
      image: "/images/steel.png",
      priceMinor: 100000,
      stock: 2,
    },
  ],
};
const banner: Banner = {
  title: "Campaign",
  eyebrow: "COLLECTION",
  heading: "A new collection",
  description: "Explore.",
  image: "/images/hero.png",
  alt: "Watch",
  link: "/deals/",
  label: "Explore",
  placement: "home",
  enabled: true,
  priority: 10,
  startsAt: "2026-10-31T00:00:00Z",
  endsAt: "2026-11-01T00:00:00Z",
};
test("invalid inventory, price, dates and duplicate variants cannot be saved", () => {
  assert.equal(productSchema.safeParse(product).success, true);
  for (const change of [
    { stock: -1 },
    { stock: 1.5 },
    { priceMinor: NaN },
    { priceMinor: -1 },
    {
      sale: {
        priceMinor: 100000,
        startsAt: "2026-10-31T00:00:00Z",
        endsAt: "2026-11-01T00:00:00Z",
      },
    },
    {
      sale: {
        priceMinor: 500,
        startsAt: "2026-11-01T00:00:00Z",
        endsAt: "2026-10-31T00:00:00Z",
      },
    },
  ])
    assert.equal(
      productSchema.safeParse({
        ...product,
        variants: [{ ...product.variants[0], ...change }],
      }).success,
      false,
    );
  assert.equal(
    productSchema.safeParse({
      ...product,
      variants: [product.variants[0], product.variants[0]],
    }).success,
    false,
  );
  assert.equal(
    productSchema.safeParse({ ...product, slug: "men" }).success,
    false,
  );
  assert.equal(
    productSchema.safeParse({ ...product, internalCost: 100 }).success,
    false,
  );
});
test("images and banner links reject executable URLs and external redirects", () => {
  for (const url of [
    "javascript:alert(1)",
    "//evil.example",
    "/\\evil.example",
    "https://evil.example",
    "/deals/?redirect=evil",
    "/images/../../secret",
  ])
    assert.equal(linkSchema.safeParse(url).success, false);
  assert.equal(linkSchema.safeParse("/watches/test-watch/").success, true);
  assert.equal(
    imageSchema.safeParse("data:image/svg+xml,<svg/>").success,
    false,
  );
  assert.equal(
    imageSchema.safeParse("https://evil.example/image.png").success,
    false,
  );
  assert.equal(
    imageSchema.safeParse(
      "https://store.public.blob.vercel-storage.com/image.webp",
    ).success,
    true,
  );
});
test("banner priority, disabled campaigns and schedule boundaries have a deterministic fallback", () => {
  assert.equal(
    activeBanner([banner], "home", new Date(banner.startsAt!))?.title,
    "Campaign",
  );
  assert.equal(
    activeBanner([banner], "home", new Date(banner.endsAt!)),
    undefined,
  );
  assert.equal(
    activeBanner(
      [{ ...banner, enabled: false }],
      "home",
      new Date("2026-10-31T12:00:00Z"),
    ),
    undefined,
  );
  assert.equal(
    activeBanner(
      [banner, { ...banner, title: "Priority", priority: 20 }],
      "home",
      new Date("2026-10-31T12:00:00Z"),
    )?.title,
    "Priority",
  );
  assert.equal(
    bannerSchema.safeParse({ ...banner, endsAt: banner.startsAt }).success,
    false,
  );
  assert.equal(colomboInstant("2026-10-31T05:30"), "2026-10-31T00:00:00.000Z");
  assert.equal(colomboInput("2026-10-31T00:00:00.000Z"), "2026-10-31T05:30");
});
test("PostgreSQL publication, atomic revisions, audit and archival work end to end", async () => {
  const database = new PGlite();
  try {
    await database.exec(
      "create table auth_user(id text primary key); insert into auth_user values ('owner-test');",
    );
    const migration = await readFile(
      new URL("../db/001-store.sql", import.meta.url),
      "utf8",
    );
    await database.exec(migration);
    await database.exec(migration); // schema setup is repeatable
    const query: Query = async (sql, values) => database.query(sql, values);
    const draft = await saveContent(
      query,
      "products",
      { action: "save", data: product },
      "owner-test",
    );
    assert.equal(draft.status, "draft");
    assert.equal(draft.published_data, null);
    const visible = () =>
      database.query(
        "select published_data from store_products where status='published'",
      );
    assert.equal((await visible()).rows.length, 0);
    const live = await saveContent(
      query,
      "products",
      {
        recordId: draft.id,
        expectedVersion: 1,
        action: "publish",
        data: product,
      },
      "owner-test",
    );
    assert.equal(live.version, 2);
    assert.equal((await visible()).rows.length, 1);
    const edited = {
      ...product,
      variants: [{ ...product.variants[0], priceMinor: 150000 }],
    };
    const saved = await saveContent(
      query,
      "products",
      { recordId: draft.id, expectedVersion: 2, action: "save", data: edited },
      "owner-test",
    );
    assert.equal(
      (saved.published_data as Product).variants[0].priceMinor,
      100000,
    );
    assert.equal((saved.data as Product).variants[0].priceMinor, 150000);
    await assert.rejects(
      () =>
        saveContent(
          query,
          "products",
          {
            recordId: draft.id,
            expectedVersion: 2,
            action: "publish",
            data: product,
          },
          "owner-test",
        ),
      (e) => e instanceof ContentError && e.status === 409,
    );
    const promoted = await saveContent(
      query,
      "products",
      {
        recordId: draft.id,
        expectedVersion: 3,
        action: "publish",
        data: edited,
      },
      "owner-test",
    );
    assert.equal(
      (promoted.published_data as Product).variants[0].priceMinor,
      150000,
    );
    await assert.rejects(
      () =>
        saveContent(
          query,
          "products",
          {
            recordId: draft.id,
            expectedVersion: 4,
            action: "publish",
            data: { ...edited, slug: "changed-url" },
          },
          "owner-test",
        ),
      (e) => e instanceof ContentError && e.status === 409,
    );
    await saveContent(
      query,
      "products",
      {
        recordId: draft.id,
        expectedVersion: 4,
        action: "unpublish",
        data: edited,
      },
      "owner-test",
    );
    assert.equal((await visible()).rows.length, 0);
    const archived = await saveContent(
      query,
      "products",
      {
        recordId: draft.id,
        expectedVersion: 5,
        action: "archive",
        data: edited,
      },
      "owner-test",
    );
    assert.equal(archived.status, "archived");
    assert.equal(archived.published_data, null);
    const audit = await database.query<{ count: number }>(
      "select count(*)::int as count from store_audit",
    );
    assert.equal(audit.rows[0].count, 6);
    const b = await saveContent(
      query,
      "banners",
      { action: "publish", data: banner },
      "owner-test",
    );
    assert.equal(b.status, "published");
    const b2 = await saveContent(
      query,
      "banners",
      { action: "save", data: { ...banner, title: "Other campaign" } },
      "owner-test",
    );
    assert.equal(b2.status, "draft");
    await assert.rejects(() =>
      saveContent(
        query,
        "products",
        { action: "save", data: product },
        "owner-test",
      ),
    ); // unique slug/reference
  } finally {
    await database.close();
  }
});
test("sale end and sold-out rules stay consistent with the public catalog", () => {
  const v = {
    ...product.variants[0],
    sale: {
      priceMinor: 80000,
      startsAt: "2026-10-31T00:00:00Z",
      endsAt: "2026-11-01T00:00:00Z",
    },
  };
  assert.equal(priceOf(v, new Date(v.sale.startsAt)).current, 80000);
  assert.equal(priceOf(v, new Date(v.sale.endsAt)).current, 100000);
  assert.equal(
    isDeal(
      { ...product, variants: [{ ...v, stock: 0 }] },
      new Date(v.sale.startsAt),
    ),
    false,
  );
});
