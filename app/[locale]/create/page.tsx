"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useFieldArray, useForm, useFormContext } from "react-hook-form";
import { Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import StarterKit from "@tiptap/starter-kit";

import { SubmitButton } from "@/components/SubmitButton";
import { TimePopover } from "@/components/TimePopover/TimePopover";
import { Typography } from "@/components/Typography";
import {
  Button,
  ErrorAlert,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/components/ui";
import { MinimalTiptapEditor } from "@/components/ui/minimal-tiptap";
import { EVENTS_BUCKET } from "@/constants";
import { useCreateEvent } from "@/hooks/query";
import { createEventSchema, CreateEventSchemaType } from "@/lib/schema";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";

import { EventDateSelector } from "../_components";
import { validateAndUploadEventImageClient } from "../actions";

export default function CreateEventPage() {
  const t = useTranslations("CreateEvent");

  const [authChecked, setAuthChecked] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const router = useRouter();
  const supabase = createClient();

  const { mutateAsync, isPending, error } = useCreateEvent();

  const defaultValues = {
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
    price: "",
    phoneNumber: "",
    image: undefined,
    images: [],
  };

  const form = useForm<CreateEventSchemaType>({
    resolver: zodResolver(createEventSchema(t)),
    defaultValues: defaultValues,
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles((prev) => {
        const next = [...prev, ...acceptedFiles];
        const uniqueByName = Array.from(
          new Map(next.map((f) => [f.name, f])).values()
        );

        form.setValue("image", uniqueByName[0] ?? undefined);
        form.setValue("images", uniqueByName);
        return uniqueByName;
      });
    },
    [form]
  );

  const removeImage = useCallback(
    (idx: number) => {
      setFiles((prev) => {
        const next = [...prev];
        const [removed] = next.splice(idx, 1);
        if (removed) URL.revokeObjectURL(URL.createObjectURL(removed));

        form.setValue("image", next[0] ?? undefined);
        form.setValue("images", next);
        return next;
      });
    },
    [form]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/gif": [],
    },
    maxSize: 1 * 1024 * 1024, // 1MB
    multiple: true,
  });

  const makeCover = useCallback(
    (idx: number) => {
      setFiles((prev) => {
        if (idx <= 0) return prev;
        const next = [...prev];
        const [picked] = next.splice(idx, 1);
        next.unshift(picked);
        form.setValue("image", next[0]);
        form.setValue("images", next);
        return next;
      });
    },
    [form]
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/auth/login");
      } else {
        setAuthChecked(true);
      }
    });
  }, [router, supabase]);

  const onSubmit = async (values: CreateEventSchemaType) => {
    const uploads: string[] = [];
    for (const f of files) {
      const url = await validateAndUploadEventImageClient(
        supabase,
        f,
        "events",
        EVENTS_BUCKET
      );
      if (url) uploads.push(url);
    }
    const coverUrl = uploads[0];

    const payload = {
      title: values.title,
      description: values.description,
      address: values.address,
      place: values.place,
      town: values.town,
      startDate: values.startDate,
      startTime: values.startTime,
      endDate: values.endDate,
      endTime: values.endTime,
      organizers: values.organizers,
      ticketsLink: values.ticketsLink || null,
      price: values.price || null,
      phoneNumber: values.phoneNumber || null,
      image: coverUrl || null,
      images: uploads.length > 1 ? uploads : null,
      slug: slugify(values.title),
    };

    const result = await mutateAsync(payload);

    if (result?.error) {
      return <>errorrr</>;
    }

    router.push("/");
  };
  console.log(form.formState.errors);

  if (!authChecked)
    return <div>Влезте в профила си, за да създадете събитие!</div>;

  return (
    <div className="flex flex-col gap-6">
      <Typography.H1>{t("createEventTitle")}</Typography.H1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    value={field.value}
                    onChange={field.onChange}
                    className="w-full"
                    editorContentClassName="p-5"
                    output="html"
                    placeholder={t("enterDescription")}
                    autofocus
                    editable
                    editorClassName="focus:outline-hidden h-80 overflow-auto"
                    extensions={[StarterKit]}
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
                  <FormLabel isRequired>{t("toTime")}</FormLabel>
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

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                  <Typography.P>{t("uploadImages")}</Typography.P>
                )}
              </div>
            </FormControl>

            {files.length > 0 && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file, idx) => (
                  <div key={file.name} className="relative group">
                    <Image
                      key={file.name}
                      width={400}
                      height={300}
                      src={URL.createObjectURL(file)}
                      alt="image"
                      className="rounded-md object-contain"
                    />

                    <button
                      type="button"
                      aria-label="Remove image"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white hover:opacity-80"
                    >
                      ×
                    </button>
                    {idx !== 0 && (
                      <button
                        type="button"
                        aria-label="Make cover"
                        onClick={() => makeCover(idx)}
                        className="absolute bottom-2 right-2 inline-flex h-7 px-3 items-center justify-center rounded-md bg-blue-600/80 text-white text-xs hover:bg-blue-600"
                      >
                        Set as cover
                      </button>
                    )}
                    {idx === 0 && (
                      <span className="absolute bottom-2 left-2 rounded-md bg-blue-600/80 text-white text-xs px-2 py-1">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <FormMessage />
          </FormItem>

          {Boolean(error) && (
            <ErrorAlert
              error={
                error instanceof Error
                  ? error.message
                  : "Възникна неочаквана грешка."
              }
              className="mt-4"
            />
          )}

          <div className="flex justify-end">
            <SubmitButton disabled={form.formState.isSubmitting || isPending}>
              {t("submitButton")}
            </SubmitButton>
          </div>
        </form>
      </Form>
    </div>
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
                  placeholder={t("enterOrganizerLink")}
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
