import { put, del } from "@vercel/blob";
import sharp from "sharp";
import { db } from "@/lib/server/db";
import { requireOwner, failure, json, HttpError } from "@/lib/server/http";
export const runtime = "nodejs";
export async function GET() {
  try {
    await requireOwner();
    return json(
      (
        await db().query(
          "select id,url,name,bytes from store_media order by created_at desc limit 100",
        )
      ).rows,
    );
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request) {
  try {
    const owner = await requireOwner(request);
    if (!process.env.BLOB_READ_WRITE_TOKEN)
      throw new HttpError(503, "Connect Vercel Blob to enable image uploads.");
    if (Number(request.headers.get("content-length") || 0) > 3_500_000)
      throw new HttpError(413, "Use an image smaller than 3 MB.");
    const data = await request.formData();
    const file = data.get("file");
    if (
      !(file instanceof File) ||
      file.size > 3_000_000 ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    )
      throw new HttpError(
        400,
        "Choose a JPEG, PNG or WebP image smaller than 3 MB.",
      );
    let buffer: Buffer;
    try {
      buffer = await sharp(Buffer.from(await file.arrayBuffer()), {
        limitInputPixels: 24_000_000,
      })
        .rotate()
        .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
    } catch {
      throw new HttpError(
        400,
        "This image could not be read. Try a different JPEG, PNG or WebP file.",
      );
    }
    const blob = await put(`soora/${crypto.randomUUID()}.webp`, buffer, {
      access: "public",
      contentType: "image/webp",
      addRandomSuffix: true,
    });
    try {
      const { rows } = await db().query(
        "insert into store_media(url,name,bytes,created_by) values($1,$2,$3,$4) returning id,url,name,bytes",
        [blob.url, file.name.slice(0, 180), buffer.length, owner.id],
      );
      return json(rows[0]);
    } catch (error) {
      await del(blob.url).catch(() => {});
      throw error;
    }
  } catch (e) {
    return failure(e);
  }
}
