"use client";

import { useMemo, useState } from "react";
import { Clock } from "lucide-react";

import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
} from "@/components/ui";
import { cn } from "@/lib/utils";

type TimePickerProps = {
  value: string | null;
  onChange: (value: string | null) => void;
  id?: string;
  placeholder?: string;
  intervalMinutes?: number; // default 30
};

export function TimePopover({
  value,
  onChange,
  id,
  placeholder = "Избери час",
  intervalMinutes = 30,
}: TimePickerProps) {
  const [open, setOpen] = useState(false);

  const times = useMemo(() => {
    const list: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += intervalMinutes) {
        list.push(
          `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
        );
      }
    }
    return list;
  }, [intervalMinutes]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id={id}
          className="flex w-full justify-start px-3 text-left font-normal"
        >
          <Clock className="mr-2 h-4 w-4 opacity-60" />
          <span className={cn("truncate", !value && "opacity-60")}>
            {value ?? placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-48 p-0"
        align="start"
        side="bottom"
        collisionPadding={{ top: 16, bottom: 16 }}
      >
        <ScrollArea className="h-64">
          <ul className="divide-y">
            {times.map((t) => (
              <li key={t}>
                <button
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-sm text-left hover:bg-accent",
                    value === t && "bg-accent font-medium"
                  )}
                  onClick={() => {
                    onChange(t);
                    setOpen(false);
                  }}
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
        {value && (
          <div className="p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => onChange(null)}
            >
              Изчисти
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
