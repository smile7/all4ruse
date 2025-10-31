"use client";

import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { formatISO9075, isValid, parseISO } from "date-fns";
import { bg } from "date-fns/locale";
import { CalendarIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn, formatDate } from "@/lib/utils";

import {
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui";

type DatePopoverRangeProps = {
  value: { from: string | null; to: string | null };
  onChange: (val: { from: string; to: string }) => void;
  onClear?: () => void;
  id?: string;
};

export function DatePopoverRange({
  value,
  onChange,
  onClear,
  id,
}: DatePopoverRangeProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("HomePage");

  const fromDate = useMemo(() => {
    if (!value.from) return undefined;
    try {
      const parsed = parseISO(value.from);
      return isValid(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }, [value.from]);

  const toDate = useMemo(() => {
    if (!value.to) return undefined;
    try {
      const parsed = parseISO(value.to);
      return isValid(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }, [value.to]);

  const rangeSelected: DateRange | undefined =
    fromDate && toDate
      ? { from: fromDate, to: toDate }
      : fromDate
        ? { from: fromDate, to: fromDate }
        : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative w-full">
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex w-full justify-start px-3 text-left font-normal select-none"
            id={id}
          >
            <CalendarIcon className="pointer-events-none shrink-0 opacity-50" />
            <span className={cn("truncate", !fromDate && "opacity-60")}>
              {fromDate && toDate
                ? `${formatDate(value.from!)} - ${formatDate(value.to!)}`
                : t("pickDate")}
            </span>
          </Button>
        </PopoverTrigger>
        {fromDate && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute right-0 bottom-0 rounded-l-none"
            onClick={() => {
              onChange({ from: "", to: "" });
              onClear?.();
            }}
          >
            <XIcon />
          </Button>
        )}
      </div>
      <PopoverContent className="w-auto p-0" align="start" side="bottom">
        <Calendar
          mode="range"
          selected={rangeSelected}
          defaultMonth={fromDate}
          locale={bg}
          onSelect={(val) => {
            if (val?.from) {
              const fromStr = formatISO9075(val.from, {
                representation: "date",
              });
              const toStr = val.to
                ? formatISO9075(val.to, { representation: "date" })
                : fromStr;
              onChange({ from: fromStr, to: toStr });
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
