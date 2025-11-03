"use client";

import React, { useEffect, useState } from "react";
import { XIcon } from "lucide-react";
import Image from "next/image";

type EventHeroImageProps = {
  src: string;
  alt?: string;
};

export default function EventHeroImage({
  src,
  alt = "Event image",
}: EventHeroImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      <div
        className="group relative w-full overflow-hidden cursor-zoom-in rounded-md shadow-md hover:shadow-lg transition"
        onClick={() => setIsOpen(true)}
      >
        {/* Image */}
        <div className="relative aspect-[16/9] md:aspect-auto md:h-[36vh] lg:h-[42vh] xl:h-[48vh]">
          <Image
            src={src}
            alt={alt}
            fill
            priority
            sizes="100vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            draggable={false}
          />
          {/* Dark overlay layer */}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-opacity" />
        </div>
      </div>

      {/* Fullscreen viewer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm animate-fadeIn flex items-center justify-center"
          onClick={() => setIsOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="absolute top-4 right-4 text-primary-foreground bg-black/60 rounded-full p-2 hover:bg-black transition"
            aria-label="Close"
          >
            <XIcon size={20} />
          </button>

          {/* Image */}
          <div className="relative max-w-6xl w-full h-auto max-h-[90vh]">
            <Image
              src={src}
              alt={alt}
              width={1920} // helps Next optimizations
              height={1080}
              className="object-contain w-full h-auto rounded-md"
              draggable={false}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
