"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";

export function LogoutButton() {
  const router = useRouter();
  const t = useTranslations("Profile");

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return <Button onClick={logout}>{t("logout")}</Button>;
}
