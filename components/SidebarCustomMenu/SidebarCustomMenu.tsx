"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui";

export function SidebarCustomMenu() {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  //   const { isMobile } = useSidebar();
  const menuItems = [
    {
      name: `${t("menuEvents")}`,
      url: `/${locale}`,
      emoji: "📅",
    },
    {
      name: `${t("menuCurrentEvents")}`,
      url: `/${locale}/current-events`,
      emoji: "🔥",
    },
    {
      name: `${t("menuPastEvents")}`,
      url: `/${locale}/past-events`,
      emoji: "⏮",
    },
  ];

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden mt-8">
      <SidebarMenu>
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <Link href={item.url} title={item.name}>
                <span>{item.emoji}</span>
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
