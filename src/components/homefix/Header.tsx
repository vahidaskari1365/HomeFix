"use client";

// ============================================================
// HomeFix — sticky header (desktop nav + mobile sheet)
// ============================================================

import { useState } from "react";
import { useTheme } from "next-themes";
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

export function Header() {
  const view = useHomeFix((s) => s.view);
  const goHome = useHomeFix((s) => s.goHome);
  const openBooking = useHomeFix((s) => s.openBooking);
  const openMyOrders = useHomeFix((s) => s.openMyOrders);
  const openSpecialistLogin = useHomeFix((s) => s.openSpecialistLogin);
  const [menuOpen, setMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        {/* logo */}
        <button
          type="button"
          onClick={goHome}
          className="flex min-h-11 items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="HomeFix — صفحه اصلی"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Wrench className="size-5" />
          </span>
          <span dir="ltr" className="text-lg font-extrabold tracking-tight">
            HomeFix
          </span>
          <span className="hidden rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-secondary-foreground sm:inline-block">
            متخصص خانگی
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
                "inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                item.active ? "bg-secondary text-secondary-foreground" : "hover:bg-muted"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </button>
          ))}

          <a
            href="tel:02191007800"
            className="ms-2 inline-flex min-h-11 items-center gap-2 rounded-full border bg-card px-3.5 text-sm font-bold shadow-sm transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring outline-none"
            aria-label={`تماس با پشتیبانی ${SUPPORT_PHONE}`}
          >
            <Phone className="size-4 text-primary" />
            <span dir="ltr">{SUPPORT_PHONE}</span>
          </a>

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
                  <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                    <Wrench className="size-4" />
                  </span>
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
                <a
                  href="tel:02191007800"
                  className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border bg-card px-3 text-sm font-bold"
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
