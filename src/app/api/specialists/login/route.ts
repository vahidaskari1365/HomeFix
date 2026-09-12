// POST /api/specialists/login — check phone, issue demo OTP

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEMO_OTP, issueOtp } from "@/lib/otp";
import { jsonError, readJsonObject, stringField } from "@/lib/order-service";

const PHONE_REGEX = /^09\d{9}$/;

export async function POST(req: Request) {
  try {
    const body = await readJsonObject(req);
    const phone = stringField(body?.phone);

    if (!phone || !PHONE_REGEX.test(phone)) {
      return jsonError("شماره موبایل معتبر نیست", 400);
    }

    const specialist = await db.specialist.findUnique({ where: { phone } });
    if (!specialist) {
      return NextResponse.json({ exists: false });
    }

    issueOtp(phone);
    return NextResponse.json({ exists: true, devOtp: DEMO_OTP });
  } catch {
    return jsonError("خطا در بررسی شماره موبایل", 500);
  }
}
