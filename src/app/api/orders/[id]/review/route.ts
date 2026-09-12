// POST /api/orders/[id]/review — two-way rating after payment

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { ReviewBy } from "@/lib/types";
import {
  addOrderEvent,
  jsonError,
  loadOrderDTO,
  numberField,
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
    const by = body?.by;
    if (by !== "CUSTOMER" && by !== "SPECIALIST") {
      return jsonError("نوع امتیازدهی معتبر نیست", 400);
    }

    const rating = numberField(body?.rating);
    if (rating === null || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return jsonError("امتیاز باید عددی بین ۱ تا ۵ باشد", 400);
    }

    const comment = stringField(body?.comment);

    const order = await db.order.findUnique({ where: { id } });
    if (!order) {
      return jsonError("سفارش یافت نشد", 404);
    }
    if (order.status !== "PAID") {
      return jsonError("امتیازدهی تنها پس از پرداخت امکان‌پذیر است", 400);
    }
    if (by === "CUSTOMER" && order.customerRated) {
      return jsonError("شما قبلاً امتیاز داده‌اید", 400);
    }
    if (by === "SPECIALIST" && order.specialistRated) {
      return jsonError("شما قبلاً امتیاز داده‌اید", 400);
    }

    await db.review.create({
      data: {
        orderId: id,
        specialistId: order.specialistId,
        by: by as ReviewBy,
        rating,
        comment,
      },
    });

    await db.order.update({
      where: { id },
      data: by === "CUSTOMER" ? { customerRated: true } : { specialistRated: true },
    });

    // Customer rating updates the specialist's aggregate rating.
    if (by === "CUSTOMER" && order.specialistId) {
      const specialist = await db.specialist.findUnique({
        where: { id: order.specialistId },
      });
      if (specialist) {
        const ratingCount = specialist.ratingCount + 1;
        const newRating =
          Math.round(
            ((specialist.rating * specialist.ratingCount + rating) / ratingCount) * 10
          ) / 10;
        await db.specialist.update({
          where: { id: specialist.id },
          data: { ratingCount, rating: newRating },
        });
      }
    }

    await addOrderEvent(
      id,
      "NOTE",
      "امتیاز ثبت شد",
      `امتیاز ${rating} از ۵ توسط ${by === "CUSTOMER" ? "مشتری" : "متخصص"}`
    );

    const updated = await loadOrderDTO(id);
    if (!updated) {
      return jsonError("خطا در دریافت سفارش", 500);
    }

    return NextResponse.json({ order: updated });
  } catch {
    return jsonError("خطا در ثبت امتیاز", 500);
  }
}
