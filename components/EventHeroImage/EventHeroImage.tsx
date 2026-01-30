"use client";

import React, { useEffect, useState } from "react";
import { XIcon } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type EventHeroImageProps = {
  src: string;
  alt?: string;
  isPast?: boolean;
};

export default function EventHeroImage({
  src,
  alt = "Event image",
  isPast = false,
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
        className={cn(
          "group relative w-full overflow-hidden cursor-zoom-in rounded-md shadow-md hover:shadow-lg transition",
          isPast && "grayscale opacity-60",
        )}
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
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-opacity" />
        </div>
      </div>

      {/* Fullscreen viewer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm animate-fadeIn flex items-center justify-center"
          onClick={() => setIsOpen(false)}
        >
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

          <div
            className="flex items-center justify-center w-full h-full"
            style={{ maxHeight: '90vh', maxWidth: '96vw' }}
          >
            <Image
              src={src}
              alt={alt}
              width={1920}
              height={1080}
              className="object-contain rounded-md"
              style={{
                maxHeight: '90vh',
                maxWidth: '96vw',
                width: 'auto',
                height: 'auto',
                display: 'block',
                margin: 'auto',
                background: 'black',
              }}
              draggable={false}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
