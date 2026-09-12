"use client";

// ============================================================
// HomeFix — Home view (custom design «خانه و اعتماد»)
// hero motion scene • marquee • stats band • AI assistant •
// catalog • journey • trust bento • plans • testimonials •
// top specialists • FAQ • final CTA
// ============================================================

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AirVent,
  ArrowLeft,
  BadgeCheck,
  CalendarPlus,
  Check,
  ClipboardCheck,
  KeyRound,
  LayoutGrid,
  MapPin,
  PackageCheck,
  Percent,
  Quote,
  Radar,
  ShieldCheck,
  Siren,
  Sparkles,
  Star,
  UserRoundPlus,
  Users,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { apiGet, apiPost } from "./api";
import { categoryColorStyle, categoryIcon } from "./icons";
import { HeroScene } from "./HeroScene";
import {
  Counter,
  ErrorState,
  LevelBadge,
  OrnamentDivider,
  Reveal,
  SectionHeading,
  Squiggle,
  StarRating,
  SpinnerRow,
  staggerContainer,
  staggerItem,
} from "./bits";
import { useHomeFix } from "@/lib/store";
import { formatToman, initialsAvatar, toFa } from "@/lib/format";
import type { AiSuggestionDTO, CategoryDTO, StatsDTO } from "@/lib/types";

const CONTAINER = "mx-auto max-w-6xl px-4";
const CARD = "rounded-2xl border bg-card shadow-warm-sm";

