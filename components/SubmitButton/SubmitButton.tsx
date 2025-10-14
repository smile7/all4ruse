"use client";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full"
      isLoading={pending}
      disabled={pending}
    >
      Create Event
    </Button>
  );
}
