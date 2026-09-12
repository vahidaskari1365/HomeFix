// POST /api/orders/[id]/reject — reject current offer, offer next candidate

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  offerOrderToNextSpecialist,
  specialistIdsWithOffers,
} from "@/lib/matching";
import { addOrderEvent, jsonError, loadOrderDTO } from "@/lib/order-service";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await db.order.findUnique({ where: { id } });
    if (!order) {
      return jsonError("سفارش یافت نشد", 404);
    }
    if (order.status !== "OFFERED") {
      return jsonError("این سفارش در این مرحله قابل رد شدن نیست", 400);
    }

    const pendingOffer = await db.orderOffer.findFirst({
      where: { orderId: id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });
    if (pendingOffer) {
      await db.orderOffer.update({
        where: { id: pendingOffer.id },
        data: { status: "REJECTED", respondedAt: new Date() },
      });
    }

    const excluded = await specialistIdsWithOffers(id);
    const nextSpecialist = await offerOrderToNextSpecialist(
      id,
      order.serviceId,
      excluded
    );

    await addOrderEvent(
      id,
      "STATUS",
      "متخصص قبلی رد کرد؛ در حال یافتن متخصص بعدی",
      nextSpecialist
        ? "پیشنهاد سفارش به متخصص بعدی ارسال شد"
        : "در حال جست‌وجوی متخصص مناسب هستیم"
    );

    const updated = await loadOrderDTO(id);
    if (!updated) {
      return jsonError("خطا در دریافت سفارش", 500);
    }

    return NextResponse.json({ order: updated });
  } catch {
    return jsonError("خطا در ثبت رد سفارش", 500);
  }
}
