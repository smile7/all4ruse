"use client";

import { useEffect, useState } from "react";
import { ListIcon, LogOutIcon, MoreVerticalIcon, UserIcon } from "lucide-react";
import Link from "next/link";
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
  useSidebar,
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
  const { isMobile, setOpenMobile } = useSidebar();
  const [user, setUser] = useState<SidebarUser>({
    fullName: null,
    avatarUrl: DEFAULT_AVATAR,
  });

  useEffect(() => {
    const loadProfile = async () => {
      const { data: profile } = await getCurrentUserProfile(supabase);

      if (!profile) {
        setUser({ fullName: null, avatarUrl: DEFAULT_AVATAR });
        return;
      }

      setUser({
        fullName: profile.full_name || profile.email || null,
        avatarUrl: profile.avatar_url || DEFAULT_AVATAR,
      });
    };

    loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser({ fullName: null, avatarUrl: DEFAULT_AVATAR });
      } else {
        loadProfile();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const { fullName, avatarUrl } = user;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser({ fullName: null, avatarUrl: DEFAULT_AVATAR });

    router.replace(`/${locale}/auth/login`);
    router.refresh();

    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleNavigate = (path: string) => {
    router.push(path);

    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          className="ring-primary h-auto flex gap-2 items-center justify-center cursor-pointer"
          closeOnMobile={false}
        >
          <Avatar>
            <AvatarImage src={DEFAULT_AVATAR} alt={fullName || "Avatar"} />
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
            <DropdownMenuItem asChild>
              <Link
                href={`/${locale}/published-events`}
                onClick={() => {
                  if (isMobile) {
                    setOpenMobile(false);
                  }
                }}
              >
                <ListIcon className="mr-2" />
                {t("publishedEvents")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/${locale}/profile`}
                onClick={() => {
                  if (isMobile) {
                    setOpenMobile(false);
                  }
                }}
              >
                <UserIcon className="mr-2" />
                {t("account")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOutIcon className="text-destructive mr-2" />
              {t("logout")}
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem asChild>
            <Link
              href={`/${locale}/auth/login`}
              onClick={() => {
                if (isMobile) {
                  setOpenMobile(false);
                }
              }}
            >
              {t("loginSignup")}
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
