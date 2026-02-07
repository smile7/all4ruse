"use client";

import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";
import LightGallery from "lightgallery/react";
import Image from "next/image";
import { normalizeSupabaseImageUrl } from "@/lib/utils";

import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";

export function ImagesGallery({
  images,
  title,
  className,
}: {
  images: string[];
  title?: string;
  className?: string;
}) {
  if (!images?.length) return null;

  return (
    <LightGallery
      plugins={[lgZoom, lgThumbnail]}
      speed={400}
      elementClassNames={`flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory ${className ?? ""}`}
      download={false}
      mobileSettings={{ controls: true, showCloseIcon: true }}
    >
      {images.map((url, idx) => {
        const imageUrl = normalizeSupabaseImageUrl(url);

        return (
          <a
            key={`${url}-${idx}`}
            href={imageUrl}
            className="relative shrink-0 snap-start rounded-md border overflow-hidden aspect-[4/3] w-64"
            aria-label={`Open image ${idx + 1}`}
          >
            <Image
              src={imageUrl}
              width={400}
              height={300}
              alt={`${title ?? "image"} ${idx + 1}`}
              className="h-full w-full object-cover"
              // unoptimized
              loading={idx < 4 ? "eager" : "lazy"}
            />
          </a>
        );
      })}
    </LightGallery>
  );
}
