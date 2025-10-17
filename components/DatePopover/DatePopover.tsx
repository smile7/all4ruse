import { useMemo, useState } from "react";
import { formatISO9075, isValid, parseISO } from "date-fns";
import { bg } from "date-fns/locale";
import { CalendarIcon, XIcon } from "lucide-react";

import { cn, formatDate } from "@/lib/utils";

import {
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui";

type DatePopoverProps = {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  onClear?: () => void;
  id?: string;
};

export function DatePopover({
  value,
  onChange,
  onClear,
  id,
}: DatePopoverProps) {
  const [open, setOpen] = useState(false);

  const date = useMemo(() => {
    if (!value) return undefined;

    try {
      const parsed = parseISO(value);
      return isValid(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }, [value]);

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
            <span className={cn("truncate", !date && "opacity-60")}>
              {value ? formatDate(value) : "Изберете дата"}
            </span>
          </Button>
        </PopoverTrigger>
        {value && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute right-0 bottom-0 rounded-l-none"
            onClick={() => {
              onChange(null);
              onClear?.();
            }}
          >
            <XIcon />
          </Button>
        )}
      </div>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        side="bottom"
        collisionPadding={{ top: 16, bottom: 16 }}
      >
        <Calendar
          mode="single"
          className="max-h-(--radix-popover-content-available-height) overflow-auto"
          selected={date}
          defaultMonth={date}
          locale={bg}
          onSelect={(v) => {
            const formattedDate = v
              ? formatISO9075(new Date(v), { representation: "date" })
              : null;
            onChange(formattedDate);
            if (v) setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
