"use client";

// ============================================================
// HomeFix — floating emergency button + modal (TrackView)
// ============================================================

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, Loader2, PhoneCall, Siren } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { apiPost } from "./api";
import { SUPPORT_PHONE, type OrderDTO } from "@/lib/types";

export function EmergencyButton({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const send = useMutation({
    mutationFn: () =>
      apiPost<{ order: OrderDTO; supportPhone: string }>(`/api/orders/${orderId}/emergency`, {
        message: message.trim(),
      }),
    onSuccess: () => {
      toast.success("گزارش ثبت شد؛ تیم پشتیبانی در جریان است");
      setMessage("");
      setOpen(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "ارسال گزارش ناموفق بود"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-4 left-4 z-50 h-12 rounded-full bg-destructive px-5 text-sm font-extrabold text-white shadow-lg hover:bg-destructive/90"
          aria-label="دکمه اضطراری"
        >
          <Siren className="size-5" />
          اضطراری
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Siren className="size-5" />
            دکمه اضطراری
          </DialogTitle>
          <DialogDescription>
            مشکل حاد یا نگرانی درباره سفارش را همین‌جا گزارش کن.
          </DialogDescription>
        </DialogHeader>

        <a
          href="tel:02191007800"
          className="flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl bg-destructive px-4 py-3 text-center text-white shadow transition hover:bg-destructive/90 focus-visible:ring-2 focus-visible:ring-ring outline-none"
        >
          <span className="inline-flex items-center gap-2 text-sm font-extrabold">
            <PhoneCall className="size-4" />
            تماس فوری با پشتیبانی
          </span>
          <span dir="ltr" className="font-mono text-lg font-black tracking-wider">
            {SUPPORT_PHONE}
          </span>
        </a>

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="مشکل را سریع بنویسید…"
          rows={3}
          className="resize-none"
          aria-label="گزارش مشکل"
        />

        <Button
          variant="destructive"
          className="min-h-11 w-full"
          disabled={send.isPending || message.trim().length < 3}
          onClick={() => send.mutate()}
        >
          {send.isPending ? <Loader2 className="size-4 animate-spin" /> : <Siren className="size-4" />}
          ارسال گزارش اضطراری
        </Button>

        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs leading-relaxed text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          در موارد خطر جانی، فوراً با <span className="font-extrabold">۱۱۰ (پلیس)</span> یا{" "}
          <span className="font-extrabold">۱۲۵ (آتش‌نشانی)</span> تماس بگیرید.
        </div>
      </DialogContent>
    </Dialog>
  );
}
