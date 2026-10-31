import { z } from "zod";

const text = (max = 120) => z.string().trim().min(1).max(max);
const money = z.number().int().min(0).max(100_000_000_000);
const instant = z.iso.datetime({ offset: true });
export const imageSchema = z
  .string()
  .max(1000)
  .refine((value) => {
    if (/^\/images\/[a-zA-Z0-9/_-]+\.(png|webp|jpe?g)$/.test(value))
      return true;
    try {
      const url = new URL(value);
      return (
        url.protocol === "https:" &&
        !url.username &&
        !url.password &&
        url.hostname.endsWith(".public.blob.vercel-storage.com")
      );
    } catch {
      return false;
    }
  }, "Choose an uploaded image or a sample image.");
export const linkSchema = z
  .string()
  .max(250)
  .regex(
    /^\/(?:[a-zA-Z0-9_-]+\/)*$/,
    "Use an internal path such as /deals/ or /watches/.",
  );
const saleSchema = z
  .object({ priceMinor: money, startsAt: instant, endsAt: instant })
  .strict();
export const variantSchema = z
  .object({
    id: text(80),
    colour: text(60),
    swatch: z.string().regex(/^#[a-fA-F0-9]{6}$/),
    image: imageSchema,
    priceMinor: money,
    stock: z.number().int().min(0).max(1_000_000),
    sale: saleSchema.optional(),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (v.sale && v.sale.priceMinor >= v.priceMinor)
      ctx.addIssue({
        code: "custom",
        path: ["sale", "priceMinor"],
        message: "Sale price must be below the regular price.",
      });
    if (v.sale && Date.parse(v.sale.endsAt) <= Date.parse(v.sale.startsAt))
      ctx.addIssue({
        code: "custom",
        path: ["sale", "endsAt"],
        message: "End must be after start.",
      });
  });
export const productSchema = z
  .object({
    id: text(80),
    slug: text(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .refine(
        (s) => !["men", "women", "unisex"].includes(s),
        "This URL is reserved for a collection.",
      ),
    brand: text(60),
    name: text(),
    gender: z.enum(["Men", "Women", "Unisex"]),
    style: text(60),
    movement: text(60),
    strap: text(100),
    description: text(4000),
    featured: z.boolean().default(false),
    variants: z.array(variantSchema).min(1).max(30),
  })
  .strict()
  .superRefine((p, ctx) => {
    if (new Set(p.variants.map((v) => v.id)).size !== p.variants.length)
      ctx.addIssue({
        code: "custom",
        path: ["variants"],
        message: "Each variant needs a unique reference.",
      });
  });
export const bannerSchema = z
  .object({
    title: text(100),
    eyebrow: text(100),
    heading: text(120),
    description: z.string().trim().max(240),
    image: imageSchema,
    mobileImage: imageSchema.optional(),
    alt: text(180),
    link: linkSchema,
    label: text(50),
    placement: z.enum(["home", "deals"]),
    enabled: z.boolean(),
    priority: z.number().int().min(0).max(100),
    startsAt: instant.nullable(),
    endsAt: instant.nullable(),
  })
  .strict()
  .superRefine((b, ctx) => {
    if (
      b.startsAt &&
      b.endsAt &&
      Date.parse(b.endsAt) <= Date.parse(b.startsAt)
    )
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "End must be after start.",
      });
  });
export const settingsSchema = z
  .object({
    whatsapp: z
      .string()
      .regex(
        /^$|^[1-9][0-9]{7,14}$/,
        "Use the international number, digits only, e.g. country code followed by the number.",
      ),
    announcement: z.string().trim().max(120),
    announcementLabel: z.string().trim().max(50),
    announcementLink: linkSchema,
    previewMode: z.boolean(),
  })
  .strict();
export const saveSchema = z
  .object({
    recordId: z.uuid().optional(),
    expectedVersion: z.number().int().positive().optional(),
    action: z.enum(["save", "publish", "unpublish", "archive"]),
    data: z.unknown(),
  })
  .strict()
  .refine(
    (v) => Boolean(v.recordId) === Boolean(v.expectedVersion),
    "Existing records require a version.",
  );
export type Banner = z.infer<typeof bannerSchema>;
export type StoreSettings = z.infer<typeof settingsSchema>;
export type ContentRecord<T> = {
  id: string;
  data: T;
  published_data: T | null;
  status: "draft" | "published" | "archived";
  version: number;
  updated_at: string;
};
export const defaultSettings: StoreSettings = {
  whatsapp: "",
  announcement: "Good watches. Great moments.",
  announcementLabel: "Explore the deals",
  announcementLink: "/deals/",
  previewMode: true,
};
export function activeBanner(
  banners: Banner[],
  placement: Banner["placement"],
  at = new Date(),
) {
  return banners
    .filter(
      (b) =>
        b.enabled &&
        b.placement === placement &&
        (!b.startsAt || Date.parse(b.startsAt) <= +at) &&
        (!b.endsAt || +at < Date.parse(b.endsAt)),
    )
    .sort((a, b) => b.priority - a.priority)[0];
}
export function colomboInput(iso: string | null) {
  return iso
    ? new Date(Date.parse(iso) + 330 * 60000).toISOString().slice(0, 16)
    : "";
}
export function colomboInstant(value: string) {
  return value ? new Date(value + ":00+05:30").toISOString() : null;
}
export const brandSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
