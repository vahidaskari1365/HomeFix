// GET /api/specialists/[id] — specialist dashboard (offers, active orders, history, earnings)

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { commissionRateFor } from "@/lib/commission";
import {
  orderFullInclude,
  toOfferDTO,
  toOrderDTO,
  toOrderSummaryDTO,
  toSpecialistPrivate,
} from "@/lib/serialize";
import { jsonError } from "@/lib/order-service";

const ACTIVE_STATUSES = ["ACCEPTED", "ARRIVED", "IN_PROGRESS"] as const;
const HISTORY_STATUSES = ["PAID", "COMPLETED"] as const;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const specialist = await db.specialist.findUnique({
      where: { id },
      include: { skills: { include: { service: true } } },
    });
    if (!specialist) {
      return jsonError("متخصص یافت نشد", 404);
    }

    const commissionPreview = commissionRateFor(
      specialist.successfulOrders,
      specialist.plan === "PRO" ? "PRO" : "FREE"
    );

    const [offers, activeOrders, historyRows, paidRows] = await Promise.all([
      db.orderOffer.findMany({
        where: { specialistId: id, status: "PENDING" },
        orderBy: { createdAt: "desc" },
        include: {
          order: { include: { service: { include: { category: true } } } },
        },
      }),
      db.order.findMany({
        where: { specialistId: id, status: { in: [...ACTIVE_STATUSES] } },
        orderBy: [{ status: "desc" }, { createdAt: "desc" }],
        include: orderFullInclude,
      }),
      db.order.findMany({
        where: { specialistId: id, status: { in: [...HISTORY_STATUSES] } },
        orderBy: { createdAt: "desc" },
        include: {
          service: { include: { category: true } },
          specialist: true,
        },
      }),
      db.order.findMany({
        where: { specialistId: id, status: "PAID" },
        select: { specialistEarning: true, paidAt: true },
      }),
    ]);

    // ---- earnings ----
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    let total = 0;
    let month = 0;
    let today = 0;
    for (const row of paidRows) {
      total += row.specialistEarning;
      if (row.paidAt) {
        if (row.paidAt >= monthStart && row.paidAt < monthEnd) {
          month += row.specialistEarning;
        }
        if (row.paidAt >= dayStart && row.paidAt < dayEnd) {
          today += row.specialistEarning;
        }
      }
    }

    // Pending earning for active orders = price minus expected commission.
    const pending = activeOrders.reduce(
      (sum, order) =>
        sum + (order.price - Math.round(order.price * commissionPreview)),
      0
    );

    return NextResponse.json({
      dashboard: {
        specialist: toSpecialistPrivate(specialist),
        offers: offers.map((offer) => toOfferDTO(offer)),
        activeOrders: activeOrders.map((order) => toOrderDTO(order)),
        history: historyRows.map((order) => toOrderSummaryDTO(order)),
        earnings: { total, month, today, pending },
      },
    });
  } catch {
    return jsonError("خطا در دریافت پنل متخصص", 500);
  }
}
