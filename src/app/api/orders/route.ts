// /api/orders — GET (list by customer phone) + POST (create order + matching)

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { TIME_SLOTS } from "@/lib/types";
import { toOrderSummaryDTO } from "@/lib/serialize";
import { findCandidateSpecialists } from "@/lib/matching";
import {
  jsonError,
  loadOrderDTO,
  readJsonObject,
  stringField,
} from "@/lib/order-service";

const PHONE_REGEX = /^09\d{9}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

async function generateOrderCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = `HF-${Math.floor(100000 + Math.random() * 900000)}`;
    const existing = await db.order.findUnique({
      where: { code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  return `HF-${String(Date.now()).slice(-6)}`;
}

// GET /api/orders?phone=09... — customer order history, newest first
export async function GET(req: Request) {
  try {
    const phone = new URL(req.url).searchParams.get("phone")?.trim() ?? "";
    if (!PHONE_REGEX.test(phone)) {
      return jsonError("شماره موبایل معتبر نیست", 400);
    }

    const orders = await db.order.findMany({
      where: { customerPhone: phone },
      orderBy: { createdAt: "desc" },
      include: {
        service: { include: { category: true } },
        specialist: true,
      },
    });

    return NextResponse.json({
      orders: orders.map((order) => toOrderSummaryDTO(order)),
    });
  } catch {
    return jsonError("خطا در دریافت سفارش‌ها", 500);
  }
}

// POST /api/orders — create order and run specialist matching
export async function POST(req: Request) {
  try {
    const body = await readJsonObject(req);
    if (!body) {
      return jsonError("داده ارسالی معتبر نیست", 400);
    }

    const customerName = stringField(body.customerName);
    const customerPhone = stringField(body.customerPhone);
    const city = stringField(body.city);
    const address = stringField(body.address);
    const serviceId = stringField(body.serviceId);
    const scheduledDate = stringField(body.scheduledDate);
    const scheduledSlot = stringField(body.scheduledSlot);
    const description = stringField(body.description);

    if (!customerName || customerName.length < 2) {
      return jsonError("نام و نام خانوادگی را وارد کنید", 400);
    }
    if (!customerPhone || !PHONE_REGEX.test(customerPhone)) {
      return jsonError("شماره موبایل معتبر نیست", 400);
    }
    if (!city) {
      return jsonError("شهر را وارد کنید", 400);
    }
    if (!address) {
      return jsonError("آدرس را وارد کنید", 400);
    }
    if (!serviceId) {
      return jsonError("انتخاب خدمت الزامی است", 400);
    }
    if (!scheduledDate || !DATE_REGEX.test(scheduledDate)) {
      return jsonError("تاریخ اجرای کار معتبر نیست", 400);
    }
    if (!scheduledSlot || !TIME_SLOTS.includes(scheduledSlot as (typeof TIME_SLOTS)[number])) {
      return jsonError("بازه زمانی انتخاب‌شده معتبر نیست", 400);
    }

    const service = await db.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return jsonError("خدمت انتخاب‌شده یافت نشد", 400);
    }

    const code = await generateOrderCode();
    const firstCandidate = (await findCandidateSpecialists(service.id))[0] ?? null;

    const created = await db.order.create({
      data: {
        code,
        status: firstCandidate ? "OFFERED" : "FINDING",
        serviceId: service.id,
        customerName,
        customerPhone,
        city,
        address,
        scheduledDate,
        scheduledSlot,
        description,
        price: service.basePrice,
        offers: firstCandidate
          ? { create: { specialistId: firstCandidate.id, status: "PENDING" } }
          : undefined,
        events: {
          create: [
            {
              type: "STATUS",
              title: "سفارش ثبت شد",
              detail: service.name,
            },
          ],
        },
      },
    });

    const order = await loadOrderDTO(created.id);
    if (!order) {
      return jsonError("خطا در دریافت سفارش ثبت‌شده", 500);
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return jsonError("خطا در ثبت سفارش", 500);
  }
}
