"use client";

import { useEffect } from "react";

export function ScrollToTopOnMount() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  return null;
}
