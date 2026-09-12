// POST /api/orders/[id]/accept — specialist accepts the PENDING offer

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
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

    const pendingOffer = await db.orderOffer.findFirst({
      where: { orderId: id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });

    if (order.status !== "OFFERED" || !pendingOffer) {
      return jsonError("این سفارش در این مرحله قابل پذیرش نیست", 400);
    }

    const now = new Date();
    const entryCode = String(Math.floor(1000 + Math.random() * 9000));

    await db.orderOffer.update({
      where: { id: pendingOffer.id },
      data: { status: "ACCEPTED", respondedAt: now },
    });
    await db.order.update({
      where: { id },
      data: {
        status: "ACCEPTED",
        specialistId: pendingOffer.specialistId,
        acceptedAt: now,
        entryCode,
      },
    });

    await addOrderEvent(id, "STATUS", "متخصص سفارش را پذیرفت");
    await addOrderEvent(
      id,
      "ENTRY",
      "کد ورود صادر شد",
      "کد یک‌بارمصرف برای مشتری نمایش داده می‌شود"
    );

    const updated = await loadOrderDTO(id);
    if (!updated) {
      return jsonError("خطا در دریافت سفارش", 500);
    }

    return NextResponse.json({ order: updated });
  } catch {
    return jsonError("خطا در پذیرش سفارش", 500);
  }
}
