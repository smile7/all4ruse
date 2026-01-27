import { createContext, useContext, useState } from "react";

import { useMediaQuery } from "@/hooks";
import { cn, getMinWidth } from "@/lib/utils";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui";
import { useTranslations } from "next-intl";

type CaptureHandler = (v: boolean) => boolean;

type DialogDrawerContextState = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setOnCaptureOpenChange: React.Dispatch<
    React.SetStateAction<CaptureHandler | undefined>
  >;
};

const DialogDrawerContext = createContext<DialogDrawerContextState | undefined>(
  undefined,
);

export type DialogDrawerProps = React.PropsWithChildren<{
  trigger?: React.ReactElement;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  title?: React.ReactNode;
  description?: React.ReactNode;
  showDrawerCancel?: boolean;
  tooltip?: React.ReactNode;
  contentClassName?: string;
}>;

export function DrawerDialog({
  children,
  trigger,
  open,
  setOpen,
  title,
  description,
  showDrawerCancel,
  tooltip,
  contentClassName,
}: DialogDrawerProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const isLargerThanMd = useMediaQuery(getMinWidth("--breakpoint-md"));
  const t = useTranslations("Profile");

  const resolvedOpen = open ?? localOpen;
  const setResolvedOpen = setOpen ?? setLocalOpen;

  const [captureHandler, setCaptureHandler] = useState<CaptureHandler>();

  const value = {
    open: resolvedOpen,
    setOpen: setResolvedOpen,
    setOnCaptureOpenChange: setCaptureHandler,
  };

  const onBeforeSetOpen = (v: boolean) => {
    if (typeof captureHandler === "function") {
      const shouldProceed = captureHandler(v);
      if (!shouldProceed) return;
    }
    setResolvedOpen(v);
  };

  return (
    <DialogDrawerContext.Provider value={value}>
      {isLargerThanMd ? (
        <Dialog open={resolvedOpen} onOpenChange={onBeforeSetOpen}>
          {Boolean(trigger) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>{trigger}</DialogTrigger>
              </TooltipTrigger>
              {Boolean(tooltip) && <TooltipContent>{tooltip}</TooltipContent>}
            </Tooltip>
          )}
          <DialogContent
            className={cn("pb-0 md:max-w-(--breakpoint-sm)", contentClassName)}
          >
            <DialogHeader>
              <DialogTitle className={cn(!title && "sr-only")}>
                {title}
              </DialogTitle>
              <DialogDescription className={cn(!description && "sr-only")}>
                {description}
              </DialogDescription>
            </DialogHeader>
            <div className="-mx-6 overflow-auto px-6">{children}</div>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={resolvedOpen} onOpenChange={onBeforeSetOpen}>
          {Boolean(trigger) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <DrawerTrigger asChild>{trigger}</DrawerTrigger>
              </TooltipTrigger>
              {Boolean(tooltip) && <TooltipContent>{tooltip}</TooltipContent>}
            </Tooltip>
          )}
          <DrawerContent className={contentClassName}>
            <DrawerHeader className="text-left">
              <DrawerTitle className={cn(!title && "sr-only")}>
                {title}
              </DrawerTitle>
              <DrawerDescription className={cn(!description && "sr-only")}>
                {description}
              </DrawerDescription>
            </DrawerHeader>
            <div className="overflow-auto pb-2">{children}</div>
            {showDrawerCancel && (
              <DrawerFooter className="pt-0">
                <DrawerClose asChild>
                  <Button variant="outline">{t("cancel")}</Button>
                </DrawerClose>
              </DrawerFooter>
            )}
          </DrawerContent>
        </Drawer>
      )}
    </DialogDrawerContext.Provider>
  );
}

export function useDialogDrawerContext() {
  const context = useContext(DialogDrawerContext);
  if (!context) {
    throw new Error(
      "useDialogDrawerContext must be used inside a DialogDrawer",
    );
  }
  return context;
}
