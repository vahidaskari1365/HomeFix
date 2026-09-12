"use client";

// ============================================================
// HomeFix — specialist dashboard
// profile + availability, offers, active orders, earnings,
// plan, history & reviews
// ============================================================

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  CalendarDays,
  CheckCircle2,
  DoorOpen,
  History,
  Hourglass,
  LogOut,
  MapPin,
  Phone,
  Play,
  Star,
  Sun,
  UserRoundCog,
  Wallet,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { apiGet, apiPost, ApiError } from "./api";
import { CATEGORY_ICONS } from "./icons";
import {
  EmptyState,
  ErrorState,
  OrderTimeline,
  SpinnerRow,
  StatusBadge,
  StarRating,
  LevelBadges,
  staggerContainer,
  staggerItem,
} from "./bits";
import { useHomeFix } from "@/lib/store";
import { formatDateFa, formatToman, initialsAvatar, slotLabel, toEnDigits, toFa } from "@/lib/format";
import type { OrderDTO, SpecialistDashboardDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SpecialistDashboardView() {
  const specialistId = useHomeFix((s) => s.specialistId);
  const openSpecialistLogin = useHomeFix((s) => s.openSpecialistLogin);

  if (!specialistId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <EmptyState
          icon={<UserRoundCog className="size-7" />}
          title="برای دیدن پنل، وارد حسابت شو"
          sub="با شماره موبایل متخصص وارد شو یا ثبت‌نام کن."
          action={
            <Button onClick={() => openSpecialistLogin("login")}>
              ورود متخصص
            </Button>
          }
        />
      </div>
    );
  }

  return <Dashboard specialistId={specialistId} />;
}

function Dashboard({ specialistId }: { specialistId: string }) {
  const queryClient = useQueryClient();
  const clearSpecialist = useHomeFix((s) => s.clearSpecialist);

  const dashQuery = useQuery({
    queryKey: ["dashboard", specialistId],
    queryFn: () => apiGet<{ dashboard: SpecialistDashboardDTO }>(`/api/specialists/${specialistId}`),
    retry: 1,
    refetchInterval: 6000,
  });

  function logout() {
    clearSpecialist();
    toast.success("از حسابت خارج شدی");
  }

  if (dashQuery.isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <SpinnerRow label="در حال دریافت پنل…" />
      </div>
    );
  }

  if (dashQuery.isError || !dashQuery.data?.dashboard) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <ErrorState onRetry={() => dashQuery.refetch()} />
        <div className="mt-4 text-center">
          <Button variant="ghost" onClick={logout}>
            <LogOut className="size-4" />
            خروج از حساب
          </Button>
        </div>
      </div>
    );
  }

  const dash = dashQuery.data.dashboard;
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["dashboard", specialistId] });

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 md:py-10">
      <ProfileHeader dash={dash} onToggleAvailability={invalidate} onLogout={logout} />
      <OffersSection dash={dash} onDone={invalidate} />
      <ActiveOrdersSection dash={dash} onDone={invalidate} />
      <EarningsCard dash={dash} />
      <PlanCard dash={dash} onDone={invalidate} />
      <HistorySection dash={dash} />

      <div className="text-center">
        <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={logout}>
          <LogOut className="size-4" />
          خروج از حساب
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// Profile header
// ============================================================
function ProfileHeader({
  dash,
  onToggleAvailability,
  onLogout,
}: {
  dash: SpecialistDashboardDTO;
  onToggleAvailability: () => void;
  onLogout: () => void;
}) {
  const sp = dash.specialist;
  const toggle = useMutation({
    mutationFn: (isAvailable: boolean) =>
      apiPost<{ specialist: unknown }>(`/api/specialists/${sp.id}/availability`, {
        isAvailable,
      }),
    onSuccess: (_, isAvailable) => {
      toast.success(isAvailable ? "آنلاین شدی؛ منتظر سفارش باش 🟢" : "آفلاین شدی");
      onToggleAvailability();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "خطا در تغییر وضعیت"),
  });

  const commissionText =
    sp.plan === "PRO"
      ? `کمیسیون ${toFa(sp.commissionPreview)}٪ — پلن حرفه‌ای`
      : sp.commissionPreview <= 10
        ? `کمیسیون ${toFa(sp.commissionPreview)}٪ — ${toFa(10)} سفارش اول`
        : `کمیسیون ${toFa(sp.commissionPreview)}٪ — پلن رایگان`;

  return (
    <motion.section
      aria-label="پروفایل متخصص"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border bg-card p-5 shadow-sm md:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="arch-well grid size-16 shrink-0 place-items-center bg-gradient-to-b from-primary to-primary/75 text-xl font-extrabold text-primary-foreground shadow-glow-teal">
            {initialsAvatar(`${sp.firstName} ${sp.lastName}`)}
          </span>
          <div className="space-y-1.5">
            <h1 className="text-lg font-extrabold">
              {sp.firstName} {sp.lastName}
            </h1>
            <LevelBadges level={sp.verificationLevel} />
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span dir="ltr" className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-mono">
                <Phone className="size-3" />
                {sp.phone}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-bold",
                  sp.plan === "PRO"
                    ? "bg-accent/15 text-accent-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                {sp.plan === "PRO" ? "پلن حرفه‌ای" : "پلن رایگان"}
              </span>
              <span className="font-bold text-primary">{commissionText}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Label
            htmlFor="availability"
            className="flex cursor-pointer items-center gap-2 text-sm font-bold"
          >
            <Switch
              id="availability"
              checked={sp.isAvailable}
              disabled={toggle.isPending}
              onCheckedChange={(v) => toggle.mutate(v)}
            />
            <span className={sp.isAvailable ? "text-primary" : "text-muted-foreground"}>
              {sp.isAvailable ? "آنلاین برای سفارش" : "آفلاین"}
            </span>
          </Label>
          <Button
            variant="ghost"
            size="icon"
            className="size-10 text-destructive hover:text-destructive"
            aria-label="خروج از حساب"
            onClick={onLogout}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </motion.section>
  );
}

