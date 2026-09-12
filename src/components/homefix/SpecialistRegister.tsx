"use client";

// ============================================================
// HomeFix — specialist registration (6-step wizard)
// 1 mobile+OTP  2 personal info  3 skills  4 experience
// 5 documents   6 interview → submit
// ============================================================

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  Fingerprint,
  Loader2,
  Lock,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost } from "./api";
import { categoryColorStyle, categoryIcon } from "./icons";
import { useHomeFix } from "@/lib/store";
import { toEnDigits, toFa } from "@/lib/format";
import type { CategoryDTO, SpecialistPrivateDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

const CITIES = ["تهران", "کرج", "اصفهان", "مشهد", "شیراز"];
const PHONE_RE = /^09\d{9}$/;
const STEP_TITLES = [
  "موبایل و تأیید کد",
  "اطلاعات شخصی",
  "تخصص‌ها",
  "سابقه کار",
  "مدارک و اطلاعات بانکی",
  "مصاحبه کوتاه",
];

const EXPERIENCE_OPTIONS = [
  { value: "1", label: "کمتر از ۱ سال" },
  { value: "3", label: "۱ تا ۳ سال" },
  { value: "5", label: "۳ تا ۵ سال" },
  { value: "10", label: "۵ تا ۱۰ سال" },
  { value: "15", label: "بیش از ۱۰ سال" },
];

const INTERVIEW_QUESTIONS: {
  q: string;
  options: string[];
  correct: number;
}[] = [
  {
    q: "مشتری می‌گوید کولرش روشن می‌شود ولی خنک نمی‌کند؛ اول چه می‌کنی؟",
    options: [
      "فوراً گاز شارژ می‌کنم",
      "فیلتر، فن و فشار گاز را به‌ترتیب بررسی می‌کنم",
      "کمپرسور را تعویض می‌کنم",
    ],
    correct: 1,
  },
  {
    q: "قبل از شروع کار در خانه مشتری چه می‌کنی؟",
    options: [
      "همین‌طور کار را شروع می‌کنم",
      "کد ورود را تأیید می‌کنم، مشکل را دقیق بررسی و توضیح می‌دهم",
      "ابزارهایم را همان‌جا پخش می‌کنم",
    ],
    correct: 1,
  },
  {
    q: "مشتری از مبلغ نهایی راضی نیست؛ چه می‌گویی؟",
    options: [
      "با آرامش توضیح می‌دهم و در صورت لزوم پشتیبانی HomeFix را در جریان می‌گذارم",
      "کاری به کارش ندارم",
      "کار را نیمه‌کاره رها می‌کنم",
    ],
    correct: 0,
  },
];

interface RegForm {
  phone: string;
  otp: string;
  firstName: string;
  lastName: string;
  city: string;
  area: string;
  serviceIds: string[];
  experienceYears: string;
  bio: string;
  nationalId: string;
  cardNumber: string;
  interview: (number | null)[];
}

const INITIAL: RegForm = {
  phone: "",
  otp: "",
  firstName: "",
  lastName: "",
  city: "تهران",
  area: "",
  serviceIds: [],
  experienceYears: "",
  bio: "",
  nationalId: "",
  cardNumber: "",
  interview: [null, null, null],
};

export function SpecialistRegister() {
  const openSpecialist = useHomeFix((s) => s.openSpecialist);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<RegForm>(INITIAL);
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [exists, setExists] = useState(false);
  const [registered, setRegistered] = useState<SpecialistPrivateDTO | null>(null);
  const [busy, setBusy] = useState(false);

  const catalogQuery = useQuery({
    queryKey: ["catalog"],
    queryFn: () => apiGet<{ categories: CategoryDTO[] }>("/api/catalog"),
    retry: 1,
  });
  const categories = catalogQuery.data?.categories ?? [];

  const set = <K extends keyof RegForm>(key: K, value: RegForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // ---------- step 1: phone + OTP ----------
  async function requestOtp() {
    const phone = toEnDigits(form.phone).trim();
    if (!PHONE_RE.test(phone)) {
      toast.error("شماره موبایل معتبر نیست (مثل ۰۹۱۲۱۲۳۴۵۶۷)");
      return;
    }
    set("phone", phone);
    setBusy(true);
    try {
      const res = await apiPost<{ exists: boolean; devOtp?: string }>(
        "/api/specialists/login",
        { phone }
      );
      setExists(res.exists);
      setDevOtp(res.devOtp ?? null);
      setOtpSent(true);
      toast.success("کد تأیید ارسال شد");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در ارسال کد");
    } finally {
      setBusy(false);
    }
  }

  async function confirmOtp() {
    const otp = toEnDigits(form.otp).trim();
    if (otp.length !== 6) {
      toast.error("کد ۶ رقمی را وارد کن");
      return;
    }
    setBusy(true);
    try {
      if (exists) {
        // already registered → just log in
        const res = await apiPost<{ specialist: SpecialistPrivateDTO }>(
          "/api/specialists/verify",
          { phone: form.phone, otp }
        );
        toast.success("قبلاً ثبت‌نام کردی؛ وارد شدی 👋");
        openSpecialist(res.specialist.id);
        return;
      }
      if (otp === devOtp) {
        toast.success("کد تأیید شد؛ ادامه ثبت‌نام");
        setStep(1);
      } else {
        toast.error("کد تأیید درست نیست");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در تأیید کد");
    } finally {
      setBusy(false);
    }
  }

  // ---------- navigation with per-step validation ----------
  function goNext() {
    if (step === 1) {
      if (form.firstName.trim().length < 2 || form.lastName.trim().length < 2) {
        toast.error("نام و نام خانوادگی را کامل وارد کن");
        return;
      }
      if (form.area.trim().length < 2) {
        toast.error("محدوده فعالیت را وارد کن");
        return;
      }
    }
    if (step === 2 && form.serviceIds.length === 0) {
      toast.error("حداقل یک تخصص انتخاب کن");
      return;
    }
    if (step === 3 && !form.experienceYears) {
      toast.error("سابقه کار را انتخاب کن");
      return;
    }
    if (step === 4) {
      const nid = toEnDigits(form.nationalId).trim();
      if (!/^\d{10}$/.test(nid)) {
        toast.error("کد ملی باید ۱۰ رقم باشد");
        return;
      }
      const card = toEnDigits(form.cardNumber).trim();
      if (card && !/^\d{16,24}$/.test(card)) {
        toast.error("شماره کارت باید ۱۶ تا ۲۴ رقم باشد");
        return;
      }
    }
    if (step === 5 && form.interview.some((a) => a === null)) {
      toast.error("به هر سه سؤال جواب بده");
      return;
    }
    setStep((s) => Math.min(5, s + 1));
  }

  function toggleService(id: string) {
    setForm((f) => ({
      ...f,
      serviceIds: f.serviceIds.includes(id)
        ? f.serviceIds.filter((x) => x !== id)
        : [...f.serviceIds, id],
    }));
  }

  // ---------- submit ----------
  async function submitRegistration() {
    setBusy(true);
    try {
      const card = toEnDigits(form.cardNumber).trim();
      const res = await apiPost<{ specialist: SpecialistPrivateDTO }>(
        "/api/specialists/register",
        {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone,
          city: form.city,
          area: form.area.trim(),
          nationalId: toEnDigits(form.nationalId).trim(),
          ...(card ? { cardNumber: card } : {}),
          ...(form.bio.trim() ? { bio: form.bio.trim() } : {}),
          experienceYears: Number(form.experienceYears),
          serviceIds: form.serviceIds,
        }
      );
      setRegistered(res.specialist);
      toast.success("ثبت‌نام تکمیل شد 🎉");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در ثبت‌نام");
    } finally {
      setBusy(false);
    }
  }

  // ---------- success screen ----------
  if (registered) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border bg-card p-8 text-center shadow-sm"
      >
        <span className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-primary/10">
          <CheckCircle2 className="size-9 text-primary" />
        </span>
        <h2 className="text-xl font-extrabold">ثبت‌نام تکمیل شد!</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          خوش آمدی {registered.firstName}؛ حساب تو فعال شد.
        </p>
        <div className="mx-auto mt-5 flex max-w-xs flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            🟢 هویت تأیید شده
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300">
            🔵 مهارت تأیید شده
          </span>
        </div>
        <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-extrabold text-secondary-foreground">
          <BadgeCheck className="size-4" />
          سطح شما: {toFa(2)} — تأیید هویت + مهارت
        </p>
        <p className="mx-auto mt-3 max-w-sm text-xs leading-relaxed text-muted-foreground">
          بعد از ۱۰ سفارش موفق با امتیاز بالای ۴٫۵ به سطح ۳ (متخصص برتر) ارتقا می‌گیری.
        </p>
        <Button size="lg" className="mt-6 min-h-12 px-8" onClick={() => openSpecialist(registered.id)}>
          ورود به پنل
          <ArrowLeft className="size-5" />
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      {/* progress header */}
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-extrabold">{STEP_TITLES[step]}</span>
          <span className="text-muted-foreground">مرحله {toFa(step + 1)} از {toFa(6)}</span>
        </div>
        <Progress value={((step + 1) / 6) * 100} aria-label="پیشرفت ثبت‌نام" />
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl border bg-card p-5 shadow-sm md:p-6"
      >
        {/* ---------- step 0: phone + OTP ---------- */}
        {step === 0 ? (
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">شماره موبایل</Label>
              <div className="flex gap-2">
                <Input
                  type="tel"
                  dir="ltr"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="09121234567"
                  className="min-h-11 flex-1 text-left"
                  disabled={otpSent}
                />
                <Button
                  className="min-h-11"
                  disabled={busy || otpSent}
                  onClick={requestOtp}
                >
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <Phone className="size-4" />}
                  دریافت کد
                </Button>
              </div>
            </div>

            {otpSent ? (
              <>
                {devOtp ? (
                  <p className="rounded-xl border border-accent/50 bg-accent/10 px-4 py-3 text-center text-sm font-bold text-accent-foreground">
                    کد نمایشی: {toFa(devOtp)}
                  </p>
                ) : null}
                <div>
                  <Label className="mb-2 block">کد تأیید ۶ رقمی</Label>
                  <Input
                    dir="ltr"
                    inputMode="numeric"
                    maxLength={6}
                    value={form.otp}
                    onChange={(e) => set("otp", e.target.value.replace(/\D/g, ""))}
                    placeholder="••••••"
                    className="min-h-11 text-center font-mono text-lg tracking-[0.5em]"
                  />
                </div>
                <Button className="min-h-11 w-full" disabled={busy} onClick={confirmOtp}>
                  تأیید و ادامه
                </Button>
              </>
            ) : (
              <p className="text-xs leading-relaxed text-muted-foreground">
                با تأیید شماره، ثبت‌نام شروع می‌شود. اگر قبلاً ثبت‌نام کرده باشی، مستقیم وارد پنل
                می‌شوی.
              </p>
            )}
          </div>
        ) : null}

        {/* ---------- step 1: personal info ---------- */}
        {step === 1 ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-2 block">نام</Label>
                <Input
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  placeholder="مثلاً محمد"
                  className="min-h-11"
                />
              </div>
              <div>
                <Label className="mb-2 block">نام خانوادگی</Label>
                <Input
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  placeholder="مثلاً رضایی"
                  className="min-h-11"
                />
              </div>
            </div>
            <div>
              <Label className="mb-2 block">شهر</Label>
              <Select value={form.city} onValueChange={(v) => set("city", v)}>
                <SelectTrigger className="min-h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">محدوده فعالیت</Label>
              <Input
                value={form.area}
                onChange={(e) => set("area", e.target.value)}
                placeholder="مثلاً سعادت‌آباد، شهرک غرب"
                className="min-h-11"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                سفارش‌های همین محدوده به شما پیشنهاد می‌شود.
              </p>
            </div>
          </div>
        ) : null}

        {/* ---------- step 2: skills ---------- */}
        {step === 2 ? (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">
              تخصص‌هایت را انتخاب کن ({toFa(form.serviceIds.length)} انتخاب شده)
            </p>
            {catalogQuery.isLoading ? (
              <Loader2 className="mx-auto size-6 animate-spin text-primary" />
            ) : catalogQuery.isError ? (
              <p className="text-center text-sm text-destructive">
                خطا در دریافت خدمات؛ دوباره تلاش کن.
              </p>
            ) : (
              <div className="thin-scroll max-h-96 space-y-4 overflow-y-auto pl-1">
                {categories.map((cat) => {
                  const Icon = categoryIcon(cat.icon);
                  return (
                    <div key={cat.id}>
                      <p className="mb-2 flex items-center gap-2 text-sm font-extrabold">
                        <span
                          className="grid size-7 place-items-center rounded-lg"
                          style={categoryColorStyle(cat.color)}
                        >
                          <Icon className="size-4" />
                        </span>
                        {cat.name}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {cat.services.map((srv) => {
                          const active = form.serviceIds.includes(srv.id);
                          return (
                            <button
                              key={srv.id}
                              type="button"
                              onClick={() => toggleService(srv.id)}
                              aria-pressed={active}
                              className={cn(
                                "inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                active
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "bg-card hover:bg-muted"
                              )}
                            >
                              {active ? <Check className="size-3.5" /> : null}
                              {srv.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {/* ---------- step 3: experience ---------- */}
        {step === 3 ? (
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">سابقه کار</Label>
              <Select
                value={form.experienceYears}
                onValueChange={(v) => set("experienceYears", v)}
              >
                <SelectTrigger className="min-h-11 w-full">
                  <SelectValue placeholder="انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">درباره خودت (اختیاری)</Label>
              <Textarea
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
                placeholder="مثلاً: متخصص کولرگازی با ۸ سال سابقه، علاقه‌مند به کار تمیز و قیمت منصفانه…"
                rows={4}
                className="resize-none"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                این متن در پروفایل عمومی شما نمایش داده می‌شود.
              </p>
            </div>
          </div>
        ) : null}

        {/* ---------- step 4: documents ---------- */}
        {step === 4 ? (
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">کد ملی (۱۰ رقم)</Label>
              <Input
                dir="ltr"
                inputMode="numeric"
                value={form.nationalId}
                onChange={(e) => set("nationalId", e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="0012345678"
                className="min-h-11 text-left font-mono"
              />
            </div>
            <div>
              <Label className="mb-2 block">شماره کارت بانکی (اختیاری — برای تسویه)</Label>
              <Input
                dir="ltr"
                inputMode="numeric"
                value={form.cardNumber}
                onChange={(e) =>
                  set("cardNumber", e.target.value.replace(/\D/g, "").slice(0, 24))
                }
                placeholder="6037991012345678"
                className="min-h-11 text-left font-mono"
              />
            </div>
            <p className="flex items-start gap-2 rounded-xl bg-secondary px-4 py-3 text-xs leading-relaxed text-secondary-foreground">
              <Lock className="mt-0.5 size-4 shrink-0" />
              اطلاعات بانکی شما رمزنگاری می‌شود و فقط برای تسویه حساب استفاده می‌شود.
            </p>
            <p className="flex items-start gap-2 rounded-xl border border-dashed px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              <Fingerprint className="mt-0.5 size-4 shrink-0 text-primary" />
              کد ملی شما برای احراز هویت سطح ۱ بررسی می‌شود.
            </p>
          </div>
        ) : null}

        {/* ---------- step 5: interview ---------- */}
        {step === 5 ? (
          <div className="space-y-6">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="size-4 text-accent-foreground" />
              سه سؤال کوتاه؛ پاسخ درست نشان حرفه‌ای بودن توست.
            </p>
            {INTERVIEW_QUESTIONS.map((item, qi) => (
              <fieldset key={qi} className="space-y-2">
                <legend className="mb-1 text-sm font-bold">
                  {toFa(qi + 1)}. {item.q}
                </legend>
                {item.options.map((opt, oi) => {
                  const selected = form.interview[qi] === oi;
                  const isCorrect = oi === item.correct;
                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() =>
                        setForm((f) => {
                          const next = [...f.interview];
                          next[qi] = oi;
                          return { ...f, interview: next };
                        })
                      }
                      aria-pressed={selected}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2.5 rounded-xl border p-3 text-right text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        selected ? "border-primary ring-2 ring-primary/30" : "hover:border-primary/40",
                        isCorrect && "border-primary/50 bg-primary/5"
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-5 shrink-0 place-items-center rounded-full border-2",
                          selected ? "border-primary bg-primary" : "border-border"
                        )}
                      >
                        {selected ? <Check className="size-3 text-primary-foreground" /> : null}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {isCorrect ? (
                        <ShieldCheck className="size-4 shrink-0 text-primary" aria-label="پاسخ درست" />
                      ) : null}
                    </button>
                  );
                })}
              </fieldset>
            ))}
          </div>
        ) : null}

        {/* ---------- nav buttons ---------- */}
        <div className="mt-6 flex gap-3">
          {step > 0 ? (
            <Button variant="outline" className="min-h-11 flex-1" onClick={() => setStep((s) => s - 1)}>
              <ArrowRight className="size-4" />
              مرحله قبل
            </Button>
          ) : null}
          {step < 5 ? (
            <Button className="min-h-11 flex-1" onClick={goNext}>
              مرحله بعد
              <ArrowLeft className="size-4" />
            </Button>
          ) : (
            <Button
              className="min-h-11 flex-1"
              disabled={busy}
              onClick={submitRegistration}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              ثبت‌نام و پایان
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
