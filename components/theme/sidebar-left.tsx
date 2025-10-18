import Image from "next/image";
import Link from "next/link";

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
    name: "Откриване на All4Ruse",
    url: "#",
    emoji: "⭐️",
  },
  {
    name: "Орлин Горанов и Акага",
    url: "#",
    emoji: "⭐️",
  },
];

export function SidebarLeft({ еmail }: { еmail?: string | null }) {
  return (
    <aside aria-label="Primary" className="h-screen">
      <Sidebar className="border-r h-full">
        <SidebarHeader>
          <Link
            href="/"
            aria-label="All4Ruse Home"
            className="flex items-center mt-4"
          >
            <Image
              src="/all4ruse.svg"
              alt="All4Ruse logo"
              width={120}
              height={32}
              priority
            />
          </Link>
        </SidebarHeader>
        <SidebarContent>
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
