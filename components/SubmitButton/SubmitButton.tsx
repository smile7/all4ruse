"use client";
import type * as React from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

type SubmitButtonProps = React.ComponentProps<typeof Button> & {
  children?: React.ReactNode;
};

export function SubmitButton({
  children = "Създай",
  className,
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      isLoading={pending}
      disabled={pending || disabled}
      className={cn(className)}
      {...props}
    >
      {children}
    </Button>
  );
}
