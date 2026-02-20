import { useEffect, useState } from "react";
import { Button } from "../ui";
import { ArrowUpToLineIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackToTopButton() {
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined") return;
      setIsAtTop(window.scrollY < 200);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Button
      size="icon"
      tabIndex={isAtTop ? -1 : 0}
      variant="outline"
      className={cn(
        "fixed right-4 bottom-22 z-50 size-12 rounded-full shadow-lg transition md:right-6",
        isAtTop && "pointer-events-none translate-y-10 opacity-0",
      )}
      onClick={() => {
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }}
    >
      <ArrowUpToLineIcon className="size-5" />
    </Button>
  );
}
