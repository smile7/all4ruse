"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DatePopover } from "@/components/DatePopover/DatePopover";
import { SubmitButton } from "@/components/SubmitButton";
import { TimePopover } from "@/components/TimePopover/TimePopover";
import { Typography } from "@/components/Typography";
import { ErrorAlert, Input, Label, Textarea } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

import { createEventAction } from "../actions";

type CreateEventActionState = { error: string | null };
const initialState: CreateEventActionState = { error: null };

// TODO: apply react hook form!
export default function CreateEventPage() {
  const [state, formAction] = useActionState(createEventAction, initialState);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/auth/login");
      } else {
        setAuthChecked(true);
      }
    });
  }, [router]);

  if (!authChecked) return <div>Зареждане...</div>;

  return (
    <div className="flex flex-col gap-6">
      <Typography.H1>Създай Събитие</Typography.H1>
      <form action={formAction} className="space-y-6">
        <div className="space-y-2">
          <label className="font-medium">Заглавие *</label>
          <Input name="title" required placeholder="Въведете заглавие" />
        </div>

        <div className="space-y-2">
          <Label className="font-medium">Описание *</Label>
          <Textarea
            name="description"
            required
            placeholder="Опишете събитието"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="font-medium">Адрес *</Label>
            <Input name="address" required placeholder="Въведете точен адрес" />
          </div>
          <div className="space-y-2">
            <Label className="font-medium">Населено място *</Label>
            <Input name="town" required placeholder="Въведете населено място" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label className="font-medium">Начална дата *</Label>
            <DatePopover
              id="startDate"
              value={startDate || null}
              onChange={(v) => setStartDate(v ?? "")}
              onClear={() => setStartDate("")}
            />
            <input type="hidden" name="startDate" value={startDate} />
          </div>
          <div className="space-y-2">
            <Label className="font-medium">Начален час *</Label>
            <TimePopover
              id="startTime"
              value={startTime || null}
              onChange={(v) => setStartTime(v ?? "")}
            />
            <input type="hidden" name="startTime" value={startTime} />
          </div>
          <div className="space-y-2">
            <Label className="font-medium">Крайна дата *</Label>
            <DatePopover
              id="endDate"
              value={endDate || null}
              onChange={(v) => setEndDate(v ?? "")}
              onClear={() => setEndDate("")}
            />
            <input type="hidden" name="endDate" value={endDate} />
          </div>
          <div className="space-y-2">
            <Label className="font-medium">Краен час *</Label>
            <TimePopover
              id="endTime"
              value={endTime || null}
              onChange={(v) => setEndTime(v ?? "")}
            />
            <input type="hidden" name="endTime" value={endTime} />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Организатор *</Label>
            <Input
              name="organizer"
              required
              placeholder="Въведете организатор"
            />
          </div>
          <div className="space-y-2">
            <Label>Картинка *</Label>
            <Input
              name="image"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              required
            />
          </div>
        </div>

        <Label className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-3">
          <input
            type="checkbox"
            name="isFree"
            value="on"
            className="size-4 accent-primary"
          />
          <span className="font-medium">Безплатно събитие</span>
        </Label>

        {state.error && <ErrorAlert error={state.error} className="mt-4" />}

        <div className="flex justify-end">
          <SubmitButton>Създай събитие</SubmitButton>
        </div>
      </form>
    </div>
  );
}
