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
  const eventMenuItems = [
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
  const whyAll4RuseItem = {
    name: `${t("menuWhyAll4Ruse")}`,
    url: `/${locale}/why-all4ruse`,
    emoji: "💡",
  };

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden mt-8">
        <SidebarMenu>
          {eventMenuItems.map((item) => (
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
      <SidebarGroup className="group-data-[collapsible=icon]:hidden my-2">
        <div className="px-2 pt-2 pb-1">
          <span className="text-xs font-semibold text-muted-foreground">
            {t("menuWhyAll4RuseTitle")}
          </span>
        </div>
        <SidebarMenu>
          <SidebarMenuItem key={whyAll4RuseItem.name}>
            <SidebarMenuButton asChild>
              <Link href={whyAll4RuseItem.url} title={whyAll4RuseItem.name}>
                <span>{whyAll4RuseItem.emoji}</span>
                <span>{whyAll4RuseItem.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
