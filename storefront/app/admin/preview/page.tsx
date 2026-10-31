import Dashboard from "@/components/admin/dashboard";
import { products } from "@/lib/fixtures";
import {
  defaultSettings,
  type Banner,
  type ContentRecord,
} from "@/lib/admin/schema";
const banner: Banner = {
  title: "Everyday collection",
  eyebrow: "SOORA & CO. · THE WATCH COLLECTION",
  heading: "Good watches. Great moments.",
  description: "For the everyday. For the occasion. For whatever comes next.",
  image: "/images/hero.png",
  alt: "A champagne-dial watch on dark stone",
  link: "/watches/",
  label: "Explore watches",
  placement: "home",
  enabled: true,
  priority: 10,
  startsAt: null,
  endsAt: null,
};
export default function PreviewPage() {
  const records = products.map((p, i) => {
    const data = {
      ...p,
      variants: p.variants.map((v) => ({
        ...v,
        swatch:
          v.swatch.length === 4
            ? "#" +
              v.swatch
                .slice(1)
                .split("")
                .map((c) => c + c)
                .join("")
            : v.swatch,
      })),
    };
    return {
      id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
      data,
      published_data: data,
      status: "published" as const,
      version: 1,
      updated_at: "2026-10-31T06:00:00Z",
    };
  });
  const banners: ContentRecord<Banner>[] = [
    {
      id: "00000000-0000-4000-8000-000000000100",
      data: banner,
      published_data: banner,
      status: "published",
      version: 1,
      updated_at: "2026-10-31T06:00:00Z",
    },
  ];
  return (
    <Dashboard
      demo
      owner="Store owner"
      initialProducts={records}
      initialBanners={banners}
      initialSettings={{ data: defaultSettings, version: 1 }}
      live={false}
    />
  );
}
