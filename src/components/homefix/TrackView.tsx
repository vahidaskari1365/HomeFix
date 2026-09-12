"use client";

// ============================================================
// HomeFix — track order view (the heart of the SPA)
// ============================================================

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CalendarPlus,
  CheckCircle2,
  DoorOpen,
  Flag,
  History,
  Siren,
  Star,
  Timer,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiGet, apiPost } from "./api";
import { CATEGORY_ICONS } from "./icons";
import {
  EmptyState,
  ErrorState,
  OrderTimeline,
  SpinnerRow,
  StatusBadge,
} from "./bits";
import { SearchAnimation } from "./SearchAnimation";
import { SpecialistCard } from "./SpecialistCard";
import { EntryCodeCard } from "./EntryCodeCard";
import { MapSim } from "./MapSim";
import { PaymentCard } from "./PaymentCard";
import { ReviewCard } from "./ReviewCard";
import { EmergencyButton } from "./EmergencyButton";
import { useHomeFix } from "@/lib/store";
import { formatDateTimeFa, formatToman, minutesSince, toFa } from "@/lib/format";
import {
  ORDER_STATUS_LABELS,
  type OrderEventDTO,
  type OrderDTO,
  type OrderStatus,
} from "@/lib/types";

const ACTIVE_STATUSES: OrderStatus[] = [
  "FINDING",
  "OFFERED",
  "ACCEPTED",
  "ARRIVED",
  "IN_PROGRESS",
];

const EVENT_ICONS: Record<OrderEventDTO["type"], typeof Flag> = {
  STATUS: Flag,
  ENTRY: DoorOpen,
  PAYMENT: Wallet,
  EMERGENCY: Siren,
  NOTE: Star,
};

// ============================================================
// View router for track
// ============================================================
export function TrackView() {
  const orderId = useHomeFix((s) => s.orderId);
  const openBooking = useHomeFix((s) => s.openBooking);

  if (!orderId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <EmptyState
          icon={<Wrench className="size-7" />}
          title="سفارشی برای پیگیری نیست"
          sub="وقتی درخواست ثبت کنی، همه مراحل این‌جا به‌صورت زنده دیده می‌شود."
          action={
            <Button onClick={() => openBooking()}>
              <CalendarPlus className="size-4" />
              ثبت درخواست
            </Button>
          }
        />
      </div>
    );
  }

  return <TrackOrder orderId={orderId} />;
}

