"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { DatePopover } from "@/components/DatePopover/DatePopover";
import { DatePopoverRange } from "@/components/DatePopoverRange";
import { Checkbox, Label } from "@/components/ui";

type EventDateSelectorProps = {
  startValue: string | null;
  endValue: string | null;
  onChange: (start: string, end: string) => void;
};

export function EventDateSelector({
  startValue,
  endValue,
  onChange,
}: EventDateSelectorProps) {
  const t = useTranslations("CreateEvent");
  const [multiDay, setMultiDay] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      {!multiDay ? (
        <DatePopover
          value={startValue}
          onChange={(val) => {
            onChange(val, val); // if single-day, set endDate same as startDate
          }}
          onClear={() => onChange("", "")}
        />
      ) : (
        <DatePopoverRange
          value={{ from: startValue, to: endValue }}
          onChange={(val: { from: string; to: string }) => {
            onChange(val.from, val.to);
          }}
          onClear={() => onChange("", "")}
        />
      )}
      <div className="flex items-center gap-2">
        <Checkbox
          id="multiDay"
          checked={multiDay}
          onCheckedChange={(val) => {
            setMultiDay(!!val);
            if (!val && startValue) {
              onChange(startValue, startValue);
            }
          }}
        />
        <Label htmlFor="multiDay">{t("rangeDateCheckbox")}</Label>
      </div>
    </div>
  );
}
