// POST /api/orders/[id]/arrive — verify entry code → ARRIVED

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
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
    const entryCode = stringField(body?.entryCode);
    if (!entryCode) {
      return jsonError("کد ورود را وارد کنید", 400);
    }

    const order = await db.order.findUnique({ where: { id } });
    if (!order) {
      return jsonError("سفارش یافت نشد", 404);
    }
    if (order.status !== "ACCEPTED") {
      return jsonError("این سفارش در این مرحله قابل تأیید ورود نیست", 400);
    }

    if (!order.entryCode || order.entryCode !== entryCode) {
      return jsonError("کد ورود اشتباه است", 400);
    }

    await db.order.update({
      where: { id },
      data: { status: "ARRIVED", arrivedAt: new Date() },
    });
    await addOrderEvent(
      id,
      "ENTRY",
      "ورود متخصص تأیید شد",
      "کد ورود با موفقیت تأیید و زمان ورود ثبت شد"
    );

    const updated = await loadOrderDTO(id);
    if (!updated) {
      return jsonError("خطا در دریافت سفارش", 500);
    }

    return NextResponse.json({ order: updated });
  } catch {
    return jsonError("خطا در تأیید ورود متخصص", 500);
  }
}
