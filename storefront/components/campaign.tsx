import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { WatchImage } from "./watch-image";
import type { Banner } from "@/lib/admin/schema";
export function Campaign({ banner }: { banner: Banner }) {
  return (
    <section
      className={
        "hero managed-campaign " +
        (banner.placement === "deals" ? "managed-deals" : "")
      }
    >
      <picture>
        {banner.mobileImage && (
          <source media="(max-width:600px)" srcSet={banner.mobileImage} />
        )}
        <WatchImage
          className="hero-photo"
          src={banner.image}
          alt={banner.alt}
          priority
          sizes="100vw"
        />
      </picture>
      <div className="hero-shade" />
      <div className="hero-content">
        <span className="eyebrow">{banner.eyebrow}</span>
        <h1>{banner.heading}</h1>
        <p>{banner.description}</p>
        <div className="hero-buttons">
          <Link className="button light" href={banner.link}>
            {banner.label}
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
