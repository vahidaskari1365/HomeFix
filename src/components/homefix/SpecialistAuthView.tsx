"use client";

// ============================================================
// HomeFix — specialist auth (login / register tabs)
// ============================================================

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { KeyRound, Loader2, Phone, UserRoundPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiPost } from "./api";
import { SpecialistRegister } from "./SpecialistRegister";
import { useHomeFix } from "@/lib/store";
import { toEnDigits, toFa } from "@/lib/format";
import type { SpecialistPrivateDTO } from "@/lib/types";

const PHONE_RE = /^09\d{9}$/;

export function SpecialistAuthView() {
  const authTab = useHomeFix((s) => s.authTab);
  const setAuthTab = useHomeFix((s) => s.setAuthTab);

  return (
    <div className="mx-auto max-w-md px-4 py-8 md:py-10">
      <div className="mb-6 text-center">
        <span className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
          <UserRoundPlus className="size-7" />
        </span>
        <h1 className="text-xl font-extrabold">پنل متخصص HomeFix</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          وارد شو یا ثبت‌نام کن؛ مشتری‌ها همین امروز می‌آیند.
        </p>
      </div>

      <Tabs value={authTab} onValueChange={(v) => setAuthTab(v as "login" | "register")}>
        <TabsList className="grid h-11 w-full grid-cols-2">
          <TabsTrigger value="login" className="min-h-9">
            ورود
          </TabsTrigger>
          <TabsTrigger value="register" className="min-h-9">
            ثبت‌نام متخصص
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="mt-5">
          <LoginTab />
        </TabsContent>

        <TabsContent value="register" className="mt-5">
          <SpecialistRegister />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// Login tab — phone → OTP → verify
// ============================================================
function LoginTab() {
  const openSpecialist = useHomeFix((s) => s.openSpecialist);
  const setAuthTab = useHomeFix((s) => s.setAuthTab);

  const [phone, setPhone] = useState("");
  const [phase, setPhase] = useState<"phone" | "otp" | "not-found">("phone");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [otp, setOtp] = useState("");

  const login = useMutation({
    mutationFn: (p: string) =>
      apiPost<{ exists: boolean; devOtp?: string }>("/api/specialists/login", { phone: p }),
  });

  const verify = useMutation({
    mutationFn: () =>
      apiPost<{ specialist: SpecialistPrivateDTO }>("/api/specialists/verify", {
        phone: toEnDigits(phone).trim(),
        otp: toEnDigits(otp).trim(),
      }),
  });

  function requestOtp() {
    const p = toEnDigits(phone).trim();
    if (!PHONE_RE.test(p)) {
      toast.error("شماره موبایل معتبر نیست (مثل ۰۹۱۲۱۲۳۴۵۶۷)");
      return;
    }
    setPhone(p);
    login.mutate(p, {
      onSuccess: (res) => {
        if (res.exists) {
          setDevOtp(res.devOtp ?? null);
          setPhase("otp");
        } else {
          setPhase("not-found");
        }
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "خطا در ارسال کد"),
    });
  }

  function confirmOtp() {
    if (toEnDigits(otp).trim().length !== 6) {
      toast.error("کد ۶ رقمی را وارد کن");
      return;
    }
    verify.mutate(undefined, {
      onSuccess: (res) => {
        toast.success(`خوش آمدی ${res.specialist.firstName} 👋`);
        openSpecialist(res.specialist.id);
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "کد تأیید درست نیست"),
    });
  }

  return (
    <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm md:p-6">
      {phase === "phone" ? (
        <>
          <div>
            <Label className="mb-2 block">شماره موبایل</Label>
            <div className="flex gap-2">
              <Input
                type="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09121234567"
                className="min-h-11 flex-1 text-left"
                autoComplete="tel"
                onKeyDown={(e) => {
                  if (e.key === "Enter") requestOtp();
                }}
              />
              <Button className="min-h-11" disabled={login.isPending} onClick={requestOtp}>
                {login.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Phone className="size-4" />
                )}
                دریافت کد
              </Button>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            شماره‌های نمایشی: <span dir="ltr">09121000001</span> تا{" "}
            <span dir="ltr">09121000008</span>
          </p>
        </>
      ) : null}

      {phase === "otp" ? (
        <>
          {devOtp ? (
            <p className="flex items-center justify-center gap-2 rounded-xl border border-accent/50 bg-accent/10 px-4 py-3 text-sm font-bold text-accent-foreground">
              <KeyRound className="size-4" />
              کد نمایشی: {toFa(devOtp)}
            </p>
          ) : null}
          <div>
            <Label className="mb-2 block">کد تأیید ۶ رقمی</Label>
            <Input
              dir="ltr"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
              className="min-h-11 text-center font-mono text-lg tracking-[0.5em]"
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmOtp();
              }}
            />
          </div>
          <Button className="min-h-11 w-full" disabled={verify.isPending} onClick={confirmOtp}>
            {verify.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            ورود به پنل
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setPhase("phone")}>
            تغییر شماره
          </Button>
        </>
      ) : null}

      {phase === "not-found" ? (
        <div className="space-y-4 text-center">
          <p className="rounded-xl border border-dashed px-4 py-4 text-sm leading-relaxed text-muted-foreground">
            حسابی با این شماره پیدا نشد. از تب «ثبت‌نام متخصص» شروع کن — فقط چند دقیقه وقت می‌گیرد.
          </p>
          <Button className="min-h-11 w-full" onClick={() => setAuthTab("register")}>
            <UserRoundPlus className="size-4" />
            رفتن به ثبت‌نام
          </Button>
        </div>
      ) : null}
    </div>
  );
}
