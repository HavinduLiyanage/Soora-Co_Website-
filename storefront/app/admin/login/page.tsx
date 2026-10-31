import { redirect } from "next/navigation";
import { adminConfigured } from "@/lib/server/db";
import { currentOwner } from "@/lib/server/auth";
import Login from "@/components/admin/login";
export default async function LoginPage() {
  if (!adminConfigured()) redirect("/admin/");
  if (await currentOwner()) redirect("/admin/");
  return <Login />;
}
