"use client";

import * as React from "react";

import { Input } from "@/components/ui";
import { cn } from "@/lib/utils";

type TimePickerProps = {
  value: string | null;
  onChange: (value: string | null) => void;
  id?: string;
  stepSeconds?: number;
  className?: string;
};

export function TimePopover({
  value,
  onChange,
  id,
  stepSeconds = 60,
  className,
}: TimePickerProps) {
  return (
    <Input
      type="time"
      id={id}
      value={value ?? ""}
      step={stepSeconds}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v ? v : null);
      }}
      className={cn(
        "bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-clear-button]:hidden",
        className
      )}
    />
  );
}
