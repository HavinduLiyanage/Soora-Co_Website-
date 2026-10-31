import {
  productSchema,
  bannerSchema,
  saveSchema,
  type ContentRecord,
} from "./schema.ts";
import type { Product } from "../catalog.ts";
import type { Banner } from "../admin/schema";

export class ContentError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
export type Query = (
  sql: string,
  values?: unknown[],
) => Promise<{ rows: Record<string, unknown>[] }>;
export type Collection = "products" | "banners";
const tables = {
  products: "store_products",
  banners: "store_banners",
} as const;
export async function contentList(query: Query, collection: Collection) {
  const { rows } = await query(
    `select id,data,published_data,status,version,updated_at from ${tables[collection]} order by updated_at desc`,
  );
  return rows as ContentRecord<Product | Banner>[];
}
export async function saveContent(
  query: Query,
  collection: Collection,
  input: unknown,
  actor: string,
) {
  const command = saveSchema.safeParse(input);
  if (!command.success)
    throw new ContentError(400, command.error.issues[0].message);
  const { recordId, expectedVersion, action } = command.data;
  const parsed = (
    collection === "products" ? productSchema : bannerSchema
  ).safeParse(command.data.data);
  if (!parsed.success)
    throw new ContentError(
      400,
      parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join(" · "),
    );
  const payload = JSON.stringify(parsed.data);
  const status =
    action === "publish"
      ? "published"
      : action === "archive"
        ? "archived"
        : "draft";
  const table = tables[collection];
  if (!recordId) {
    if (action !== "save" && action !== "publish")
      throw new ContentError(
        400,
        "Save the record before archiving or unpublishing it.",
      );
    const { rows } = await query(
      `insert into ${table}(data,published_data,status,updated_by) values($1,$2,$3,$4) returning id,data,published_data,status,version,updated_at`,
      [payload, action === "publish" ? payload : null, status, actor],
    );
    return rows[0];
  }
  // The version comparison and update are one atomic statement. Audit trigger participates in the same transaction.
  const { rows } = await query(
    `update ${table} set data=$1,
    published_data=case when $2='publish' then $1::jsonb when $2 in ('unpublish','archive') then null else published_data end,
    status=case when $2='save' then status else $3 end, version=version+1,updated_at=now(),updated_by=$4
    where id=$5 and version=$6 ${collection === "products" ? "and data->>'slug'=$1::jsonb->>'slug'" : ""}
    returning id,data,published_data,status,version,updated_at`,
    [payload, action, status, actor, recordId, expectedVersion],
  );
  if (!rows.length)
    throw new ContentError(
      409,
      "This record changed in another session, or its URL was changed. Reload the record before saving. Your draft remains in this form.",
    );
  return rows[0];
}
