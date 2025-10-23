"use client";

import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";

export default function BackButton() {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.back()}
      className="my-2 flex items-center gap-2 hover:underline focus-visible:underline focus-visible:outline-hidden"
      aria-label="Go back"
      variant="ghost"
    >
      <ArrowLeftIcon className="size-4" />
    </Button>
  );
}
