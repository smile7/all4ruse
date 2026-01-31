// Place your image in public/author.jpg or update the src below
import Image from "next/image";
import { AspectRatio } from "@/components/AspectRatio";
import { Typography } from "@/components/Typography";
import {
  Mail,
  Sparkles,
  HeartHandshake,
  MapPin,
  Users,
  Star,
  Filter,
  Calendar,
  CheckCircle,
  Lightbulb,
  Send,
  Info,
  ThumbsUp,
  AlertCircle,
  PlusCircle,
  Facebook,
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function WhyAll4RusePage() {
  const t = useTranslations("WhyUs");

  return (
    <div className="min-h-screen bg-gradient-to-b rounded-xl from-primary/10 via-background to-background flex flex-col gap-16 items-center py-10">
      {/* Header */}
      <section className="w-full max-w-4xl text-center relative pb-8 px-4">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/30 via-primary/10 to-transparent blur-2xl opacity-60 -z-10" />
        <div className="inline-flex items-center gap-2 rounded-lg px-5 py-2 text-base font-semibold text-white bg-primary/85 shadow-lg mb-8 animate-fade-in">
          <Sparkles className="size-5" />
          <span className="text-pretty">{t("headerTagline")}</span>
        </div>
        <Typography.H1 className="mb-4 animate-fade-in text-pretty delay-100 drop-shadow-lg">
          {t("mainHeadline")}
        </Typography.H1>
        <Typography.P className="text-muted-foreground animate-fade-in delay-200 text-lg">
          {t("mainSubheadline")}
        </Typography.P>
      </section>

      {/* About Me */}
      <section className="w-full max-w-3xl border-2 border-primary/30 bg-background/80 rounded-lg shadow-xl p-8 flex flex-col md:flex-row gap-8 items-center animate-fade-in delay-300">
        <div className="flex-shrink-0 w-[160px] md:w-[180px]">
          <AspectRatio ratio={3 / 5}>
            <Image
              src="/author2.jpeg"
              alt="Силвена - създател на all4ruse"
              fill
              className="rounded-2xl border-4 border-primary shadow-lg object-cover"
              priority
            />
          </AspectRatio>
        </div>
        <div className="flex-1 text-left">
          <Typography.H2 className="mb-2">{t("aboutMeHeader")}</Typography.H2>
          <Typography.P className="text-justify">{t("aboutMe")}</Typography.P>
          <Typography.P className="mt-6 text-justify">
            {t("aboutMe2")}
          </Typography.P>
        </div>
      </section>

      {/* Why Created */}
      <section className="w-full max-w-3xl animate-fade-in delay-400">
        <div className="bg-background/90 border-2 border-primary/30 shadow-xl rounded-3xl p-8 flex flex-col gap-4">
          <Typography.H2 className="mb-2">
            {t("whyCreatedHeadline")}
          </Typography.H2>
          <Typography.P className="text-justify">
            {t("whyCreated")}
          </Typography.P>
          <Typography.P className="mt-6 text-justify">
            {t("whyCreated2")}
          </Typography.P>
          <div className="mt-6 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary shadow-lg">
              <span className="font-bold text-center text-lg text-white tracking-wide">
                {t("whyCreated3")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Different */}
      <section className="w-full max-w-3xl animate-fade-in delay-500">
        <div className="bg-background/90 border-2 border-primary/30 shadow-xl rounded-3xl p-8 flex flex-col gap-4">
          <Typography.H2 className="mb-2">
            {t("whatMakesDifferentHeadline")}
          </Typography.H2>
          <Typography.P className="mb-4">
            {t("whatMakesDifferent")}
          </Typography.P>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-background p-6 flex flex-col items-center shadow-md">
              <Filter className="size-8 text-primary mb-2" />
              <span className="font-semibold text-center text-lg mb-1">
                {t("searchAndFilters")}
              </span>
              <span className="text-muted-foreground text-sm text-center">
                {t("searchAndFiltersDesc")}
              </span>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-background p-6 flex flex-col items-center shadow-md">
              <CheckCircle className="size-8 text-primary mb-2" />
              <span className="font-semibold text-center text-lg mb-1">
                {t("cleanInterface")}
              </span>
              <span className="text-muted-foreground text-sm text-center">
                {t("cleanInterfaceDesc")}
              </span>
            </div>
          </div>
          <Typography.P className="mt-6 text-center text-lg font-semibold text-primary">
            {t("lessScrollingMoreExperiences")}
          </Typography.P>
        </div>
      </section>

      {/* How Events Are Added */}
      <section className="w-full max-w-3xl animate-fade-in delay-500">
        <div className="bg-background/90 border-2 border-primary/30 shadow-xl rounded-3xl p-8 flex flex-col gap-4">
          <Typography.H2 className="mb-2">
            {t("howEventsAreAddedHeadline")}
          </Typography.H2>
          <Typography.P>{t("howEventsAreAdded")}</Typography.P>
          <Typography.P className="mt-4">
            {t("howEventsAreAdded2")}
          </Typography.P>
          <Typography.P className="mt-4">
            {t("howEventsAreAdded3")}
          </Typography.P>
          <Typography.P className="mt-6 text-center text-lg font-semibold text-primary">
            {t("howEventsAreAdded4")}
          </Typography.P>
        </div>
      </section>

      {/* How You Can Help */}
      <section className="w-full max-w-3xl animate-fade-in delay-700">
        <div className="bg-background/90 border-2 border-primary/30 shadow-xl rounded-3xl p-8 flex flex-col gap-4">
          <Typography.H2 className="mb-2">
            {t("howYouCanHelpHeadline")}
          </Typography.H2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex flex-col items-center bg-gradient-to-br from-primary/10 to-background rounded-xl p-4 shadow-sm">
              <Send className="h-7 w-7 text-primary mb-2" />
              <span className="font-semibold text-center">
                {t("sendEvent")}
              </span>
              <span className="text-xs text-muted-foreground text-center">
                {t("sendEventDesc")}
              </span>
            </div>
            <div className="flex flex-col items-center bg-gradient-to-br from-primary/10 to-background rounded-xl p-4 shadow-sm">
              <AlertCircle className="h-7 w-7 text-primary mb-2" />
              <span className="font-semibold text-center">
                {t("reportIssue")}
              </span>
              <span className="text-xs text-muted-foreground text-center">
                {t("reportIssueDesc")}
              </span>
            </div>
            <div className="flex flex-col items-center bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-4 shadow-sm">
              <PlusCircle className="h-7 w-7 text-primary mb-2" />
              <span className="font-semibold text-center">{t("newIdeas")}</span>
              <span className="text-xs text-muted-foreground text-center">
                {t("newIdeasDesc")}
              </span>
            </div>
          </div>
          <Typography.P className="mt-6 text-center text-lg font-semibold text-primary">
            {t("yourFeedbackMatters")}
          </Typography.P>
        </div>
      </section>

      {/* Contact */}
      <section className="w-full max-w-3xl animate-fade-in delay-800">
        <div className="bg-background/90 border-2 border-primary/30 shadow-xl rounded-3xl p-8 flex flex-col gap-4">
          <Typography.H2 className="mb-2">{t("contactHeadline")}</Typography.H2>
          <Typography.P className="text-justify">
            {t("contactInfo")}
          </Typography.P>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center bg-gradient-to-br from-primary/10 to-background rounded-xl p-6 shadow-sm">
              <Mail className="h-8 w-8 text-primary mb-2" />
              <span className="font-semibold text-lg mb-1">{t("email")}</span>
              <a
                href="mailto:silvena@all4ruse.com"
                className="text-primary underline text-base font-medium"
              >
                silvena@all4ruse.com
              </a>
            </div>
            <div className="flex flex-col items-center bg-gradient-to-br from-primary/10 to-background rounded-xl p-6 shadow-sm">
              <Facebook className="h-8 w-8 text-primary mb-2" />
              <span className="font-semibold text-lg mb-1">
                {t("facebookPage")}
              </span>
              <a
                href="https://www.facebook.com/profile.php?id=61586926929594"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline text-base font-medium"
              >
                all4ruse
              </a>
            </div>
          </div>
          <Typography.P className="mt-6 text-center text-lg font-semibold text-primary">
            {t("lookingForwardToHearingFromYou")}
          </Typography.P>
        </div>
      </section>
    </div>
  );
}
