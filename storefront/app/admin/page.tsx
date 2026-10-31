import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  Database,
  ShieldCheck,
  Image as ImageIcon,
} from "lucide-react";
import { adminConfigured, db } from "@/lib/server/db";
import { currentOwner } from "@/lib/server/auth";
import { contentList } from "@/lib/server/content";
import Dashboard from "@/components/admin/dashboard";
import type { ContentRecord, Banner } from "@/lib/admin/schema";
import type { Product } from "@/lib/catalog";
export default async function AdminPage() {
  if (!adminConfigured())
    return (
      <main className="admin-setup">
        <span className="admin-wordmark">
          SOORA <span>& CO.</span>
        </span>
        <span className="eyebrow">THE OWNER WORKSPACE</span>
        <h1>
          A little behind
          <br />
          the scenes.
        </h1>
        <p>
          Your collection, prices and campaigns. One place to keep the store up
          to date.
        </p>
        <div className="setup-status">
          Connection needed{" "}
          <span>The storefront preview is still available.</span>
        </div>
        <div className="setup-steps">
          <div>
            <Database />
            <h2>01 · Connect Neon</h2>
            <p>
              Persistent inventory and content, with automatic wake-up after
              inactivity.
            </p>
          </div>
          <div>
            <ShieldCheck />
            <h2>02 · Create the owner</h2>
            <p>Private login. Public registration is disabled.</p>
          </div>
          <div>
            <ImageIcon />
            <h2>03 · Connect images</h2>
            <p>Vercel Blob stores product photography and campaign artwork.</p>
          </div>
        </div>
        <Link className="admin-primary" href="/admin/preview/">
          Explore the dashboard preview <ArrowUpRight size={18} />
        </Link>
        <Link className="admin-text-link" href="/">
          Back to the storefront
        </Link>
        <p className="admin-note">
          Preview screens use sample records. Saving and uploading become
          available after setup.
        </p>
      </main>
    );
  const owner = await currentOwner();
  if (!owner) redirect("/admin/login/");
  const [products, banners, settings] = await Promise.all([
    contentList("products"),
    contentList("banners"),
    db().query("select data,version from store_settings where id=1"),
  ]);
  return (
    <Dashboard
      owner={owner.name}
      initialProducts={products as ContentRecord<Product>[]}
      initialBanners={banners as ContentRecord<Banner>[]}
      initialSettings={settings.rows[0]}
      live={process.env.CATALOG_SOURCE === "database"}
    />
  );
}
