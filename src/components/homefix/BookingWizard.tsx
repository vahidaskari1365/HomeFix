"use client";

// ============================================================
// HomeFix — 3-step booking wizard
// 1) choose service  2) time & address  3) confirm & submit
// ============================================================

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  MapPin,
  Sparkles,
  User,
  Wallet,
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
import { SearchAnimation } from "./SearchAnimation";
import { useHomeFix, type BookingPreset } from "@/lib/store";
import {
  formatDateFa,
  formatToman,
  nextDays,
  slotLabel,
  toEnDigits,
  toFa,
} from "@/lib/format";
import { TIME_SLOTS, type CategoryDTO, type OrderDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

const CITIES = ["تهران", "کرج", "اصفهان", "مشهد", "شیراز"];
const PHONE_RE = /^09\d{9}$/;
const STEP_TITLES = ["انتخاب سرویس", "زمان و آدرس", "تأیید و ارسال"];

interface BookingForm {
  name: string;
  phone: string;
  city: string;
  address: string;
  description: string;
}

export function BookingWizard() {
  const preset: BookingPreset = useHomeFix((s) => s.bookingPreset);
  const openTrack = useHomeFix((s) => s.openTrack);

  const [step, setStep] = useState(0);
  const [categoryId, setCategoryId] = useState<string | undefined>(preset.categoryId);
  const [serviceId, setServiceId] = useState<string | undefined>(preset.serviceId);
  const [dateIso, setDateIso] = useState<string>(nextDays(3)[0].iso);
  const [slot, setSlot] = useState<string | undefined>(undefined);
  const [form, setForm] = useState<BookingForm>({
    name: "",
    phone: "",
    city: "تهران",
    address: "",
    description: "",
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [waiting, setWaiting] = useState(false);

  const days = useMemo(() => nextDays(3), []);

  const catalogQuery = useQuery({
    queryKey: ["catalog"],
    queryFn: () => apiGet<{ categories: CategoryDTO[] }>("/api/catalog"),
    retry: 1,
  });
  const categories = catalogQuery.data?.categories ?? [];

  // if preset has only a serviceId, resolve its category once catalog loads
  useEffect(() => {
    if (!categoryId && preset.serviceId && categories.length > 0) {
      const cat = categories.find((c) => c.services.some((s) => s.id === preset.serviceId));
      if (cat) setCategoryId(cat.id);
    }
  }, [categoryId, preset.serviceId, categories]);

  const activeCategory = categories.find((c) => c.id === categoryId) ?? null;
  const selectedService = activeCategory?.services.find((s) => s.id === serviceId) ?? null;

  const submitOrder = useMutation({
    mutationFn: (body: Record<string, string>) =>
      apiPost<{ order: OrderDTO }>("/api/orders", body),
  });

  function goNext() {
    if (step === 0) {
      if (!serviceId) {
        toast.error("اول یک سرویس انتخاب کن");
        return;
      }
      setErrors({});
      setStep(1);
      return;
    }
    if (step === 1) {
      const phone = toEnDigits(form.phone).trim();
      const next: Partial<Record<string, string>> = {};
      if (form.name.trim().length < 2) next.name = "نام و نام خانوادگی را وارد کنید";
      if (!PHONE_RE.test(phone)) next.phone = "شماره موبایل معتبر نیست (مثل ۰۹۱۲۱۲۳۴۵۶۷)";
      if (form.address.trim().length < 8) next.address = "آدرس را دقیق‌تر بنویسید";
      if (!slot) next.slot = "یک بازه زمانی انتخاب کنید";
      setErrors(next);
      if (Object.keys(next).length > 0) return;
      setForm((f) => ({ ...f, phone }));
      setStep(2);
    }
  }

  async function submit() {
    if (!selectedService) return;
    setWaiting(true);
    const startedAt = Date.now();
    try {
      const body: Record<string, string> = {
        customerName: form.name.trim(),
        customerPhone: toEnDigits(form.phone).trim(),
        city: form.city,
        address: form.address.trim(),
        serviceId: selectedService.id,
        scheduledDate: dateIso,
        scheduledSlot: slot ?? TIME_SLOTS[0],
      };
      if (form.description.trim()) body.description = form.description.trim();
      const res = await submitOrder.mutateAsync(body);
      // keep the "searching" moment at least ~2.2s for good UX
      const elapsed = Date.now() - startedAt;
      if (elapsed < 2200) await new Promise((r) => setTimeout(r, 2200 - elapsed));
      toast.success("درخواست شما ثبت شد ✅");
      openTrack(res.order.id);
    } catch (e) {
      setWaiting(false);
      toast.error(e instanceof Error ? e.message : "خطا در ثبت سفارش");
    }
  }

  // ---------- waiting screen ----------
  if (waiting) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <SearchAnimation />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-10">
      {/* header */}
      <div className="mb-6 flex items-center gap-3">
        {step > 0 ? (
          <Button
            variant="ghost"
            size="icon"
            className="size-11"
            aria-label="مرحله قبل"
            onClick={() => setStep((s) => s - 1)}
          >
            <ChevronRight className="size-5" />
          </Button>
        ) : null}
        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-extrabold">{STEP_TITLES[step]}</span>
            <span className="text-muted-foreground">مرحله {toFa(step + 1)} از {toFa(3)}</span>
          </div>
          <Progress value={((step + 1) / 3) * 100} aria-label="پیشرفت ثبت درخواست" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ================= STEP 1 — service ================= */}
        {step === 0 ? (
          <motion.div
            key="step-service"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {preset.aiText ? (
              <div className="flex items-center gap-2 rounded-xl border border-accent/50 bg-accent/10 px-4 py-3 text-sm">
                <Sparkles className="size-4 text-accent-foreground" />
                <span>
                  بر اساس توضیح تو: <span className="font-bold">«{preset.aiText}»</span>
                </span>
              </div>
            ) : null}

            {/* category chips */}
            <div className="thin-scroll flex max-h-20 gap-2 overflow-y-auto pb-1" role="tablist" aria-label="دسته‌بندی‌ها">
              {categories.map((cat) => {
                const Icon = categoryIcon(cat.icon);
                const active = cat.id === categoryId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setCategoryId(cat.id)}
                    className={cn(
                      "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-card hover:bg-muted"
                    )}
                  >
                    <Icon className="size-4" />
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* services */}
            {catalogQuery.isLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
                ))}
              </div>
            ) : activeCategory ? (
              <div className="grid gap-3">
                {activeCategory.services.map((srv) => {
                  const active = srv.id === serviceId;
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => setServiceId(srv.id)}
                      aria-pressed={active}
                      className={cn(
                        "flex min-h-20 cursor-pointer items-start gap-3 rounded-2xl border bg-card p-4 text-right transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active ? "border-primary ring-2 ring-primary/30" : "hover:border-primary/40"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2",
                          active ? "border-primary bg-primary" : "border-border"
                        )}
                      >
                        {active ? <Check className="size-3 text-primary-foreground" /> : null}
                      </span>
                      <span className="flex-1">
                        <span className="block font-bold">{srv.name}</span>
                        {srv.description ? (
                          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                            {srv.description}
                          </span>
                        ) : null}
                      </span>
                      <span className="shrink-0 text-left">
                        <span className="block text-sm font-extrabold text-primary">
                          {formatToman(srv.basePrice)}
                        </span>
                        <span className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
                          <Clock className="size-3" />
                          ~{toFa(srv.durationMin)} دقیقه
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                یک دسته‌بندی را انتخاب کن
              </p>
            )}
          </motion.div>
        ) : null}

        {/* ================= STEP 2 — time & address ================= */}
        {step === 1 ? (
          <motion.div
            key="step-time"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* date chips */}
            <div>
              <Label className="mb-2 block">روز</Label>
              <div className="grid grid-cols-3 gap-2">
                {days.map((d) => {
                  const active = d.iso === dateIso;
                  return (
                    <button
                      key={d.iso}
                      type="button"
                      onClick={() => setDateIso(d.iso)}
                      aria-pressed={active}
                      className={cn(
                        "min-h-14 cursor-pointer rounded-xl border p-2 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active ? "border-primary bg-primary/5" : "bg-card hover:bg-muted"
                      )}
                    >
                      <span className="block text-sm font-bold">{d.label}</span>
                      <span className="block text-[11px] text-muted-foreground">{d.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* slot chips */}
            <div>
              <Label className="mb-2 block">بازه زمانی</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {TIME_SLOTS.map((s) => {
                  const active = s === slot;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSlot(s)}
                      aria-pressed={active}
                      className={cn(
                        "inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active ? "border-primary bg-primary/5" : "bg-card hover:bg-muted"
                      )}
                    >
                      <Clock className="size-3.5 text-muted-foreground" />
                      {slotLabel(s)}
                    </button>
                  );
                })}
              </div>
              {errors.slot ? <p className="mt-1.5 text-xs text-destructive">{errors.slot}</p> : null}
            </div>

            {/* city */}
            <div>
              <Label className="mb-2 block">شهر</Label>
              <Select value={form.city} onValueChange={(v) => setForm((f) => ({ ...f, city: v }))}>
                <SelectTrigger className="min-h-11 w-full">
                  <SelectValue placeholder="شهر را انتخاب کنید" />
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

            {/* address */}
            <div>
              <Label className="mb-2 block">آدرس دقیق</Label>
              <Textarea
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="محله، خیابان، کوچه، پلاک، واحد…"
                rows={2}
                className="resize-none"
              />
              {errors.address ? (
                <p className="mt-1.5 text-xs text-destructive">{errors.address}</p>
              ) : null}
            </div>

            {/* description */}
            <div>
              <Label className="mb-2 block">توضیحات (اختیاری)</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="مثلاً: دستگاه مدل ۱۳۹۸ است، صدا می‌دهد…"
                rows={2}
                className="resize-none"
              />
            </div>

            {/* name & phone */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-2 block">نام و نام خانوادگی</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="مثلاً سارا محمدی"
                  autoComplete="name"
                  className="min-h-11"
                />
                {errors.name ? (
                  <p className="mt-1.5 text-xs text-destructive">{errors.name}</p>
                ) : null}
              </div>
              <div>
                <Label className="mb-2 block">شماره موبایل</Label>
                <Input
                  type="tel"
                  dir="ltr"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="09121234567"
                  autoComplete="tel"
                  className="min-h-11 text-left"
                />
                {errors.phone ? (
                  <p className="mt-1.5 text-xs text-destructive">{errors.phone}</p>
                ) : null}
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* ================= STEP 3 — confirm ================= */}
        {step === 2 && selectedService ? (
          <motion.div
            key="step-confirm"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3 border-b pb-4">
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-11 place-items-center rounded-xl"
                    style={categoryColorStyle(activeCategory?.color)}
                  >
                    {(() => {
                      const Icon = categoryIcon(activeCategory?.icon);
                      return <Icon className="size-5" />;
                    })()}
                  </span>
                  <div>
                    <p className="font-extrabold">{selectedService.name}</p>
                    <p className="text-xs text-muted-foreground">{activeCategory?.name}</p>
                  </div>
                </div>
                <p className="font-extrabold text-primary">{formatToman(selectedService.basePrice)}</p>
              </div>

              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span>
                    <span className="text-muted-foreground">زمان: </span>
                    {formatDateFa(dateIso)} — {slotLabel(slot ?? "")}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span>
                    <span className="text-muted-foreground">آدرس: </span>
                    {form.city}، {form.address}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <User className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span>
                    <span className="text-muted-foreground">مشتری: </span>
                    {form.name} — <span dir="ltr">{toEnDigits(form.phone)}</span>
                  </span>
                </div>
              </dl>

              <p className="mt-4 flex items-center gap-2 rounded-xl bg-secondary px-4 py-3 text-xs font-semibold text-secondary-foreground">
                <Wallet className="size-4" />
                پرداخت فقط بعد از انجام کار، داخل اپ انجام می‌شود.
              </p>
            </div>

            <Button
              size="lg"
              className="min-h-12 w-full text-base"
              disabled={submitOrder.isPending}
              onClick={submit}
            >
              ثبت درخواست
              <ArrowLeft className="size-5" />
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setStep(1)}>
              <ArrowRight className="size-4" />
              ویرایش زمان و آدرس
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* next button (steps 0 & 1) */}
      {step < 2 ? (
        <Button size="lg" className="mt-6 min-h-12 w-full text-base" onClick={goNext}>
          مرحله بعد
          <ArrowLeft className="size-5" />
        </Button>
      ) : null}
    </div>
  );
}