// ============================================================
// Order fetcher + status panels
// ============================================================
function TrackOrder({ orderId }: { orderId: string }) {
  const queryClient = useQueryClient();
  const acceptDemo = useMutation({
    mutationFn: () => apiPost<{ order: OrderDTO }>(`/api/orders/${orderId}/accept`),
    onSuccess: () => {
      toast.success("متخصص سفارش را پذیرفت 🎉");
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "خطا در پذیرش سفارش"),
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => apiGet<{ order: OrderDTO }>(`/api/orders/${orderId}`),
    retry: 1,
    refetchInterval: (query) => {
      const status = query.state.data?.order?.status;
      return status && ACTIVE_STATUSES.includes(status) ? 4000 : false;
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <SpinnerRow label="در حال دریافت سفارش…" />
      </div>
    );
  }

  if (isError || !data?.order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <ErrorState message="خطا در دریافت سفارش" onRetry={() => refetch()} />
      </div>
    );
  }

  const order = data.order;
  const Icon = CATEGORY_ICONS[order.service.category.icon] ?? Wrench;
  const sortedEvents = [...order.events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 md:py-10">
      {/* ---------- header card ---------- */}
      <motion.section
        aria-label="خلاصه سفارش"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border bg-card p-5 shadow-sm md:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="font-extrabold">{order.service.name}</p>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <span dir="ltr" className="rounded bg-muted px-1.5 py-0.5 font-mono">
                  {order.code}
                </span>
                <span>{formatToman(order.price)}</span>
              </p>
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="mt-5 border-t pt-5">
          <OrderTimeline status={order.status} />
        </div>
      </motion.section>

      {/* ---------- status-specific panel ---------- */}
      <StatusPanel
        order={order}
        accepting={acceptDemo.isPending}
        onDemoAccept={() => acceptDemo.mutate()}
      />

      {/* ---------- events log ---------- */}
      <section aria-label="رویدادهای سفارش" className="rounded-2xl border bg-card p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 font-extrabold">
          <History className="size-4 text-primary" />
          رویدادها
        </h3>
        {sortedEvents.length === 0 ? (
          <p className="py-3 text-center text-sm text-muted-foreground">هنوز رویدادی ثبت نشده.</p>
        ) : (
          <ul className="thin-scroll max-h-56 space-y-3 overflow-y-auto pl-1">
            {sortedEvents.map((ev) => {
              const EvIcon = EVENT_ICONS[ev.type];
              return (
                <li key={ev.id} className="flex items-start gap-3">
                  <span
                    className={
                      ev.type === "EMERGENCY"
                        ? "mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive"
                        : "mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"
                    }
                  >
                    <EvIcon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{ev.title}</p>
                    {ev.detail ? (
                      <p className="text-xs leading-relaxed text-muted-foreground">{ev.detail}</p>
                    ) : null}
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {formatDateTimeFa(ev.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <EmergencyButton orderId={order.id} />
    </div>
  );
}

// ============================================================
// Status panels
// ============================================================
function StatusPanel({
  order,
  accepting,
  onDemoAccept,
}: {
  order: OrderDTO;
  accepting: boolean;
  onDemoAccept: () => void;
}) {
  switch (order.status) {
    case "FINDING":
    case "OFFERED":
      return (
        <motion.section
          aria-label="وضعیت جست‌وجوی متخصص"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <SearchAnimation />
          <div className="rounded-2xl border bg-card p-5 text-center shadow-sm">
            <p className="text-sm font-semibold">
              سفارش برای بهترین متخصصِ منطقه شما ارسال شد؛ منتظر تأیید او هستیم.
            </p>
            {order.status === "OFFERED" ? (
              <p className="mt-2 text-xs text-muted-foreground">
                اگر متخصص رد کند، بلافاصله به متخصص بعدی ارسال می‌شود.
              </p>
            ) : null}
            <Button
              className="mt-4 min-h-11 bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={accepting}
              onClick={onDemoAccept}
            >
              <Zap className="size-4" />
              {accepting ? "در حال قبول…" : "⚡ قبول سفارش (شبیه‌سازی متخصص)"}
            </Button>
            <p className="mt-2 text-[11px] text-muted-foreground">
              این دکمه فقط برای نمایش دمو است.
            </p>
          </div>
        </motion.section>
      );

    case "ACCEPTED":
      if (!order.specialist) return null;
      return (
        <motion.section
          aria-label="اطلاعات متخصص"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <SpecialistCard specialist={order.specialist} />
          <div className="grid gap-6 md:grid-cols-2">
            {order.entryCode ? <EntryCodeCard code={order.entryCode} /> : null}
            <MapSim />
          </div>
        </motion.section>
      );

    case "ARRIVED":
      return (
        <motion.section
          aria-label="تأیید ورود"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center"
        >
          <span className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-primary/10">
            <DoorOpen className="size-7 text-primary" />
          </span>
          <p className="font-extrabold">ورود با کد تأیید شد</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {order.arrivedAt
              ? `ساعت ورود: ${formatDateTimeFa(order.arrivedAt)} ثبت شد.`
              : "ساعت ورود ثبت شد."}
          </p>
        </motion.section>
      );

    case "IN_PROGRESS":
      return (
        <motion.section
          aria-label="در حال انجام کار"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border bg-card p-6 text-center shadow-sm"
        >
          <span className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-accent/15">
            <Wrench className="size-7 text-accent-foreground" />
          </span>
          <p className="font-extrabold">متخصص در حال انجام کار است</p>
          {order.workStartedAt ? (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground">
              <Timer className="size-3.5" />
              <ElapsedChip iso={order.workStartedAt} />
            </p>
          ) : null}
        </motion.section>
      );

    case "COMPLETED":
      return (
        <motion.section
          aria-label="پرداخت"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PaymentCard order={order} />
        </motion.section>
      );

    case "PAID":
      return (
        <motion.section
          aria-label="امتیازدهی"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-bold text-primary">
            <CheckCircle2 className="size-4" />
            این سفارش با موفقیت پرداخت و بسته شد — {ORDER_STATUS_LABELS.PAID}
          </div>
          <ReviewCard order={order} />
        </motion.section>
      );

    case "CANCELED":
      return (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center"
        >
          <p className="font-extrabold text-destructive">این سفارش لغو شده است.</p>
        </motion.section>
      );

    default:
      return null;
  }
}

function ElapsedChip({ iso }: { iso: string }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 30_000);
    return () => clearInterval(t);
  }, []);
  return <>از شروع کار: {toFa(minutesSince(iso))} دقیقه</>;
}
