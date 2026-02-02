"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";

import { Button } from "../ui";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathName = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations("HomePage");

  const locales = [
    { code: "en", label: "English", flag: "/flags/en.svg" },
    { code: "bg", label: "Български", flag: "/flags/bg.svg" },
    { code: "ro", label: "Română", flag: "/flags/ro.svg" },
    { code: "ua", label: "Українська", flag: "/flags/ua.svg" },
  ];

  const handleChange = (value: string) => {
    if (value !== currentLocale) {
      router.replace(pathName, { locale: value });
    }
  };

  const currentFlag =
    locales.find((l) => l.code === currentLocale)?.flag || "/flags/bg.svg";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <Image
            src={currentFlag}
            alt={currentLocale}
            width={20}
            height={20}
            className="w-5 h-5"
            priority
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="z-100 min-w-[6rem]"
      >
        {locales.map((l) => (
          <DropdownMenuItem
            key={l.code}
            className="cursor-pointer flex items-center gap-2"
            onClick={() => handleChange(l.code)}
          >
            <Image
              src={l.flag}
              alt={l.label}
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <span>{l.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
