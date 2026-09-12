"use client";

// ============================================================
// HomeFix — sticky footer (deep-teal panel with khatam pattern)
// ============================================================

import { Heart, Phone, Siren, Wrench } from "lucide-react";
import { useHomeFix } from "@/lib/store";
import { SUPPORT_PHONE } from "@/lib/types";

export function Footer() {
  const goHome = useHomeFix((s) => s.goHome);

  function goToSection(id: string) {
    goHome();
    // wait for the home view to mount (AnimatePresence "wait")
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 350);
  }

  const links = [
    { label: "خدمات", id: "catalog" },
    { label: "مسیر سفارش", id: "how" },
    { label: "امنیت و اعتماد", id: "trust" },
    { label: "تعرفه متخصص‌ها", id: "plans" },
    { label: "سوالات پرتکرار", id: "faq" },
  ];

  return (
    <footer className="mt-auto bg-deep text-deep-foreground">
      <div className="pattern-khatam-light">
        <div className="mx-auto max-w-6xl px-4 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-12">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1.2fr]">
            {/* brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="relative grid size-10 place-items-center overflow-hidden rounded-xl bg-brass text-accent-foreground">
                  <span className="pattern-khatam absolute inset-0 opacity-50" />
                  <Wrench className="relative size-5" />
                </span>
                <span dir="ltr" className="text-lg font-black tracking-tight">
                  HomeFix
                </span>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-deep-foreground/70">
                بازار آنلاین خدمات خانگی؛ متخصص‌های احراز‌هویت‌شده، کد ورود امن، ردیابی زنده و
                پرداخت درون‌برنامه‌ای — از کولر تا لوله‌کشی.
              </p>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3">
                <Siren className="size-5 shrink-0 text-terra" aria-hidden />
                <p className="text-xs leading-relaxed text-deep-foreground/80">
                  در خطر فوری؟ اورژانس <b dir="ltr">۱۲۵</b> و پلیس <b dir="ltr">۱۱۰</b> —
                  پشتیبانی HomeFix همیشه در خط بعدی است.
                </p>
              </div>
            </div>

            {/* links */}
            <nav className="flex flex-col gap-1" aria-label="لینک‌های فوتر">
              <span className="mb-2 text-sm font-extrabold text-brass">دسترسی سریع</span>
              {links.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => goToSection(l.id)}
                  className="min-h-10 w-fit px-0 text-right text-sm text-deep-foreground/70 transition-colors hover:text-deep-foreground focus-visible:ring-2 focus-visible:ring-ring outline-none"
                >
                  {l.label}
                </button>
              ))}
            </nav>

            {/* support */}
            <div className="space-y-3">
              <span className="mb-2 block text-sm font-extrabold text-brass">پشتیبانی ۲۴/۷</span>
              <a
                href="tel:02191007800"
                className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-bold transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-ring outline-none"
              >
                <Phone className="size-4 text-brass" />
                <span dir="ltr">{SUPPORT_PHONE}</span>
              </a>
              <p className="text-xs leading-relaxed text-deep-foreground/60">
                هر روز از ۸ صبح تا ۱۲ شب — حتی روزهای تعطیل.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs text-deep-foreground/60 sm:flex-row">
            <p>HomeFix © ۱۴۰۴ — همه حقوق محفوظ است.</p>
            <p className="inline-flex items-center gap-1.5">
              ساخته‌شده با
              <Heart className="size-3.5 fill-terra text-terra" aria-hidden />
              برای خانه‌های ایران
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
