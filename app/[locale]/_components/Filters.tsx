"use client";

import { FilterIcon, XIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

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
import { useTags } from "@/hooks/query";
import { TAG_LABELS_BG } from "@/constants";
import type { Tag } from "@/lib/api";

type EventsFiltersProps = {
  filters: ReturnType<typeof useEventFilters>;
};

type ControlledAccordionProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function EventsFilters({
  filters,
  open,
  onOpenChange,
  inDialog,
}: EventsFiltersProps & ControlledAccordionProps & { inDialog?: boolean }) {
  const {
    title,
    setTitle,
    from,
    setFrom,
    to,
    setTo,
    tagIds,
    setTagIds,
    freeOnly,
    setFreeOnly,
    hasFilters,
    appliedFiltersCount,
    clear,
  } = filters;

  const t = useTranslations("HomePage");
  const tCreate = useTranslations("CreateEvent");
  const locale = useLocale();
  const { data: allTags = [] } = useTags();

  const formatLabel = (tag: Tag) => {
    const base = (tag.title ?? "").toUpperCase();
    return locale === "bg" ? (TAG_LABELS_BG[base] ?? base) : base;
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={open !== undefined ? (open ? "filters" : undefined) : undefined}
      onValueChange={(val) => {
        if (onOpenChange) {
          onOpenChange(Boolean(val));
        }
      }}
      className={`rounded-md border bg-secondary ${
        inDialog ? "md:border-none md:bg-background" : ""
      }`}
    >
      <AccordionItem value="filters">
        {!inDialog && (
          <AccordionTrigger
            className={`p-4 hover:cursor-pointer ${
              inDialog ? "md:[&_svg]:hidden" : ""
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <FilterIcon className="size-4" />
              {t("filters")}
              {appliedFiltersCount ? ` (${appliedFiltersCount})` : ""}
            </span>
          </AccordionTrigger>
        )}
        <AccordionContent className="grid border-t p-4 gap-4">
          <div
            className={
              inDialog
                ? "grid gap-4 md:grid-cols-3"
                : "grid gap-4 md:grid-cols-[minmax(0,1fr)_10rem_10rem_auto]"
            }
          >
            <div className={`relative ${inDialog ? "md:col-span-3" : ""}`}>
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
                className={`pr-10 ${inDialog ? "bg-white" : ""}`}
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

          <div className="mt-2">
            <p className="mb-2 text-xs text-muted-foreground">
              {tCreate("tags")}
              {tagIds.length || freeOnly
                ? ` (${tagIds.length + (freeOnly ? 1 : 0)})`
                : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFreeOnly(!freeOnly)}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm transition-colors ${
                  freeOnly
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/60"
                }`}
              >
                <span>#{t("freeEvent")}</span>
              </button>

              {allTags.map((tag) => {
                const selected = tagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      if (selected) {
                        setTagIds(tagIds.filter((id) => id !== tag.id));
                      } else {
                        setTagIds([...tagIds, tag.id]);
                      }
                    }}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm transition-colors ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/60"
                    }`}
                  >
                    <span>#{formatLabel(tag)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
