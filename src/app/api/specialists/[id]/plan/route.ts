// POST /api/specialists/[id]/plan — switch FREE / PRO plan

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toSpecialistPrivate } from "@/lib/serialize";
import { jsonError, readJsonObject, stringField } from "@/lib/order-service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await readJsonObject(req);
    const plan = stringField(body?.plan);
    if (plan !== "FREE" && plan !== "PRO") {
      return jsonError("پلن انتخابی معتبر نیست", 400);
    }

    const specialist = await db.specialist.findUnique({ where: { id } });
    if (!specialist) {
      return jsonError("متخصص یافت نشد", 404);
    }

    const updated = await db.specialist.update({
      where: { id },
      data: { plan },
      include: { skills: { include: { service: true } } },
    });

    return NextResponse.json({ specialist: toSpecialistPrivate(updated) });
  } catch {
    return jsonError("خطا در تغییر پلن", 500);
  }
}
