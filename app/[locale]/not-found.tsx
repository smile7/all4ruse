import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

import { Typography } from "@/components/Typography";
import { Button, Card, CardContent } from "@/components/ui";

export default async function NotFound() {
  const t = await getTranslations("NotFound");
  const locale = await getLocale();

  return (
    <div className="flex w-full items-center justify-center">
      <Card className="relative overflow-hidden border-2 border-border/60 shadow-xl max-w-xl w-full">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/20" />
        <CardContent className="relative flex flex-col items-center gap-6 p-8 text-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-primary/30 bg-primary/5 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <span>404</span>
            <span className="h-1 w-1 rounded-full bg-primary/60" />
            <span>{t("badge")}</span>
          </div>

          <Typography.H1 className="text-balance text-3xl md:text-4xl">
            {t("title")}
          </Typography.H1>

          <Typography.P className="max-w-md text-muted-foreground text-balance">
            {t("description")}
          </Typography.P>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href={`/${locale}`}>{t("goHome")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
