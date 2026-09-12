// POST /api/specialists/register — new specialist signup (level 2, ACTIVE)

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toSpecialistPrivate } from "@/lib/serialize";
import { jsonError, numberField, readJsonObject, stringField } from "@/lib/order-service";

const PHONE_REGEX = /^09\d{9}$/;
const NATIONAL_ID_REGEX = /^\d{10}$/;

export async function POST(req: Request) {
  try {
    const body = await readJsonObject(req);
    if (!body) {
      return jsonError("داده ارسالی معتبر نیست", 400);
    }

    const firstName = stringField(body.firstName);
    const lastName = stringField(body.lastName);
    const phone = stringField(body.phone);
    const city = stringField(body.city);
    const area = stringField(body.area);
    const nationalId = stringField(body.nationalId);
    const cardNumber = stringField(body.cardNumber);
    const bio = stringField(body.bio);
    const experienceYears = numberField(body.experienceYears);

    if (!firstName) {
      return jsonError("نام را وارد کنید", 400);
    }
    if (!lastName) {
      return jsonError("نام خانوادگی را وارد کنید", 400);
    }
    if (!phone || !PHONE_REGEX.test(phone)) {
      return jsonError("شماره موبایل معتبر نیست", 400);
    }
    if (!city) {
      return jsonError("شهر را وارد کنید", 400);
    }
    if (!area) {
      return jsonError("محله یا منطقه را وارد کنید", 400);
    }
    if (!nationalId || !NATIONAL_ID_REGEX.test(nationalId)) {
      return jsonError("کد ملی باید ۱۰ رقم باشد", 400);
    }
    if (experienceYears === null || !Number.isInteger(experienceYears) || experienceYears < 0) {
      return jsonError("سال سابقه کار معتبر نیست", 400);
    }

    const serviceIdsRaw = body.serviceIds;
    if (!Array.isArray(serviceIdsRaw) || serviceIdsRaw.length === 0) {
      return jsonError("انتخاب حداقل یک خدمت الزامی است", 400);
    }
    const uniqueServiceIds = [
      ...new Set(
        serviceIdsRaw
          .filter((id): id is string => typeof id === "string" && id.trim() !== "")
          .map((id) => id.trim())
      ),
    ];
    if (uniqueServiceIds.length === 0) {
      return jsonError("انتخاب حداقل یک خدمت الزامی است", 400);
    }

    const existing = await db.specialist.findUnique({ where: { phone } });
    if (existing) {
      return jsonError("این شماره قبلاً ثبت شده است", 409);
    }

    const foundServices = await db.service.findMany({
      where: { id: { in: uniqueServiceIds } },
      select: { id: true },
    });
    if (foundServices.length !== uniqueServiceIds.length) {
      return jsonError("یکی از خدمات انتخاب‌شده معتبر نیست", 400);
    }

    const specialist = await db.specialist.create({
      data: {
        firstName,
        lastName,
        phone,
        city,
        area,
        nationalId,
        cardNumber,
        bio,
        experienceYears,
        identityVerified: true,
        skillsVerified: true,
        interviewPassed: true,
        verificationLevel: 2,
        status: "ACTIVE",
        plan: "FREE",
        isAvailable: true,
        skills: {
          create: uniqueServiceIds.map((serviceId) => ({ serviceId })),
        },
      },
      include: { skills: { include: { service: true } } },
    });

    return NextResponse.json(
      { specialist: toSpecialistPrivate(specialist) },
      { status: 201 }
    );
  } catch {
    return jsonError("خطا در ثبت‌نام متخصص", 500);
  }
}
