"use client";

// ============================================================
// HomeFix — my orders (search by phone)
// ============================================================

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronLeft, PackageOpen, PackageSearch, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiGet } from "./api";
import { categoryColorStyle, categoryIcon } from "./icons";
import {
  EmptyState,
  ErrorState,
  SpinnerRow,
  StatusBadge,
  staggerContainer,
  staggerItem,
} from "./bits";
import { useHomeFix } from "@/lib/store";
import { formatDateFa, formatToman, toEnDigits, toFa } from "@/lib/format";
import type { OrderSummaryDTO } from "@/lib/types";

const PHONE_RE = /^09\d{9}$/;

export function MyOrdersView() {
  const openTrack = useHomeFix((s) => s.openTrack);
  const openBooking = useHomeFix((s) => s.openBooking);

  const [input, setInput] = useState("");
  const [phone, setPhone] = useState("");

  const ordersQuery = useQuery({
    queryKey: ["orders", phone],
    queryFn: () => apiGet<{ orders: OrderSummaryDTO[] }>(`/api/orders?phone=${phone}`),
    enabled: PHONE_RE.test(phone),
    retry: 1,
  });

  function search() {
    const normalized = toEnDigits(input).trim();
    if (!PHONE_RE.test(normalized)) {
      toast.error("شماره موبایل معتبر نیست (مثل ۰۹۱۲۱۲۳۴۵۶۷)");
      return;
    }
    setPhone(normalized);
  }

  const orders = ordersQuery.data?.orders ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-10">
      <section aria-label="جست‌وجوی سفارش‌ها" className="rounded-2xl border bg-card p-5 shadow-sm md:p-6">
        <h1 className="flex items-center gap-2 font-extrabold">
          <PackageSearch className="size-5 text-primary" />
          سفارش‌های من
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          شماره موبایلی که با آن سفارش ثبت کردی را وارد کن.
        </p>
        <form
          className="mt-4 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            search();
          }}
        >
          <div className="flex-1">
            <Label htmlFor="my-orders-phone" className="sr-only">
              شماره موبایل
            </Label>
            <Input
              id="my-orders-phone"
              type="tel"
              dir="ltr"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="09121234567"
              className="min-h-11 text-left"
              autoComplete="tel"
            />
          </div>
          <Button type="submit" className="min-h-11">
            <Search className="size-4" />
            مشاهده سفارش‌ها
          </Button>
        </form>
      </section>

      <div className="mt-6">
        {phone && PHONE_RE.test(phone) ? (
          ordersQuery.isLoading ? (
            <SpinnerRow label="در حال جست‌وجو…" />
          ) : ordersQuery.isError ? (
            <ErrorState onRetry={() => ordersQuery.refetch()} />
          ) : orders.length === 0 ? (
            <EmptyState
              icon={<PackageOpen className="size-7" />}
              title="سفارشی با این شماره پیدا نشد"
              sub="اولین درخواستت را ثبت کن؛ همه‌چیز این‌جا قابل پیگیری است."
              action={
                <Button onClick={() => openBooking()}>
                  ثبت درخواست
                </Button>
              }
            />
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid gap-3"
              aria-label="لیست سفارش‌ها"
            >
              {orders.map((o) => {
                const Icon = categoryIcon(o.categoryIcon);
                return (
                  <motion.button
                    key={o.id}
                    type="button"
                    variants={staggerItem}
                    onClick={() => openTrack(o.id)}
                    className="flex w-full cursor-pointer items-center gap-4 rounded-2xl border bg-card p-4 text-right shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring outline-none"
                    aria-label={`پیگیری سفارش ${o.code}`}
                  >
                    <span
                      className="grid size-11 shrink-0 place-items-center rounded-xl"
                      style={categoryColorStyle(undefined)}
                    >
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold">{o.serviceName}</p>
                        <span dir="ltr" className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                          {o.code}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {o.categoryName}
                        {o.specialistName ? ` — متخصص: ${o.specialistName}` : ""} —{" "}
                        {formatDateFa(o.createdAt)}
                      </p>
                    </div>
                    <div className="shrink-0 text-left">
                      <StatusBadge status={o.status} />
                      <p className="mt-1.5 text-sm font-extrabold text-primary">
                        {formatToman(o.price)}
                      </p>
                    </div>
                    <ChevronLeft className="size-4 shrink-0 text-muted-foreground" />
                  </motion.button>
                );
              })}
              <p className="pt-2 text-center text-xs text-muted-foreground">
                {toFa(orders.length)} سفارش پیدا شد
              </p>
            </motion.div>
          )
        ) : null}
      </div>
    </div>
  );
}
