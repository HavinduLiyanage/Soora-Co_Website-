import { auth } from "@/lib/server/auth";
import { adminConfigured } from "@/lib/server/db";
import { failure, json } from "@/lib/server/http";
export const runtime = "nodejs";
async function handle(request: Request) {
  if (!adminConfigured())
    return json({ error: "Owner login is not configured yet." }, 503);
  try {
    // Next canonicalises to trailing slashes; Better Auth's endpoint router uses slashless paths.
    const url = new URL(request.url);
    url.pathname = url.pathname.replace(/\/+$/, "");
    return await auth().handler(new Request(url, request));
  } catch (error) {
    return failure(error);
  }
}
export { handle as GET, handle as POST };
