// GET /api/catalog — all categories with their services

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toCategoryDTO } from "@/lib/serialize";
import { jsonError } from "@/lib/order-service";

export async function GET() {
  try {
    const categories = await db.serviceCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { basePrice: "asc" },
        },
      },
    });

    return NextResponse.json({
      categories: categories.map((category) => toCategoryDTO(category)),
    });
  } catch {
    return jsonError("خطا در دریافت کاتالوگ خدمات", 500);
  }
}
