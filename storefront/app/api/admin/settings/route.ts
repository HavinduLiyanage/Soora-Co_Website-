import { z } from "zod";
import { db } from "@/lib/server/db";
import { requireOwner, failure, json, HttpError } from "@/lib/server/http";
import { settingsSchema } from "@/lib/admin/schema";
export async function GET() {
  try {
    await requireOwner();
    const { rows } = await db().query(
      "select data,version from store_settings where id=1",
    );
    return json(rows[0]);
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request) {
  try {
    const owner = await requireOwner(request);
    const parsed = z
      .object({
        data: settingsSchema,
        expectedVersion: z.number().int().positive(),
      })
      .strict()
      .safeParse(await request.json());
    if (!parsed.success)
      throw new HttpError(400, parsed.error.issues[0].message);
    const { rows } = await db().query(
      "update store_settings set data=$1,version=version+1,updated_at=now(),updated_by=$2 where id=1 and version=$3 returning data,version",
      [JSON.stringify(parsed.data.data), owner.id, parsed.data.expectedVersion],
    );
    if (!rows.length)
      throw new HttpError(
        409,
        "Settings were changed in another session. Reload before saving.",
      );
    return json(rows[0]);
  } catch (e) {
    return failure(e);
  }
}
