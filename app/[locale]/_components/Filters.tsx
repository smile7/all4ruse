"use client";

import { FilterIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { DatePopover } from "@/components/DatePopover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Input,
  Label,
} from "@/components/ui";
import { useEventFilters } from "@/hooks";

export function EventsFilters() {
  const {
    title,
    setTitle,
    from,
    setFrom,
    to,
    setTo,
    hasFilters,
    appliedFiltersCount,
    clear,
  } = useEventFilters();

  const t = useTranslations("HomePage");

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="filters"
      className="rounded-lg border"
    >
      <AccordionItem value="filters">
        <AccordionTrigger className="p-4 hover:cursor-pointer">
          <span className="inline-flex items-center gap-2">
            <FilterIcon className="size-4" />
            {t("filters")}{" "}
            {appliedFiltersCount ? ` (${appliedFiltersCount})` : ""}
          </span>
        </AccordionTrigger>
        <AccordionContent className="grid border-t p-4">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_10rem_10rem_auto]">
            <div className="relative">
              <Label
                htmlFor="events-title"
                className="text-xs text-muted-foreground"
              >
                {t("title")}
              </Label>
              <Input
                id="events-title"
                placeholder={t("searchTitle")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Изчисти търсене"
                onClick={() => setTitle("")}
                className={`absolute bottom-0 right-0 size-9 rounded-l-none transition-opacity ${
                  title ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <XIcon className="size-4" />
              </Button>
            </div>

            <div className="relative">
              <Label
                htmlFor="events-from"
                className="text-xs text-muted-foreground"
              >
                {t("fromDate")}
              </Label>
              <DatePopover
                id="events-from"
                value={from}
                onChange={(v) => setFrom(v)}
                onClear={() => setFrom(null)}
              />
            </div>

            <div className="relative">
              <Label
                htmlFor="events-to"
                className="text-xs text-muted-foreground"
              >
                {t("toDate")}
              </Label>
              <DatePopover
                id="events-to"
                value={to}
                onChange={(v) => setTo(v)}
                onClear={() => setTo(null)}
              />
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                disabled={!hasFilters}
                onClick={clear}
              >
                {t("clearFilters")}
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
