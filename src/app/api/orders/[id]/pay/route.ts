// POST /api/orders/[id]/pay — COMPLETED → PAID, commission frozen, specialist stats updated

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Plan } from "@/lib/types";
import { computeCommission, commissionRateFor, nextVerificationLevel } from "@/lib/commission";
import { addOrderEvent, jsonError, loadOrderDTO, readJsonObject } from "@/lib/order-service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await db.order.findUnique({ where: { id } });
    if (!order) {
      return jsonError("سفارش یافت نشد", 404);
    }

    // Idempotent: paying an already-paid order returns the current order.
    if (order.status === "PAID") {
      const current = await loadOrderDTO(id);
      if (!current) {
        return jsonError("خطا در دریافت سفارش", 500);
      }
      return NextResponse.json({ order: current });
    }

    if (order.status !== "COMPLETED") {
      return jsonError("پرداخت تنها پس از تکمیل کار امکان‌پذیر است", 400);
    }

    const body = await readJsonObject(req);
    const method = body?.method;
    if (method !== "online" && method !== "wallet") {
      return jsonError("روش پرداخت معتبر نیست", 400);
    }

    if (!order.specialistId) {
      return jsonError("این سفارش متخصص تعیین‌شده ندارد", 400);
    }
    const specialist = await db.specialist.findUnique({
      where: { id: order.specialistId },
    });
    if (!specialist) {
      return jsonError("متخصص سفارش یافت نشد", 400);
    }

    const plan: Plan = specialist.plan === "PRO" ? "PRO" : "FREE";
    const rate = commissionRateFor(specialist.successfulOrders, plan);
    const { commissionAmount, specialistEarning } = computeCommission(
      order.price,
      rate
    );
    const now = new Date();

    await db.order.update({
      where: { id },
      data: {
        status: "PAID",
        paidAt: now,
        paymentMethod: method,
        commissionRate: rate,
        commissionAmount,
        specialistEarning,
      },
    });

    const successfulOrders = specialist.successfulOrders + 1;
    const verificationLevel = nextVerificationLevel(specialist.verificationLevel, {
      identityVerified: specialist.identityVerified,
      skillsVerified: specialist.skillsVerified,
      interviewPassed: specialist.interviewPassed,
      successfulOrders,
      rating: specialist.rating,
    });

    await db.specialist.update({
      where: { id: specialist.id },
      data: {
        successfulOrders: { increment: 1 },
        totalOrders: { increment: 1 },
        verificationLevel,
      },
    });

    const formatter = new Intl.NumberFormat("fa-IR");
    await addOrderEvent(
      id,
      "PAYMENT",
      "پرداخت با موفقیت انجام شد",
      `کمیسیون پلتفرم: ${formatter.format(commissionAmount)} تومان — سهم متخصص: ${formatter.format(specialistEarning)} تومان`
    );

    const updated = await loadOrderDTO(id);
    if (!updated) {
      return jsonError("خطا در دریافت سفارش", 500);
    }

    return NextResponse.json({ order: updated });
  } catch {
    return jsonError("خطا در پردازش پرداخت", 500);
  }
}
