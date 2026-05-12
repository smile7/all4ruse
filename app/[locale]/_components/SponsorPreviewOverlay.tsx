"use client";

import Image from "next/image";
import { XIcon } from "lucide-react";

type SponsorPreviewOverlayProps = {
  sponsor: {
    imageSrc: string;
    alt: string;
    previewImageClassName?: string;
  };
  onClose: () => void;
};

const DEFAULT_SPONSOR_PREVIEW_IMAGE_CLASS_NAME = "rounded-md object-contain";

export function SponsorPreviewOverlay({
  sponsor,
  onClose,
}: SponsorPreviewOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute top-4 right-4 z-10 rounded-full bg-black/60 p-2 text-primary-foreground transition hover:bg-black"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        aria-label="Close sponsor image"
      >
        <XIcon size={20} />
      </button>
      <div
        className="flex h-full w-full items-center justify-center"
        style={{ maxHeight: "90vh", maxWidth: "96vw" }}
      >
        <Image
          src={sponsor.imageSrc}
          alt={sponsor.alt}
          width={1920}
          height={1080}
          unoptimized
          className={
            sponsor.previewImageClassName ??
            DEFAULT_SPONSOR_PREVIEW_IMAGE_CLASS_NAME
          }
          style={{
            maxHeight: "90vh",
            maxWidth: "96vw",
            width: "auto",
            height: "auto",
            display: "block",
            margin: "auto",
            background: "black",
          }}
          draggable={false}
          priority
          onClick={(event) => event.stopPropagation()}
        />
      </div>
    </div>
  );
}
