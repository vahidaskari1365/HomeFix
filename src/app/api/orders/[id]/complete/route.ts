// POST /api/orders/[id]/complete — IN_PROGRESS → COMPLETED (optional finalPrice)

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  addOrderEvent,
  jsonError,
  loadOrderDTO,
  numberField,
  readJsonObject,
} from "@/lib/order-service";

const MAX_PRICE = 100_000_000;

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
    if (order.status !== "IN_PROGRESS") {
      return jsonError("این سفارش در این مرحله قابل تکمیل نیست", 400);
    }

    const body = await readJsonObject(req);
    let finalPrice: number | null = null;
    if (body && body.finalPrice !== undefined && body.finalPrice !== null) {
      const parsed = numberField(body.finalPrice);
      if (parsed === null || parsed <= 0 || parsed >= MAX_PRICE) {
        return jsonError("مبلغ نهایی معتبر نیست", 400);
      }
      finalPrice = Math.round(parsed);
    }

    await db.order.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        ...(finalPrice !== null ? { price: finalPrice } : {}),
      },
    });
    await addOrderEvent(id, "STATUS", "کار انجام شد؛ نوبت پرداخت");

    const updated = await loadOrderDTO(id);
    if (!updated) {
      return jsonError("خطا در دریافت سفارش", 500);
    }

    return NextResponse.json({ order: updated });
  } catch {
    return jsonError("خطا در تکمیل کار", 500);
  }
}
