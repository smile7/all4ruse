"use client";

import { useEffect, useState } from "react";
import { LogOutIcon, MoreVerticalIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { createClient } from "@/lib/supabase/client";

import {
  Avatar,
  AvatarFallback,
  Badge,
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
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!initialEmail) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          setEmail(data.user.email ?? null);
          setRole((data.user.user_metadata?.role as string) || "user");
        }
      });
    } else {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          setRole((data.user.user_metadata?.role as string) || "user");
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
        <SidebarMenuButton className="h-auto items-start gap-2 cursor-pointer">
          <Avatar>
            <AvatarFallback>
              {email ? email.charAt(0).toUpperCase() : "?"}
            </AvatarFallback>
          </Avatar>
          <span className="inline-flex flex-col gap-1 truncate">
            <span className="truncate">{email || t("guest")}</span>
            {email && (
              <div className="flex items-center gap-2">
                <Badge className="uppercase" variant="default">
                  {role || "user"}
                </Badge>
              </div>
            )}
          </span>
          <MoreVerticalIcon className="mt-1 ml-auto" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top">
        {email ? (
          <DropdownMenuItem onClick={handleLogout}>
            <LogOutIcon className="mr-2" />
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
