"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface EmailObfuscatedProps extends React.HTMLAttributes<HTMLButtonElement> {
  user: string;
  domain: string;
  label?: string;
}

export function EmailObfuscated({
  user,
  domain,
  label,
  className,
  ...props
}: EmailObfuscatedProps) {
  const handleClick = React.useCallback(() => {
    const email = `${user}@${domain}`;

    if (typeof window !== "undefined") {
      window.location.href = `mailto:${email}`;
    }
  }, [user, domain]);

  const display = label ?? `${user}[at]${domain}`;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn("text-primary underline", className)}
      {...props}
    >
      {display}
    </button>
  );
}
