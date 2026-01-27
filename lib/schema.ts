import { z } from "zod";

import type { TablesInsert } from "./database.types";

export type EventInsert = TablesInsert<"events">;

export const organizerSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("requiredField")),
    link: z
      .string()
      .url({ message: t("invalidUrl") })
      .optional()
      .or(z.literal("")),
  });

export const createEventSchema = (t: (key: string) => string) =>
  z
    .object({
      title: z.string().min(1, t("requiredField")),
      description: z.string().min(1, t("requiredField")),
      address: z.string().min(1, t("requiredField")),
      place: z.string().min(1, t("requiredField")),
      town: z.string().min(1, t("requiredField")),
      startDate: z.string().min(1, t("requiredField")),
      startTime: z.string().min(1, t("requiredField")),
      endDate: z.string().min(1, t("requiredField")),
      endTime: z.string().min(1, t("requiredField")),
      organizers: z.array(organizerSchema(t)).min(1, t("atLeastOneOrganizer")),
      ticketsLink: z.string().optional().or(z.literal("")),
      fbLink: z.string().optional().or(z.literal("")),
      email: z
        .string()
        .email({ message: t("invalidEmail") })
        .optional()
        .or(z.literal("")),
      price: z.string().optional().or(z.literal("")),
      phoneNumber: z.string().optional().or(z.literal("")),
      image: z.instanceof(File).optional(),
      images: z.array(z.instanceof(File)).optional(),
      tags: z.array(z.number()).min(1, t("atLeastOneTag")).default([]),
    })
    .superRefine((data, ctx) => {
      if (data.endDate < data.startDate) {
        ctx.addIssue({
          code: "custom",
          path: ["endDate"],
          message: t("endDateAfterStartDate"),
        });
        return;
      }
      if (data.endDate === data.startDate && data.endTime <= data.startTime) {
        ctx.addIssue({
          code: "custom",
          path: ["endTime"],
          message: t("endTimeAfterStartTime"),
        });
      }
    });

export type CreateEventSchemaType = z.infer<
  ReturnType<typeof createEventSchema>
>;

export const defaultEventValues = (): CreateEventSchemaType => ({
  title: "",
  description: "",
  address: "",
  place: "",
  town: "Русе",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  organizers: [{ name: "", link: "" }],
  ticketsLink: "",
  fbLink: "",
  email: "",
  price: "",
  phoneNumber: "",
  image: undefined,
  images: [],
  tags: [],
});
