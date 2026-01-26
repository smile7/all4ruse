import { AspectRatio } from "@/components/AspectRatio";
import { Card, CardContent, Skeleton } from "@/components/ui";

export default function LoadingEventsPage() {
  const placeholders = Array.from({ length: 10 });

  return (
    <div className="mx-auto flex w-full flex-col gap-6">
      <div className="flex w-full flex-col items-center gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
        <div className="order-2 flex flex-col gap-2 md:order-1">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="order-1 h-10 w-40 self-end md:order-2 md:self-center" />
      </div>

      <Skeleton className="h-20 w-full rounded-md" />

      <div
        className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(min(100%,18rem),1fr))]"
        aria-label="Зареждане на събития"
      >
        {placeholders.map((_, idx) => (
          <Card
            key={idx}
            className="flex h-full flex-col overflow-hidden border-border/60 p-0"
          >
            <AspectRatio ratio={6 / 9}>
              <Skeleton className="h-full w-full" />
            </AspectRatio>
            <CardContent className="flex flex-col gap-3 p-4 pt-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
