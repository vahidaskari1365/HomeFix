"use client";

// ============================================================
// HomeFix — sticky header (scroll progress + custom logo mark)
// ============================================================

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  CalendarPlus,
  Menu,
  Moon,
  PackageSearch,
  Phone,
  Sun,
  UserRoundCog,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useHomeFix } from "@/lib/store";
import { useMounted } from "./bits";
import { SUPPORT_PHONE } from "@/lib/types";
import { cn } from "@/lib/utils";

function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("size-10", className)}
      aria-label="تغییر پوسته روشن و تاریک"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {mounted && resolvedTheme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}

/** Custom logo mark: wrench inside a Persian-arch badge */
function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary text-primary-foreground shadow-glow-teal",
        className
      )}
      aria-hidden
    >
      <span className="pattern-khatam-light absolute inset-0 opacity-60" />
      <Wrench className="relative size-5" />
      <span className="absolute -bottom-1.5 -left-1.5 size-4 rounded-full bg-brass ring-2 ring-card" />
    </span>
  );
}

export function Header() {
  const view = useHomeFix((s) => s.view);
  const goHome = useHomeFix((s) => s.goHome);
  const openBooking = useHomeFix((s) => s.openBooking);
  const openMyOrders = useHomeFix((s) => s.openMyOrders);
  const openSpecialistLogin = useHomeFix((s) => s.openSpecialistLogin);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { label: "ثبت درخواست", icon: CalendarPlus, active: view === "booking", onClick: () => openBooking() },
    { label: "سفارش‌های من", icon: PackageSearch, active: view === "my-orders", onClick: () => openMyOrders() },
    {
      label: "پنل متخصص",
      icon: UserRoundCog,
      active: view === "specialist-login" || view === "specialist-dashboard",
      onClick: () => openSpecialistLogin(),
    },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-shadow duration-300",
        scrolled ? "glass shadow-warm-sm" : "bg-transparent"
      )}
    >
      {/* brass scroll progress hairline */}
      <motion.span
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5 origin-right bg-gradient-to-l from-brass to-brass-deep"
        style={{ scaleX: progress }}
      />

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        {/* logo */}
        <button
          type="button"
          onClick={goHome}
          className="flex min-h-11 items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="HomeFix — صفحه اصلی"
        >
          <LogoMark />
          <span className="leading-none">
            <span dir="ltr" className="block text-lg font-black tracking-tight">
              HomeFix
            </span>
            <span className="mt-0.5 hidden text-[10px] font-semibold text-muted-foreground sm:block">
              متخصص خانگی، با خیال راحت
            </span>
          </span>
        </button>

        {/* desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="ناوبری اصلی">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "relative inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                item.active
                  ? "bg-secondary text-secondary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
              {item.active ? (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brass"
                />
              ) : null}
            </button>
          ))}

          <a
            href="tel:02191007800"
            className="ms-2 inline-flex min-h-11 items-center gap-2 rounded-full border bg-card px-3.5 text-sm font-bold shadow-warm-sm transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring outline-none"
            aria-label={`تماس با پشتیبانی ${SUPPORT_PHONE}`}
          >
            <Phone className="size-4 text-primary" />
            <span dir="ltr">{SUPPORT_PHONE}</span>
          </a>

          <Button
            className="ms-1 min-h-11 gap-2 bg-accent px-4 text-accent-foreground shadow-glow-brass hover:bg-accent/90"
            onClick={() => openBooking()}
          >
            <CalendarPlus className="size-4" />
            درخواست سرویس
          </Button>

          <ThemeToggle className="ms-1" />
        </nav>

        {/* mobile menu */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="size-11" aria-label="باز کردن منو">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <LogoMark className="size-8" />
                  <span dir="ltr">HomeFix</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-2 flex flex-col gap-1 px-2" aria-label="منوی موبایل">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      item.onClick();
                      setMenuOpen(false);
                    }}
                    className={cn(
                      "inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      item.active ? "bg-secondary text-secondary-foreground" : "hover:bg-muted"
                    )}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </button>
                ))}
                <Button
                  className="mt-2 min-h-11 bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => {
                    openBooking();
                    setMenuOpen(false);
                  }}
                >
                  <CalendarPlus className="size-4" />
                  درخواست سرویس
                </Button>
                <a
                  href="tel:02191007800"
                  className="mt-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border bg-card px-3 text-sm font-bold"
                >
                  <Phone className="size-4 text-primary" />
                  پشتیبانی: <span dir="ltr">{SUPPORT_PHONE}</span>
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
