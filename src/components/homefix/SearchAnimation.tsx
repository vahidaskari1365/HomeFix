"use client";

// ============================================================
// HomeFix — animated "searching for specialist" radar card
// (shared by BookingWizard & TrackView)
// ============================================================

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wrench } from "lucide-react";

const TIPS = [
  "در حال بررسی متخصص‌های منطقه شما…",
  "چک کردن سطح تأیید و امتیاز متخصص‌ها…",
  "انتخاب بهترین تطابق برای کار شما…",
  "ارسال سفارش به آماده‌ترین متخصص…",
];

export function SearchAnimation({ title }: { title?: string }) {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card p-8 text-center shadow-sm">
      {/* radar rings */}
      <div className="relative mx-auto mb-5 grid size-24 place-items-center">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full border-2 border-primary/40"
            initial={{ scale: 0.5, opacity: 0.8 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
            aria-hidden
          />
        ))}
        <span className="grid size-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg">
          <Wrench className="size-7" />
        </span>
      </div>
      <p className="font-extrabold">{title ?? "در حال یافتن بهترین متخصص…"}</p>
      <motion.p
        key={tipIndex}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 text-sm text-muted-foreground"
      >
        {TIPS[tipIndex]}
      </motion.p>
    </div>
  );
}
