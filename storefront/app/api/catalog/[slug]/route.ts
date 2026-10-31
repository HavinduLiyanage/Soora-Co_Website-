import { getProduct, getSettings } from "@/lib/repository";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const product = await getProduct((await params).slug);
    if (!product)
      return Response.json(
        { error: "This watch is no longer available on the website." },
        { status: 404 },
      );
    return Response.json(
      { product, whatsapp: (await getSettings()).whatsapp },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "We could not confirm the current price. Please try again." },
      { status: 503 },
    );
  }
}
