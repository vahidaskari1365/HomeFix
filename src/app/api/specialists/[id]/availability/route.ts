// POST /api/specialists/[id]/availability — toggle isAvailable

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toSpecialistPrivate } from "@/lib/serialize";
import { jsonError, readJsonObject } from "@/lib/order-service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await readJsonObject(req);
    if (!body || typeof body.isAvailable !== "boolean") {
      return jsonError("وضعیت ارسال‌شده معتبر نیست", 400);
    }

    const specialist = await db.specialist.findUnique({ where: { id } });
    if (!specialist) {
      return jsonError("متخصص یافت نشد", 404);
    }

    const updated = await db.specialist.update({
      where: { id },
      data: { isAvailable: body.isAvailable },
      include: { skills: { include: { service: true } } },
    });

    return NextResponse.json({ specialist: toSpecialistPrivate(updated) });
  } catch {
    return jsonError("خطا در تغییر وضعیت دسترسی", 500);
  }
}