// ============================================================
// Offers (new job proposals)
// ============================================================
function OffersSection({
  dash,
  onDone,
}: {
  dash: SpecialistDashboardDTO;
  onDone: () => void;
}) {
  const accept = useMutation({
    mutationFn: (orderId: string) =>
      apiPost<{ order: OrderDTO }>(`/api/orders/${orderId}/accept`),
    onSuccess: () => {
      toast.success("سفارش را پذیرفتی؛ کد ورود در صفحه سفارش است ✅");
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "خطا در پذیرش سفارش"),
  });

  const reject = useMutation({
    mutationFn: (orderId: string) =>
      apiPost<{ order: OrderDTO }>(`/api/orders/${orderId}/reject`),
    onSuccess: () => {
      toast.info("رد شد؛ سفارش به متخصص بعدی ارسال می‌شود");
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "خطا در رد سفارش"),
  });

  if (dash.offers.length === 0) {
    return (
      <section aria-label="سفارش‌های پیشنهادی">
        <EmptyState
          icon={<Bell className="size-7" />}
          title="فعلاً سفارش جدیدی نیست"
          sub="آنلاین بمان تا مشتری برات بیاد."
        />
      </section>
    );
  }

  const rate = dash.specialist.commissionPreview;

  return (
    <section aria-label="سفارش‌های پیشنهادی" className="space-y-3">
      <h2 className="flex items-center gap-2 font-extrabold">
        <Bell className="size-4 text-accent-foreground" />
        پیشنهادهای جدید ({toFa(dash.offers.length)})
      </h2>
      {dash.offers.map((offer) => (
        <motion.div
          key={offer.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 border-accent/60 bg-accent/5 p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-extrabold">
              {offer.serviceName}
              <span className="ms-2 text-xs font-medium text-muted-foreground">
                {offer.categoryName}
              </span>
            </p>
            <span dir="ltr" className="rounded bg-card px-2 py-0.5 font-mono text-xs text-muted-foreground">
              {offer.orderCode}
            </span>
          </div>

          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <p className="flex items-center gap-1.5">
              <BadgeCheck className="size-4 shrink-0 text-primary" />
              مشتری: {offer.customerName} — <span dir="ltr">{offer.customerPhone}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0 text-muted-foreground" />
              {offer.city}، {offer.address}
            </p>
            <p className="flex items-center gap-1.5">
              <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
              {formatDateFa(offer.scheduledDate)} — {slotLabel(offer.scheduledSlot)}
            </p>
            <p className="font-extrabold text-primary">{formatToman(offer.price)}</p>
          </div>

          {offer.description ? (
            <p className="mt-2 rounded-lg bg-card px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              توضیح مشتری: {offer.description}
            </p>
          ) : null}

          <p className="mt-3 text-xs font-bold text-accent-foreground">
            کمیسیون این کار: ~{formatToman(Math.round((offer.price * rate) / 100))}
          </p>

          <div className="mt-4 flex gap-3">
            <Button
              className="min-h-11 flex-1"
              disabled={accept.isPending || reject.isPending}
              onClick={() => accept.mutate(offer.orderId)}
            >
              <CheckCircle2 className="size-4" />
              قبول سفارش
            </Button>
            <Button
              variant="outline"
              className="min-h-11 flex-1"
              disabled={accept.isPending || reject.isPending}
              onClick={() => reject.mutate(offer.orderId)}
            >
              <X className="size-4" />
              رد
            </Button>
          </div>
        </motion.div>
      ))}
    </section>
  );
}

// ============================================================
// Active orders with contextual actions
// ============================================================
function ActiveOrdersSection({
  dash,
  onDone,
}: {
  dash: SpecialistDashboardDTO;
  onDone: () => void;
}) {
  if (dash.activeOrders.length === 0) return null;

  return (
    <section aria-label="سفارش‌های فعال" className="space-y-3">
      <h2 className="font-extrabold">سفارش‌های فعال</h2>
      {dash.activeOrders.map((order) => (
        <ActiveOrderCard key={order.id} order={order} onDone={onDone} />
      ))}
    </section>
  );
}

function ActiveOrderCard({ order, onDone }: { order: OrderDTO; onDone: () => void }) {
  const Icon = CATEGORY_ICONS[order.service.category.icon] ?? Wrench;
  const [entryCode, setEntryCode] = useState("");
  const [finalPrice, setFinalPrice] = useState("");

  const arrive = useMutation({
    mutationFn: () =>
      apiPost<{ order: OrderDTO }>(`/api/orders/${order.id}/arrive`, {
        entryCode: entryCode.trim(),
      }),
    onSuccess: () => {
      toast.success("ورود ثبت شد؛ کار را شروع کن");
      onDone();
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 400) {
        toast.error("کد ورود مشتری اشتباه است");
      } else {
        toast.error(e instanceof Error ? e.message : "خطا در ثبت ورود");
      }
    },
  });

  const startWork = useMutation({
    mutationFn: () => apiPost<{ order: OrderDTO }>(`/api/orders/${order.id}/start-work`),
    onSuccess: () => {
      toast.success("کار شروع شد؛ موفق باشی 💪");
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "خطا در شروع کار"),
  });

  const complete = useMutation({
    mutationFn: () => {
      const parsed = Number(toEnDigits(finalPrice).replace(/\D/g, ""));
      const body: { finalPrice?: number } = {};
      if (parsed > 0) body.finalPrice = parsed;
      return apiPost<{ order: OrderDTO }>(`/api/orders/${order.id}/complete`, body);
    },
    onSuccess: () => {
      toast.success("کار ثبت شد؛ منتظر پرداخت مشتری بمان");
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "خطا در اتمام کار"),
  });

  const busy = arrive.isPending || startWork.isPending || complete.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border bg-card p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-extrabold">
          <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          {order.service.name}
        </p>
        <div className="flex items-center gap-2">
          <span dir="ltr" className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
            {order.code}
          </span>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="size-3.5" />
        {order.city}، {order.address} — {order.customerName}
      </p>

      <div className="mt-4 border-t pt-4">
        <OrderTimeline status={order.status} />
      </div>

      {/* contextual action */}
      <div className="mt-4 border-t pt-4">
        {order.status === "ACCEPTED" ? (
          <div className="space-y-2">
            <Label htmlFor={`code-${order.id}`} className="block text-sm">
              کد ورود مشتری را وارد کنید
            </Label>
            <p className="text-xs text-muted-foreground">کد را مشتری به شما می‌گوید.</p>
            <div className="flex gap-2">
              <Input
                id={`code-${order.id}`}
                dir="ltr"
                inputMode="numeric"
                maxLength={4}
                value={entryCode}
                onChange={(e) => setEntryCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="••••"
                className="min-h-11 flex-1 text-center font-mono text-lg tracking-[0.4em]"
              />
              <Button
                className="min-h-11"
                disabled={busy || entryCode.length !== 4}
                onClick={() => arrive.mutate()}
              >
                <DoorOpen className="size-4" />
                تأیید ورود
              </Button>
            </div>
          </div>
        ) : null}

        {order.status === "ARRIVED" ? (
          <Button className="min-h-11 w-full" disabled={busy} onClick={() => startWork.mutate()}>
            <Play className="size-4" />
            شروع کار
          </Button>
        ) : null}

        {order.status === "IN_PROGRESS" ? (
          <div className="flex gap-2">
            <Input
              dir="ltr"
              inputMode="numeric"
              value={finalPrice}
              onChange={(e) => setFinalPrice(e.target.value)}
              placeholder="مبلغ نهایی (تومان) — اختیاری"
              className="min-h-11 flex-1 text-left"
            />
            <Button className="min-h-11" disabled={busy} onClick={() => complete.mutate()}>
              <CheckCircle2 className="size-4" />
              اتمام کار
            </Button>
          </div>
        ) : null}

        {order.status === "COMPLETED" ? (
          <p className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent/15 px-4 py-3 text-sm font-extrabold text-accent-foreground">
            <Hourglass className="size-4" />
            در انتظار پرداخت مشتری
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}

// ============================================================
// Earnings
// ============================================================
function EarningsCard({ dash }: { dash: SpecialistDashboardDTO }) {
  const e = dash.earnings;
  const items = [
    { label: "امروز", value: e.today, Icon: Sun },
    { label: "این ماه", value: e.month, Icon: CalendarDays },
    { label: "کل درآمد", value: e.total, Icon: Wallet },
    { label: "در انتظار تسویه", value: e.pending, Icon: Hourglass },
  ];

  return (
    <motion.section
      aria-label="درآمد"
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="grid grid-cols-2 gap-3 md:grid-cols-4"
    >
      {items.map((item) => (
        <motion.div
          key={item.label}
          variants={staggerItem}
          className="rounded-2xl border bg-card p-4 text-center shadow-sm"
        >
          <item.Icon className="mx-auto mb-2 size-5 text-primary" />
          <p className="text-sm font-black text-primary">{formatToman(item.value)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
        </motion.div>
      ))}
    </motion.section>
  );
}

// ============================================================
// Plan
// ============================================================
function PlanCard({ dash, onDone }: { dash: SpecialistDashboardDTO; onDone: () => void }) {
  const sp = dash.specialist;
  const change = useMutation({
    mutationFn: (plan: "FREE" | "PRO") =>
      apiPost<{ specialist: unknown }>(`/api/specialists/${sp.id}/plan`, { plan }),
    onSuccess: (_, plan) => {
      toast.success(plan === "PRO" ? "به پلن حرفه‌ای ارتقا یافتی 🎉" : "به پلن رایگان برگشتی");
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "خطا در تغییر پلن"),
  });

  return (
    <section aria-label="پلن عضویت" className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold">پلن عضویت</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            پلن فعلی:{" "}
            <span className="font-bold text-foreground">
              {sp.plan === "PRO" ? "حرفه‌ای" : "رایگان"}
            </span>
          </p>
        </div>
        {sp.plan === "PRO" ? (
          <Button
            variant="outline"
            className="min-h-11"
            disabled={change.isPending}
            onClick={() => change.mutate("FREE")}
          >
            بازگشت به پلن رایگان
          </Button>
        ) : (
          <Button
            className="min-h-11 bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={change.isPending}
            onClick={() => change.mutate("PRO")}
          >
            ارتقا به پلن حرفه‌ای
            <ArrowLeft className="size-4" />
          </Button>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border text-sm">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-muted/60 text-xs text-muted-foreground">
              <th className="p-2.5 font-semibold">پلن</th>
              <th className="p-2.5 font-semibold">کمیسیون</th>
              <th className="p-2.5 font-semibold">مزایا</th>
            </tr>
          </thead>
          <tbody>
            <tr className={cn("border-t", sp.plan === "FREE" && "bg-primary/5")}>
              <td className="p-2.5 font-bold">رایگان</td>
              <td className="p-2.5">۱۵٪ (۱۰ سفارش اول ۱۰٪)</td>
              <td className="p-2.5 text-muted-foreground">شروع بدون هزینه</td>
            </tr>
            <tr className={cn("border-t", sp.plan === "PRO" && "bg-accent/5")}>
              <td className="p-2.5 font-bold">حرفه‌ای — {formatToman(199000)}/ماه</td>
              <td className="p-2.5">۸٪</td>
              <td className="p-2.5 text-muted-foreground">اولویت در نمایش + پشتیبانی ویژه</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ============================================================
// History + received reviews
// ============================================================
function HistorySection({ dash }: { dash: SpecialistDashboardDTO }) {
  const openTrack = useHomeFix((s) => s.openTrack);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* history */}
      <section aria-label="تاریخچه سفارش‌ها" className="rounded-2xl border bg-card p-5 shadow-sm lg:col-span-3">
        <h2 className="mb-4 flex items-center gap-2 font-extrabold">
          <History className="size-4 text-primary" />
          تاریخچه سفارش‌ها
        </h2>
        {dash.history.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">هنوز سفارشی انجام ندادی.</p>
        ) : (
          <ul className="thin-scroll max-h-96 space-y-2 overflow-y-auto pl-1">
            {dash.history.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => openTrack(o.id)}
                  className="flex w-full items-center gap-3 rounded-xl border p-3 text-right transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring outline-none"
                >
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-bold">
                      {o.serviceName}
                      <span dir="ltr" className="rounded bg-muted px-1.5 font-mono text-[10px] font-normal text-muted-foreground">
                        {o.code}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDateFa(o.createdAt)}</p>
                  </div>
                  <div className="shrink-0 text-left">
                    <StatusBadge status={o.status} />
                    <p className="mt-1 text-xs font-bold">{formatToman(o.price)}</p>
                  </div>
                  <ArrowLeft className="size-3.5 shrink-0 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* reviews */}
      <section aria-label="نظرات دریافت‌شده" className="rounded-2xl border bg-card p-5 shadow-sm lg:col-span-2">
        <h2 className="mb-4 flex items-center gap-2 font-extrabold">
          <Star className="size-4 text-amber-400" />
          نظرات دریافت‌شده
        </h2>
        {(() => {
          const reviews = dash.activeOrders.flatMap((o) =>
            o.reviews.filter((r) => r.by === "CUSTOMER").map((r) => ({ ...r, orderCode: o.code }))
          );
          if (reviews.length === 0) {
            return (
              <p className="py-4 text-center text-sm text-muted-foreground">
                هنوز نظری دریافت نکردی؛ با کارهای خوب اولین امتیازها بگیر!
              </p>
            );
          }
          return (
            <ul className="thin-scroll max-h-96 space-y-3 overflow-y-auto pl-1">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-xl border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <StarRating value={r.rating} size={13} />
                    <span className="text-[10px] text-muted-foreground">{formatDateFa(r.createdAt)}</span>
                  </div>
                  {r.comment ? (
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{r.comment}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          );
        })()}
      </section>
    </div>
  );
}
