"use client";

// ============================================================
// HomeFix — payment card + payment modal (COMPLETED state)
// ============================================================

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, CreditCard, Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiPost } from "./api";
import { formatToman, toFa } from "@/lib/format";
import type { OrderDTO } from "@/lib/types";

type PayMethod = "online" | "wallet";
type ModalStep = "choose" | "connecting" | "done";

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export function PaymentCard({ order }: { order: OrderDTO }) {
  const [open, setOpen] = useState(false);
  const rate = order.commissionRate ?? 0;
  const commission =
    order.commissionAmount > 0 ? order.commissionAmount : Math.round((order.price * rate) / 100);
  const earning = order.specialistEarning > 0 ? order.specialistEarning : order.price - commission;

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm md:p-6">
      <h3 className="mb-4 font-extrabold">تسویه سفارش</h3>

      <dl className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">هزینه خدمات</dt>
          <dd className="font-bold">{formatToman(order.price)}</dd>
        </div>
        {rate > 0 ? (
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">کمیسیون پلتفرم {toFa(rate)}٪ (فقط نمایش)</dt>
            <dd className="font-bold">{formatToman(commission)}</dd>
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">سهم متخصص</dt>
          <dd className="font-bold">{formatToman(earning)}</dd>
        </div>
        <div className="flex items-center justify-between border-t pt-3">
          <dt className="font-extrabold">قابل پرداخت</dt>
          <dd className="text-lg font-black text-primary">{formatToman(order.price)}</dd>
        </div>
      </dl>

      <Button size="lg" className="mt-5 min-h-12 w-full text-base" onClick={() => setOpen(true)}>
        <Wallet className="size-5" />
        پرداخت
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        با پرداخت، امتیازدهی دوطرفه فعال می‌شود.
      </p>

      <PaymentModal
        order={order}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
}

function PaymentModal({
  order,
  open,
  onOpenChange,
}: {
  order: OrderDTO;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [method, setMethod] = useState<PayMethod>("online");
  const [step, setStep] = useState<ModalStep>("choose");

  const pay = useMutation({
    mutationFn: async () => {
      setStep("connecting");
      await delay(1500); // simulated gateway connection
      return apiPost<{ order: OrderDTO }>(`/api/orders/${order.id}/pay`, { method });
    },
    onSuccess: () => {
      setStep("done");
      queryClient.invalidateQueries({ queryKey: ["order", order.id] });
    },
    onError: (e) => {
      setStep("choose");
      toast.error(e instanceof Error ? e.message : "پرداخت ناموفق بود");
    },
  });

  function close(next: boolean) {
    if (!next) setStep("choose");
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-md" dir="rtl">
        {step === "choose" ? (
          <>
            <DialogHeader>
              <DialogTitle>پرداخت سفارش</DialogTitle>
              <DialogDescription>
                مبلغ قابل پرداخت: {formatToman(order.price)}
              </DialogDescription>
            </DialogHeader>
            <RadioGroup
              value={method}
              onValueChange={(v) => setMethod(v as PayMethod)}
              className="gap-3"
            >
              <Label
                htmlFor="pay-online"
                className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-4 has-[button[data-state=checked]]:border-primary"
              >
                <RadioGroupItem id="pay-online" value="online" />
                <CreditCard className="size-5 text-primary" />
                <span className="flex-1">
                  <span className="block text-sm font-bold">درگاه بانکی</span>
                  <span className="block text-xs text-muted-foreground">پرداخت امن آنلاین</span>
                </span>
              </Label>
              <Label
                htmlFor="pay-wallet"
                className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-4 has-[button[data-state=checked]]:border-primary"
              >
                <RadioGroupItem id="pay-wallet" value="wallet" />
                <Wallet className="size-5 text-primary" />
                <span className="flex-1">
                  <span className="block text-sm font-bold">کیف پول HomeFix</span>
                  <span className="block text-xs text-muted-foreground">موجودی کیف پول شما</span>
                </span>
              </Label>
            </RadioGroup>
            <DialogFooter>
              <Button
                className="min-h-11 w-full"
                disabled={pay.isPending}
                onClick={() => pay.mutate()}
              >
                {pay.isPending ? <Loader2 className="size-4 animate-spin" /> : <Wallet className="size-4" />}
                پرداخت {formatToman(order.price)}
              </Button>
            </DialogFooter>
          </>
        ) : null}

        {step === "connecting" ? (
          <div className="flex flex-col items-center gap-4 py-10">
            <Loader2 className="size-10 animate-spin text-primary" />
            <p className="font-bold">در حال اتصال به درگاه…</p>
            <p className="text-xs text-muted-foreground">چند لحظه صبر کنید</p>
          </div>
        ) : null}

        {step === "done" ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-primary/10">
              <CheckCircle2 className="size-9 text-primary" />
            </span>
            <p className="text-lg font-extrabold">پرداخت با موفقیت انجام شد</p>
            <div className="w-full space-y-2 rounded-xl bg-muted p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">مبلغ</span>
                <span className="font-bold">{formatToman(order.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">روش</span>
                <span className="font-bold">{method === "online" ? "درگاه بانکی" : "کیف پول"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">کد سفارش</span>
                <span dir="ltr" className="font-mono font-bold">{order.code}</span>
              </div>
            </div>
            <Button variant="outline" className="min-h-11 w-full" onClick={() => close(false)}>
              بستن
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
