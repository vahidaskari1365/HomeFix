"use client";

// ============================================================
// HomeFix — Home view (hero, stats, AI assistant, catalog,
// how-it-works, trust, plans, specialist CTA, top specialists)
// ============================================================

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AirVent,
  ArrowLeft,
  BadgeCheck,
  CalendarPlus,
  Check,
  ClipboardCheck,
  Droplets,
  KeyRound,
  MapPin,
  Percent,
  Quote,
  Radar,
  ShieldCheck,
  Siren,
  Sparkles,
  Star,
  UserCheck,
  UserRoundPlus,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost } from "./api";
import { categoryColorStyle, categoryIcon } from "./icons";
import {
  ErrorState,
  LevelBadge,
  SectionHeading,
  StarRating,
  SpinnerRow,
  staggerContainer,
  staggerItem,
} from "./bits";
import { useHomeFix } from "@/lib/store";
import { formatToman, initialsAvatar, toFa } from "@/lib/format";
import type { AiSuggestionDTO, CategoryDTO, StatsDTO } from "@/lib/types";

const CONTAINER = "mx-auto max-w-6xl px-4";
const CARD = "rounded-2xl border bg-card shadow-sm";

// ============================================================
// Hero
// ============================================================
function Hero() {
  const openBooking = useHomeFix((s) => s.openBooking);
  const openSpecialistLogin = useHomeFix((s) => s.openSpecialistLogin);

  const bubbles = [
    { Icon: AirVent, className: "top-8 right-8", delay: 0 },
    { Icon: Droplets, className: "top-24 left-10", delay: 0.7 },
    { Icon: Zap, className: "bottom-24 right-16", delay: 1.2 },
    { Icon: Sparkles, className: "bottom-10 left-16", delay: 0.4 },
  ];

  const trustChips = [
    { Icon: ShieldCheck, label: "پرداخت امن" },
    { Icon: BadgeCheck, label: "ضمانت کیفیت" },
    { Icon: KeyRound, label: "کد ورود امن" },
  ];

  return (
    <section aria-label="معرفی HomeFix" className="relative overflow-hidden">
      <div className={`${CONTAINER} grid items-center gap-10 pt-12 pb-8 md:grid-cols-2 md:pt-20 md:pb-12`}>
        {/* copy */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-6"
        >
          <h1 className="text-3xl leading-[1.25] font-extrabold md:text-5xl md:leading-[1.2]">
            متخصص خانگی،{" "}
            <span className="bg-gradient-to-l from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              به سادگیِ یک انتخاب
            </span>
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            از کولر تا لوله‌کشی — انتخاب کن، متخصص مناسب می‌رسد، با خیال راحت پرداخت کن.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" className="min-h-11 px-6 text-base" onClick={() => openBooking()}>
              <CalendarPlus className="size-5" />
              ثبت درخواست
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-h-11 px-6 text-base"
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
                className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground"
              >
                <c.Icon className="size-3.5 text-primary" />
                {c.label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
          className="relative"
        >
          <div className="relative h-72 overflow-hidden rounded-3xl bg-gradient-to-bl from-emerald-500 via-teal-600 to-emerald-800 shadow-xl md:h-80">
            <div className="absolute -top-10 -left-10 size-40 rounded-full bg-white/10 blur-2xl" aria-hidden />
            <div className="absolute -right-12 bottom-0 size-52 rounded-full bg-amber-400/20 blur-3xl" aria-hidden />

            {/* floating icon bubbles */}
            {bubbles.map((b, i) => (
              <motion.span
                key={i}
                className={`absolute grid size-14 place-items-center rounded-2xl bg-white/15 text-white shadow-lg backdrop-blur-sm ${b.className}`}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, delay: b.delay, ease: "easeInOut" }}
                aria-hidden
              >
                <b.Icon className="size-7" />
              </motion.span>
            ))}

            {/* glass status card */}
            <motion.div
              className="absolute bottom-5 right-5 left-5 rounded-2xl bg-white/90 p-4 shadow-lg backdrop-blur dark:bg-white/10"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <AirVent className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">سرویس و شارژ کولر گازی</p>
                    <p className="text-xs text-muted-foreground">امروز، ۹ تا ۱۱ صبح</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                  <ShieldCheck className="size-3.5" />
                  متخصص تأیید شد
                </span>
              </div>
              <div className="mt-3 flex items-center gap-1 border-t pt-3">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold">۴٫۹</span>
                <span className="text-xs text-muted-foreground">— از ۳۲۶ سفارش موفق</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// Stats strip — GET /api/stats
// ============================================================
function StatsStrip() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["stats"],
    queryFn: () => apiGet<{ stats: StatsDTO }>("/api/stats"),
    retry: 1,
  });

  const stats = data?.stats;
  const items = [
    { label: "متخصص فعال", value: stats ? toFa(stats.specialistsCount) : "—" },
    { label: "سفارش موفق", value: stats ? toFa(stats.ordersCount) : "—" },
    { label: "میانگین امتیاز", value: stats ? `${toFa(stats.avgRating.toFixed(1))} ★` : "—" },
    { label: "دسته خدمات", value: toFa(8) },
  ];

  return (
    <section aria-label="آمار پلتفرم" className={`${CONTAINER} py-6 md:py-8`}>
      {isError ? (
        <ErrorState message="خطا در دریافت آمار" onRetry={() => refetch()} />
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {items.map((item) => (
            <div key={item.label} className={`${CARD} p-5 text-center`}>
              {isLoading ? (
                <div className="mx-auto mb-2 h-7 w-14 animate-pulse rounded bg-muted" />
              ) : (
                <p className="text-2xl font-extrabold text-primary">{item.value}</p>
              )}
              <p className="mt-1 text-xs font-medium text-muted-foreground md:text-sm">{item.label}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ============================================================
// AI assistant — POST /api/ai/suggest
// ============================================================
function AiAssistant() {
  const openBooking = useHomeFix((s) => s.openBooking);
  const [text, setText] = useState("");

  const suggest = useMutation({
    mutationFn: (t: string) =>
      apiPost<{ suggestion: AiSuggestionDTO | null }>("/api/ai/suggest", { text: t }),
  });

  const suggestion = suggest.data?.suggestion ?? null;

  return (
    <section aria-label="دستیار هوشمند" className={`${CONTAINER} py-8`}>
      <div className={`${CARD} mx-auto max-w-3xl p-6 md:p-8`}>
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-accent/15 text-accent-foreground">
            <Sparkles className="size-5" />
          </span>
          <div>
            <h2 className="font-extrabold">نمی‌دانی چه سرویسی لازم داری؟</h2>
            <p className="text-xs text-muted-foreground">مشکل را بنویس، دستیار هوشمند پیشنهاد می‌دهد</p>
          </div>
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="مثلاً: کولرم روشن می‌شه ولی خنک نمی‌کنه…"
          rows={3}
          className="resize-none"
          aria-label="توصیف مشکل"
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            className="min-h-11 bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={suggest.isPending || text.trim().length < 3}
            onClick={() => suggest.mutate(text.trim())}
          >
            <Sparkles className="size-4" />
            {suggest.isPending ? "در حال فکر کردن…" : "دستیار هوشمند HomeFix"}
          </Button>
          {suggest.isError ? (
            <p className="text-sm text-muted-foreground">
              الان نمی‌تونم پیشنهاد بدم؛ از دسته‌بندی‌ها انتخاب کن
            </p>
          ) : null}
        </div>

        {suggestion ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-xl border border-accent/50 bg-accent/10 p-4"
          >
            <p className="text-sm leading-relaxed">
              <span className="font-extrabold">پیشنهاد ما: {suggestion.serviceName}</span>
              <span className="text-muted-foreground"> — {suggestion.reason}</span>
            </p>
            <Button
              className="mt-3 min-h-11"
              onClick={() => openBooking({ serviceId: suggestion.serviceId, aiText: text.trim() })}
            >
              شروع درخواست با این سرویس
              <ArrowLeft className="size-4" />
            </Button>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}

// ============================================================
// Catalog grid — GET /api/catalog
// ============================================================
function CatalogGrid() {
  const openBooking = useHomeFix((s) => s.openBooking);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["catalog"],
    queryFn: () => apiGet<{ categories: CategoryDTO[] }>("/api/catalog"),
    retry: 1,
  });

  return (
    <section id="catalog" aria-label="دسته‌بندی خدمات" className={`${CONTAINER} py-12 md:py-16`}>
      <SectionHeading
        eyebrow="خدمات"
        title="چه کاری لازم داری؟"
        sub="دسته را انتخاب کن؛ متخصص‌های همان حوزه برایت پیشنهاد می‌شوند."
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
                className={`${CARD} group flex min-h-44 cursor-pointer flex-col items-start p-5 text-right transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring outline-none`}
                aria-label={`${cat.name} — ${toFa(cat.services.length)} خدمات`}
              >
                <span
                  className="mb-4 grid size-12 place-items-center rounded-xl"
                  style={colorStyle}
                >
                  <Icon className="size-6" />
                </span>
                <span className="font-extrabold">{cat.name}</span>
                <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {cat.tagline}
                </span>
                <span className="mt-auto flex w-full items-center justify-between pt-4 text-xs font-bold">
                  <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                    {toFa(cat.services.length)} خدمات
                  </span>
                  <ArrowLeft className="size-4 text-muted-foreground transition-transform group-hover:-translate-x-1" />
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
// How it works — 9 steps
// ============================================================
const HOW_STEPS = [
  { icon: ClipboardCheck, title: "ثبت درخواست", desc: "سرویس، زمان و آدرس را در چند ثانیه انتخاب می‌کنی." },
  { icon: Sparkles, title: "انتخاب متخصص", desc: "سیستم، متخصصِ مناسبِ منطقه و تخصص را پیدا می‌کند." },
  { icon: Check, title: "پذیرش سفارش", desc: "متخصص سفارش را می‌پذیرد و کد ورود ساخته می‌شود." },
  { icon: UserCheck, title: "مشاهده پروفایل", desc: "امتیاز، سطح تأیید و سابقه متخصص را می‌بینی." },
  { icon: MapPin, title: "حرکت به آدرس", desc: "متخصص در مسیر است؛ ردیابی زنده سفارش فعال می‌شود." },
  { icon: Wrench, title: "انجام کار", desc: "کار با ابزار کامل انجام و ورود/خروج ثبت می‌شود." },
  { icon: Wallet, title: "پرداخت درون‌برنامه‌ای", desc: "فقط بعد از انجام کار، داخل اپ پرداخت می‌کنی." },
  { icon: Star, title: "امتیاز دوطرفه", desc: "هم تو به متخصص امتیاز می‌دهی، هم او به تو." },
  { icon: Percent, title: "کمیسیون پلتفرم", desc: "پلتفرم فقط درصد کمی از هر کار موفق برمی‌دارد." },
];

function HowItWorks() {
  return (
    <section id="how" aria-label="نحوه کار" className="bg-muted/40">
      <div className={`${CONTAINER} py-12 md:py-16`}>
        <SectionHeading
          eyebrow="فرآیند"
          title="از درخواست تا پرداخت، ۹ قدم"
          sub="کل مسیر شفاف است؛ هر لحظه می‌دانی سفارش کجاست."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {HOW_STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              variants={staggerItem}
              className={`${CARD} relative p-5`}
            >
              <span className="absolute top-4 left-4 text-3xl font-black text-primary/10" aria-hidden>
                {toFa(i + 1)}
              </span>
              <div className="mb-3 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="size-5" />
                </span>
                <span className="grid size-6 place-items-center rounded-full bg-primary text-[11px] font-extrabold text-primary-foreground">
                  {toFa(i + 1)}
                </span>
              </div>
              <p className="font-bold">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// Trust section
// ============================================================
function TrustSection() {
  return (
    <section id="trust" aria-label="امنیت و اعتماد" className={`${CONTAINER} py-12 md:py-16`}>
      <SectionHeading
        eyebrow="امنیت"
        title="خیالت راحت باشد"
        sub="از لحظه ثبت سفارش تا پرداخت، همه‌چیز امن و قابل ردیابی است."
      />
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <motion.div variants={staggerItem} className={`${CARD} p-5`}>
          <span className="mb-3 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <KeyRound className="size-5" />
          </span>
          <p className="font-bold">کد ورود یک‌بارمصرف</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            متخصص فقط با کد ۴ رقمی که خودت به او می‌گویی وارد می‌شود؛ زمان ورود دقیق ثبت می‌شود.
          </p>
        </motion.div>

        <motion.div variants={staggerItem} className={`${CARD} p-5`}>
          <span className="mb-3 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="size-5" />
          </span>
          <p className="font-bold">سطوح احراز هویت متخصص‌ها</p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500" aria-hidden />
              سطح ۱ — هویت
            </li>
            <li className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-blue-500" aria-hidden />
              سطح ۲ — هویت + مهارت
            </li>
            <li className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-purple-500" aria-hidden />
              سطح ۳ — + عملکرد عالی
            </li>
          </ul>
        </motion.div>

        <motion.div variants={staggerItem} className={`${CARD} p-5`}>
          <span className="mb-3 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <Radar className="size-5" />
          </span>
          <p className="font-bold">ردیابی زنده سفارش</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            مسیر متخصص را تا لحظه رسیدن می‌بینی؛ ردیابی فقط در بازه همین سفارش فعال است.
          </p>
        </motion.div>

        <motion.div variants={staggerItem} className={`${CARD} p-5`}>
          <span className="mb-3 grid size-11 place-items-center rounded-xl bg-destructive/10 text-destructive">
            <Siren className="size-5" />
          </span>
          <p className="font-bold">دکمه اضطراری</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            در هر لحظه از سفارش، یک دکمه مستقیم به تیم پشتیبانی و گزارش فوری داری.
          </p>
        </motion.div>

        <motion.div variants={staggerItem} className={`${CARD} p-5`}>
          <span className="mb-3 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <BadgeCheck className="size-5" />
          </span>
          <p className="font-bold">بررسی‌شده بودن متخصص‌ها</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            همه متخصص‌ها مدارک، مهارت و مصاحبه را می‌گذرانند و بعد فعال می‌شوند.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============================================================
// Plans
// ============================================================
function PlansSection() {
  const openSpecialistLogin = useHomeFix((s) => s.openSpecialistLogin);

  const freeFeatures = ["ثبت‌نام رایگان", "کمیسیون ۱۵٪", "۱۰ سفارش اول فقط ۱۰٪"];
  const proFeatures = ["کمیسیون ۸٪", "اولویت در نمایش", "پشتیبانی ویژه", "نشان حرفه‌ای در پروفایل"];

  return (
    <section id="plans" aria-label="پلن‌های متخصص" className="bg-muted/40">
      <div className={`${CONTAINER} py-12 md:py-16`}>
        <SectionHeading
          center
          eyebrow="برای متخصص‌ها"
          title="پلن خودت را انتخاب کن"
          sub="شروع رایگان است؛ هر وقت خواستی ارتقا بده."
        />
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {/* FREE */}
          <div className={`${CARD} flex flex-col p-6`}>
            <p className="text-lg font-extrabold">پلن رایگان</p>
            <p className="mt-1 text-sm text-muted-foreground">برای شروع کار بدون هزینه اولیه</p>
            <p className="mt-4 text-2xl font-black text-primary">۰ تومان<span className="text-sm font-medium text-muted-foreground"> /ماه</span></p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="size-4 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="mt-6 min-h-11" onClick={() => openSpecialistLogin("register")}>
              شروع رایگان
            </Button>
          </div>

          {/* PRO */}
          <div className="relative flex flex-col rounded-2xl border-2 border-accent bg-card p-6 shadow-md">
            <span className="absolute -top-3 right-6 rounded-full bg-accent px-3 py-1 text-[11px] font-extrabold text-accent-foreground shadow">
              بهترین انتخاب
            </span>
            <p className="text-lg font-extrabold">پلن حرفه‌ای</p>
            <p className="mt-1 text-sm text-muted-foreground">برای متخصص‌های جدی و پرکار</p>
            <p className="mt-4 text-2xl font-black text-primary">
              {formatToman(199000)}
              <span className="text-sm font-medium text-muted-foreground"> /ماه</span>
            </p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="size-4 text-accent-foreground" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="mt-6 min-h-11 bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => openSpecialistLogin("register")}
            >
              ارتقا و شروع
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Specialist CTA (quote)
// ============================================================
function SpecialistCta() {
  const openSpecialistLogin = useHomeFix((s) => s.openSpecialistLogin);
  return (
    <section aria-label="دعوت متخصص‌ها" className={`${CONTAINER} py-12 md:py-16`}>
      <div className={`${CARD} relative mx-auto max-w-3xl p-8 text-center`}>
        <Quote className="mx-auto mb-4 size-8 text-accent" aria-hidden />
        <p className="mx-auto max-w-xl text-lg leading-relaxed font-semibold md:text-xl">
          ما برای متخصص‌ها مشتری آماده می‌آوریم؛ ثبت‌نام اولیه رایگانه و فقط از هر کاری که از طریق
          ما بگیری، درصد کمی کمیسیون می‌دی.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">— تیم HomeFix</p>
        <Button size="lg" className="mt-6 min-h-11 px-6" onClick={() => openSpecialistLogin("register")}>
          <UserRoundPlus className="size-5" />
          ثبت‌نام متخصص
        </Button>
      </div>
    </section>
  );
}

// ============================================================
// Top specialists — from stats.topSpecialists
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
    <div className={`${CONTAINER} pb-12 md:pb-16`}>
      <SectionHeading
        eyebrow="متخصص‌های برتر"
        title="حرفه‌ای‌های HomeFix"
        sub="بهترین امتیازها، بیشترین سفارش موفق."
      />
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {top.map((sp) => (
          <motion.div key={sp.id} variants={staggerItem} className={`${CARD} flex flex-col p-5`}>
            <div className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-bl from-emerald-500 to-teal-700 text-lg font-extrabold text-white">
                {initialsAvatar(`${sp.firstName} ${sp.lastName}`)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold">
                  {sp.firstName} {sp.lastName}
                </p>
                <p className="truncate text-xs text-muted-foreground">{sp.skills[0]}</p>
              </div>
            </div>
            <StarRating value={sp.rating} count={sp.ratingCount} size={14} className="mt-3" />
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              {toFa(sp.successfulOrders)} سفارش موفق
            </p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <LevelBadge level={sp.verificationLevel} />
              <Button variant="outline" size="sm" className="min-h-9" onClick={() => openBooking()}>
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
// HomeView
// ============================================================
export function HomeView() {
  return (
    <div>
      <Hero />
      <StatsStrip />
      <AiAssistant />
      <CatalogGrid />
      <HowItWorks />
      <TrustSection />
      <PlansSection />
      <SpecialistCta />
      <section aria-label="متخصص‌های برتر" className="bg-muted/40">
        <div className="py-12 md:py-16">
          <TopSpecialists />
        </div>
      </section>
    </div>
  );
}
