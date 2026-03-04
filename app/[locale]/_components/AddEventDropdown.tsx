"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CopyPlusIcon, ListIcon, SquarePlusIcon } from "lucide-react";

type AddEventDropdownProps = {
  locale: string;
  label: string;
  className?: string;
};

export function AddEventDropdown({
  locale,
  label,
  className,
}: AddEventDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const tHome = useTranslations("HomePage");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={className}>{label}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onSelect={(event) => {
            if (pathname?.endsWith("/published-events")) {
              // Already on this page — let Radix close naturally, no navigation.
              return;
            }
            event.preventDefault();
            router.push(`/${locale}/published-events`);
          }}
        >
          <CopyPlusIcon />
          {tHome("duplicateExistingEvent")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            router.push(`/${locale}/create`);
          }}
        >
          <SquarePlusIcon />
          {tHome("createNewEvent")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
