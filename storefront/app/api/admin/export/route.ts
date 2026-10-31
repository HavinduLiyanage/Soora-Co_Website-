import { db } from "@/lib/server/db";
import { requireOwner, failure } from "@/lib/server/http";
export async function GET() {
  try {
    await requireOwner();
    const result = await db().query(
      `select jsonb_build_object('products',(select coalesce(jsonb_agg(t),'[]') from store_products t),'banners',(select coalesce(jsonb_agg(t),'[]') from store_banners t),'settings',(select coalesce(jsonb_agg(t),'[]') from store_settings t),'media',(select coalesce(jsonb_agg(t),'[]') from store_media t)) as data`,
    );
    return new Response(
      JSON.stringify(
        { exportedAt: new Date().toISOString(), ...result.rows[0].data },
        null,
        2,
      ),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "private, no-store",
          "Content-Disposition":
            'attachment; filename="soora-content-export.json"',
        },
      },
    );
  } catch (e) {
    return failure(e);
  }
}
