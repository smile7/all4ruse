import { z } from "zod";

import type { TablesInsert } from "./database.types";

type EventInsert = TablesInsert<"events">;

export const eventFields = [
  "title",
  "description",
  "address",
  "organizer",
  "town",
  "startDate",
  "startTime",
  "endDate",
  "endTime",
] as const satisfies readonly (keyof EventInsert)[];

export type EventField = (typeof eventFields)[number];

const baseEventSchema = z.object(
  Object.fromEntries(
    eventFields.map((k) => [k, z.string().min(1, "Задължително поле")])
  ) as { [K in EventField]: z.ZodString }
);

export const createEventSchema = baseEventSchema
  .extend({
    image: z.union([z.instanceof(File), z.string().url()]).optional(),
  })
  .superRefine((data, ctx) => {
    const { startDate, startTime, endDate, endTime } = data;

    if (endDate < startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "Крайната дата трябва да е след началната.",
      });
      return;
    }

    if (endDate === startDate && endTime <= startTime) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "Крайният час трябва да е след началния.",
      });
    }
  });

export type CreateEventSchemaType = z.infer<typeof createEventSchema>;

export const defaultEventValues: Record<EventField, string> =
  Object.fromEntries(eventFields.map((k) => [k, ""])) as Record<
    EventField,
    string
  >;
