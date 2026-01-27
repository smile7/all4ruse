"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ScaleIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SidebarGroup,
  SidebarMenuButton,
} from "../ui";

export function NavLegal() {
  const t = useTranslations("HomePage");
  const locale = useLocale();

  const items = [
    {
      name: t("termsOfUse"),
      url: `/${locale}/legal`,
      emoji: "📜",
    },
    {
      name: t("privacyPolicy"),
      url: `/${locale}/privacy-policy`,
      emoji: "🔒",
    },
    {
      name: t("cookiesPolicy"),
      url: `/${locale}/cookies`,
      emoji: "🍪",
    },
  ];

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            className="h-auto flex gap-2 items-center justify-start cursor-pointer"
            closeOnMobile={false}
          >
            <ScaleIcon className="size-4" />
            <span className="text-xs">{t("legal")}</span>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          className="w-(--radix-popper-anchor-width)"
        >
          {items.map((item) => (
            <DropdownMenuItem key={item.url} asChild>
              <Link href={item.url} title={item.name}>
                <span className="mr-2">{item.emoji}</span>
                <span>{item.name}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarGroup>
  );
}
