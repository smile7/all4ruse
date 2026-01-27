"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui";
import { DrawerDialog } from "@/components/DialogDrawer";
import { Typography } from "./Typography";

type ConsentLevel = "unknown" | "necessary" | "all";

type CookieConsentContextValue = {
  consent: ConsentLevel;
  acceptAll: () => void;
  acceptNecessary: () => void;
};

const CookieConsentContext = createContext<
  CookieConsentContextValue | undefined
>(undefined);

const CONSENT_COOKIE_NAME = "cookie_consent";

function readConsentFromDocument(): ConsentLevel {
  if (typeof document === "undefined") return "unknown";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE_NAME}=`));
  if (!match) return "unknown";
  const value = match.split("=")[1];
  if (value === "all" || value === "necessary") return value;
  return "unknown";
}

function setConsentCookie(value: Exclude<ConsentLevel, "unknown">) {
  if (typeof document === "undefined") return;
  const maxAgeSeconds = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${CONSENT_COOKIE_NAME}=${value}; Max-Age=${maxAgeSeconds}; Path=/`;
}

export function CookieConsentProvider({
  initialConsent,
  children,
}: {
  initialConsent: ConsentLevel;
  children: React.ReactNode;
}) {
  const [consent, setConsent] = useState<ConsentLevel>(initialConsent);

  // In case the user had a consent cookie set client-side after the server render,
  // re-read it on mount when we are still in the "unknown" state.
  useEffect(() => {
    if (consent !== "unknown") return;
    const fromDocument = readConsentFromDocument();
    if (fromDocument !== "unknown") {
      setConsent(fromDocument);
    }
  }, [consent]);

  const acceptAll = useCallback(() => {
    setConsent("all");
    setConsentCookie("all");
  }, []);

  const acceptNecessary = useCallback(() => {
    setConsent("necessary");
    setConsentCookie("necessary");
  }, []);

  return (
    <CookieConsentContext.Provider
      value={{ consent, acceptAll, acceptNecessary }}
    >
      {children}
      {consent === "unknown" && (
        <CookieBanner
          onAcceptAll={acceptAll}
          onAcceptNecessary={acceptNecessary}
        />
      )}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error(
      "useCookieConsent must be used within CookieConsentProvider",
    );
  }
  return ctx;
}

function CookieBanner({
  onAcceptAll,
  onAcceptNecessary,
}: {
  onAcceptAll: () => void;
  onAcceptNecessary: () => void;
}) {
  const t = useTranslations("General");

  const [open, setOpen] = useState(true);

  return (
    <DrawerDialog
      open={open}
      setOpen={setOpen}
      title={t("cookies")}
      description={t("cookiesDescr")}
    >
      <div className="px-6 pb-4 flex flex-col gap-3">
        <Typography.P className="text-muted-foreground text-xs md:text-sm">
          {t("cookiesDescr")}
        </Typography.P>
        <div className="flex flex-col w-full md:flex-row justify-end gap-4 mt-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => {
              onAcceptNecessary();
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
              onAcceptAll();
              setOpen(false);
            }}
          >
            {t("acceptAll")}
          </Button>
        </div>
      </div>
    </DrawerDialog>
  );
}
