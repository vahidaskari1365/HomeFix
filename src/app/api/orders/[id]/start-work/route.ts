// POST /api/orders/[id]/start-work — ARRIVED → IN_PROGRESS

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
    if (order.status !== "ARRIVED") {
      return jsonError("این سفارش در این مرحله قابل شروع نیست", 400);
    }

    await db.order.update({
      where: { id },
      data: { status: "IN_PROGRESS", workStartedAt: new Date() },
    });
    await addOrderEvent(id, "STATUS", "کار شروع شد");

    const updated = await loadOrderDTO(id);
    if (!updated) {
      return jsonError("خطا در دریافت سفارش", 500);
    }

    return NextResponse.json({ order: updated });
  } catch {
    return jsonError("خطا در شروع کار", 500);
  }
}
