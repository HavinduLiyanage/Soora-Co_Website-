import "server-only";
import { ContentError } from "../admin/content-store";
import { currentOwner } from "./auth";
import { adminConfigured } from "./db";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const configured = process.env.BETTER_AUTH_URL;
  if (!origin || !configured || origin !== new URL(configured).origin)
    throw new HttpError(
      403,
      "This request did not come from the admin website.",
    );
}
export async function requireOwner(request?: Request) {
  if (!adminConfigured())
    throw new HttpError(
      503,
      "Admin setup is incomplete. Connect the database and authentication first.",
    );
  if (request && !["GET", "HEAD"].includes(request.method)) sameOrigin(request);
  const owner = await currentOwner();
  if (!owner)
    throw new HttpError(
      401,
      "Please sign in with an authorised owner account.",
    );
  return owner;
}
export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
export function failure(error: unknown) {
  if (error instanceof HttpError || error instanceof ContentError)
    return json({ error: error.message }, error.status);
  // Never return driver messages (which can contain connection details) to the browser.
  if (
    typeof error === "object" &&
    error &&
    "code" in error &&
    error.code === "23505"
  )
    return json(
      { error: "That reference or URL already exists. Choose a unique value." },
      409,
    );
  console.error(
    "Admin request failed",
    error instanceof Error ? error.name : "UnknownError",
  );
  return json(
    {
      error:
        "We could not complete that request. Your changes have not been confirmed. Please try again.",
    },
    500,
  );
}
