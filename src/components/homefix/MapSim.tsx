"use client";

// ============================================================
// HomeFix — simulated live-tracking map (inline SVG + framer)
// ============================================================

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { EyeOff, Navigation } from "lucide-react";
import { toFa } from "@/lib/format";

function mmss(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${toFa(m)}:${toFa(String(s).padStart(2, "0"))}`;
}

export function MapSim() {
  const [secondsLeft, setSecondsLeft] = useState(7 * 60);

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="relative h-44 bg-gradient-to-b from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30">
        <svg viewBox="0 0 300 160" className="h-full w-full" aria-label="نقشه شبیه‌سازی‌شده مسیر متخصص">
          {/* streets */}
          <path d="M0 40 H300" stroke="currentColor" strokeWidth="14" className="text-emerald-100 dark:text-emerald-900/60" />
          <path d="M0 110 H300" stroke="currentColor" strokeWidth="14" className="text-emerald-100 dark:text-emerald-900/60" />
          <path d="M70 0 V160" stroke="currentColor" strokeWidth="14" className="text-emerald-100 dark:text-emerald-900/60" />
          <path d="M215 0 V160" stroke="currentColor" strokeWidth="14" className="text-emerald-100 dark:text-emerald-900/60" />
          {/* blocks */}
          <rect x="90" y="55" width="40" height="38" rx="6" className="fill-emerald-200/70 dark:fill-emerald-900/70" />
          <rect x="150" y="55" width="45" height="38" rx="6" className="fill-emerald-200/70 dark:fill-emerald-900/70" />
          <rect x="18" y="55" width="36" height="38" rx="6" className="fill-emerald-200/70 dark:fill-emerald-900/70" />
          {/* route */}
          <motion.path
            d="M30 128 H70 V40 H215 V64 H240"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="7 6"
            strokeLinecap="round"
            className="text-primary"
            initial={{ pathLength: 0, opacity: 0.4 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2.2, ease: "easeInOut" }}
          />
          {/* destination pin (customer home) */}
          <circle cx="240" cy="64" r="7" className="fill-primary" />
          <circle cx="240" cy="64" r="12" fill="none" strokeWidth="2" className="stroke-primary/40" />
          {/* moving specialist dot */}
          <motion.circle
            r="6"
            className="fill-accent"
            animate={{
              cx: [30, 70, 70, 215, 215, 238],
              cy: [128, 128, 40, 40, 64, 64],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
          />
        </svg>

        <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 text-[11px] font-extrabold shadow-sm">
          <Navigation className="size-3.5 text-primary" />
          متخصص شما ~{mmss(secondsLeft)} دیگر می‌رسد
        </span>
      </div>
      <p className="flex items-center justify-center gap-1.5 border-t px-4 py-2.5 text-center text-[11px] text-muted-foreground">
        <EyeOff className="size-3.5" />
        ردیابی فقط در بازه همین سفارش فعال است.
      </p>
    </div>
  );
}
