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
      <section className="w-full max-w-4xl text-center relative pb-8">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/30 via-primary/10 to-transparent blur-2xl opacity-60 -z-10" />
        <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-base font-semibold text-white bg-primary/85 shadow-lg mb-6 animate-fade-in">
          <Sparkles className="size-5" />
          all4ruse – твоят гид за събития в Русе
        </div>
        <Typography.H1 className="mb-4 animate-fade-in delay-100 drop-shadow-lg">
          Мястото, където събираме на едно място всички събития в града, за да
          не изпускаш нищо важно.
        </Typography.H1>
        <Typography.P className="text-muted-foreground animate-fade-in delay-200 text-lg">
          По-малко скролване, повече истински преживявания.{" "}
        </Typography.P>
        <Typography.P className="text-muted-foreground animate-fade-in delay-200 text-lg">
          Присъедини се към общността!
        </Typography.P>
      </section>

      {/* About Me */}
      <section className="w-full max-w-3xl border-2 border-primary/30 bg-background/80 rounded-lg shadow-xl p-8 flex flex-col md:flex-row gap-8 items-center animate-fade-in delay-300">
        <div className="flex-shrink-0 w-[120px] md:w-[180px]">
          <AspectRatio ratio={3 / 5}>
            <Image
              src="/author.jpeg"
              alt="Силвена - създател на all4ruse"
              fill
              className="rounded-2xl border-4 border-primary shadow-lg object-cover"
              priority
            />
          </AspectRatio>
        </div>
        <div className="flex-1 text-left">
          <Typography.H2 className="mb-2">За мен</Typography.H2>
          <Typography.P>
            Виновникът за този нов русенски сайт съм аз, <b>Силвена</b> - върл
            оптимист, който вярва, че с достатъчно желание можем да направим
            града ни още по-добро място за живеене.
            <br />
            <br />
            Обичам Русе, обичам да ходя по събития, но ми липсваше едно ясно,
            подредено място, където да видя какво се случва тази седмица, без да
            скролвам през безкрайни Facebook страници.
          </Typography.P>
        </div>
      </section>

      {/* Why Created */}
      <section className="w-full max-w-3xl animate-fade-in delay-400">
        <div className="bg-background/90 border-2 border-primary/30 shadow-xl rounded-3xl p-8 flex flex-col gap-4">
          <Typography.H2 className="mb-2">Защо създадох all4ruse</Typography.H2>
          <Typography.P>
            Русе е богат на културни събития – концерти, театри, работилници,
            събития за деца, спорт, срещи на общности – но информацията за тях е
            разпръсната в различни фейсбук страници и сайтове.
          </Typography.P>
          <Typography.P className="mt-5">
            Много често ми се случва да разбера за някое много интересно събитие
            след като е минало, а вероятно за други изобщо не съм разбрала, че
            са се случили.
          </Typography.P>
          <div className="mt-6 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary shadow-lg">
              <span className="font-bold text-center text-lg text-white tracking-wide">
                Целта ни е да съберем на едно място най-интересното, което се
                случва в Русе и околността и да го направим лесно за откриване.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Different */}
      <section className="w-full max-w-3xl animate-fade-in delay-500">
        <div className="bg-background/90 border-2 border-primary/30 shadow-xl rounded-3xl p-8 flex flex-col gap-4">
          <Typography.H2 className="mb-2">
            Какво прави този сайт различен
          </Typography.H2>
          <Typography.P className="mb-4">
            Facebook е добър, но не е създаден за подреден календар. Тук имате:
          </Typography.P>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-background p-6 flex flex-col items-center shadow-md">
              <Filter className="size-8 text-primary mb-2" />
              <span className="font-semibold text-lg mb-1">
                Търсене и Филтри
              </span>
              <span className="text-muted-foreground text-sm text-center">
                Търси по ключова дума, дати и теми (театър, работилници, деца и
                др.)
              </span>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-background p-6 flex flex-col items-center shadow-md">
              <CheckCircle className="size-8 text-primary mb-2" />
              <span className="font-semibold text-lg mb-1">Чист Интерфейс</span>
              <span className="text-muted-foreground text-sm text-center">
                Без реклами, без излишен шум, фокус само върху Русе и региона
              </span>
            </div>
          </div>
          <Typography.P className="mt-6 text-center text-lg font-semibold text-primary">
            По-малко скролване, повече истински преживявания.
          </Typography.P>
        </div>
      </section>

      {/* How Events Are Added */}
      <section className="w-full max-w-3xl animate-fade-in delay-500">
        <div className="bg-background/90 border-2 border-primary/30 shadow-xl rounded-3xl p-8 flex flex-col gap-4">
          <Typography.H2 className="mb-2">
            Как събитията попадат тук
          </Typography.H2>
          <Typography.P>
            Събитията се качват от организаторите след регистрация в сайта.
          </Typography.P>
          <Typography.P className="mt-4">
            Всяко събитие минава през одобрение от администратор, преди да бъде
            публикувано.
          </Typography.P>
          <Typography.P className="mt-4">
            Не се публикуват незаконни, подвеждащи, хазартни или рекламни
            събития.
          </Typography.P>
          <Typography.P className="mt-6 text-center text-lg font-semibold text-primary">
            Ако видиш нещо, което според теб не е ок, винаги можеш да ми пишеш –
            реагирам и коригирам.
          </Typography.P>
        </div>
      </section>

      {/* How You Can Help */}
      <section className="w-full max-w-3xl animate-fade-in delay-700">
        <div className="bg-background/90 border-2 border-primary/30 shadow-xl rounded-3xl p-8 flex flex-col gap-4">
          <Typography.H2 className="mb-2">Как можеш да помогнеш</Typography.H2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex flex-col items-center bg-gradient-to-br from-primary/10 to-background rounded-xl p-4 shadow-sm">
              <Send className="h-7 w-7 text-primary mb-2" />
              <span className="font-semibold text-center">Изпрати събитие</span>
              <span className="text-xs text-muted-foreground text-center">
                Дори да не си организатор, можеш да споделиш за важно събитие.
              </span>
            </div>
            <div className="flex flex-col items-center bg-gradient-to-br from-primary/10 to-background rounded-xl p-4 shadow-sm">
              <AlertCircle className="h-7 w-7 text-primary mb-2" />
              <span className="font-semibold text-center">Сигнализирай</span>
              <span className="text-xs text-muted-foreground text-center">
                Помогни да поддържаме информацията актуална и вярна.
              </span>
            </div>
            <div className="flex flex-col items-center bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-4 shadow-sm">
              <PlusCircle className="h-7 w-7 text-primary mb-2" />
              <span className="font-semibold text-center">Нови идеи</span>
              <span className="text-xs text-muted-foreground text-center">
                Тагове, филтри и функционалности, които биха ти били полезни.
              </span>
            </div>
          </div>
          <Typography.P className="mt-6 text-center text-lg font-semibold text-primary">
            Всеки имейл с идея или критика помага този сайт да става по-добър.
          </Typography.P>
        </div>
      </section>

      {/* Contact */}
      <section className="w-full max-w-3xl animate-fade-in delay-800">
        <div className="bg-background/90 border-2 border-primary/30 shadow-xl rounded-3xl p-8 flex flex-col gap-4">
          <Typography.H2 className="mb-2">Контакт</Typography.H2>
          <Typography.P>
            Ако искаш да предложиш нова идея, да дадеш критика или просто да
            кажеш „Здрасти, харесва ми, че го правиш“, можеш да ми пишеш на:
          </Typography.P>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center bg-gradient-to-br from-primary/10 to-background rounded-xl p-6 shadow-sm">
              <Mail className="h-8 w-8 text-primary mb-2" />
              <span className="font-semibold text-lg mb-1">Имейл</span>
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
                Фейсбук страница
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
            Ще се радвам да ми разкажеш какво би искал да виждаш повече в Русе –
            и в сайта, и в града.
          </Typography.P>
        </div>
      </section>
    </div>
  );
}
