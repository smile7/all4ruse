"use client";

import { ArrowUpRight, Link, MoreHorizontal, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui";

export function NavFavorites({
  favorites,
}: {
  favorites: {
    name: string;
    url: string;
    emoji: string;
  }[];
}) {
  const t = useTranslations("HomePage");
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{t("favorites")}</SidebarGroupLabel>
      <SidebarMenu>
        {favorites.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={item.url} title={item.name}>
                <span>{item.emoji}</span>
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild className="cursor-pointer">
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">{t("more")}</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-md"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <Link className="text-muted-foreground" />
                  <span>{t("copyLink")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ArrowUpRight className="text-muted-foreground" />
                  <span>{t("openNewTab")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Trash2 className="text-muted-foreground" />
                  <span>{t("removeFavorites")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
