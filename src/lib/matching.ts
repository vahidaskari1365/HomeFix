// ============================================================
// HomeFix — Specialist matching logic
// Owned by: Task 3-a (backend)
// ============================================================

import type { Specialist } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * Candidates = ACTIVE + available specialists that have a skill for the service,
 * sorted by verificationLevel desc → rating desc → successfulOrders desc.
 */
export async function findCandidateSpecialists(
  serviceId: string,
  excludeSpecialistIds: string[] = []
): Promise<Specialist[]> {
  return db.specialist.findMany({
    where: {
      status: "ACTIVE",
      isAvailable: true,
      skills: { some: { serviceId } },
      ...(excludeSpecialistIds.length > 0
        ? { id: { notIn: excludeSpecialistIds } }
        : {}),
    },
    orderBy: [
      { verificationLevel: "desc" },
      { rating: "desc" },
      { successfulOrders: "desc" },
    ],
  });
}

/** Ids of all specialists that already received an offer for this order. */
export async function specialistIdsWithOffers(orderId: string): Promise<string[]> {
  const offers = await db.orderOffer.findMany({
    where: { orderId },
    select: { specialistId: true },
  });
  return [...new Set(offers.map((offer) => offer.specialistId))];
}

/**
 * Create a PENDING offer for the best remaining candidate and move the order
 * to OFFERED. When nobody remains, the order goes back to FINDING.
 * Returns the offered specialist, or null when nobody remains.
 */
export async function offerOrderToNextSpecialist(
  orderId: string,
  serviceId: string,
  excludeSpecialistIds: string[]
): Promise<Specialist | null> {
  const candidates = await findCandidateSpecialists(serviceId, excludeSpecialistIds);
  const candidate = candidates[0];

  if (!candidate) {
    await db.order.update({
      where: { id: orderId },
      data: { status: "FINDING" },
    });
    return null;
  }

  await db.orderOffer.create({
    data: { orderId, specialistId: candidate.id, status: "PENDING" },
  });
  await db.order.update({
    where: { id: orderId },
    data: { status: "OFFERED" },
  });

  return candidate;
}
