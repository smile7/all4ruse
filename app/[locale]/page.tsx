import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Typography } from "@/components/Typography";
import { Button } from "@/components/ui";
import { getEvents } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

import { Events } from "./_components";

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("HomePage");

  const supabase = await createClient();
  const { data: events, error } = await getEvents(supabase);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto w-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row w-full gap-4 md:items-center md:justify-between items-center text-center md:text-left">
        {user && (
          <Button
            asChild
            className="order-1 md:order-2 self-end md:self-center md:ml-auto"
          >
            <Link href={`/${locale}/create`}>{t("createEvent")}</Link>
          </Button>
        )}
        <div className="flex flex-col gap-2 order-2 md:order-1">
          <Typography.H1>{t("pageTitle")}</Typography.H1>
          <Typography.Small>{t("pageDescription")}</Typography.Small>
          <hr className="my-1.5" />
          <Typography.Small>{t("createProfileMsg")}</Typography.Small>
        </div>
      </div>
      <Events
        events={events ?? []}
        errorMessage={error?.message}
        timeFilter="upcoming"
      />
    </div>
  );
}
