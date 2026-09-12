// GET /api/orders/[id] — full order detail

import { NextResponse } from "next/server";
import { jsonError, loadOrderDTO } from "@/lib/order-service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await loadOrderDTO(id);
    if (!order) {
      return jsonError("سفارش یافت نشد", 404);
    }

    return NextResponse.json({ order });
  } catch {
    return jsonError("خطا در دریافت سفارش", 500);
  }
}
