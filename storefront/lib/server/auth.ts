import "server-only";
import { betterAuth } from "better-auth";
import { headers } from "next/headers";
import { authOptions } from "./auth-options";
import { adminConfigured, db } from "./db";

const makeAuth = () => betterAuth(authOptions(db()));
let instance: ReturnType<typeof makeAuth> | undefined;
export function auth() {
  if (!adminConfigured()) throw new Error("Admin setup is incomplete.");
  return (instance ??= makeAuth());
}
export async function currentOwner() {
  if (!adminConfigured()) return null;
  const session = await auth().api.getSession({ headers: await headers() });
  if (!session) return null;
  const { rows } = await db().query(
    "select user_id from store_owners where user_id = $1 and enabled = true",
    [session.user.id],
  );
  return rows.length ? session.user : null;
}
