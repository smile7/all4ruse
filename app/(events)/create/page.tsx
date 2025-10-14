import { createEventAction } from "@/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { Input, Textarea } from "@/components/ui";

export default function CreateEventPage() {
  return (
    <div className="flex flex-col gap-6">
      <form
        action={createEventAction}
        className="space-y-6"
        encType="multipart/form-data"
      >
        <div className="w-full">
          <label htmlFor="title" className="text-sm font-medium">
            Event Title
          </label>
          <Input
            id="title"
            name="title"
            placeholder="Enter the event title"
            required
          />
        </div>

        <div className="w-full">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            placeholder="Describe your event"
            required
          />
        </div>

        <div className="flex flex-col gap-6 xl:flex-row xl:gap-2">
          <div className="space-y-2">
            <label htmlFor="startDateTime" className="text-sm font-medium">
              Start Date & Time
            </label>
            <Input
              id="startDateTime"
              name="startDateTime"
              type="datetime-local"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="endDateTime" className="text-sm font-medium">
              End Date & Time
            </label>
            <Input
              id="endDateTime"
              name="endDateTime"
              type="datetime-local"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="image" className="text-sm font-medium">
              Event Image *
            </label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
            />
          </div>
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
