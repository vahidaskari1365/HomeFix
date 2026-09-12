// GET /api/stats — landing page statistics

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { skillNames, toSpecialistPublic } from "@/lib/serialize";
import { jsonError } from "@/lib/order-service";

export async function GET() {
  try {
    const [specialistsCount, ordersCount, activeSpecialists] = await Promise.all([
      db.specialist.count({ where: { status: "ACTIVE" } }),
      db.order.count({ where: { status: "PAID" } }),
      db.specialist.findMany({
        where: { status: "ACTIVE" },
        include: { skills: { include: { service: true } } },
        orderBy: [
          { successfulOrders: "desc" },
          { rating: "desc" },
        ],
      }),
    ]);

    const avgRating = activeSpecialists.length
      ? Math.round(
          (activeSpecialists.reduce((sum, s) => sum + s.rating, 0) /
            activeSpecialists.length) *
            10
        ) / 10
      : 0;

    const topSpecialists = activeSpecialists
      .slice(0, 4)
      .map((specialist) =>
        toSpecialistPublic(specialist, skillNames(specialist))
      );

    return NextResponse.json({
      stats: { specialistsCount, ordersCount, avgRating, topSpecialists },
    });
  } catch {
    return jsonError("خطا در دریافت آمار پلتفرم", 500);
  }
}
