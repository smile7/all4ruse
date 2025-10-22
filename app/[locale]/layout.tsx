import LanguageSwitcher from "@/components/LanguageSwitcher/LanguageSwitcher";
import { SidebarLeft, ThemeToggle } from "@/components/theme";
import {
  Separator,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui";

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <SidebarLeft />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex h-14 shrink-0 z-100 items-center justify-between px-2 mb-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="data-[orientation=vertical]:h-6"
            />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </header>

        <div className="p-6 pt-0">
          <div className="mx-auto w-full max-w-(--breakpoint-xl) pb-16">
            {children}
          </div>
        </div>
      </SidebarInset>
      {/* <SidebarRight /> */}
    </SidebarProvider>
  );
}
