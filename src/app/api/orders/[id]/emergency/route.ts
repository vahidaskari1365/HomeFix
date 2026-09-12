// POST /api/orders/[id]/emergency — log an emergency report on the order

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SUPPORT_PHONE } from "@/lib/types";
import {
  addOrderEvent,
  jsonError,
  loadOrderDTO,
  readJsonObject,
  stringField,
} from "@/lib/order-service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await readJsonObject(req);
    const message = stringField(body?.message);
    if (!message || message.length < 3) {
      return jsonError("متن گزارش اضطراری باید حداقل ۳ کاراکتر باشد", 400);
    }

    const order = await db.order.findUnique({ where: { id } });
    if (!order) {
      return jsonError("سفارش یافت نشد", 404);
    }

    const recordedAt = new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date());

    await addOrderEvent(
      id,
      "EMERGENCY",
      "🚨 گزارش اضطراری ثبت شد",
      `${message} (زمان ثبت: ${recordedAt})`
    );

    const updated = await loadOrderDTO(id);
    if (!updated) {
      return jsonError("خطا در دریافت سفارش", 500);
    }

    return NextResponse.json({ order: updated, supportPhone: SUPPORT_PHONE });
  } catch {
    return jsonError("خطا در ثبت گزارش اضطراری", 500);
  }
}
