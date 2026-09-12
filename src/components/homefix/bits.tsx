"use client";

// ============================================================
// HomeFix — small shared UI parts (custom design language)
// طاق ایرانی + ریتم بصری «خانه و اعتماد»
// ============================================================

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Check, Loader2, RotateCcw, Star } from "lucide-react";
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
  show: { transition: { staggerChildren: 0.07 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

// ---------- scroll reveal wrapper ----------
export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ---------- animated number counter ----------
export function Counter({
  value,
  decimals = 0,
  duration = 1.6,
  className,
}: {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: reduce ? 0 : duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {toFa(display.toFixed(decimals))}
    </span>
  );
}

// ---------- ornamental divider (rosette + rules) ----------
export function OrnamentDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3", className)} aria-hidden>
      <span className="h-px w-14 bg-gradient-to-l from-primary/35 to-transparent" />
      <svg viewBox="0 0 24 24" className="size-4 text-brass" fill="currentColor">
        <path d="M12 1.5 14.6 9.4 22.5 12 14.6 14.6 12 22.5 9.4 14.6 1.5 12 9.4 9.4Z" />
      </svg>
      <span className="h-px w-14 bg-gradient-to-r from-primary/35 to-transparent" />
    </div>
  );
}

// ---------- animated hand-drawn underline ----------
export function Squiggle({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <svg
      viewBox="0 0 220 14"
      fill="none"
      aria-hidden
      className={cn("absolute -bottom-2 right-0 h-3 w-full", className)}
      preserveAspectRatio="none"
    >
      <motion.path
        d="M4 10 C 40 2, 70 12, 108 7 S 180 3, 216 8"
        stroke="var(--brass)"
        strokeWidth="5"
        strokeLinecap="round"
        initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, delay: 0.7, ease: "easeOut" }}
      />
    </svg>
  );
}

// ---------- section heading ----------
export function SectionHeading({
  eyebrow,
  title,
  sub,
  center,
  dark,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  center?: boolean;
  dark?: boolean;
}) {
  return (
    <Reveal className={cn("mb-10 space-y-3", center && "text-center")}>
      {eyebrow ? (
        <span
          className={cn(
            "inline-flex items-center gap-2 text-xs font-extrabold tracking-widest",
            dark ? "text-brass" : "text-brass-deep dark:text-brass"
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brass shadow-[0_0_0_3px] shadow-brass/20" aria-hidden />
          {eyebrow}
        </span>
      ) : null}
      <h2
        className={cn(
          "text-2xl font-black leading-snug md:text-4xl md:leading-snug",
          dark ? "text-deep-foreground" : "text-foreground"
        )}
      >
        {title}
      </h2>
      {sub ? (
        <p
          className={cn(
            "max-w-2xl text-sm leading-relaxed md:text-base",
            dark ? "text-deep-foreground/70" : "text-muted-foreground",
            center && "mx-auto"
          )}
        >
          {sub}
        </p>
      ) : null}
    </Reveal>
  );
}

// ---------- status badge ----------
const STATUS_STYLES: Record<OrderStatus, string> = {
  FINDING: "bg-muted text-muted-foreground border-border",
  OFFERED: "bg-brass/15 text-brass-deep dark:text-brass border-brass/40",
  ACCEPTED: "bg-primary/10 text-primary border-primary/30",
  ARRIVED: "bg-terra/10 text-terra border-terra/30",
  IN_PROGRESS: "bg-brass/15 text-brass-deep dark:text-brass border-brass/40",
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
    <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-[11px] font-semibold text-muted-foreground shadow-warm-sm">
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
              active ? "fill-brass text-brass" : "text-muted-foreground/35",
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
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card/60 px-6 py-12 text-center shadow-warm-sm">
      <div className="arch-well grid size-14 place-items-center bg-muted text-muted-foreground">
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
        <div key={i} className="rounded-2xl border bg-card p-5 shadow-warm-sm">
          <div className="arch-well mb-4 size-12 animate-pulse bg-muted" />
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
