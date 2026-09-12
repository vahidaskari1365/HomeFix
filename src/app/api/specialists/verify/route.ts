// POST /api/specialists/verify — verify OTP → specialist private DTO

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyOtp } from "@/lib/otp";
import { toSpecialistPrivate } from "@/lib/serialize";
import { jsonError, readJsonObject, stringField } from "@/lib/order-service";

const PHONE_REGEX = /^09\d{9}$/;

export async function POST(req: Request) {
  try {
    const body = await readJsonObject(req);
    const phone = stringField(body?.phone);
    const otp = stringField(body?.otp);

    if (!phone || !PHONE_REGEX.test(phone)) {
      return jsonError("شماره موبایل معتبر نیست", 400);
    }
    if (!otp) {
      return jsonError("کد تأیید را وارد کنید", 400);
    }

    if (!verifyOtp(phone, otp)) {
      return jsonError("کد تأیید اشتباه است", 401);
    }

    const specialist = await db.specialist.findUnique({
      where: { phone },
      include: { skills: { include: { service: true } } },
    });
    if (!specialist) {
      return jsonError("متخصصی با این شماره یافت نشد", 404);
    }

    return NextResponse.json({ specialist: toSpecialistPrivate(specialist) });
  } catch {
    return jsonError("خطا در تأیید کد", 500);
  }
}
