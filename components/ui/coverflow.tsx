"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

import { Button } from "./button";

export type CoverFlowItem = {
  id: string | number;
  image: string;
  title: string;
  subtitle?: string;
};

type CoverFlowProps = {
  items: CoverFlowItem[];
  className?: string;
  itemWidth?: number;
  itemHeight?: number;
  gap?: number;
  stackSpacing?: number;
  initialIndex?: number;
  autoPlayMs?: number;
  onIndexChange?: (index: number) => void;
};

function getWrappedOffset(
  index: number,
  activeIndex: number,
  total: number,
): number {
  const forward = (index - activeIndex + total) % total;
  const backward = forward - total;

  return Math.abs(forward) <= Math.abs(backward) ? forward : backward;
}

export function CoverFlow({
  items,
  className,
  itemWidth = 280,
  itemHeight = 360,
  gap = 170,
  stackSpacing = 24,
  initialIndex = 0,
  autoPlayMs = 4200,
  onIndexChange,
}: CoverFlowProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(() => {
    if (items.length === 0) {
      return 0;
    }

    return Math.min(Math.max(initialIndex, 0), items.length - 1);
  });
  const [isPaused, setIsPaused] = useState(false);

  const jumpTo = useCallback(
    (index: number) => {
      if (items.length === 0) {
        return;
      }

      const normalized = ((index % items.length) + items.length) % items.length;
      setActiveIndex(normalized);
    },
    [items.length],
  );

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    setActiveIndex((current) => Math.min(current, items.length - 1));
  }, [items.length]);

  useEffect(() => {
    if (items.length < 2 || autoPlayMs <= 0 || isPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, autoPlayMs);

    return () => window.clearInterval(timer);
  }, [autoPlayMs, isPaused, items.length]);

  useEffect(() => {
    if (items.length > 0) {
      onIndexChange?.(activeIndex);
    }
  }, [activeIndex, items.length, onIndexChange]);

  if (items.length === 0) {
    return null;
  }

  const activeItem = items[activeIndex];
  const canvasHeight = itemHeight + 100;

  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="relative w-full"
        style={{
          height: canvasHeight,
          perspective: 1600,
        }}
        role="region"
        aria-label="Festival coverflow"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            jumpTo(activeIndex - 1);
          }

          if (event.key === "ArrowRight") {
            event.preventDefault();
            jumpTo(activeIndex + 1);
          }
        }}
      >
        <div className="absolute inset-x-0 top-0 bottom-16 flex items-center justify-center">
          {items.map((item, index) => {
            const offset = getWrappedOffset(index, activeIndex, items.length);
            const absOffset = Math.abs(offset);

            if (absOffset > 3) {
              return null;
            }

            const translateX =
              offset * gap +
              (absOffset > 1
                ? Math.sign(offset) * (absOffset - 1) * stackSpacing
                : 0);
            const rotateY =
              offset === 0
                ? 0
                : -Math.sign(offset) * Math.min(28 + absOffset * 14, 58);
            const scale = absOffset === 0 ? 1 : absOffset === 1 ? 0.84 : 0.68;
            const opacity =
              absOffset === 0
                ? 1
                : absOffset === 1
                  ? 0.78
                  : absOffset === 2
                    ? 0.42
                    : 0.16;

            return (
              <motion.button
                key={item.id}
                type="button"
                className="absolute left-1/2 top-1/2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                style={{
                  width: itemWidth,
                  height: itemHeight,
                  marginLeft: -(itemWidth / 2),
                  marginTop: -(itemHeight / 2),
                  zIndex: 100 - absOffset,
                  transformStyle: "preserve-3d",
                }}
                initial={false}
                animate={
                  shouldReduceMotion
                    ? {
                        x: translateX,
                        scale,
                        opacity,
                      }
                    : {
                        x: translateX,
                        rotateY,
                        scale,
                        opacity,
                        filter: `brightness(${absOffset === 0 ? 1 : 0.72})`,
                      }
                }
                transition={{
                  type: "spring",
                  stiffness: 210,
                  damping: 24,
                  mass: 0.9,
                }}
                onClick={() => jumpTo(index)}
                aria-label={`Show card ${item.title}`}
              >
                <div className="relative h-full w-full overflow-hidden rounded-[1.65rem] border border-white/12 bg-black shadow-[0_30px_90px_-42px_rgba(0,0,0,0.95)]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes={`${itemWidth}px`}
                    className="object-cover select-none"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,transparent_22%,rgba(0,0,0,0.15)_100%)]" />
                  <div className="absolute inset-0 rounded-[1.65rem] ring-1 ring-white/10" />
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center px-6 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {activeItem.title}
              </h3>
            </motion.div>
          </AnimatePresence>
        </div>

        {items.length > 1 && (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="pointer-events-auto rounded-full border-white/12 bg-background/70 shadow-md backdrop-blur hover:bg-background"
                onClick={() => jumpTo(activeIndex - 1)}
                aria-label="Previous cover"
              >
                <ChevronLeftIcon className="size-5" />
              </Button>
            </div>

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="pointer-events-auto rounded-full border-white/12 bg-background/70 shadow-md backdrop-blur hover:bg-background"
                onClick={() => jumpTo(activeIndex + 1)}
                aria-label="Next cover"
              >
                <ChevronRightIcon className="size-5" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
