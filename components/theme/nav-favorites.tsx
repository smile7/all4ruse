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

import { useFavorites } from "./favorites-provider";
export function NavFavorites() {
  const t = useTranslations("HomePage");
  const { isMobile } = useSidebar();
  const { favorites, removeFavorite } = useFavorites();

  if (!favorites.length) {
    return null;
  }

  const handleCopyLink = async (url: string) => {
    const absoluteUrl =
      typeof window !== "undefined" && !url.startsWith("http")
        ? `${window.location.origin}${url}`
        : url;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(absoluteUrl);
      }
    } catch (error) {
      console.error("Failed to copy link", error);
    }
  };

  const handleOpenNewTab = (url: string) => {
    const absoluteUrl =
      typeof window !== "undefined" && !url.startsWith("http")
        ? `${window.location.origin}${url}`
        : url;
    try {
      window.open(absoluteUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to open link", error);
    }
  };

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
                <DropdownMenuItem onClick={() => handleCopyLink(item.url)}>
                  <Link className="text-muted-foreground" />
                  <span>{t("copyLink")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenNewTab(item.url)}>
                  <ArrowUpRight className="text-muted-foreground" />
                  <span>{t("openNewTab")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => removeFavorite(item.id)}>
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
