"use client";

// ============================================================
// HomeFix — small shared UI parts
// ============================================================

import { motion, type Variants } from "framer-motion";
import {
  Check,
  Loader2,
  RotateCcw,
  Star,
} from "lucide-react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { toFa } from "@/lib/format";
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/types";

// ---------- motion presets ----------
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

// ---------- section heading ----------
export function SectionHeading({
  eyebrow,
  title,
  sub,
  center,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  center?: boolean;
}) {
  return (
    <div className={cn("mb-8 space-y-2", center && "text-center")}>
      {eyebrow ? (
        <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-2xl font-extrabold md:text-3xl">{title}</h2>
      {sub ? <p className="max-w-2xl text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

// ---------- status badge ----------
const STATUS_STYLES: Record<OrderStatus, string> = {
  FINDING: "bg-muted text-muted-foreground border-border",
  OFFERED: "bg-accent/15 text-accent-foreground border-accent/40",
  ACCEPTED: "bg-primary/10 text-primary border-primary/30",
  ARRIVED: "bg-teal-600/10 text-teal-700 border-teal-600/30 dark:text-teal-300",
  IN_PROGRESS: "bg-accent/15 text-accent-foreground border-accent/40",
  COMPLETED: "bg-primary/10 text-primary border-primary/30",
  PAID: "bg-primary text-primary-foreground border-primary",
  CANCELED: "bg-destructive/10 text-destructive border-destructive/30",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap",
        STATUS_STYLES[status]
      )}
    >
      {status === "PAID" ? <Check className="size-3" /> : null}
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

// ---------- verification level badges ----------
export const LEVEL_META = {
  1: { label: "هویت تأیید شده", dot: "bg-emerald-500", emoji: "🟢" },
  2: { label: "مهارت تأیید شده", dot: "bg-blue-500", emoji: "🔵" },
  3: { label: "متخصص برتر", dot: "bg-purple-500", emoji: "🟣" },
} as const;

export type Level = 1 | 2 | 3;

/** Single badge for one level */
export function LevelBadge({ level }: { level: Level }) {
  const meta = LEVEL_META[level];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
      <span className={cn("size-2 rounded-full", meta.dot)} aria-hidden />
      {meta.label}
    </span>
  );
}

/** Cumulative badges up to a level (1 → 🟢, 2 → 🟢🔵, 3 → 🟢🔵🟣) */
export function LevelBadges({ level }: { level: Level }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {([1, 2, 3] as Level[])
        .filter((l) => l <= level)
        .map((l) => (
          <LevelBadge key={l} level={l} />
        ))}
    </div>
  );
}

// ---------- star rating ----------
export function StarRating({
  value,
  count,
  onChange,
  size = 16,
  className,
}: {
  value: number;
  count?: number;
  onChange?: (v: number) => void;
  size?: number;
  className?: string;
}) {
  const interactive = typeof onChange === "function";
  return (
    <div className={cn("inline-flex items-center gap-1", className)} aria-label="امتیاز">
      {[1, 2, 3, 4, 5].map((i) => {
        const active = i <= Math.round(value);
        const star = (
          <Star
            style={{ width: size, height: size }}
            className={cn(
              active ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
              interactive && "transition-transform hover:scale-110"
            )}
          />
        );
        return interactive ? (
          <button
            key={i}
            type="button"
            aria-label={`${toFa(i)} ستاره`}
            onClick={() => onChange?.(i)}
            className="cursor-pointer rounded outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {star}
          </button>
        ) : (
          <span key={i}>{star}</span>
        );
      })}
      {count !== undefined ? (
        <span className="ms-1 text-xs text-muted-foreground">({toFa(count)})</span>
      ) : null}
    </div>
  );
}

// ---------- empty / error / loading states ----------
export function EmptyState({
  icon,
  title,
  sub,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card/50 px-6 py-12 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
        {icon}
      </div>
      <p className="font-bold">{title}</p>
      {sub ? <p className="max-w-sm text-sm text-muted-foreground">{sub}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  message = "خطا در دریافت اطلاعات",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
      <p className="text-sm font-semibold text-destructive">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring outline-none"
        >
          <RotateCcw className="size-4" />
          تلاش دوباره
        </button>
      ) : null}
    </div>
  );
}

export function LoadingCards({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-4 size-12 animate-pulse rounded-xl bg-muted" />
          <div className="mb-2 h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function SpinnerRow({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      {label ?? "در حال بارگذاری…"}
    </div>
  );
}

// ---------- order status timeline (7 dots) ----------
export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "CANCELED") return null;
  const currentIndex = ORDER_STATUS_FLOW.indexOf(status);
  return (
    <div className="flex w-full items-start" dir="rtl" aria-label="وضعیت سفارش">
      {ORDER_STATUS_FLOW.map((s, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        return (
          <div key={s} className="relative flex flex-1 flex-col items-center gap-1.5">
            {i > 0 ? (
              <span
                className={cn(
                  "absolute top-2 right-1/2 h-0.5 w-full -translate-y-1/2",
                  i <= currentIndex ? "bg-primary" : "bg-border"
                )}
                aria-hidden
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 grid size-4 shrink-0 place-items-center rounded-full border-2 transition-colors",
                done && "border-primary bg-primary",
                current && "border-primary bg-primary",
                !done && !current && "border-border bg-card"
              )}
            >
              {done ? <Check className="size-2.5 text-primary-foreground" /> : null}
              {current ? (
                <span className="absolute size-4 animate-ping rounded-full bg-primary/40" aria-hidden />
              ) : null}
            </span>
            <span
              className={cn(
                "hidden max-w-16 text-center text-[9px] leading-tight sm:block",
                current ? "font-bold text-foreground" : "text-muted-foreground"
              )}
            >
              {ORDER_STATUS_LABELS[s]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---------- SSR-safe mounted gate (no setState-in-effect) ----------
const emptySubscribe = () => () => {};

/** True only after hydration on the client. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