// ============================================================
// Hero — copy + custom SVG motion scene
// ============================================================
function Hero() {
  const openBooking = useHomeFix((s) => s.openBooking);
  const openSpecialistLogin = useHomeFix((s) => s.openSpecialistLogin);

  const trustChips = [
    { Icon: KeyRound, label: "کد ورود امن" },
    { Icon: ShieldCheck, label: "پرداخت امن" },
    { Icon: BadgeCheck, label: "ضمانت کیفیت" },
  ];

  return (
    <section aria-label="معرفی HomeFix" className="pattern-khatam relative overflow-hidden">
      {/* soft glow blobs */}
      <div className="pointer-events-none absolute -top-24 right-[-8%] size-96 rounded-full bg-primary/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute bottom-[-20%] left-[-6%] size-[28rem] rounded-full bg-brass/10 blur-3xl" aria-hidden />

      <div className={`${CONTAINER} relative grid items-center gap-12 pt-10 pb-14 md:grid-cols-2 md:pt-16 md:pb-20`}>
        {/* copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-brass/40 bg-brass/10 px-3.5 py-1.5 text-xs font-extrabold text-brass-deep dark:text-brass">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brass opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-brass" />
            </span>
            بازار آنلاین خدمات خانگی ایران
          </span>

          <h1 className="text-3xl leading-[1.35] font-black md:text-5xl md:leading-[1.3]">
            متخصصِ خانگیِ{" "}
            <span className="relative inline-block text-primary">
              مطمئن
              <Squiggle />
            </span>
            ،
            <br className="hidden md:block" />
            به سادگیِ یک انتخاب
          </h1>

          <p className="max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            از کولر تا لوله‌کشی — سرویس، زمان و آدرس را انتخاب کن؛ متخصصِ احراز‌هویت‌شده با{" "}
            <b className="text-foreground">کد ورود امن</b> می‌رسد و بعد از کار، داخل اپ پرداخت می‌کنی.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="min-h-12 gap-2 bg-accent px-7 text-base font-extrabold text-accent-foreground shadow-glow-brass transition-transform hover:bg-accent/90 hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => openBooking()}
            >
              <CalendarPlus className="size-5" />
              ثبت درخواست
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-h-12 gap-2 border-primary/30 px-6 text-base hover:bg-secondary"
              onClick={() => openSpecialistLogin("register")}
            >
              <UserRoundPlus className="size-5" />
              عضویت به‌عنوان متخصص
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {trustChips.map((c) => (
              <span
                key={c.label}
                className="inline-flex items-center gap-1.5 rounded-full border bg-card/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-warm-sm"
              >
                <c.Icon className="size-3.5 text-primary" />
                {c.label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* motion scene */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-[2rem] border bg-card p-2.5 shadow-warm-lg">
            <HeroScene />
          </div>

          {/* floating glass chips */}
          <motion.div
            className="glass absolute -top-3 right-6 flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-extrabold shadow-warm"
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <ShieldCheck className="size-4 text-primary" />
            متخصص تأییدشده
          </motion.div>
          <motion.div
            className="glass absolute -bottom-4 left-6 flex items-center gap-2 rounded-2xl border px-4 py-2.5 shadow-warm"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          >
            <Star className="size-4 fill-brass text-brass" />
            <span className="text-sm font-black">۴٫۹</span>
            <span className="text-xs text-muted-foreground">از ۳۲۶ سفارش موفق</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// Marquee band — services ribbon
// ============================================================
const MARQUEE_ITEMS = [
  "کولر گازی",
  "لوله‌کشی",
  "برق و روشنایی",
  "یخچال و فریزر",
  "ماشین لباسشویی",
  "درب و پنجره",
  "گچ‌کاری و رنگ",
  "نظافت تخصصی",
  "آبگرمکن و پکیج",
  "قفل و کلید",
];

function MarqueeBand() {
  const row = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="marquee-paused relative overflow-hidden bg-deep py-3.5 text-deep-foreground" aria-label="خدمات HomeFix">
      <div className="pattern-khatam-light absolute inset-0" aria-hidden />
      <div className="animate-marquee flex w-max items-center gap-8" dir="rtl">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap" aria-hidden={i >= MARQUEE_ITEMS.length}>
            <span className="text-sm font-bold">{item}</span>
            <Wrench className="size-4 text-brass" aria-hidden />
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Stats band — dark panel with animated counters (GET /api/stats)
// ============================================================
function StatsBand() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["stats"],
    queryFn: () => apiGet<{ stats: StatsDTO }>("/api/stats"),
    retry: 1,
  });

  const stats = data?.stats;
  const items = [
    { Icon: Users, label: "متخصص فعال", value: stats?.specialistsCount ?? 0 },
    { Icon: PackageCheck, label: "سفارش موفق", value: stats?.ordersCount ?? 0 },
    { Icon: Star, label: "میانگین امتیاز", value: stats?.avgRating ?? 0, decimals: 1 },
    { Icon: LayoutGrid, label: "دسته خدمات", value: 8 },
  ];

  return (
    <section aria-label="آمار پلتفرم" className={`${CONTAINER} -mt-2 py-10 md:py-12`}>
      <Reveal>
        <div className="pattern-khatam-light relative overflow-hidden rounded-3xl bg-deep px-6 py-8 text-deep-foreground shadow-warm-lg md:px-10">
          <div className="pointer-events-none absolute -top-16 left-1/4 size-56 rounded-full bg-brass/15 blur-3xl" aria-hidden />
          {isError ? (
            <div className="py-4 text-center">
              <ErrorState message="خطا در دریافت آمار" onRetry={() => refetch()} />
            </div>
          ) : (
            <div className="relative grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-4">
              {items.map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-2 text-center">
                  <span className="arch-well grid size-12 place-items-center bg-brass/15 text-brass">
                    <item.Icon className="size-5" />
                  </span>
                  {isLoading ? (
                    <span className="h-8 w-14 animate-pulse rounded bg-white/10" />
                  ) : (
                    <span className="text-2xl font-black md:text-3xl">
                      <Counter value={item.value} decimals={item.decimals ?? 0} />
                    </span>
                  )}
                  <span className="text-xs font-semibold text-deep-foreground/70 md:text-sm">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}
          <OrnamentDivider className="mt-7 opacity-80" />
        </div>
      </Reveal>
    </section>
  );
}

// ============================================================
// AI assistant — POST /api/ai/suggest (chat style)
// ============================================================
const QUICK_PROBLEMS = [
  "یخچالم سرد نمی‌کنه",
  "کولر آب می‌چکه",
  "پریز برق جرقه می‌زنه",
];

function AiAssistant() {
  const openBooking = useHomeFix((s) => s.openBooking);
  const [text, setText] = useState("");

  const suggest = useMutation({
    mutationFn: (t: string) =>
      apiPost<{ suggestion: AiSuggestionDTO | null }>("/api/ai/suggest", { text: t }),
  });

  const suggestion = suggest.data?.suggestion ?? null;

  return (
    <section aria-label="دستیار هوشمند" className={`${CONTAINER} py-6`}>
      <Reveal>
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-brass/30 bg-gradient-to-bl from-brass/10 via-card to-card p-6 shadow-warm md:p-8">
          <div className="pattern-khatam pointer-events-none absolute inset-0 opacity-40" aria-hidden />

          <div className="relative mb-5 flex items-center gap-3">
            <span className="arch-well grid size-12 place-items-center bg-brass/15 text-brass-deep dark:text-brass">
              <Sparkles className="size-6" />
            </span>
            <div>
              <h2 className="text-lg font-black">نمی‌دانی چه سرویسی لازم داری؟</h2>
              <p className="text-xs text-muted-foreground">
                مشکل را خودت بنویس — دستیار هوشمند سرویس درست را پیشنهاد می‌دهد
              </p>
            </div>
          </div>

          <div className="relative space-y-3">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="مثلاً: کولرم روشن می‌شه ولی خنک نمی‌کنه…"
              rows={3}
              className="resize-none border-border/80 bg-card"
              aria-label="توصیف مشکل"
            />

            <div className="flex flex-wrap gap-2">
              {QUICK_PROBLEMS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setText(q)}
                  className="min-h-9 rounded-full border bg-card px-3 text-xs font-semibold text-muted-foreground transition hover:border-brass/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring outline-none"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                className="min-h-11 gap-2 bg-accent font-extrabold text-accent-foreground shadow-glow-brass hover:bg-accent/90"
                disabled={suggest.isPending || text.trim().length < 3}
                onClick={() => suggest.mutate(text.trim())}
              >
                <Sparkles className="size-4" />
                {suggest.isPending ? "در حال فکر کردن…" : "پیشنهاد بده"}
              </Button>
              {suggest.isError ? (
                <p className="text-sm text-muted-foreground">
                  الان نمی‌تونم پیشنهاد بدم؛ از دسته‌بندی‌ها انتخاب کن
                </p>
              ) : null}
            </div>
          </div>

          <AnimatePresence>
            {suggestion ? (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="relative mt-5 rounded-2xl border border-brass/40 bg-card p-4 shadow-warm"
              >
                <div className="flex items-start gap-3">
                  <span className="arch-well mt-0.5 grid size-9 shrink-0 place-items-center bg-primary/10 text-primary">
                    <Wrench className="size-4" />
                  </span>
                  <p className="text-sm leading-relaxed">
                    <span className="font-extrabold">پیشنهاد ما: {suggestion.serviceName}</span>
                    <span className="text-muted-foreground"> — {suggestion.reason}</span>
                  </p>
                </div>
                <Button
                  className="mt-3 min-h-11 gap-2"
                  onClick={() => openBooking({ serviceId: suggestion.serviceId, aiText: text.trim() })}
                >
                  شروع درخواست با این سرویس
                  <ArrowLeft className="size-4" />
                </Button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </Reveal>
    </section>
  );
}

// ============================================================
// Catalog grid — GET /api/catalog (arch-well cards)
// ============================================================
function CatalogGrid() {
  const openBooking = useHomeFix((s) => s.openBooking);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["catalog"],
    queryFn: () => apiGet<{ categories: CategoryDTO[] }>("/api/catalog"),
    retry: 1,
  });

  return (
    <section id="catalog" aria-label="دسته‌بندی خدمات" className={`${CONTAINER} scroll-mt-20 py-12 md:py-16`}>
      <SectionHeading
        eyebrow="خدمات"
        title="چه کاری لازم داری؟"
        sub="دسته را انتخاب کن؛ متخصص‌های همان حوزه که مدارک‌شان تأیید شده برایت پیشنهاد می‌شوند."
      />
      {isLoading ? (
        <SpinnerRow label="در حال بارگذاری خدمات…" />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {(data?.categories ?? []).map((cat) => {
            const Icon = categoryIcon(cat.icon);
            const colorStyle = categoryColorStyle(cat.color);
            return (
              <motion.button
                key={cat.id}
                type="button"
                variants={staggerItem}
                onClick={() => openBooking({ categoryId: cat.id })}
                className={`${CARD} group flex min-h-48 cursor-pointer flex-col items-start p-5 text-right transition-all duration-300 hover:-translate-y-1.5 hover:shadow-warm focus-visible:ring-2 focus-visible:ring-ring outline-none`}
                aria-label={`${cat.name} — ${toFa(cat.services.length)} خدمات`}
              >
                <span
                  className="arch-well mb-4 grid size-14 place-items-center transition-transform duration-300 group-hover:scale-110"
                  style={colorStyle}
                >
                  <Icon className="size-7" />
                </span>
                <span className="font-extrabold">{cat.name}</span>
                <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {cat.tagline}
                </span>
                <span className="mt-auto flex w-full items-center justify-between pt-4 text-xs font-bold">
                  <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                    {toFa(cat.services.length)} خدمات
                  </span>
                  <span className="grid size-7 place-items-center rounded-full border text-muted-foreground transition-all group-hover:border-brass group-hover:bg-brass group-hover:text-accent-foreground">
                    <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
                  </span>
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      )}
    </section>
  );
}

// ============================================================
// Journey — how it works (5 stages over an animated path)
// ============================================================
const JOURNEY = [
  {
    Icon: ClipboardCheck,
    title: "درخواست را ثبت کن",
    desc: "سرویس، زمان و آدرس — همه‌چیز چندثانیه‌ای و بدون تماس تلفنی.",
  },
  {
    Icon: Radar,
    title: "متخصص مناسب انتخاب می‌شود",
    desc: "سیستم بر اساس مهارت، منطقه و امتیاز، بهترین متخصص را پیشنهاد می‌دهد.",
  },
  {
    Icon: KeyRound,
    title: "کد ورود و شروع کار",
    desc: "پروفایل و امتیاز متخصص را می‌بینی؛ او فقط با کد ۴ رقمیِ تو وارد می‌شود.",
  },
  {
    Icon: Wallet,
    title: "پرداخت درون‌برنامه‌ای",
    desc: "بعد از انجام کار، داخل اپ پرداخت می‌کنی — شفاف و بدون پول نقد.",
  },
  {
    Icon: Star,
    title: "امتیاز دوطرفه",
    desc: "هم تو به متخصص امتیاز می‌دهی، هم او به تو؛ کیفیت همین‌طور حفظ می‌شود.",
  },
];

function Journey() {
  return (
    <section id="how" aria-label="مسیر سفارش" className="scroll-mt-20 border-y bg-muted/45">
      <div className="pattern-khatam">
        <div className={`${CONTAINER} py-14 md:py-20`}>
          <SectionHeading
            center
            eyebrow="فرآیند"
            title="از درخواست تا پرداخت، یک مسیر شفاف"
            sub="هر لحظه می‌دانی سفارش کجاست — بدون تماس‌های پی در پی."
          />

          <div className="relative">
            {/* animated connector (desktop) */}
            <svg
              className="absolute inset-x-10 top-7 hidden h-2 w-[calc(100%-5rem)] lg:block"
              preserveAspectRatio="none"
              aria-hidden
            >
              <line
                x1="0"
                y1="4"
                x2="100%"
                y2="4"
                stroke="var(--primary)"
                strokeOpacity="0.3"
                strokeWidth="2.5"
                strokeDasharray="6 8"
                className="animate-dash-flow"
                strokeLinecap="round"
              />
            </svg>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
            >
              {JOURNEY.map((step, i) => (
                <motion.div
                  key={step.title}
                  variants={staggerItem}
                  className={`${CARD} relative flex flex-col items-center p-5 pt-6 text-center transition-shadow hover:shadow-warm`}
                >
                  {/* arch number medallion */}
                  <span className="arch-well absolute -top-5 grid size-10 place-items-center bg-primary text-sm font-black text-primary-foreground shadow-glow-teal">
                    {toFa(i + 1)}
                  </span>
                  <span className="arch-well mt-3 grid size-14 place-items-center bg-brass/12 text-brass-deep dark:text-brass">
                    <step.Icon className="size-7" />
                  </span>
                  <p className="mt-3 font-extrabold">{step.title}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* micro-steps ribbon */}
          <Reveal delay={0.15} className="mt-10">
            <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-[11px] font-semibold text-muted-foreground">
              {[
                "ثبت درخواست",
                "انتخاب متخصص",
                "پذیرش سفارش",
                "مشاهده پروفایل",
                "حرکت به آدرس",
                "انجام کار",
                "پرداخت",
                "امتیاز",
                "کمیسیون",
              ].map((s, i, arr) => (
                <span key={s} className="inline-flex items-center gap-2">
                  <span className="rounded-full border bg-card px-2.5 py-1">{s}</span>
                  {i < arr.length - 1 ? <span className="text-brass">←</span> : null}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Trust bento — safety features with live mini-demos
// ============================================================
const DEMO_CODES = ["۵۴۲۳", "۷۸۱۲", "۹۰۳۶", "۴۲۳۱", "۱۸۹۷"];

function TrustBento() {
  const [codeIdx, setCodeIdx] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const t = setInterval(() => setCodeIdx((i) => (i + 1) % DEMO_CODES.length), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="trust" aria-label="امنیت و اعتماد" className={`${CONTAINER} scroll-mt-20 py-12 md:py-16`}>
      <SectionHeading
        eyebrow="امنیت"
        title="خیالت راحت باشد"
        sub="از لحظه ثبت سفارش تا پرداخت، همه‌چیز امن، قابل ردیابی و ثبت‌شده است."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        className="grid gap-4 lg:grid-cols-3"
      >
        {/* entry code — big card with phone mockup */}
        <motion.div variants={staggerItem} className={`${CARD} relative overflow-hidden p-6 lg:col-span-2`}>
          <div className="pattern-khatam pointer-events-none absolute inset-0 opacity-40" aria-hidden />
          <div className="relative flex flex-col items-center gap-6 sm:flex-row">
            <div className="flex-1 space-y-3">
              <span className="arch-well grid size-12 place-items-center bg-primary/10 text-primary">
                <KeyRound className="size-6" />
              </span>
              <p className="text-lg font-black">کد ورود یک‌بارمصرف</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                متخصص فقط با کد ۴ رقمی که <b className="text-foreground">فقط روی گوشی تو</b> ظاهر
                می‌شود وارد می‌شود؛ زمان ورود و خروج دقیق ثبت و در پرونده سفارش می‌ماند.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                  ورود: ۱۷:۰۲
                </span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                  خروج: ۱۸:۴۱
                </span>
                <span className="rounded-full bg-brass/15 px-3 py-1 text-[11px] font-bold text-brass-deep dark:text-brass">
                  ضمانت انجام
                </span>
              </div>
            </div>

            {/* phone mockup */}
            <div className="relative shrink-0">
              <div className="w-40 rounded-[1.6rem] border-4 border-foreground/80 bg-card p-2 shadow-warm-lg">
                <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-foreground/20" />
                <div className="rounded-xl bg-muted/60 p-3 text-center">
                  <p className="text-[10px] font-bold text-muted-foreground">کد ورود سفارش</p>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={codeIdx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      dir="ltr"
                      className="my-2 text-2xl font-black tracking-[0.3em] text-primary"
                    >
                      {DEMO_CODES[codeIdx]}
                    </motion.p>
                  </AnimatePresence>
                  <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-muted-foreground">
                    <ShieldCheck className="size-3 text-primary" />
                    فقط به تکنسین نشان بده
                  </div>
                </div>
                <div className="mt-2 h-6 rounded-lg bg-brass/20" />
              </div>
              <span className="absolute -right-2 -top-2 grid size-8 place-items-center rounded-full bg-brass text-accent-foreground shadow-glow-brass">
                <Zap className="size-4" />
              </span>
            </div>
          </div>
        </motion.div>

        {/* verification levels */}
        <motion.div variants={staggerItem} className={`${CARD} p-6`}>
          <span className="arch-well grid size-12 place-items-center bg-primary/10 text-primary">
            <ShieldCheck className="size-6" />
          </span>
          <p className="mt-3 text-lg font-black">سطوح تأیید متخصص‌ها</p>
          <ul className="mt-4 space-y-3">
            {[
              { emoji: "🟢", t: "سطح ۱ — هویت تأیید شده", d: "کد ملی و مدارک بررسی شده" },
              { emoji: "🔵", t: "سطح ۲ — مهارت تأیید شده", d: "+ مصاحبه و سنجش مهارت" },
              { emoji: "🟣", t: "سطح ۳ — متخصص برتر", d: "+ عملکرد عالی و سابقه موفق" },
            ].map((l) => (
              <li key={l.t} className="flex items-start gap-2.5 rounded-xl border bg-background/60 p-2.5">
                <span className="text-base leading-none" aria-hidden>{l.emoji}</span>
                <span>
                  <span className="block text-xs font-extrabold">{l.t}</span>
                  <span className="block text-[11px] text-muted-foreground">{l.d}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            کارهای حساس فقط به متخصص‌های سطح بالا سپرده می‌شود.
          </p>
        </motion.div>

        {/* live tracking */}
        <motion.div variants={staggerItem} className={`${CARD} p-6`}>
          <span className="arch-well grid size-12 place-items-center bg-primary/10 text-primary">
            <Radar className="size-6" />
          </span>
          <p className="mt-3 text-lg font-black">ردیابی زنده سفارش</p>
          <div className="relative mt-4 h-24 overflow-hidden rounded-xl border bg-muted/50">
            <svg viewBox="0 0 280 96" className="h-full w-full" aria-hidden>
              <path
                d="M20 80 C 70 80, 90 30, 150 30 S 250 60, 262 22"
                fill="none"
                stroke="var(--primary)"
                strokeOpacity="0.35"
                strokeWidth="3"
                strokeDasharray="7 8"
                className="animate-dash-flow"
                strokeLinecap="round"
              />
              <circle cx="262" cy="22" r="7" fill="var(--brass)" />
              {reduce ? (
                <circle cx="262" cy="22" r="7" fill="var(--primary)" opacity="0.7" />
              ) : (
                <motion.circle
                  r="7"
                  fill="var(--primary)"
                  animate={{
                    cx: [20, 150, 262],
                    cy: [80, 30, 22],
                    transition: {
                      duration: 4.5,
                      repeat: Infinity,
                      repeatDelay: 1,
                      ease: "easeInOut" as const,
                      times: [0, 0.55, 1],
                    },
                  }}
                />
              )}
            </svg>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            مسیر متخصص را تا لحظه رسیدن می‌بینی؛ ردیابی فقط در بازه همین سفارش فعال است.
          </p>
        </motion.div>

        {/* SOS */}
        <motion.div variants={staggerItem} className={`${CARD} p-6`}>
          <div className="flex items-center justify-between">
            <span className="arch-well grid size-12 place-items-center bg-destructive/10 text-destructive">
              <Siren className="size-6" />
            </span>
            <span className="relative grid size-9 place-items-center rounded-full bg-destructive font-black text-white">
              <span className="animate-pulse-ring absolute inset-0 rounded-full bg-destructive" aria-hidden />
              SOS
            </span>
          </div>
          <p className="mt-3 text-lg font-black">دکمه اضطراری دوطرفه</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            در هر لحظه از سفارش، اتصال مستقیم به پشتیبانی، اشتراک وضعیت و ثبت گزارش فوری — برای
            هر دو طرف.
          </p>
        </motion.div>

        {/* vetting */}
        <motion.div variants={staggerItem} className={`${CARD} p-6`}>
          <span className="arch-well grid size-12 place-items-center bg-primary/10 text-primary">
            <BadgeCheck className="size-6" />
          </span>
          <p className="mt-3 text-lg font-black">متخصص‌ها بررسی می‌شوند</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            هیچ‌کس بدون گذر از این سه فیلتر فعال نمی‌شود:
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["مدارک هویتی", "سنجش مهارت", "مصاحبه تلفنی ۵–۱۰ دقیقه‌ای"].map((c) => (
              <span key={c} className="rounded-full border bg-muted/60 px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                {c}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============================================================
// Plans — specialist commission model
// ============================================================
function PlansSection() {
  const openSpecialistLogin = useHomeFix((s) => s.openSpecialistLogin);

  const freeFeatures = ["ثبت‌نام رایگان", "۱۰ سفارش اول فقط ۱۰٪ کمیسیون", "دریافت سفارش از همان روز اول"];
  const proFeatures = ["کمیسیون فقط ۸٪", "اولویت در پیشنهاد سفارش‌ها", "پشتیبانی ویژه", "نشان حرفه‌ای در پروفایل"];

  const commissionRows = [
    { label: "۱۰ سفارش اول هر متخصص", free: "۱۰٪", pro: "۸٪" },
    { label: "بعد از ۱۰ سفارش", free: "۱۵٪", pro: "۸٪" },
    { label: "هزینه ماهانه", free: "۰ تومان", pro: "۱۹۹٬۰۰۰ تومان" },
  ];

  return (
    <section id="plans" aria-label="پلن‌های متخصص" className="scroll-mt-20 border-y bg-muted/45">
      <div className="pattern-khatam">
        <div className={`${CONTAINER} py-14 md:py-20`}>
          <SectionHeading
            center
            eyebrow="برای متخصص‌ها"
            title="پلن خودت را انتخاب کن"
            sub="شروع رایگان است؛ هر وقت خواستی ارتقا بده. کمیسیون فقط از سفارش موفق برداشته می‌شود."
          />

          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {/* FREE */}
            <Reveal>
              <div className={`${CARD} flex h-full flex-col p-6`}>
                <p className="text-lg font-black">پلن رایگان</p>
                <p className="mt-1 text-sm text-muted-foreground">برای شروع کار بدون هزینه اولیه</p>
                <p className="mt-4 text-3xl font-black text-primary">
                  ۰ <span className="text-sm font-semibold text-muted-foreground">تومان /ماه</span>
                </p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {freeFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="size-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="mt-6 min-h-11 border-primary/30 hover:bg-secondary"
                  onClick={() => openSpecialistLogin("register")}
                >
                  شروع رایگان
                </Button>
              </div>
            </Reveal>

            {/* PRO */}
            <Reveal delay={0.1}>
              <div className="pattern-khatam-light relative flex h-full flex-col overflow-hidden rounded-2xl bg-deep p-6 text-deep-foreground shadow-warm-lg">
                <span className="absolute -top-3 right-6 rounded-full bg-brass px-3 py-1 text-[11px] font-black text-accent-foreground shadow-glow-brass">
                  پیشنهاد ما
                </span>
                <p className="text-lg font-black">پلن حرفه‌ای</p>
                <p className="mt-1 text-sm text-deep-foreground/70">برای متخصص‌های جدی و پرکار</p>
                <p className="mt-4 text-3xl font-black text-brass">
                  {formatToman(199000)}
                  <span className="text-sm font-semibold text-deep-foreground/70"> /ماه</span>
                </p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {proFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="size-4 shrink-0 text-brass" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-6 min-h-11 bg-brass font-extrabold text-accent-foreground shadow-glow-brass hover:bg-brass/90"
                  onClick={() => openSpecialistLogin("register")}
                >
                  ارتقا و شروع
                </Button>
              </div>
            </Reveal>
          </div>

          {/* commission mini-table */}
          <Reveal delay={0.15} className="mx-auto mt-8 max-w-4xl">
            <div className={`${CARD} overflow-hidden`}>
              <div className="grid grid-cols-3 border-b bg-muted/60 px-4 py-3 text-xs font-black text-muted-foreground md:text-sm">
                <span>مدل کمیسیون</span>
                <span className="text-center">پلن رایگان</span>
                <span className="text-center">پلن حرفه‌ای</span>
              </div>
              {commissionRows.map((r) => (
                <div key={r.label} className="grid grid-cols-3 items-center border-b px-4 py-3 text-xs last:border-0 md:text-sm">
                  <span className="font-semibold">{r.label}</span>
                  <span className="text-center font-black text-primary">{r.free}</span>
                  <span className="text-center font-black text-brass-deep dark:text-brass">{r.pro}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <Percent className="size-3.5" />
              مثال: سرویس ۱٬۰۰۰٬۰۰۰ تومانی با کمیسیون ۱۵٪ → ۱۵۰٬۰۰۰ پلتفرم، ۸۵۰٬۰۰۰ متخصص.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Testimonials — rotating quotes (static content)
// ============================================================
const TESTIMONIALS = [
  {
    name: "سارا محمدی",
    city: "تهران، سعادت‌آباد",
    text: "سرویس کولر خواستم؛ ساعت ۵ عصر تکنسین با کد ورود رسید. همون لحظه ورودش ثبت شد و بعد از کار داخل اپ پرداخت کردم. انگار تاکسی گرفتن، ولی برای خونه!",
    rating: 5,
  },
  {
    name: "امیر رضایی",
    city: "کرج، گوهردشت",
    text: "لوله زیر سینک ترکیده بود. ۲۰ دقیقه بعد متخصص پذیرفت و قبل از رسیدنش امتیازها و سابقه کارش را دیدم. دقیقاً همون چیزی بود که پلتفرم قول داده بود.",
    rating: 5,
  },
  {
    name: "مریم احمدی",
    city: "اصفهان، مرداویج",
    text: "به‌عنوان متخصص ثبت‌نام کردم؛ مصاحبه تلفنی ۱۰ دقیقه‌ای گذاشتم و از هفته بعد سفارش‌ها شروع شد. کمیسیون شفافه و تسویه همیشه سر وقت است.",
    rating: 4,
  },
  {
    name: "حسین کریمی",
    city: "مشهد، احمدآباد",
    text: "کولرم را شب عید سرویس کردم! ردیابی زنده خیال‌ام را راحت کرد که دقیقاً کجای مسیر است. دکمه پشتیبانی هم که همیشه کنار دست است.",
    rating: 5,
  },
];

function Testimonials() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % TESTIMONIALS.length), 5200);
    return () => clearInterval(t);
  }, []);

  const item = TESTIMONIALS[idx];

  return (
    <section aria-label="نظر مشتریان" className={`${CONTAINER} py-12 md:py-16`}>
      <SectionHeading
        center
        eyebrow="اعتماد خانواده‌ها"
        title="مشتری‌ها چه می‌گویند؟"
      />
      <Reveal>
        <div className="relative mx-auto max-w-2xl">
          <Quote className="absolute -top-5 right-2 size-10 text-brass/30" aria-hidden />
          <div className={`${CARD} min-h-52 p-7 text-center md:p-9`}>
            <AnimatePresence mode="wait">
              <motion.figure
                key={idx}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <blockquote className="text-sm leading-relaxed text-foreground/90 md:text-base">
                  «{item.text}»
                </blockquote>
                <figcaption className="mt-5 flex flex-col items-center gap-2">
                  <span className="arch-well grid size-12 place-items-center bg-gradient-to-b from-primary to-primary/80 text-base font-black text-primary-foreground">
                    {initialsAvatar(item.name)}
                  </span>
                  <span className="text-sm font-extrabold">{item.name}</span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {item.city}
                  </span>
                  <StarRating value={item.rating} size={14} />
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            {TESTIMONIALS.map((t, i) => (
              <button
                key={t.name}
                type="button"
                aria-label={`نظر ${toFa(i + 1)}`}
                onClick={() => setIdx(i)}
                className={`h-2 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-ring outline-none ${
                  i === idx ? "w-6 bg-brass" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ============================================================
// Top specialists — GET /api/stats (topSpecialists)
// ============================================================
function TopSpecialists() {
  const openBooking = useHomeFix((s) => s.openBooking);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["stats"],
    queryFn: () => apiGet<{ stats: StatsDTO }>("/api/stats"),
    retry: 1,
  });

  if (isLoading) return <SpinnerRow label="در حال بارگذاری متخصص‌های برتر…" />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const top = data?.stats.topSpecialists ?? [];
  if (top.length === 0) return null;

  return (
    <div className={`${CONTAINER} pb-4`}>
      <SectionHeading
        eyebrow="متخصص‌های برتر"
        title="حرفه‌ای‌های HomeFix"
        sub="بهترین امتیازها، بیشترین سفارش موفق — همه با مدارک تأییدشده."
      />
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {top.map((sp) => (
          <motion.div
            key={sp.id}
            variants={staggerItem}
            className={`${CARD} flex flex-col items-center p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-warm`}
          >
            <span className="arch-well grid size-16 place-items-center bg-gradient-to-b from-primary to-primary/75 text-xl font-black text-primary-foreground shadow-glow-teal">
              {initialsAvatar(`${sp.firstName} ${sp.lastName}`)}
            </span>
            <p className="mt-3 font-extrabold">
              {sp.firstName} {sp.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{sp.skills[0]}</p>
            <StarRating value={sp.rating} count={sp.ratingCount} size={14} className="mt-2" />
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              {toFa(sp.successfulOrders)} سفارش موفق
            </p>
            <div className="mt-3 flex w-full items-center justify-between gap-2">
              <LevelBadge level={sp.verificationLevel} />
              <Button variant="outline" size="sm" className="min-h-9 border-primary/30" onClick={() => openBooking()}>
                رزرو
              </Button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// ============================================================
// FAQ — accordion + FAQPage JSON-LD
// ============================================================
const FAQS = [
  {
    q: "متخصص‌ها چطور تأیید می‌شوند؟",
    a: "همه متخصص‌ها باید مدارک هویتی بدهند، مهارت‌شان سنجیده شود و یک مصاحبه تلفنی ۵ تا ۱۰ دقیقه‌ای را بگذرانند. بعد از تأیید، نشان سطح ۱ یا ۲ می‌گیرند و سطح ۳ با عملکرد عالی به‌مرور اضافه می‌شود.",
  },
  {
    q: "کد ورود یک‌بارمصرف چیست؟",
    a: "وقتی متخصص سفارش را پذیرفت، یک کد ۴ رقمی روی گوشی تو ساخته می‌شود. متخصص هنگام رسیدن، آن کد را وارد می‌کند تا زمان ورود و خروجش دقیق ثبت شود — این یعنی امنیت خانه تو.",
  },
  {
    q: "پرداخت چطور انجام می‌شود؟",
    a: "پرداخت کاملاً درون‌برنامه‌ای و فقط بعد از انجام کار است: آنلاین یا از کیف پول. هزینه‌ها شفاف است و رسید همان لحظه صادر می‌شود.",
  },
  {
    q: "اگر از کیفیت کار راضی نباشم چه می‌شود؟",
    a: "تا قبل از پرداخت هیچ پولی جابه‌جا نمی‌شود. اگر از کار ناراضی باشی، پشتیبانی سفارش را بررسی می‌کند و اصلاح یا بازگشت وجه انجام می‌شود. امتیاز دوطرفه هم باعث می‌شود کیفیت همیشه زیر نظر باشد.",
  },
  {
    q: "کمیسیون پلتفرم چقدر است؟",
    a: "برای متخصص‌ها: ۱۰ سفارش اول ۱۰٪، بعد از آن در پلن رایگان ۱۵٪ و در پلن حرفه‌ای ۸٪ (با اشتراک ماهانه). ثبت‌نام همیشه رایگان است و کمیسیون فقط از سفارش موفق برداشته می‌شود.",
  },
  {
    q: "اطلاعات شخصی‌ام امن می‌ماند؟",
    a: "متخصص فقط نام، امتیاز، تعداد سفارش موفق و نشان‌های تأیید تو را می‌بیند؛ شماره تماس و آدرس دقیق فقط در بازه همان سفارش در دسترس است و ردیابی موقعیت پس از پایان کار خاموش می‌شود.",
  },
];

function FaqSection() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section id="faq" aria-label="سوالات پرتکرار" className={`${CONTAINER} scroll-mt-20 py-12 md:py-16`}>
      <SectionHeading center eyebrow="سوالات پرتکرار" title="هر سوالی داری، اینجاست" />
      <Reveal className="mx-auto max-w-3xl">
        <Accordion type="single" collapsible className="space-y-3">
          {FAQS.map((f, i) => (
            <AccordionItem
              key={f.q}
              value={`faq-${i}`}
              className="rounded-2xl border bg-card px-5 shadow-warm-sm last:border-b"
            >
              <AccordionTrigger className="py-4 text-right text-sm font-extrabold hover:no-underline md:text-base">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}

// ============================================================
// Final CTA — dark band
// ============================================================
function FinalCta() {
  const openBooking = useHomeFix((s) => s.openBooking);
  const openSpecialistLogin = useHomeFix((s) => s.openSpecialistLogin);

  return (
    <section aria-label="شروع کنید" className={`${CONTAINER} pb-16 pt-4 md:pb-20`}>
      <Reveal>
        <div className="pattern-khatam-light relative overflow-hidden rounded-3xl bg-deep px-6 py-12 text-center text-deep-foreground shadow-warm-lg md:py-16">
          <div className="pointer-events-none absolute -top-20 right-1/4 size-72 rounded-full bg-brass/20 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-24 left-1/4 size-72 rounded-full bg-primary/40 blur-3xl" aria-hidden />

          <span className="arch-well relative mx-auto grid size-14 place-items-center bg-brass/15 text-brass">
            <AirVent className="size-7" />
          </span>
          <h2 className="relative mx-auto mt-5 max-w-xl text-2xl font-black leading-snug md:text-3xl">
            خانه‌ات خوب کار می‌کند، وقتی متخصصِ درست به آن برسد
          </h2>
          <p className="relative mx-auto mt-3 max-w-lg text-sm leading-relaxed text-deep-foreground/70 md:text-base">
            همین حالا درخواست بده — متخصص تأییدشده با کد ورود امن سر وقت می‌رسد.
          </p>
          <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="min-h-12 gap-2 bg-brass px-7 text-base font-extrabold text-accent-foreground shadow-glow-brass hover:bg-brass/90"
              onClick={() => openBooking()}
            >
              <CalendarPlus className="size-5" />
              ثبت درخواست سرویس
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-h-12 gap-2 border-white/25 bg-transparent px-6 text-base text-deep-foreground hover:bg-white/10 hover:text-deep-foreground"
              onClick={() => openSpecialistLogin("register")}
            >
              <UserRoundPlus className="size-5" />
              عضویت متخصص‌ها
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ============================================================
// HomeView
// ============================================================
export function HomeView() {
  return (
    <div>
      <Hero />
      <MarqueeBand />
      <StatsBand />
      <AiAssistant />
      <CatalogGrid />
      <Journey />
      <TrustBento />
      <PlansSection />
      <Testimonials />
      <section aria-label="متخصص‌های برتر" className="border-y bg-muted/45">
        <div className="pattern-khatam py-12 md:py-16">
          <TopSpecialists />
        </div>
      </section>
      <FaqSection />
      <FinalCta />
    </div>
  );
}
