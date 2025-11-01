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
import { createEventSchema, CreateEventSchemaType } from "@/lib/schema";
import { createClient } from "@/lib/supabase/client";

import { EventDateSelector } from "../_components";
import { createEventAction } from "../actions";

export default function CreateEventPage() {
  const t = useTranslations("CreateEvent");

  const [authChecked, setAuthChecked] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const router = useRouter();

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
  };

  const form = useForm<CreateEventSchemaType>({
    resolver: zodResolver(createEventSchema(t)),
    defaultValues: defaultValues,
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles(acceptedFiles);
      if (acceptedFiles[0]) {
        form.setValue("image", acceptedFiles[0]); // store file in RHF
      }
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
    maxSize: 1 * 1024 * 1024,
    multiple: true,
  });

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

  const onSubmit = async (values: CreateEventSchemaType) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, val]) => {
      if (val instanceof File) {
        formData.append(key, val);
      } else if (Array.isArray(val) || typeof val === "object") {
        formData.append(key, JSON.stringify(val));
      } else {
        formData.append(key, String(val));
      }
    });

    try {
      const state = await createEventAction({ error: null }, formData);
      if (state.error && state.error.length > 0) {
        setServerError(state.error);
      }
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Unexpected error occurred"
      );
    }
  };

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
                    value={field.value} // as Content}
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
            <FormLabel isRequired>{t("images")}</FormLabel>
            <FormControl>
              <div
                {...getRootProps({
                  className:
                    "border-2 border-dashed rounded-lg p-6 cursor-pointer text-center " +
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
              <div className="mt-2">
                <p className="text-sm font-medium">Preview:</p>
                {files.map((file) => (
                  <Image
                    key={file.name}
                    width={400}
                    height={300}
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="mt-1 max-h-48 rounded-lg object-contain"
                  />
                ))}
              </div>
            )}
            <FormMessage />
          </FormItem>

          {serverError && <ErrorAlert error={serverError} className="mt-4" />}

          <div className="flex justify-end">
            <SubmitButton disabled={form.formState.isSubmitting}>
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
