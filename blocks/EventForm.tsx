"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useFieldArray, useForm, useFormContext } from "react-hook-form";
import { ChevronDownIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";

import { EventDateSelector } from "@/app/[locale]/_components";
import { AspectRatio } from "@/components/AspectRatio";
import { DrawerDialog } from "@/components/DialogDrawer";
import { validateAndUploadEventImageClient } from "@/app/[locale]/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { TimePopover } from "@/components/TimePopover";
import { Typography } from "@/components/Typography";
import {
  Button,
  Card,
  CardContent,
  ErrorAlert,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  WarningAlert,
} from "@/components/ui";
import { MinimalTiptapEditor } from "@/components/ui/minimal-tiptap";
import { EVENTS_BUCKET, TAG_LABELS_BG } from "@/constants";
import {
  useCreateEvent,
  useDeleteEvent,
  useTags,
  useUpdateEvent,
} from "@/hooks/query";
import type { Event, EventUpdate, Host, Tag } from "@/lib/api";
import { createEventSchema, type CreateEventSchemaType } from "@/lib/schema";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";

type EventFormProps = {
  mode: "create" | "edit";
  event?: Event | null;
};

type EventImageItem = {
  id: string;
  url: string;
  file?: File;
  isNew: boolean;
};

const MAX_IMAGES = 10;

export function EventForm({ mode, event }: EventFormProps) {
  const t = useTranslations("CreateEvent");
  const locale = useLocale();

  const [authChecked, setAuthChecked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [imagesLimitExceeded, setImagesLimitExceeded] = useState(false);
  const [imageSizeExceeded, setImageSizeExceeded] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [images, setImages] = useState<EventImageItem[]>(() => {
    if (!event) return [];

    const initial: EventImageItem[] = [];
    if (event.image) {
      initial.push({
        id: "existing-cover",
        url: event.image,
        isNew: false,
      });
    }

    if (Array.isArray(event.images)) {
      (event.images as string[]).forEach((url, idx) => {
        initial.push({
          id: `existing-${idx}`,
          url,
          isNew: false,
        });
      });
    }

    return initial.slice(0, MAX_IMAGES);
  });

  const router = useRouter();
  const supabase = createClient();

  const { data: allTags = [] } = useTags();

  const {
    mutateAsync: createEventMutate,
    isPending: isCreating,
    error: createError,
  } = useCreateEvent();
  const {
    mutateAsync: updateEventMutate,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateEvent();
  const { mutateAsync: deleteEventMutate, isPending: isDeleting } =
    useDeleteEvent();

  const isPending = isCreating || isUpdating || isDeleting;
  const error = createError ?? updateError;

  const defaultValues: CreateEventSchemaType = event
    ? {
        title: event.title ?? "",
        description: event.description ?? "",
        address: event.address ?? "",
        place: event.place ?? "",
        town: event.town ?? "Русе",
        startDate: event.startDate ?? "",
        startTime: (event.startTime ?? "").slice(0, 5),
        endDate: event.endDate ?? "",
        endTime: (event.endTime ?? "").slice(0, 5),
        organizers: (event.organizers as Host[]) ?? [{ name: "", link: "" }],
        ticketsLink: event.ticketsLink ?? "",
        fbLink: event.fbLink ?? "",
        email: event.email ?? "",
        price: event.price ?? "",
        phoneNumber: event.phoneNumber ?? "",
        image: undefined,
        images: [],
        tags: [],
      }
    : {
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
      };

  const form = useForm<CreateEventSchemaType>({
    resolver: zodResolver(createEventSchema(t)) as any,
    defaultValues,
  });

  const syncFormImagesFromState = useCallback(() => {
    const newFiles = images
      .filter((i) => i.isNew && i.file)
      .map((i) => i.file as File);

    form.setValue("images", newFiles);

    if (!form.getValues("image") && newFiles[0]) {
      form.setValue("image", newFiles[0]);
    }
  }, [form, images]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      setImages((prev) => {
        const availableSlots = MAX_IMAGES - prev.length;
        if (availableSlots <= 0) {
          setImagesLimitExceeded(true);
          return prev;
        }

        const filesToAdd = acceptedFiles.slice(0, availableSlots);

        if (acceptedFiles.length > filesToAdd.length) {
          setImagesLimitExceeded(true);
        } else {
          setImagesLimitExceeded(false);
        }

        // Size warning: if any rejected file was too large, show warning,
        // otherwise clear it when this drop has no size issues.
        const hasTooLarge = fileRejections?.some((rejection) =>
          rejection.errors?.some(
            (error: { code: string }) => error.code === "file-too-large",
          ),
        );
        setImageSizeExceeded(Boolean(hasTooLarge));

        const next: EventImageItem[] = [
          ...prev,
          ...filesToAdd.map((file, index) => ({
            id: `new-${Date.now()}-${prev.length + index}`,
            url: URL.createObjectURL(file),
            file,
            isNew: true,
          })),
        ];

        const capped = next.slice(0, MAX_IMAGES);

        const newFiles = capped
          .filter((i) => i.isNew && i.file)
          .map((i) => i.file as File);

        form.setValue("images", newFiles);
        if (!form.getValues("image") && newFiles[0]) {
          form.setValue("image", newFiles[0]);
        }

        return capped;
      });
    },
    [form],
  );

  const removeImage = useCallback(
    (idx: number) => {
      setImages((prev) => {
        const removed = prev[idx];

        if (removed?.isNew && removed.url.startsWith("blob:")) {
          URL.revokeObjectURL(removed.url);
        }

        const next = prev.filter((_, i) => i !== idx);

        if (next.length < MAX_IMAGES) {
          setImagesLimitExceeded(false);
        }

        const newFiles = next
          .filter((i) => i.isNew && i.file)
          .map((i) => i.file as File);

        form.setValue("images", newFiles);
        if (newFiles.length === 0) {
          form.setValue("image", undefined);
        } else if (!next[0].isNew) {
          form.setValue("image", newFiles[0]);
        } else {
          form.setValue("image", next[0].file as File);
        }

        return next;
      });
    },
    [form],
  );

  const makeCover = useCallback(
    (idx: number) => {
      setImages((prev) => {
        if (idx === 0) return prev;

        const next = [...prev];
        const [item] = next.splice(idx, 1);
        next.unshift(item);

        const newFiles = next
          .filter((i) => i.isNew && i.file)
          .map((i) => i.file as File);
        form.setValue("images", newFiles);

        if (next[0].isNew && next[0].file) {
          form.setValue("image", next[0].file);
        } else if (newFiles[0]) {
          form.setValue("image", newFiles[0]);
        } else {
          form.setValue("image", undefined);
        }

        return next;
      });
    },
    [form],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/gif": [],
    },
    maxSize: 2 * 1024 * 1024, // 2MB
    multiple: true,
  });

  useEffect(() => {
    if (!event?.id) return;

    supabase
      .from("event_tags")
      .select("tag_id")
      .eq("event_id", event.id)
      .then(({ data, error }) => {
        if (error || !data) return;
        const tagIds = data.map((row: { tag_id: number }) => row.tag_id);
        form.setValue("tags", tagIds);
      });
  }, [event, supabase, form]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/auth/login");
      } else {
        setUserId(data.user.id);

        if (mode === "create") {
          const currentEmail = form.getValues("email") ?? "";
          const userEmail = data.user.email ?? "";

          if (!currentEmail && userEmail) {
            form.setValue("email", userEmail);
          }
        }

        setAuthChecked(true);
      }
    });
  }, [router, supabase, mode, form]);

  const onSubmit = async (values: CreateEventSchemaType) => {
    if (!userId) return;
    setUploadError(null);

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_confirmed")
        .eq("id", userId)
        .maybeSingle();
      const isConfirmed = profile?.is_confirmed === true;

      const newItems = images.filter((i) => i.isNew && i.file);
      const uploadMap = new Map<string, string>();

      for (const item of newItems) {
        const file = item.file as File;
        const url = await validateAndUploadEventImageClient(
          supabase,
          file,
          "events",
          EVENTS_BUCKET,
        );
        if (url) {
          uploadMap.set(item.id, url);
        }
      }

      const orderedUrls: string[] = [];
      for (const item of images.slice(0, MAX_IMAGES)) {
        if (item.isNew) {
          const url = uploadMap.get(item.id);
          if (url) orderedUrls.push(url);
        } else {
          orderedUrls.push(item.url);
        }
      }

      const limitedUrls = orderedUrls.slice(0, MAX_IMAGES);
      const coverUrl = limitedUrls[0] ?? null;
      const galleryUrls = limitedUrls.slice(1);

      const cleanedEndTime =
        values.endTime && values.endTime.trim() !== "" ? values.endTime : null;

      const basePayload = {
        title: values.title,
        description: values.description,
        address: values.address,
        place: values.place,
        town: values.town,
        startDate: values.startDate,
        startTime: values.startTime,
        endDate: values.endDate,
        endTime: cleanedEndTime,
        organizers: values.organizers,
        ticketsLink: values.ticketsLink || null,
        fbLink: values.fbLink || null,
        email: values.email || null,
        price: values.price || null,
        phoneNumber: values.phoneNumber || null,
        image: coverUrl,
        images: galleryUrls.length > 0 ? galleryUrls : null,
      };

      const selectedTagIds = values.tags ?? [];

      if (mode === "create") {
        const result = await createEventMutate({
          ...basePayload,
          isEventActive: isConfirmed,
          slug: `${slugify(values.title)}-${Math.random().toString(36).slice(2, 8)}`,
          createdBy: userId,
        });

        const createdEvent = (result as { data?: Event | null })?.data;

        if (createdEvent?.id && selectedTagIds.length > 0) {
          await supabase.from("event_tags").insert(
            selectedTagIds.map((tagId) => ({
              event_id: createdEvent.id,
              tag_id: tagId,
            })),
          );
        }

        if (createdEvent?.slug) {
          router.push(`/${locale}/${createdEvent.slug}`);
          return;
        }
      } else if (mode === "edit" && event) {
        const patch: EventUpdate = {
          ...basePayload,
          slug: event.slug,
        };

        await updateEventMutate({
          id: event.id,
          slug: event.slug || "",
          patch,
        });

        // replace existing tags with the newly selected ones
        await supabase.from("event_tags").delete().eq("event_id", event.id);

        if (selectedTagIds.length > 0) {
          await supabase.from("event_tags").insert(
            selectedTagIds.map((tagId) => ({
              event_id: event.id,
              tag_id: tagId,
            })),
          );
        }
      }

      router.push("/");
    } catch (err) {
      // Surface any upload or mutation error to the user instead of letting the promise reject silently
      console.error(err);
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Възникна грешка при записването на събитието. Моля, опитайте отново.";
      setUploadError(message);
    }
  };

  const handleDelete = async () => {
    if (mode !== "edit" || !event?.id) return;

    await deleteEventMutate(event.id);
    router.push("/");
  };

  useEffect(() => {
    syncFormImagesFromState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (showLeaveDialog) return;
      if (isPending) return;
      if (!form.formState.isDirty) return;

      const target = event.target as HTMLElement | null;
      if (!target) return;

      const link = target.closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href || !href.startsWith("/")) return;

      const linkTarget = link.getAttribute("target");
      if (linkTarget && linkTarget !== "_self") return;

      event.preventDefault();
      event.stopPropagation();

      setNextUrl(href);
      setShowLeaveDialog(true);
    };

    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [form.formState.isDirty, isPending, showLeaveDialog]);

  if (!authChecked) return null;

  return (
    <Card>
      <CardContent className="flex flex-col gap-6 p-6">
        <Typography.H1>
          {mode === "create" ? t("createEventTitle") : t("editEventTitle")}
        </Typography.H1>

        {uploadError && <ErrorAlert error={uploadError} />}
        {error && <ErrorAlert error={error.message} />}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit as any)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{t("title")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("enterTitle")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{t("description")}</FormLabel>
                  <FormControl>
                    <MinimalTiptapEditor
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      className="w-full"
                      editorContentClassName="p-5"
                      showLinkBubbleMenu={false}
                      output="html"
                      placeholder={t("enterDescription")}
                      editable
                      editorClassName="focus:outline-hidden h-80 overflow-auto"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{t("address")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("enterAddress")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="place"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{t("place")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("enterPlace")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="town"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{t("town")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{t("tags")}</FormLabel>
                  {(() => {
                    const selectedIds: number[] = field.value ?? [];
                    const selectedTags = allTags.filter((tag) =>
                      selectedIds.includes(tag.id),
                    );
                    const availableTags = allTags.filter(
                      (tag) => !selectedIds.includes(tag.id),
                    );

                    const formatLabel = (tag: Tag) => {
                      const base = (tag.title ?? "").toUpperCase();
                      return locale === "bg"
                        ? (TAG_LABELS_BG[base] ?? base)
                        : base;
                    };

                    return (
                      <>
                        {availableTags.length > 0 ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <button
                                  type="button"
                                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:cursor-pointer"
                                >
                                  <span>
                                    {t("tags")}
                                    {selectedTags.length > 0
                                      ? ` (${selectedTags.length})`
                                      : ""}
                                  </span>
                                  <span className="text-xs opacity-50">
                                    <ChevronDownIcon />
                                  </span>
                                </button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              align="start"
                              className="w-[var(--radix-popover-trigger-width)] max-w-sm p-2"
                            >
                              <div className="max-h-52 space-y-1 overflow-auto">
                                {availableTags.map((tag) => (
                                  <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => {
                                      if (!selectedIds.includes(tag.id)) {
                                        field.onChange([
                                          ...selectedIds,
                                          tag.id,
                                        ]);
                                      }
                                    }}
                                    className="flex w-full items-center justify-between rounded-md px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground hover:cursor-pointer"
                                  >
                                    <span className="truncate">
                                      # {formatLabel(tag)}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                        ) : (
                          allTags.length === 0 && (
                            <Typography.Small>
                              {t("noTagsAvailable")}
                            </Typography.Small>
                          )
                        )}

                        {selectedTags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {selectedTags.map((tag) => (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() =>
                                  field.onChange(
                                    selectedIds.filter((id) => id !== tag.id),
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground shadow-sm hover:bg-primary/90 hover:cursor-pointer transition-colors"
                              >
                                <span># {formatLabel(tag)}</span>
                                <span className="text-xs" aria-hidden="true">
                                  ×
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="startDate"
                render={() => (
                  <FormItem>
                    <FormLabel isRequired>{t("eventDate")}</FormLabel>
                    <FormControl>
                      <EventDateSelector
                        startValue={form.watch("startDate")}
                        endValue={form.watch("endDate")}
                        onChange={(start, end) => {
                          form.setValue("startDate", start);
                          form.setValue("endDate", end);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{t("fromTime")}</FormLabel>
                    <FormControl>
                      <TimePopover
                        id="startTime"
                        value={field.value}
                        onChange={(v) => field.onChange(v ?? "")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("toTime")}</FormLabel>
                    <FormControl>
                      <TimePopover
                        id="endTime"
                        value={field.value}
                        onChange={(v) => field.onChange(v ?? "")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormItem>
              <FormControl>
                <OrganizersFieldArray />
              </FormControl>
              <FormMessage />
            </FormItem>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="ticketsLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("ticketsLink")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("enterTicketsLink")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fbLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fbLink")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("enterFbLink")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("phoneNumber")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("enterPhoneNumber")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("enterEmail")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("price")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("enterPrice")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormItem>
              <FormLabel>{t("images")}</FormLabel>
              <FormControl>
                <div
                  {...getRootProps({
                    className:
                      "border-2 border-dashed rounded-md p-6 cursor-pointer text-center " +
                      (isDragActive
                        ? "bg-gray-100 border-blue-500"
                        : "border-gray-300"),
                  })}
                >
                  <input {...getInputProps({ name: "image" })} />
                  {isDragActive ? (
                    <Typography.P>{t("uploadImageDrop")}</Typography.P>
                  ) : (
                    <>
                      <Typography.P>{t("uploadImages")}</Typography.P>
                      <Typography.Small className="mt-2 block text-muted-foreground">
                        {t("uploadImagesInfo")}
                      </Typography.Small>
                    </>
                  )}
                </div>
              </FormControl>
              {(imagesLimitExceeded || imageSizeExceeded) && (
                <WarningAlert
                  className="mt-3"
                  warning={
                    imagesLimitExceeded
                      ? t("maxImagesExceeded")
                      : t("maxImageSizeExceeded")
                  }
                />
              )}

              {images.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="relative group w-full max-w-[18rem] mx-auto">
                    <AspectRatio ratio={6 / 9}>
                      <Image
                        src={images[0].url}
                        alt="Cover image"
                        fill
                        sizes="600px"
                        className="rounded-md object-cover"
                      />
                    </AspectRatio>

                    <button
                      type="button"
                      aria-label="Remove image"
                      onClick={() => removeImage(0)}
                      className="absolute top-2 right-2 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white hover:opacity-80"
                    >
                      ×
                    </button>

                    <span className="absolute bottom-2 left-2 rounded-md bg-blue-600/80 px-2 py-1 text-xs text-white">
                      {t("cover")}
                    </span>
                  </div>

                  {/* Other images as horizontal thumbnails */}
                  {images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {images.slice(1).map((item, idx) => {
                        const originalIndex = idx + 1;
                        return (
                          <div
                            key={item.id}
                            className="relative group shrink-0 w-64"
                          >
                            <AspectRatio ratio={4 / 3}>
                              <Image
                                src={item.url}
                                alt="image"
                                fill
                                sizes="256px"
                                className="rounded-md object-cover"
                              />
                            </AspectRatio>

                            <button
                              type="button"
                              aria-label="Remove image"
                              onClick={() => removeImage(originalIndex)}
                              className="absolute top-2 right-2 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white hover:opacity-80"
                            >
                              ×
                            </button>

                            <button
                              type="button"
                              aria-label="Make cover"
                              onClick={() => makeCover(originalIndex)}
                              className="absolute bottom-2 right-2 inline-flex h-6 items-center justify-center rounded-md bg-blue-600/80 px-2 text-[10px] text-white hover:bg-blue-600"
                            >
                              {t("makeCover")}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              <FormMessage />
            </FormItem>

            {Boolean(error) && (
              <ErrorAlert
                error={error instanceof Error ? error.message : t("error")}
                className="mt-4"
              />
            )}

            <div className="flex justify-end gap-3">
              {mode === "edit" && event?.id && (
                <DrawerDialog
                  title={t("deleteEventTitle")}
                  description={t("confirmDeleteEvent")}
                  showDrawerCancel
                  trigger={
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending}
                      isLoading={isPending}
                      className="border-destructive text-destructive hover:bg-destructive/10"
                    >
                      {t("deleteEventTitle")}
                    </Button>
                  }
                >
                  <div className="flex justify-end gap-3 pb-4">
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={isPending}
                      isLoading={isPending}
                      onClick={handleDelete}
                    >
                      {t("deleteEventTitle")}
                    </Button>
                  </div>
                </DrawerDialog>
              )}
              <SubmitButton
                disabled={form.formState.isSubmitting || isPending}
                isLoading={isPending}
              >
                {t("submitButton")}
              </SubmitButton>
            </div>
          </form>
        </Form>

        <DrawerDialog
          open={showLeaveDialog}
          setOpen={setShowLeaveDialog}
          title={t("unsavedChangesTitle")}
          description={t("unsavedChangesDescription")}
        >
          <div className="flex justify-end gap-2 pb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowLeaveDialog(false);
                setNextUrl(null);
              }}
            >
              {t("unsavedChangesCancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setShowLeaveDialog(false);
                if (!nextUrl) return;

                const destination = nextUrl;
                setNextUrl(null);
                router.push(destination);
              }}
            >
              {t("unsavedChangesConfirm")}
            </Button>
          </div>
        </DrawerDialog>
      </CardContent>
    </Card>
  );
}

function OrganizersFieldArray({ disabled }: { disabled?: boolean }) {
  const t = useTranslations("CreateEvent");

  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "organizers",
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => {
        const isSingle = fields.length === 1;

        return (
          <FormItem
            key={field.id}
            className="flex flex-col md:flex-row gap-3 items-start"
          >
            <div className="flex-1">
              <FormLabel isRequired>{t("organizerName")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("enterOrganizerName")}
                  disabled={disabled}
                  {...register(`organizers.${index}.name`)}
                />
              </FormControl>
              <FormMessage />
            </div>
            <div className="flex-1">
              <FormLabel>{t("organizerLink")}</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://all4ruse.com"
                  disabled={disabled}
                  {...register(`organizers.${index}.link`)}
                />
              </FormControl>
              <FormMessage />
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={disabled || isSingle}
              onClick={() => remove(index)}
              className="text-destructive hover:text-destructive/80 mt-6"
            >
              <Trash2Icon className="w-5 h-5" />
            </Button>
          </FormItem>
        );
      })}
      <Button
        type="button"
        onClick={() => append({ name: "", link: "" })}
        disabled={disabled}
        variant="outline"
      >
        {t("addOrganizer")}
      </Button>
    </div>
  );
}
