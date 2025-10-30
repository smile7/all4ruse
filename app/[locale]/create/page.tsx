"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Content } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { DatePopover } from "@/components/DatePopover/DatePopover";
import { SubmitButton } from "@/components/SubmitButton";
import { TimePopover } from "@/components/TimePopover/TimePopover";
import { Typography } from "@/components/Typography";
import { Button, ErrorAlert, Input, Label } from "@/components/ui";
import { MinimalTiptapEditor } from "@/components/ui/minimal-tiptap";
import { createClient } from "@/lib/supabase/client";

import { createEventAction } from "../actions";

type CreateEventActionState = { error: string | null };
const initialState: CreateEventActionState = { error: null };

// TODO: apply react hook form!
export default function CreateEventPage() {
  const t = useTranslations("CreateEvent");

  const [state, formAction] = useActionState(createEventAction, initialState);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [authChecked, setAuthChecked] = useState(false);
  const [description, setDescription] = useState<Content>("");
  const router = useRouter();

  // const upload = useSupabaseUpload({
  //   bucketName: process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME!,
  //   allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
  //   maxFiles: 10,
  //   maxFileSize: 1 * 1024 * 1024, // 1MB
  //   path: BUCKET,
  //   upsert: true,
  // });
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

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

  if (!authChecked) return <div>...</div>;

  return (
    <div className="flex flex-col gap-6">
      <Typography.H1>{t("createEventTitle")}</Typography.H1>
      <form action={formAction} className="space-y-6">
        <div className="space-y-2">
          <label className="font-medium">{t("title")} *</label>
          <Input name="title" required placeholder={t("enterTitle")} />
        </div>

        <div className="space-y-2">
          <Label className="font-medium">{t("description")} *</Label>
          <MinimalTiptapEditor
            value={description}
            onChange={setDescription}
            className="w-full"
            editorContentClassName="p-5"
            output="html"
            placeholder={t("enterDescription")}
            autofocus={true}
            editable={true}
            editorClassName="focus:outline-hidden h-80 overflow-auto"
            extensions={[StarterKit]}
          />
          <input
            type="hidden"
            name="description"
            value={String(description)}
            required
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label className="font-medium">{t("address")} *</Label>
            <Input name="address" required placeholder={t("enterAddress")} />
          </div>

          <div className="space-y-2">
            <Label>{t("place")}</Label>
            <Input name="place" required placeholder={t("enterPlace")} />
          </div>

          <div className="space-y-2">
            <Label className="font-medium">{t("town")} *</Label>
            <Input name="town" required value="Русе" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label className="font-medium">{t("fromDate")} *</Label>
            <DatePopover
              id="startDate"
              value={startDate}
              onChange={(v) => setStartDate(v ?? "")}
              onClear={() => setStartDate("")}
            />
            <input type="hidden" name="startDate" value={startDate} required />
          </div>
          <div className="space-y-2">
            <Label className="font-medium">{t("fromTime")} *</Label>
            <TimePopover
              id="startTime"
              value={startTime}
              onChange={(v) => setStartTime(v ?? "")}
            />
            <input type="hidden" name="startTime" value={startTime} required />
          </div>
          <div className="space-y-2">
            <Label className="font-medium">{t("toDate")} *</Label>
            <DatePopover
              id="endDate"
              value={endDate}
              onChange={(v) => setEndDate(v ?? "")}
              onClear={() => setEndDate("")}
            />
            <input type="hidden" name="endDate" value={endDate} required />
          </div>
          <div className="space-y-2">
            <Label className="font-medium">{t("toTime")} *</Label>
            <TimePopover
              id="endTime"
              value={endTime}
              onChange={(v) => setEndTime(v ?? "")}
            />
            <input type="hidden" name="endTime" value={endTime} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t("organizers")} *</Label>
          <Input name="organizer" required placeholder={t("enterOrganizers")} />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>{t("ticketsLink")}</Label>
            <Input
              name="ticketsLink"
              required
              placeholder={t("enterTicketsLink")}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("price")}</Label>
            <Input name="price" required placeholder={t("enterPrice")} />
          </div>

          <div className="space-y-2">
            <Label>{t("phoneNumber")}</Label>
            <Input
              name="phoneNumber"
              required
              placeholder={t("enterPhoneNumber")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t("images")} *</Label>
          <div
            {...getRootProps({
              className:
                "border-2 border-dashed rounded-lg p-6 cursor-pointer text-center " +
                (isDragActive
                  ? "opacity-80 border-primary"
                  : "border-gray-300"),
            })}
          >
            <input
              {...getInputProps({
                name: "image",
              })}
            />
            {isDragActive ? (
              <p>{t("uploadImageDrop")}</p>
            ) : (
              <p>{t("uploadImages")}</p>
            )}
          </div>

          {files.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">Preview:</p>
              <div className="flex gap-4 flex-wrap">
                {files.map((file, idx) => (
                  <div key={file.name} className="relative inline-block">
                    <Image
                      width={300}
                      height={150}
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        setFiles(files.filter((_, i) => i !== idx));
                        document.querySelector<HTMLInputElement>(
                          'input[name="image"]'
                        )!.value = "";
                      }}
                      className="absolute top-2 right-2 bg-background text-primary-foreground rounded-full size-8 flex items-center justify-center hover:bg-destructive transition cursor-pointer"
                      aria-label="Remove image"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* <div className="space-y-2">
          <Label>{t("images")} *</Label>
          <Dropzone {...upload} className="my-2">
            <DropzoneEmptyState />
            <DropzoneContent />
          </Dropzone>
          {upload.successes.length > 0 && (
            <input
              type="hidden"
              name="image"
              required
              value={`https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/${process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME}/${BUCKET}/${upload.successes[0]}`}
            />
          )}
        </div> */}

        {state.error && <ErrorAlert error={state.error} className="mt-4" />}

        <div className="flex justify-end">
          <SubmitButton>{t("submitButton")}</SubmitButton>
        </div>
      </form>
    </div>
  );
}
