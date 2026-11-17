"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Watch,
  Tag,
  PanelsTopLeft,
  Settings,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Search,
  LogOut,
  X,
  ChevronRight,
  PackageCheck,
  Download,
  Check,
  Trash2,
} from "lucide-react";
import {
  displayVariant,
  isInStock,
  stockStatus,
  isDeal,
  money,
  priceOf,
  type Product,
  type Variant,
} from "@/lib/catalog";
import {
  colomboInput,
  colomboInstant,
  productSchema,
  bannerSchema,
  settingsSchema,
  type Banner,
  type StoreSettings,
  type ContentRecord,
} from "@/lib/admin/schema";
import { StockChip } from "../stock-chip";
import ImageField from "./image-field";
import { WatchImage } from "../watch-image";

type Tab = "overview" | "inventory" | "sales" | "banners" | "settings";
type Props = {
  demo?: boolean;
  owner: string;
  initialProducts: ContentRecord<Product>[];
  initialBanners: ContentRecord<Banner>[];
  initialSettings: { data: StoreSettings; version: number };
  live: boolean;
};
const navigation = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "inventory", label: "Inventory", icon: Watch },
  { id: "sales", label: "Sales & offers", icon: Tag },
  { id: "banners", label: "Banners", icon: PanelsTopLeft },
  { id: "settings", label: "Store settings", icon: Settings },
] as const;
function newVariant(): Variant {
  return {
    id: crypto.randomUUID(),
    colour: "",
    swatch: "#242120",
    image: "",
    priceMinor: 0,
    stock: 0,
    availability: "out_of_stock",
  };
}
function newProduct(): Product {
  return {
    id: "",
    slug: "",
    brand: "",
    name: "",
    gender: "Unspecified",
    style: "",
    movement: "",
    strap: "",
    description: "",
    featured: false,
    variants: [newVariant()],
  };
}
function newBanner(): Banner {
  return {
    title: "New campaign",
    eyebrow: "THE SOORA & CO. EDIT",
    heading: "Something worth a closer look.",
    description: "Explore the collection.",
    image: "",
    alt: "Watch collection",
    link: "/watches/",
    label: "Explore watches",
    placement: "home",
    enabled: true,
    priority: 10,
    startsAt: null,
    endsAt: null,
  };
}
type ProductEdit = { record?: ContentRecord<Product>; data: Product };
type BannerEdit = { record?: ContentRecord<Banner>; data: Banner };
export default function Dashboard({
  demo = false,
  owner,
  initialProducts,
  initialBanners,
  initialSettings,
  live,
}: Props) {
  const [tab, setTab] = useState<Tab>("overview"),
    [products, setProducts] = useState(initialProducts),
    [banners, setBanners] = useState(initialBanners),
    [settings, setSettings] = useState(initialSettings);
  const [query, setQuery] = useState(""),
    [status, setStatus] = useState("all"),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [productEdit, setProductEdit] = useState<ProductEdit | null>(null),
    [bannerEdit, setBannerEdit] = useState<BannerEdit | null>(null),
    [dirty, setDirty] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const uploading = uploadCount > 0;
  const uploadState = (active: boolean) => {
    setUploadCount(count => Math.max(0, count + (active ? 1 : -1)));
    if (active) setDirty(true);
  };
  const editor = useRef<HTMLDialogElement>(null);
  const confirmation = useRef<HTMLDialogElement>(null);
  const [confirmationText, setConfirmationText] = useState("");
  const confirmationResolve = useRef<((answer: boolean) => void) | null>(null);
  const askConfirmation = (message: string) => new Promise<boolean>(resolve => {
    if (confirmationResolve.current) { resolve(false); return; }
    confirmationResolve.current = resolve;
    setConfirmationText(message);
  });
  const answerConfirmation = (answer: boolean) => {
    const resolve = confirmationResolve.current;
    confirmationResolve.current = null;
    confirmation.current?.close();
    setConfirmationText("");
    resolve?.(answer);
  };
  useEffect(() => { if (confirmationText) confirmation.current?.showModal(); }, [confirmationText]);
  useEffect(() => () => { confirmationResolve.current?.(false); }, []);
  useEffect(() => {
    if (productEdit || bannerEdit) editor.current?.showModal();
    else editor.current?.close();
  }, [!!productEdit, !!bannerEdit]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const published = products.filter((p) => p.status === "published");
  const inStock = products.filter(p => p.status !== "archived" && p.data.variants.some(isInStock));
  const deals = published.filter(
    (p) => p.published_data && isDeal(p.published_data),
  );
  const low = products.filter(
    (p) => p.status !== "archived" && p.data.variants.some((v) => !isInStock(v)),
  );
  const close = async () => {
    if (busy || uploading) return;
    if (dirty && !await askConfirmation("Discard your unsaved changes?")) return;
    setProductEdit(null);
    setBannerEdit(null);
    setDirty(false);
    setError("");
  };
  const editProduct = (record?: ContentRecord<Product>) => {
    setProductEdit({
      record,
      data: record ? structuredClone(record.data) : newProduct(),
    });
    setBannerEdit(null);
    setError("");
    setDirty(false);
  };
  const editBanner = (record?: ContentRecord<Banner>) => {
    setBannerEdit({
      record,
      data: record ? structuredClone(record.data) : newBanner(),
    });
    setProductEdit(null);
    setError("");
    setDirty(false);
  };
  const changeProduct = (change: Partial<Product>) => {
    setProductEdit((p) => (p ? { ...p, data: { ...p.data, ...change } } : p));
    setDirty(true);
  };
  const changeBanner = (change: Partial<Banner>) => {
    setBannerEdit((p) => (p ? { ...p, data: { ...p.data, ...change } } : p));
    setDirty(true);
  };
  const changeVariant = (index: number, change: Partial<Variant>) => {
    setProductEdit(current => current ? {
      ...current,
      data: {...current.data, variants: current.data.variants.map((variant, i) =>
        i === index ? {...variant, ...change} : variant)},
    } : current);
    setDirty(true);
  };
  async function save(action: "save" | "publish" | "unpublish" | "archive") {
    if (demo || busy || uploading) return;
    const editing = productEdit || bannerEdit;
    if (!editing) return;
    if (
      (action === "unpublish" || action === "archive") &&
      !await askConfirmation(
        `${action === "archive" && productEdit ? "Delete " + productEdit.data.brand + " " + productEdit.data.name : action === "archive" ? "Archive this item" : "Unpublish this item"}? It will be removed from the storefront.${action === "archive" && productEdit ? " You can restore it from Deleted. Images will be kept." : ""}`,
      )
    )
      return;
    const validated = (productEdit ? productSchema : bannerSchema).safeParse(
      editing.data,
    );
    if (!validated.success) {
      setError(
        validated.error.issues
          .map((i) => `${i.path.join(" → ")}: ${i.message}`)
          .join("\n"),
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      const collection = productEdit ? "products" : "banners";
      const r = await fetch(`/api/admin/${collection}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordId: editing.record?.id,
          expectedVersion: editing.record?.version,
          action,
          data: validated.data,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      if (productEdit)
        setProducts((list) => [data, ...list.filter((p) => p.id !== data.id)]);
      else
        setBanners((list) => [data, ...list.filter((p) => p.id !== data.id)]);
      setNotice(
        action === "publish"
          ? "Published. The storefront will show this version."
          : action === "save"
            ? "Draft saved. The published version has not changed."
            : action === "archive"
              ? productEdit ? "Deleted. You can restore this watch from Deleted." : "Archived. You can republish it later."
              : "Unpublished. This item is now a draft.",
      );
      setDirty(false);
      setProductEdit(null);
      setBannerEdit(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setBusy(false);
    }
  }
  async function removeOrRestore(record: ContentRecord<Product>) {
    if (busy || demo) return;
    const restore=record.status==='archived';
    if(!restore && !await askConfirmation('Delete '+record.data.brand+' '+record.data.name+' ('+record.data.id+')?\n\nThis removes it from the website and active inventory. You can restore it from Deleted. Images will be kept.')) return;
    setBusy(true);setError('');setNotice('');
    try {
      const response=await fetch('/api/admin/products/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({recordId:record.id,expectedVersion:record.version,action:restore?'unpublish':'archive',data:record.data})});
      const updated=await response.json();
      if(!response.ok)throw new Error(updated.error);
      setProducts(list=>list.map(p=>p.id===updated.id?updated:p));
      setNotice(restore?'Restored as a draft. Open the watch and publish when ready.':'Watch deleted from the website. Restore it anytime from Deleted.');
    }catch(e){setError(e instanceof Error?e.message:'Unable to update this watch.');}
    finally{setBusy(false);}
  }
  async function quickStock(record: ContentRecord<Product>, availability: "in_stock" | "out_of_stock") {
    if (busy || demo) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch('/api/admin/products/', {method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({recordId:record.id,expectedVersion:record.version,availability})});
      const updated=await response.json();
      if(!response.ok) throw new Error(updated.error);
      setProducts(list=>list.map(p=>p.id===updated.id?updated:p));
      setNotice(record.data.name + ': ' + (availability==='in_stock'?'In stock':'Out of stock') + (record.status==='published'?'. Updated on the storefront.':'. Draft updated.'));
    } catch(e) {setError(e instanceof Error?e.message:'Unable to update availability.');}
    finally {setBusy(false);}
  }
  const signOut = async () => {
    try {
      const r = await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (!r.ok) throw new Error();
      window.location.assign("/admin/login/");
    } catch {
      setError("Unable to sign out. Please try again.");
    }
  };
  const filtered = products.filter(
    (p) =>
      (status === "all" ? p.status !== "archived" : p.status === status) &&
      `${p.data.brand} ${p.data.name} ${p.data.id}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (tab !== "sales" || p.data.variants.some((v) => v.sale)),
  );
  const title = {
    overview: "A good day for your store.",
    inventory: "The collection.",
    sales: "Good finds. Better prices.",
    banners: "Set the scene.",
    settings: "Make it yours.",
  }[tab];
  const subtitle = {
    overview: "Keep an eye on the details that keep things moving.",
    inventory: "Every watch, every variant, all in one place.",
    sales: "Schedule offers. Let the storefront take care of the rest.",
    banners: "A fresh first impression, whenever you need one.",
    settings: "The details behind every customer conversation.",
  }[tab];
  function table(rows: ContentRecord<Product>[]) {
    return (
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Watch</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Visibility</th>
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((record) => {
              const p = record.data,
                v = displayVariant(p);
              const stockVariant = p.variants.find(isInStock) ?? p.variants.find(v => stockStatus(v) === "unconfirmed") ?? v;
              return (
                <tr key={record.id}>
                  <td>
                    <button
                      className="admin-product-cell"
                      onClick={() => editProduct(record)}
                    >
                      <WatchImage src={v.image} alt="" />
                      <span>
                        <small>
                          {p.brand.toUpperCase()} · {p.id}
                        </small>
                        <strong>{p.name}</strong>
                        <span>
                          {p.gender} · {p.variants.length}{" "}
                          {p.variants.length === 1 ? "variant" : "variants"}
                        </span>
                      </span>
                    </button>
                  </td>
                  <td>
                    <strong>{money(priceOf(v).current)}</strong>
                    {v.sale && (
                      <small className="admin-sale-note">
                        {priceOf(v).onSale ? "On sale" : "Scheduled / ended"}
                      </small>
                    )}
                  </td>
                  <td>
                    <StockChip variant={stockVariant} />
                    {record.status !== "archived" && <div className="admin-quick-stock" role="group" aria-label={"Stock for " + p.name}>
                      {(["in_stock", "out_of_stock"] as const).map(value=><button key={value} type="button" disabled={busy || demo} aria-pressed={p.variants.every(v=>stockStatus(v)===value)} onClick={()=>quickStock(record,value)}>{value==='in_stock'?'In stock':'Out of stock'}</button>)}
                      <small>{p.variants.length>1?'All variants · ':''}{record.status==='published'?'Updates live':'Draft only'}</small>
                    </div>}
                  </td>
                  <td>
                    <span className={"admin-pill " + record.status}>
                      {record.status === "archived" ? "Deleted" : record.status}
                    </span>
                    {record.published_data &&
                      JSON.stringify(record.data) !==
                        JSON.stringify(record.published_data) && (
                        <small>Unpublished edits</small>
                      )}
                  </td>
                  <td>
                    <button
                      className="admin-edit-button"
                      onClick={() => editProduct(record)}
                      aria-label={`Edit ${p.brand} ${p.name}`}
                    >
                      <ChevronRight size={19} />
                    </button>
                    <button className="admin-delete-watch" type="button" disabled={busy || demo} onClick={()=>removeOrRestore(record)} aria-label={(record.status==='archived'?'Restore ':'Delete ')+p.brand+' '+p.name}>{record.status==='archived'?'Restore':<><Trash2 size={14}/>Delete</>}</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="admin-empty">
            <Watch size={30} />
            <h3>
              {query ? "No matching watches." : "Room for your next watch."}
            </h3>
            <p>
              {query
                ? "Try another name, brand or reference."
                : "Add a watch, set its price and availability, then publish it."}
            </p>
            <button className="admin-secondary" onClick={() => editProduct()}>
              Add a watch <Plus size={16} />
            </button>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin/" className="admin-wordmark">
          SOORA <span>& CO.</span>
        </Link>
        <span className="admin-workspace-label">STORE WORKSPACE</span>
        <nav aria-label="Admin navigation">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={tab === item.id ? "active" : ""}
              aria-current={tab === item.id ? "page" : undefined}
              onClick={() => {
                setTab(item.id);
                setQuery("");
                setStatus("all");
                setError("");
              }}
            >
              <item.icon size={19} />
              {item.label}
              {item.id === "inventory" && <span>{products.filter(p=>p.status!=="archived").length}</span>}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <Link href="/" target="_blank">
            View storefront <ArrowUpRight size={17} />
          </Link>
          <span className="admin-owner-avatar">
            {owner.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <strong>{owner}</strong>
            <small>{demo ? "Sample workspace" : "Owner access"}</small>
          </div>
          {!demo && (
            <button aria-label="Sign out" onClick={signOut}>
              <LogOut size={17} />
            </button>
          )}
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar">
          <span>
            Workspace <ChevronRight size={13} />{" "}
            {navigation.find((n) => n.id === tab)?.label}
          </span>
          <span className="admin-connection">
            <i />
            {demo
              ? "DESIGN PREVIEW"
              : live
                ? "CONNECTED TO STOREFRONT"
                : "CONTENT PREPARATION"}
          </span>
          {!demo && (
            <button
              className="admin-mobile-logout"
              aria-label="Sign out"
              onClick={signOut}
            >
              <LogOut size={17} />
            </button>
          )}
        </header>
        <div className="admin-content">
          {demo ? (
            <div className="admin-preview-notice">
              <span>Preview workspace</span> Explore the screens with imported
              inventory. Saving and uploads are disabled.
              <Link href="/admin/">
                Setup status <ArrowRight size={14} />
              </Link>
            </div>
          ) : !live ? (
            <div className="admin-preview-notice">
              <span>Content preparation</span>The public website still uses
              the imported catalog snapshot. Switch CATALOG_SOURCE to database after content
              review.
            </div>
          ) : null}
          <div className="admin-page-heading">
            <div>
              <span className="eyebrow">
                SOORA & CO. /{" "}
                {tab === "overview"
                  ? "YOUR STORE"
                  : navigation.find((n) => n.id === tab)?.label.toUpperCase()}
              </span>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
            {tab !== "settings" && (
              <button
                className="admin-primary"
                onClick={() =>
                  tab === "banners" ? editBanner() : editProduct()
                }
              >
                <Plus size={17} />
                {tab === "banners" ? "New banner" : "Add a watch"}
              </button>
            )}
          </div>
          {notice && (
            <div className="admin-success" role="status">
              <Check size={17} />
              {notice}
              <button
                aria-label="Dismiss notification"
                onClick={() => setNotice("")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {error && !productEdit && !bannerEdit && (
            <p role="alert" className="admin-error">
              {error}
            </p>
          )}
          {tab === "overview" && (
            <>
              <div className="admin-stats">
                {[
                  {
                    label: "Published watches",
                    value: published.length,
                    note: `${products.filter((p) => p.status === "draft").length} drafts waiting in the wings`,
                    icon: Watch,
                  },
                  {
                    label: "In-stock watches",
                    value: inStock.length,
                    note: "Across your active inventory",
                    icon: PackageCheck,
                  },
                  {
                    label: "Live offers",
                    value: deals.length,
                    note: "Published and available now",
                    icon: Tag,
                  },
                  {
                    label: "Stock to review",
                    value: low.length,
                    note: "Watches with out-of-stock or unconfirmed variants",
                    icon: LayoutDashboard,
                  },
                ].map((s) => (
                  <div key={s.label}>
                    <span>
                      {s.label}
                      <s.icon size={18} />
                    </span>
                    <strong>{s.value.toString().padStart(2, "0")}</strong>
                    <p>{s.note}</p>
                  </div>
                ))}
              </div>
              <div className="admin-overview-grid">
                <section className="admin-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <span className="eyebrow">A CLOSER LOOK</span>
                      <h2>On your radar.</h2>
                    </div>
                    <button onClick={() => setTab("inventory")}>
                      All inventory <ArrowUpRight size={16} />
                    </button>
                  </div>
                  {table(low.slice(0, 4))}
                </section>
                <aside className="admin-campaign-card">
                  <span className="eyebrow">THE FIRST IMPRESSION</span>
                  <h2>
                    Give the collection
                    <br />a fresh perspective.
                  </h2>
                  <WatchImage
                    src={banners[0]?.data.image || ""}
                    alt="Campaign artwork"
                  />
                  <p>
                    Update the homepage, announce an offer, or plan what comes
                    next.
                  </p>
                  <button onClick={() => setTab("banners")}>
                    Manage banners <ArrowUpRight size={17} />
                  </button>
                </aside>
              </div>
              <section className="admin-workflow-note">
                <span>01</span>
                <div>
                  <strong>Prepare. Preview. Publish.</strong>
                  <p>
                    Draft changes stay private until you publish. WhatsApp
                    enquiries never change availability—update the stock status
                    in Inventory after a confirmed sale.
                  </p>
                </div>
              </section>
            </>
          )}
          {(tab === "inventory" || tab === "sales") && (
            <>
              {tab === "sales" && (
                <div className="admin-info">
                  <Tag size={20} />
                  <p>
                    Sale prices apply automatically within the scheduled window.
                    All times use <strong>Sri Lanka time (UTC+05:30)</strong>.
                    Expired offers return to the regular price. No quantities are needed;
                    watches marked out of stock leave Deals.
                  </p>
                </div>
              )}
              <section className="admin-panel">
                <div className="admin-inventory-toolbar">
                  <div className="admin-filter-tabs">
                    {["all", "published", "draft", "archived"].map((s) => (
                      <button
                        className={status === s ? "selected" : ""}
                        key={s}
                        onClick={() => setStatus(s)}
                      >
                        {s === "all" ? "All watches" : s === "archived" ? "Deleted" : s}
                      </button>
                    ))}
                  </div>
                  <label className="admin-search">
                    <Search size={16} />
                    <input
                      aria-label="Search inventory"
                      placeholder="Find a watch or reference…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </label>
                </div>
                {table(filtered)}
                <div className="admin-table-footer">
                  {filtered.length} watches{" "}
                  <span>
                    {tab === "sales"
                      ? "Includes active, scheduled and ended offers. Edit a watch to change its sale."
                      : "Update availability after a confirmed sale, then publish changes."}
                  </span>
                </div>
              </section>
            </>
          )}
          {tab === "banners" && (
            <>
              <div className="admin-info">
                <PanelsTopLeft size={21} />
                <p>
                  One banner appears per placement. The highest-priority active
                  banner wins. When a campaign ends, the website returns to the
                  next active banner or its default design.
                </p>
              </div>
              <div className="admin-banner-grid">
                {banners.map((record) => (
                  <button
                    className="admin-banner-tile"
                    key={record.id}
                    onClick={() => editBanner(record)}
                  >
                    <div className="admin-banner-art">
                      <WatchImage
                        src={record.data.image}
                        alt={record.data.alt}
                      />
                      <span>
                        {record.data.eyebrow}
                        <strong>{record.data.heading}</strong>
                      </span>
                    </div>
                    <div>
                      <span className={"admin-pill " + record.status}>
                        {record.status}
                      </span>
                      <span className="admin-banner-placement">
                        {record.data.placement} · Priority{" "}
                        {record.data.priority}
                      </span>
                      <h2>
                        {record.data.title}
                        <ArrowUpRight size={20} />
                      </h2>
                      <p>
                        {record.data.enabled ? "Enabled" : "Disabled"} ·{" "}
                        {record.data.startsAt
                          ? new Date(record.data.startsAt).toLocaleDateString(
                              "en-GB",
                              { timeZone: "Asia/Colombo" },
                            )
                          : "Always available"}
                        {record.data.endsAt
                          ? " → " +
                            new Date(record.data.endsAt).toLocaleDateString(
                              "en-GB",
                              { timeZone: "Asia/Colombo" },
                            )
                          : ""}
                      </p>
                    </div>
                  </button>
                ))}
                <button
                  className="admin-add-banner"
                  onClick={() => editBanner()}
                >
                  <Plus size={28} />
                  <h2>A new point of view.</h2>
                  <span>Create a campaign banner</span>
                </button>
              </div>
            </>
          )}
          {tab === "settings" && (
            <div className="admin-settings-grid">
              <form
                className="admin-panel admin-settings-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (demo) return;
                  const parsed = settingsSchema.safeParse(settings.data);
                  if (!parsed.success) {
                    setError(parsed.error.issues[0].message);
                    return;
                  }
                  setBusy(true);
                  setError("");
                  try {
                    const r = await fetch("/api/admin/settings/", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        data: parsed.data,
                        expectedVersion: settings.version,
                      }),
                    });
                    const data = await r.json();
                    if (!r.ok) throw new Error(data.error);
                    setSettings(data);
                    setNotice("Store settings saved.");
                  } catch (e) {
                    setError(
                      e instanceof Error ? e.message : "Unable to save.",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <h2>Customer conversations</h2>
                <p>
                  Keep the contact destination correct. A blank number keeps
                  enquiries in preview mode.
                </p>
                <label>
                  WhatsApp number
                  <input
                    value={settings.data.whatsapp}
                    inputMode="tel"
                    placeholder="Country code + number, digits only"
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        data: { ...s.data, whatsapp: e.target.value },
                      }))
                    }
                  />
                </label>
                <h2>Announcement bar</h2>
                <label>
                  Message
                  <input
                    value={settings.data.announcement}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        data: { ...s.data, announcement: e.target.value },
                      }))
                    }
                  />
                </label>
                <div className="admin-field-grid">
                  <label>
                    Link label
                    <input
                      value={settings.data.announcementLabel}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          data: {
                            ...s.data,
                            announcementLabel: e.target.value,
                          },
                        }))
                      }
                    />
                  </label>
                  <label>
                    Destination
                    <input
                      value={settings.data.announcementLink}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          data: { ...s.data, announcementLink: e.target.value },
                        }))
                      }
                    />
                  </label>
                </div>
                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={settings.data.previewMode}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        data: { ...s.data, previewMode: e.target.checked },
                      }))
                    }
                  />
                  Show preview notices
                </label>
                <p className="admin-note">
                  Turn this off only after replacing sample photographs,
                  inventory and store copy. Search indexing remains disabled
                  until the launch review.
                </p>
                <button className="admin-primary" disabled={demo || busy || uploading}>
                  {busy ? "Saving…" : "Save settings"}
                </button>
              </form>
              <div>
                <section className="admin-panel admin-settings-form">
                  <span className="eyebrow">YOUR CONTENT</span>
                  <h2>Keep a copy.</h2>
                  <p>
                    Download products, banners, settings and media references.
                    Image files and authentication data require separate
                    backups.
                  </p>
                  {demo ? (
                    <button disabled className="admin-secondary">
                      <Download size={16} />
                      Export content
                    </button>
                  ) : (
                    <a className="admin-secondary" href="/api/admin/export/">
                      <Download size={16} />
                      Export content
                    </a>
                  )}
                </section>
                <form
                  className="admin-panel admin-settings-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (demo) return;
                    const form = e.currentTarget;
                    const data = new FormData(form);
                    setPasswordBusy(true);
                    setError("");
                    try {
                      const r = await fetch("/api/auth/change-password", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          currentPassword: data.get("current"),
                          newPassword: data.get("new"),
                          revokeOtherSessions: true,
                        }),
                      });
                      if (!r.ok)
                        throw new Error(
                          "Password could not be changed. Check your current password.",
                        );
                      form.reset();
                      setNotice(
                        "Password changed. Other sessions have been signed out.",
                      );
                    } catch (e) {
                      setError(
                        e instanceof Error
                          ? e.message
                          : "Unable to change password.",
                      );
                    } finally {
                      setPasswordBusy(false);
                    }
                  }}
                >
                  <h2>Owner security</h2>
                  <label>
                    Current password
                    <input
                      name="current"
                      type="password"
                      required
                      autoComplete="current-password"
                    />
                  </label>
                  <label>
                    New password
                    <input
                      name="new"
                      type="password"
                      minLength={12}
                      maxLength={128}
                      required
                      autoComplete="new-password"
                    />
                  </label>
                  <button
                    className="admin-secondary"
                    disabled={demo || passwordBusy}
                  >
                    {passwordBusy ? "Updating…" : "Change password"}
                  </button>
                </form>
              </div>
            </div>
          )}
          <footer className="admin-footer">
            <span>SOORA & CO. · OWNER WORKSPACE</span>
            <span>Thoughtful details. Everyday control.</span>
          </footer>
        </div>
      </main>
      <dialog
        className="admin-editor"
        ref={editor}
        aria-label={productEdit ? "Watch editor" : "Banner editor"}
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
      >
        <div className="admin-editor-header">
          <div>
            <span className="eyebrow">
              {productEdit ? "THE COLLECTION" : "CAMPAIGN STUDIO"}
            </span>
            <h2>
              {productEdit
                ? productEdit.record
                  ? "Edit watch"
                  : "Add a watch"
                : bannerEdit?.record
                  ? "Edit banner"
                  : "New banner"}
            </h2>
          </div>
          <button
            className="admin-edit-button"
            aria-label="Close editor"
            disabled={busy || uploading}
            onClick={close}
          >
            <X size={23} />
          </button>
        </div>
        <div className="admin-editor-body">
          {demo && (
            <div className="admin-preview-notice">
              Sample editor · You can explore the fields. Changes are not saved.
            </div>
          )}
          {error && (
            <p role="alert" className="admin-error">
              {error}
            </p>
          )}
          {productEdit && (
            <>
              <p className="admin-note">Examples show the format only and are not saved. Enter the actual watch details; use “Not specified” for unknown specifications.</p>
              <div className="admin-field-grid">
                <label>
                  Brand
                  <input
                    aria-label="Brand"
                    placeholder="e.g. Casio"
                    value={productEdit.data.brand}
                    onChange={(e) => changeProduct({ brand: e.target.value })}
                    maxLength={60}
                    list="watch-brands"
                  />
                  <datalist id="watch-brands">
                    {[...new Set(products.map((p) => p.data.brand))].map(
                      (b) => (
                        <option key={b}>{b}</option>
                      ),
                    )}
                  </datalist>
                </label>
                <label>
                  Model name
                  <input
                    aria-label="Model name"
                    placeholder="e.g. A168WA-3AYDF Vintage Digital Watch"
                    value={productEdit.data.name}
                    onChange={(e) => changeProduct({ name: e.target.value })}
                    maxLength={120}
                  />
                </label>
                <label>
                  Product reference
                  <input
                    aria-label="Product reference"
                    placeholder="e.g. A168WA-3AYDF"
                    value={productEdit.data.id}
                    onChange={(e) => changeProduct({ id: e.target.value })}
                  />
                  <small>Use the model/reference printed on the watch or box. Each watch needs a unique reference.</small>
                </label>
                <label>
                  Product URL
                  <input
                    value={productEdit.data.slug}
                    disabled={!!productEdit.record}
                    aria-label="Product URL"
                    placeholder="e.g. casio-a168wa-3aydf"
                    onChange={(e) =>
                      changeProduct({
                        slug: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-"),
                      })
                    }
                  />
                  <small>
                    {productEdit.record
                      ? "URL stays fixed to preserve shared links."
                      : "Example: casio-a168wa-3aydf → /watches/casio-a168wa-3aydf/. Use lowercase letters, numbers and hyphens; no full web address."}
                  </small>
                </label>
                <label>
                  Category
                  <select
                    aria-label="Category"
                    value={productEdit.data.gender}
                    onChange={(e) =>
                      changeProduct({
                        gender: e.target.value as Product["gender"],
                      })
                    }
                  >
                    {["Men", "Women", "Unisex", "Unspecified"].map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                  <small>Choose Men, Women or Unisex. Leave Unspecified if you are unsure.</small>
                </label>
                <label>
                  Style
                  <input
                    aria-label="Style"
                    placeholder="e.g. Everyday, Dress, Sport or Digital"
                    value={productEdit.data.style}
                    onChange={(e) => changeProduct({ style: e.target.value })}
                  />
                </label>
                <label>
                  Movement
                  <input
                    aria-label="Movement"
                    placeholder="e.g. Quartz, Automatic or Solar"
                    value={productEdit.data.movement}
                    onChange={(e) =>
                      changeProduct({ movement: e.target.value })
                    }
                  />
                </label>
                <label>
                  Strap
                  <input
                    aria-label="Strap"
                    placeholder="e.g. Stainless steel, Leather or Resin"
                    value={productEdit.data.strap}
                    onChange={(e) => changeProduct({ strap: e.target.value })}
                  />
                </label>
              </div>
              <label>
                Description
                <textarea
                  rows={3}
                  aria-label="Description"
                    placeholder="e.g. A classic digital watch with a stainless steel bracelet and an easy-to-read display. Add verified features and what makes this model special."
                    value={productEdit.data.description}
                  onChange={(e) =>
                    changeProduct({ description: e.target.value })
                  }
                />
              </label>
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={!!productEdit.data.featured}
                  onChange={(e) =>
                    changeProduct({ featured: e.target.checked })
                  }
                />
                Feature on the homepage
              </label>
              <div className="admin-section-divider">
                <h3>Variants, stock & pricing</h3>
                <span>All prices in LKR</span>
              </div>
              {productEdit.data.variants.map((variant, index) => (
                <section className="admin-variant" key={variant.id}>
                  <div className="admin-variant-title">
                    <h3>Variant {String(index + 1).padStart(2, "0")}</h3>
                    {productEdit.data.variants.length > 1 && (
                      <button
                        aria-label={`Remove variant ${index + 1}`}
                        disabled={uploading}
                        className="admin-text-link"
                        onClick={async () => {
                          if (
                            await askConfirmation(
                              "Remove this variant from the draft?",
                            )
                          )
                            changeProduct({
                              variants: productEdit.data.variants.filter(
                                (_, i) => i !== index,
                              ),
                            });
                        }}
                      >
                        <Trash2 size={15} />
                        Remove
                      </button>
                    )}
                  </div>
                  <ImageField
                    onUploadState={uploadState}
                    value={variant.image}
                    onChange={(image) => changeVariant(index, { image })}
                    demo={demo}
                  />
                  <div className="admin-field-grid">
                    <label>
                      Dial colour
                      <input
                        aria-label="Dial colour"
                    placeholder="e.g. Black, Blue or Champagne"
                    value={variant.colour}
                        onChange={(e) =>
                          changeVariant(index, { colour: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Colour swatch
                      <input
                        type="color"
                        aria-label="Colour swatch"
                        value={variant.swatch}
                        onChange={(e) =>
                          changeVariant(index, { swatch: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Regular price (LKR)
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        aria-label="Regular price (LKR)"
                        placeholder="e.g. 17950"
                        value={variant.priceMinor / 100}
                        onChange={(e) =>
                          changeVariant(index, {
                            priceMinor: Math.round(
                              Number(e.target.value) * 100,
                            ),
                          })
                        }
                      />
                    </label>
                    <fieldset className="admin-availability">
                      <legend>Availability</legend>
                      <div className="admin-stock-options">
                        {(["in_stock", "out_of_stock"] as const).map(status => <button
                          type="button"
                          key={status}
                          className={status}
                          aria-pressed={stockStatus(variant) === status}
                          onClick={() => changeVariant(index, { availability: status, availabilityUnconfirmed: false })}
                        ><span aria-hidden="true" />{status === "in_stock" ? "In stock" : "Out of stock"}</button>)}
                      </div>
                      {stockStatus(variant) === "unconfirmed" && <small>Not set yet. Choose a stock status for this watch.</small>}
                    </fieldset>
                  </div>
                  <p className="admin-note">Price example: 17950 means LKR 17,950; enter numbers only, without commas or “LKR”. Choose a swatch that matches the dial.</p>
                  <p className="admin-help">No quantity needed. Publish changes to update the customer’s stock chip. In-stock watches can appear in Deals; out-of-stock watches offer a restocking enquiry.</p>
                  <label className="admin-checkbox">
                    <input
                      type="checkbox"
                      checked={!!variant.sale}
                      onChange={(e) =>
                        changeVariant(index, {
                          sale: e.target.checked
                            ? {
                                priceMinor: Math.round(
                                  variant.priceMinor * 0.8,
                                ),
                                startsAt: new Date().toISOString(),
                                endsAt: new Date(
                                  Date.now() + 7 * 86400000,
                                ).toISOString(),
                              }
                            : undefined,
                        })
                      }
                    />
                    Put this variant on sale
                  </label>
                  {variant.sale && (
                    <div className="admin-sale-fields">
                      <p className="admin-note">Example: regular price 17950 → sale price 14950. Choose the start and end using the date/time picker in Sri Lanka time; for example, 20 Nov 2026 at 09:00 to 27 Nov 2026 at 23:59. The end must be later than the start.</p>
                      <label>
                        Sale price (LKR)
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          aria-label="Sale price (LKR)"
                          placeholder="e.g. 14950"
                          value={variant.sale.priceMinor / 100}
                          onChange={(e) =>
                            changeVariant(index, {
                              sale: {
                                ...variant.sale!,
                                priceMinor: Math.round(
                                  Number(e.target.value) * 100,
                                ),
                              },
                            })
                          }
                        />
                      </label>
                      <label>
                        Starts · Sri Lanka time
                        <input
                          type="datetime-local"
                          value={colomboInput(variant.sale.startsAt)}
                          onInput={(e) => {
                            if (e.currentTarget.value)
                              changeVariant(index, {
                                sale: {
                                  ...variant.sale!,
                                  startsAt: colomboInstant(e.currentTarget.value)!,
                                },
                              });
                          }}
                        />
                      </label>
                      <label>
                        Ends · Sri Lanka time
                        <input
                          type="datetime-local"
                          value={colomboInput(variant.sale.endsAt)}
                          onInput={(e) => {
                            if (e.currentTarget.value)
                              changeVariant(index, {
                                sale: {
                                  ...variant.sale!,
                                  endsAt: colomboInstant(e.currentTarget.value)!,
                                },
                              });
                          }}
                        />
                      </label>
                      <p>
                        {variant.sale.priceMinor < variant.priceMinor
                          ? `${Math.round((1 - variant.sale.priceMinor / variant.priceMinor) * 100)}% off · `
                          : ""}
                        The regular price returns automatically when this offer
                        ends.
                      </p>
                    </div>
                  )}
                </section>
              ))}
              <button
                className="admin-secondary"
                onClick={() =>
                  changeProduct({
                    variants: [...productEdit.data.variants, newVariant()],
                  })
                }
                disabled={productEdit.data.variants.length >= 30}
              >
                <Plus size={16} />
                Add variant
              </button>
            </>
          )}
          {bannerEdit && (
            <>
              <label>
                Campaign name{" "}
                <input
                  value={bannerEdit.data.title}
                  onChange={(e) => changeBanner({ title: e.target.value })}
                />
              </label>
              <div className="admin-field-grid">
                <label>
                  Placement
                  <select
                    value={bannerEdit.data.placement}
                    onChange={(e) =>
                      changeBanner({
                        placement: e.target.value as Banner["placement"],
                      })
                    }
                  >
                    <option value="home">Homepage</option>
                    <option value="deals">Deals page</option>
                  </select>
                </label>
                <label>
                  Priority
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={bannerEdit.data.priority}
                    onChange={(e) =>
                      changeBanner({ priority: Number(e.target.value) })
                    }
                  />
                  <small>Higher numbers appear first.</small>
                </label>
              </div>
              <ImageField
                    onUploadState={uploadState}
                value={bannerEdit.data.image}
                onChange={(image) => changeBanner({ image })}
                demo={demo}
                label="Desktop artwork"
              />
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  disabled={uploading}
                  checked={bannerEdit.data.mobileImage !== undefined}
                  onChange={(e) =>
                    changeBanner({
                      mobileImage: e.target.checked
                        ? bannerEdit.data.image
                        : undefined,
                    })
                  }
                />
                Use separate mobile artwork
              </label>
              {bannerEdit.data.mobileImage !== undefined && (
                <ImageField
                    onUploadState={uploadState}
                  value={bannerEdit.data.mobileImage}
                  onChange={(mobileImage) => changeBanner({ mobileImage })}
                  demo={demo}
                  label="Mobile artwork"
                />
              )}
              <label>
                Image description
                <input
                  value={bannerEdit.data.alt}
                  onChange={(e) => changeBanner({ alt: e.target.value })}
                />
              </label>
              <label>
                Eyebrow text
                <input
                  value={bannerEdit.data.eyebrow}
                  onChange={(e) => changeBanner({ eyebrow: e.target.value })}
                />
              </label>
              <label>
                Headline
                <input
                  value={bannerEdit.data.heading}
                  onChange={(e) => changeBanner({ heading: e.target.value })}
                />
              </label>
              <label>
                Supporting copy
                <textarea
                  rows={2}
                  value={bannerEdit.data.description}
                  onChange={(e) =>
                    changeBanner({ description: e.target.value })
                  }
                />
              </label>
              <div className="admin-field-grid">
                <label>
                  Button label
                  <input
                    value={bannerEdit.data.label}
                    onChange={(e) => changeBanner({ label: e.target.value })}
                  />
                </label>
                <label>
                  Button destination
                  <input
                    value={bannerEdit.data.link}
                    onChange={(e) => changeBanner({ link: e.target.value })}
                  />
                  <small>For example: /deals/ or /watches/</small>
                </label>
                <label>
                  Starts · Sri Lanka time
                  <input
                    type="datetime-local"
                    value={colomboInput(bannerEdit.data.startsAt)}
                    onInput={(e) =>
                      changeBanner({ startsAt: colomboInstant(e.currentTarget.value) })
                    }
                  />
                  <small>Leave blank to start immediately.</small>
                </label>
                <label>
                  Ends · Sri Lanka time
                  <input
                    type="datetime-local"
                    value={colomboInput(bannerEdit.data.endsAt)}
                    onInput={(e) =>
                      changeBanner({ endsAt: colomboInstant(e.currentTarget.value) })
                    }
                  />
                  <small>Leave blank for no end date.</small>
                </label>
              </div>
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={bannerEdit.data.enabled}
                  onChange={(e) => changeBanner({ enabled: e.target.checked })}
                />
                Campaign enabled
              </label>
              <div className="admin-banner-art editor-banner-preview">
                <WatchImage
                  src={bannerEdit.data.image}
                  alt={bannerEdit.data.alt}
                />
                <span>
                  {bannerEdit.data.eyebrow}
                  <strong>{bannerEdit.data.heading}</strong>
                </span>
              </div>
              <p className="admin-note">
                Use accurate offer copy. Discounts are calculated from watch
                prices; text baked into an image won’t update automatically.
              </p>
            </>
          )}
        </div>
        {uploading && <p role="status" className="admin-note">Please wait for image uploads to finish before saving or closing.</p>}
        <div className="admin-editor-actions">
          <div>
            {(productEdit?.record || bannerEdit?.record) && (
              <>
                <button
                  className="admin-text-link"
                  disabled={demo || busy || uploading}
                  onClick={() => save("unpublish")}
                >
                  Unpublish
                </button>
                <button
                  className="admin-text-link"
                  disabled={demo || busy || uploading}
                  onClick={() => save("archive")}
                >
                  {productEdit ? "Delete watch" : "Archive"}
                </button>
              </>
            )}
          </div>
          <button
            className="admin-secondary"
            disabled={demo || busy || uploading}
            onClick={() => save("save")}
          >
            {productEdit?.record?.status === "archived" ? "Restore as draft" : "Save draft"}
          </button>
          <button
            className="admin-primary"
            disabled={demo || busy || uploading}
            onClick={() => save("publish")}
          >
            {busy ? "Saving…" : "Publish changes"}
            <ArrowUpRight size={16} />
          </button>
        </div>
      </dialog>
      <dialog ref={confirmation} className="admin-confirmation" aria-labelledby="admin-confirm-title" aria-describedby="admin-confirm-message" onCancel={e=>{e.preventDefault();answerConfirmation(false)}} onClick={e=>{if(e.target===e.currentTarget)answerConfirmation(false)}}>
        <span className="eyebrow">PLEASE CONFIRM</span>
        <h2 id="admin-confirm-title">Confirm this change</h2>
        <p id="admin-confirm-message">{confirmationText}</p>
        <div><button type="button" className="admin-secondary" autoFocus onClick={()=>answerConfirmation(false)}>Cancel</button><button type="button" className="admin-primary" onClick={()=>answerConfirmation(true)}>Confirm</button></div>
      </dialog>
    </div>
  );
}
