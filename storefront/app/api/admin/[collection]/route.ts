import { requireOwner, json, failure, HttpError } from "@/lib/server/http";
import {
  contentList,
  saveContent,
  type Collection,
} from "@/lib/server/content";
export const runtime = "nodejs";
function collection(value: string): Collection {
  if (value !== "products" && value !== "banners")
    throw new HttpError(404, "Collection not found.");
  return value;
}
export async function GET(
  request: Request,
  context: { params: Promise<{ collection: string }> },
) {
  try {
    await requireOwner();
    return json(
      await contentList(collection((await context.params).collection)),
    );
  } catch (error) {
    return failure(error);
  }
}
export async function POST(
  request: Request,
  context: { params: Promise<{ collection: string }> },
) {
  try {
    const owner = await requireOwner(request);
    if (Number(request.headers.get("content-length") || 0) > 150_000)
      throw new HttpError(413, "This record is too large.");
    const body = await request.text();
    if (body.length > 150_000)
      throw new HttpError(413, "This record is too large.");
    let value: unknown;
    try {
      value = JSON.parse(body);
    } catch {
      throw new HttpError(400, "Invalid request.");
    }
    return json(
      await saveContent(
        collection((await context.params).collection),
        value,
        owner.id,
      ),
    );
  } catch (error) {
    return failure(error);
  }
}
