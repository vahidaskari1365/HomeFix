// ============================================================
// HomeFix — Shared order logic + small API route helpers
// Owned by: Task 3-a (backend)
// ============================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { OrderDTO, OrderEventType } from "@/lib/types";
import { orderFullInclude, toOrderDTO } from "@/lib/serialize";

// ---------- order queries ----------

export async function findOrderFull(id: string) {
  return db.order.findUnique({ where: { id }, include: orderFullInclude });
}

export async function loadOrderDTO(id: string): Promise<OrderDTO | null> {
  const order = await findOrderFull(id);
  return order ? toOrderDTO(order) : null;
}

export async function addOrderEvent(
  orderId: string,
  type: OrderEventType,
  title: string,
  detail?: string | null
): Promise<void> {
  await db.orderEvent.create({
    data: { orderId, type, title, detail: detail ?? null },
  });
}

// ---------- small shared API helpers ----------

/** JSON error response with a Persian message. */
export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** Safely parse a JSON object body; returns null when the body is not an object. */
export async function readJsonObject(
  req: Request
): Promise<Record<string, unknown> | null> {
  try {
    const data: unknown = await req.json();
    if (data && typeof data === "object" && !Array.isArray(data)) {
      return data as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

/** Trimmed non-empty string, or null when missing/empty/non-string. */
export function stringField(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Coerce an unknown value to a finite number, or null when not numeric. */
export function numberField(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}
