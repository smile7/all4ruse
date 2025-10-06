import { XIcon } from "lucide-react";

import { Button, Tooltip, TooltipContent, TooltipTrigger } from "../ui";

type PillProps = {
  label: string;
  onClick?: () => void;
  tooltip?: string;
  showRemoveIcon?: boolean;
};

export function Pill({ label, onClick, tooltip, showRemoveIcon }: PillProps) {
  const pill = (
    <Button
      variant="outline"
      size="sm"
      className="h-auto items-start gap-2 py-2 text-sm leading-none"
      type="button"
      onClick={() => onClick?.()}
      tabIndex={typeof onClick === "function" ? 0 : -1}
    >
      <span className="break-word text-left whitespace-normal">{label}</span>
      {showRemoveIcon && <XIcon className="-mr-1 size-3.5" />}
    </Button>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{pill}</TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return pill;
}
