"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Cookie } from "lucide-react";

import { useCookieConsent } from "@/components/CookieConsentProvider";
import { DrawerDialog } from "@/components/DialogDrawer";
import { Typography } from "@/components/Typography";
import { Button, SidebarGroup } from "../ui";

export function NavCookiePreferences() {
  const t = useTranslations("General");
  const { consent, acceptAll, acceptNecessary } = useCookieConsent();
  const [open, setOpen] = useState(false);

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <DrawerDialog
        open={open}
        setOpen={setOpen}
        title={t("cookies")}
        description={t("cookiesDescr")}
        showDrawerCancel
        trigger={
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-2 w-full justify-start flex items-center gap-2 text-xs"
          >
            <Cookie className="size-4" />
            {t("cookiePreferences")}
          </Button>
        }
      >
        <div className="px-6 pb-4 flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                acceptNecessary();
                setOpen(false);
              }}
            >
              {t("onlyNecessary")}
            </Button>
            <Button
              variant="default"
              size="sm"
              type="button"
              onClick={() => {
                acceptAll();
                setOpen(false);
              }}
            >
              {t("acceptAll")}
            </Button>
          </div>
        </div>
      </DrawerDialog>
    </SidebarGroup>
  );
}
