// Deliberately restricted to the isolated local QA database and app, never Neon.
import assert from "node:assert/strict";
import { Pool } from "pg";
const origin = "http://127.0.0.1:3001";
if (
  process.env.DATABASE_URL !==
  "postgresql://soora_test@127.0.0.1:55437/postgres"
)
  throw new Error("Only the isolated local test database is allowed.");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
let cookie = "";
let passed = 0;
async function request(path, body, options = {}) {
  return fetch(origin + (path.endsWith("/") ? path : path + "/"), {
    method: body === undefined ? "GET" : "POST",
    headers: {
      ...(body === undefined
        ? {}
        : { "Content-Type": "application/json", Origin: origin }),
      ...(cookie ? { Cookie: cookie } : {}),
      ...options,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: "manual",
  });
}
function check(actual, expected, label) {
  assert.equal(actual, expected, label);
  passed++;
  console.log("PASS " + label);
}
const product = {
  id: "QA-INTEGRATION",
  slug: "qa-integration-watch",
  brand: "QA Brand",
  name: "QA Integration Watch",
  gender: "Unisex",
  style: "Dress",
  movement: "Quartz",
  strap: "Steel",
  description: "Temporary automated QA inventory.",
  featured: true,
  variants: [
    {
      id: "qa-v1",
      colour: "Black",
      swatch: "#222222",
      image: "/images/steel.png",
      priceMinor: 100000,
      stock: 2,
    },
  ],
};
let record;
try {
  await pool.query(
    "delete from store_products where data->>'id'='QA-INTEGRATION'",
  );
  await pool.query(
    "delete from store_banners where data->>'title'='QA campaign'",
  );
  check(
    (await request("/api/admin/products/")).status,
    401,
    "anonymous inventory read denied",
  );
  check(
    (
      await request("/api/admin/products/", {
        action: "publish",
        data: product,
      })
    ).status,
    401,
    "anonymous inventory write denied",
  );
  check(
    (await request("/api/admin/export/")).status,
    401,
    "anonymous export denied",
  );
  check(
    (await request("/api/admin/media/")).status,
    401,
    "anonymous media access denied",
  );
  const signup = await request("/api/auth/sign-up/email", {
    name: "Unknown",
    email: "unknown@soora.test",
    password: "unused-test-password-123",
  });
  check(signup.status, 400, "public signup disabled");
  const login = await request("/api/auth/sign-in/email", {
    email: process.env.SOORA_OWNER_EMAIL,
    password: process.env.SOORA_OWNER_PASSWORD,
    rememberMe: false,
  });
  check(login.status, 200, "owner login succeeds");
  cookie = login.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
  assert(cookie);
  check(
    (await request("/api/admin/products/")).status,
    200,
    "owner inventory read allowed",
  );
  check(
    (
      await request(
        "/api/admin/products/",
        { action: "publish", data: product },
        { Origin: "https://untrusted.example" },
      )
    ).status,
    403,
    "cross-origin write denied",
  );
  check(
    (
      await request("/api/admin/products/", {
        action: "publish",
        data: { ...product, variants: [] },
      })
    ).status,
    400,
    "invalid inventory rejected",
  );
  let response = await request("/api/admin/products/", {
    action: "save",
    data: product,
  });
  check(response.status, 200, "save draft succeeds");
  record = await response.json();
  check(
    (await request("/api/catalog/qa-integration-watch/")).status,
    404,
    "draft not visible publicly",
  );
  response = await request("/api/admin/products/", {
    recordId: record.id,
    expectedVersion: record.version,
    action: "publish",
    data: product,
  });
  check(response.status, 200, "publish succeeds");
  record = await response.json();
  check(
    (await request("/api/catalog/qa-integration-watch/")).status,
    200,
    "published watch visible publicly",
  );
  const changed = {
    ...product,
    variants: [
      {
        ...product.variants[0],
        priceMinor: 150000,
        sale: {
          priceMinor: 90000,
          startsAt: "2026-01-01T00:00:00Z",
          endsAt: "2030-01-01T00:00:00Z",
        },
      },
    ],
  };
  const staleVersion = record.version;
  response = await request("/api/admin/products/", {
    recordId: record.id,
    expectedVersion: record.version,
    action: "save",
    data: changed,
  });
  check(response.status, 200, "published watch accepts draft edit");
  record = await response.json();
  check(
    (await (await request("/api/catalog/qa-integration-watch/")).json()).product
      .variants[0].priceMinor,
    100000,
    "draft price cannot leak",
  );
  check(
    (
      await request("/api/admin/products/", {
        recordId: record.id,
        expectedVersion: staleVersion,
        action: "publish",
        data: changed,
      })
    ).status,
    409,
    "stale editor cannot overwrite",
  );
  response = await request("/api/admin/products/", {
    recordId: record.id,
    expectedVersion: record.version,
    action: "publish",
    data: changed,
  });
  check(response.status, 200, "price and sale publish together");
  record = await response.json();
  check(
    (await (await request("/api/catalog/qa-integration-watch/")).json()).product
      .variants[0].sale.priceMinor,
    90000,
    "fresh enquiry endpoint sees sale",
  );
  assert(
    (await (await request("/deals/")).text()).includes("QA Integration Watch"),
  );
  passed++;
  console.log("PASS deals page uses published data");
  const campaign = {
    title: "QA campaign",
    eyebrow: "QA",
    heading: "QA scheduled banner",
    description: "Temporary test banner",
    image: "/images/hero.png",
    alt: "Test image",
    link: "/deals/",
    label: "Explore",
    placement: "home",
    enabled: true,
    priority: 100,
    startsAt: null,
    endsAt: null,
  };
  check(
    (
      await request("/api/admin/banners/", {
        action: "publish",
        data: campaign,
      })
    ).status,
    200,
    "banner publish succeeds",
  );
  assert((await (await request("/")).text()).includes("QA scheduled banner"));
  passed++;
  console.log("PASS homepage reads published banner");
  const settings = await (await request("/api/admin/settings/")).json();
  check(
    (
      await request("/api/admin/settings/", {
        data: { ...settings.data, announcement: "QA announcement" },
        expectedVersion: settings.version,
      })
    ).status,
    200,
    "settings save succeeds",
  );
  check(
    (
      await request("/api/admin/settings/", {
        data: settings.data,
        expectedVersion: settings.version,
      })
    ).status,
    409,
    "stale settings update denied",
  );
  const exportResponse = await request("/api/admin/export/");
  check(exportResponse.status, 200, "owner export works");
  const exported = await exportResponse.json();
  assert(!("users" in exported) && !("sessions" in exported));
  await pool.query("update store_owners set enabled=false");
  check(
    (await request("/api/admin/products/")).status,
    401,
    "revoked owner denied even with valid session",
  );
  await pool.query("update store_owners set enabled=true");
  response = await request("/api/admin/products/", {
    recordId: record.id,
    expectedVersion: record.version,
    action: "archive",
    data: changed,
  });
  check(response.status, 200, "archive succeeds");
  check(
    (await request("/api/catalog/qa-integration-watch/")).status,
    404,
    "archive removes public access",
  );
  check(
    (await request("/api/auth/sign-out", {})).status,
    200,
    "logout succeeds",
  );
  check(
    (await request("/api/admin/products/")).status,
    401,
    "logged-out session cannot be reused",
  );
  cookie = "";
  let limited = false;
  for (let i = 0; i < 6; i++) {
    const r = await request("/api/auth/sign-in/email", {
      email: process.env.SOORA_OWNER_EMAIL,
      password: "intentionally-incorrect-test-password",
    });
    if (r.status === 429) {
      limited = true;
      break;
    }
  }
  check(limited, true, "repeated login attempts are rate limited");
  console.log(`${passed} backend integration assertions passed.`);
} finally {
  await pool.query("update store_owners set enabled=true");
  await pool.end();
}
