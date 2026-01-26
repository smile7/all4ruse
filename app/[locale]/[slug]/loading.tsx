import { AspectRatio } from "@/components/AspectRatio";
import { Typography } from "@/components/Typography";
import { Card, CardContent, CardTitle, Skeleton } from "@/components/ui";

export default function EventLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="relative aspect-[16/9] md:aspect-auto md:h-[36vh] lg:h-[42vh] xl:h-[48vh]">
        <Skeleton className="h-[460px] w-full" />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-6 p-6">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-9 w-28" />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          <hr />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-8">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-10/12" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="space-y-3 lg:col-span-4">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
