"use client";

import { useEffect, useState } from "react";
import { LogOutIcon, MoreVerticalIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { createClient } from "@/lib/supabase/client";

import {
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SidebarMenuButton,
} from "../ui";

export function SidebarUserMenu({
  initialEmail,
}: {
  initialEmail: string | null;
}) {
  const t = useTranslations("HomePage");

  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(initialEmail);

  useEffect(() => {
    if (!initialEmail) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          setEmail(data.user.email ?? null);
        }
      });
    }
  }, [initialEmail, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/auth/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton className="ring-primary h-auto flex gap-2 items-center justify-center cursor-pointer">
          <Avatar>
            <AvatarFallback>
              {email ? email.charAt(0).toUpperCase() : t("guest")}
            </AvatarFallback>
          </Avatar>
          <span className="inline-flex flex-col gap-1 truncate">
            <span className="truncate">{email || t("guest")}</span>
          </span>
          <MoreVerticalIcon className="mt-1 ml-auto" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        className="w-(--radix-popper-anchor-width)"
      >
        {email ? (
          <DropdownMenuItem onClick={handleLogout}>
            <LogOutIcon className="text-destructive mr-2" />
            {t("logout")}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => router.push("/auth/login")}>
            {t("loginSignup")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
