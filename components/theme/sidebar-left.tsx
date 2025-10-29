"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

import { SidebarCustomMenu } from "../SidebarCustomMenu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "../ui";

import { SidebarUserMenu } from "./sidebar-user-menu";
import { NavFavorites } from ".";

const favorites = [
  {
    name: "Арт Ателие с Ема Йорданова",
    url: "#",
    emoji: "⭐️",
  },
  {
    name: "Best of Гошо и Джовани",
    url: "#",
    emoji: "⭐️",
  },
];

export function SidebarLeft({ еmail }: { еmail?: string | null }) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? systemTheme : theme;
  const logoSrc =
    currentTheme === "dark" ? "/logo_white.png" : "/logo_black.png";

  return (
    <aside aria-label="Primary" className="h-screen">
      <Sidebar className="border-r h-full">
        <SidebarHeader>
          <Link
            href="/"
            aria-label="All4Ruse Home"
            className={cn("hidden md:flex items-center justify-center mt-4")}
          >
            {mounted ? (
              <Image
                src={logoSrc}
                alt="All4Ruse logo"
                width={70}
                height={30}
                priority
              />
            ) : null}
          </Link>
        </SidebarHeader>
        <SidebarContent className="mt-8 md:mt-0">
          <SidebarCustomMenu />
          <NavFavorites favorites={favorites} />
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarUserMenu initialEmail={еmail ?? null} />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </aside>
  );
}
