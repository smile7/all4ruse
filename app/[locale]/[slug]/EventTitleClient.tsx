"use client";
import { useSearchParams } from "next/navigation";
import { Typography } from "@/components/Typography";

export default function EventTitleClient({ fallback }: { fallback: string }) {
  const searchParams = useSearchParams();
  const translatedTitle = searchParams.get("translatedTitle");
  return (
    <Typography.H1 className="text-center flex-1">
      {translatedTitle || fallback}
    </Typography.H1>
  );
}
