import { createEventAction } from "@/actions";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from "@/components/ui";
import { Textarea } from "@/components/ui/textarea";

export default function CreateEventPage() {
  return (
    <div className="container mx-auto p-4">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Създай ново събитие</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={createEventAction}
            className="space-y-6"
            encType="multipart/form-data"
          >
            <div className="space-y-2">
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

            <div className="space-y-2">
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
                Event Image (optional)
              </label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
              />
            </div>

            <Button type="submit" className="w-full">
              Create Event
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
