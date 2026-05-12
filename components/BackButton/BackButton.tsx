"use client";

import { ChevronLeftIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";

export default function BackButton() {
  const locale = useLocale();
  const router = useRouter();

  function handleClick() {
    const referrer = document.referrer;
    const isInternalReferrer =
      referrer && new URL(referrer).origin === window.location.origin;

    if (isInternalReferrer) {
      router.back();
      return;
    }

    router.push(`/${locale}`);
  }

  return (
    <Button
      onClick={handleClick}
      className="my-2 rounded-full"
      aria-label="Go back"
      variant="outline"
      size="icon"
    >
      <ChevronLeftIcon className="size-4" />
    </Button>
  );
}
