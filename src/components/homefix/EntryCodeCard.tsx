"use client";

// ============================================================
// HomeFix — entry code card (customer side)
// ============================================================

import { useState } from "react";
import { Copy, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { toFa } from "@/lib/format";

export function EntryCodeCard({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("کد کپی شد");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("کپی نشد؛ کد را دستی یادداشت کن");
    }
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-accent bg-accent/5 p-5 text-center">
      <p className="inline-flex items-center gap-2 text-sm font-extrabold text-accent-foreground">
        <KeyRound className="size-4" />
        کد ورود سفارش
      </p>
      <div className="my-3 flex items-center justify-center gap-3" dir="ltr">
        <span className="rounded-xl bg-card px-5 py-2 font-mono text-4xl font-black tracking-[0.3em] text-foreground shadow-inner">
          {toFa(code)}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label="کپی کد ورود"
          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl border bg-card transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring outline-none"
        >
          <Copy className={copied ? "size-4 text-primary" : "size-4"} />
        </button>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        این کد را فقط وقتی متخصص جلوی در است به او بگویید؛ با وارد کردن کد، زمان ورود ثبت می‌شود.
      </p>
    </div>
  );
}
