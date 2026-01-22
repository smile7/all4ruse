"use client";

import { useEffect, useState } from "react";
import { ListIcon, LogOutIcon, MoreVerticalIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { DEFAULT_AVATAR } from "@/constants";
import { getCurrentUserProfile } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

import {
  Avatar,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SidebarMenuButton,
} from "../ui";

type SidebarUser = {
  fullName: string | null;
  avatarUrl: string | null;
};

export function SidebarUserMenu() {
  const t = useTranslations("HomePage");
  const locale = useLocale();

  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<SidebarUser>({
    fullName: "",
    avatarUrl: "",
  });

  useEffect(() => {
    (async () => {
      const { data: profile } = await getCurrentUserProfile(supabase);

      if (!profile) {
        setUser({ fullName: null, avatarUrl: null });
        return;
      }

      setUser({
        fullName: profile.full_name || profile.email || null,
        avatarUrl: profile.avatar_url || null,
      });
    })();
  }, [supabase]);

  const { fullName, avatarUrl } = user;

  const handleLogout = async () => {
    await fetch(`/${locale}/auth/signout`, {
      method: "POST",
      credentials: "include",
    });

    router.replace(`/${locale}/auth/login`);
    router.refresh();
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton className="ring-primary h-auto flex gap-2 items-center justify-center cursor-pointer">
          <Avatar>
            <AvatarImage
              src={avatarUrl || DEFAULT_AVATAR}
              alt={fullName || "Avatar"}
            />
          </Avatar>
          <span className="inline-flex flex-col gap-1 truncate">
            <span className="truncate">{fullName || t("guest")}</span>
          </span>
          <MoreVerticalIcon className="ml-auto" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        className="w-(--radix-popper-anchor-width)"
      >
        {fullName ? (
          <>
            <DropdownMenuItem
              onClick={() => router.push(`/${locale}/published-events`)}
            >
              <ListIcon className="mr-2" />
              {t("publishedEvents")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/${locale}/profile`)}>
              <UserIcon className="mr-2" />
              {t("account")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOutIcon className="text-destructive mr-2" />
              {t("logout")}
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem
            onClick={() => router.push(`/${locale}/auth/login`)}
          >
            {t("loginSignup")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
