"use client";

import Image from "next/image";
import { useLocale } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const locales = [
  { code: "en", label: "EN", flag: "/flags/en.svg" },
  { code: "bg", label: "БГ", flag: "/flags/bg.svg" },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathName = usePathname();
  const currentLocale = useLocale();

  const handleChange = (value: string) => {
    router.replace(pathName, { locale: value });
  };

  const currentFlag =
    locales.find((l) => l.code === currentLocale)?.flag || "/flags/bg.svg";

  return (
    <Select value={currentLocale} onValueChange={handleChange}>
      <SelectTrigger className="w-24 cursor-pointer">
        <SelectValue asChild>
          <span className="flex items-center gap-2">
            <Image
              src={currentFlag}
              alt={currentLocale}
              width={5}
              height={5}
              className="w-5 h-5"
            />
            <span>{currentLocale.toUpperCase()}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {locales.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            <span className="flex cursor-pointer items-center gap-2">
              <Image
                src={l.flag}
                alt={l.label}
                width={5}
                height={5}
                className="w-5 h-5"
              />
              <span>{l.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
