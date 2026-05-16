import { z } from "zod";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const freeText = z
  .string()
  .catch("")
  .transform((value) => value.trim());

function normalizeDate(value: string) {
  return DATE_PATTERN.test(value) ? value : "";
}

function normalizeTime(value: string) {
  return TIME_PATTERN.test(value) ? value : "";
}

export const aiEventDraftRequestSchema = z.object({
  prompt: z.string().trim().min(10).max(4000),
  generateDescription: z.boolean().default(false),
  locale: z.string().trim().min(2).max(5).default("bg"),
  availableTags: z.array(freeText).catch([]),
});

export const aiEventDraftSchema = z
  .object({
    title: freeText,
    description: freeText,
    address: freeText,
    place: freeText,
    town: freeText,
    startDate: freeText,
    startTime: freeText,
    endDate: freeText,
    endTime: freeText,
    organizers: z
      .array(
        z.object({
          name: freeText,
          link: freeText,
        }),
      )
      .catch([]),
    ticketsLink: freeText,
    fbLink: freeText,
    email: freeText,
    price: freeText,
    phoneNumber: freeText,
    tagSuggestions: z.array(freeText).catch([]),
  })
  .transform((draft) => ({
    ...draft,
    startDate: normalizeDate(draft.startDate),
    startTime: normalizeTime(draft.startTime),
    endDate: normalizeDate(draft.endDate),
    endTime: normalizeTime(draft.endTime),
    organizers: draft.organizers.filter((organizer) => organizer.name !== ""),
    tagSuggestions: Array.from(
      new Set(draft.tagSuggestions.filter((tag) => tag !== "")),
    ),
  }));

export type AiEventDraftRequest = z.infer<typeof aiEventDraftRequestSchema>;
export type AiEventDraft = z.infer<typeof aiEventDraftSchema>;
