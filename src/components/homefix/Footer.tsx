"use client";

// ============================================================
// HomeFix — sticky footer
// ============================================================

import { Phone, ShieldCheck, Wrench } from "lucide-react";
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
    { label: "نحوه کار", id: "how" },
    { label: "امنیت", id: "trust" },
    { label: "پلن‌ها", id: "plans" },
  ];

  return (
    <footer className="mt-auto border-t bg-card/60 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* brand */}
          <div className="max-w-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Wrench className="size-4" />
              </span>
              <span dir="ltr" className="text-lg font-extrabold">
                HomeFix
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              بازار آنلاین خدمات خانگی؛ متخصص‌های احراز‌هویت‌شده، کد ورود امن و پرداخت
              درون‌برنامه‌ای.
            </p>
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              <ShieldCheck className="size-4" />
              مورد اعتماد خانواده‌های ایرانی
            </p>
          </div>

          {/* links */}
          <nav className="flex flex-col gap-2" aria-label="لینک‌های فوتر">
            <span className="mb-1 text-sm font-bold">دسترسی سریع</span>
            {links.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => goToSection(l.id)}
                className="min-h-11 w-fit px-0 text-right text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring outline-none"
              >
                {l.label}
              </button>
            ))}
          </nav>

          {/* support */}
          <div className="space-y-2">
            <span className="mb-1 block text-sm font-bold">پشتیبانی</span>
            <a
              href="tel:02191007800"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border bg-background px-4 text-sm font-bold shadow-sm transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring outline-none"
            >
              <Phone className="size-4 text-primary" />
              پشتیبانی ۲۴/۷: <span dir="ltr">{SUPPORT_PHONE}</span>
            </a>
          </div>
        </div>

        <div className="mt-8 border-t pt-5 text-center text-xs text-muted-foreground">
          HomeFix © ۱۴۰۴ — همه حقوق محفوظ است.
        </div>
      </div>
    </footer>
  );
}
