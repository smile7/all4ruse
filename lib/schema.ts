import { z } from "zod";

const dateTimeString = z
  .string()
  .min(1, "Field is required")
  .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date/time");

const baseEvent = z.object({
  title: z.string().min(1, "Title required").max(200),
  description: z.string().max(5000).optional().nullable(),
  startDateTime: dateTimeString,
  endDateTime: dateTimeString,
  image: z.string().url().optional().nullable(),
  createdBy: z.string().uuid().optional().nullable(),
});

type HasDateRange = {
  startDateTime?: string | null;
  endDateTime?: string | null;
};

function ensureEndAfterStart<T extends z.ZodType<HasDateRange>>(schema: T): T {
  return schema.refine(
    (v) => {
      if (!v.startDateTime || !v.endDateTime) return true;
      const start = Date.parse(v.startDateTime);
      const end = Date.parse(v.endDateTime);
      if (Number.isNaN(start) || Number.isNaN(end)) return true;
      return end >= start;
    },
    {
      path: ["endDateTime"],
      message: "End must be after start",
    }
  ) as T;
}

export const createEventSchema = ensureEndAfterStart(baseEvent);

export const updateEventSchema = ensureEndAfterStart(baseEvent.partial());

export const eventSchema = ensureEndAfterStart(
  baseEvent.extend({
    id: z.number().int(),
    created_at: z.string(), // stored timestamp string
  })
);

export type Event = z.infer<typeof eventSchema>;
export type CreateEventSchemaType = z.infer<typeof createEventSchema>;
export type UpdateEventSchemaType = z.infer<typeof updateEventSchema>;
