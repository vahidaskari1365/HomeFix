// ============================================================
// HomeFix — Prisma → DTO mappers (shapes from src/lib/types.ts)
// Owned by: Task 3-a (backend)
// ============================================================

import type { Prisma, Service, ServiceCategory, Specialist } from "@prisma/client";
import type {
  CategoryDTO,
  OfferDTO,
  OrderDTO,
  OrderEventDTO,
  OrderEventType,
  OrderStatus,
  OrderSummaryDTO,
  Plan,
  ReviewBy,
  ReviewDTO,
  ServiceDTO,
  SpecialistPrivateDTO,
  SpecialistPublicDTO,
} from "@/lib/types";
import { commissionRateFor } from "@/lib/commission";

// ---------- shared prisma payloads ----------

export const orderFullInclude = {
  service: { include: { category: true } },
  specialist: { include: { skills: { include: { service: true } } } },
  events: true,
  reviews: true,
} as const satisfies Prisma.OrderInclude;

export type OrderFull = Prisma.OrderGetPayload<{ include: typeof orderFullInclude }>;

export type OrderSummaryRow = Prisma.OrderGetPayload<{
  include: { service: { include: { category: true } }; specialist: true };
}>;

export type OfferWithOrder = Prisma.OrderOfferGetPayload<{
  include: { order: { include: { service: { include: { category: true } } } } };
}>;

export type SpecialistWithSkills = Specialist & {
  skills: Array<{ service: Service }>;
};

// ---------- internals ----------

const SPECIALIST_VISIBLE_STATUSES: OrderStatus[] = [
  "ACCEPTED",
  "ARRIVED",
  "IN_PROGRESS",
  "COMPLETED",
  "PAID",
];

function byCreatedAtAsc(a: { createdAt: Date }, b: { createdAt: Date }): number {
  return a.createdAt.getTime() - b.createdAt.getTime();
}

function asPlan(value: string): Plan {
  return value === "PRO" ? "PRO" : "FREE";
}

function asVerificationLevel(value: number): 1 | 2 | 3 {
  if (value >= 3) return 3;
  if (value === 2) return 2;
  return 1;
}

// ---------- service / category ----------

export function toServiceDTO(service: Service): ServiceDTO {
  return {
    id: service.id,
    name: service.name,
    description: service.description,
    basePrice: service.basePrice,
    durationMin: service.durationMin,
    categoryId: service.categoryId,
  };
}

export function toCategoryDTO(
  category: ServiceCategory & { services: Service[] }
): CategoryDTO {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    tagline: category.tagline,
    icon: category.icon,
    color: category.color,
    services: category.services.map((service) => toServiceDTO(service)),
  };
}

// ---------- specialist ----------

export function skillNames(specialist: SpecialistWithSkills): string[] {
  return specialist.skills.map((skill) => skill.service.name);
}

export function toSpecialistPublic(
  specialist: Specialist,
  skills: string[]
): SpecialistPublicDTO {
  return {
    id: specialist.id,
    firstName: specialist.firstName,
    lastName: specialist.lastName,
    avatarUrl: specialist.avatarUrl,
    city: specialist.city,
    area: specialist.area,
    bio: specialist.bio,
    experienceYears: specialist.experienceYears,
    verificationLevel: asVerificationLevel(specialist.verificationLevel),
    plan: asPlan(specialist.plan),
    isAvailable: specialist.isAvailable,
    rating: specialist.rating,
    ratingCount: specialist.ratingCount,
    successfulOrders: specialist.successfulOrders,
    totalOrders: specialist.totalOrders,
    skills,
  };
}

export function toSpecialistPrivate(
  specialist: SpecialistWithSkills
): SpecialistPrivateDTO {
  const commissionPreview = commissionRateFor(
    specialist.successfulOrders,
    asPlan(specialist.plan)
  );
  return {
    ...toSpecialistPublic(specialist, skillNames(specialist)),
    phone: specialist.phone,
    commissionPreview,
  };
}

// ---------- events / reviews ----------

export function toOrderEventDTO(event: {
  id: string;
  type: string;
  title: string;
  detail: string | null;
  createdAt: Date;
}): OrderEventDTO {
  return {
    id: event.id,
    type: event.type as OrderEventType,
    title: event.title,
    detail: event.detail,
    createdAt: event.createdAt.toISOString(),
  };
}

export function toReviewDTO(review: {
  id: string;
  by: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}): ReviewDTO {
  return {
    id: review.id,
    by: review.by as ReviewBy,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
  };
}

// ---------- order ----------

export function toOrderDTO(order: OrderFull): OrderDTO {
  const status = order.status as OrderStatus;
  const statusVisible = SPECIALIST_VISIBLE_STATUSES.includes(status);
  const specialistRow = statusVisible ? order.specialist : null;

  return {
    id: order.id,
    code: order.code,
    status,
    createdAt: order.createdAt.toISOString(),
    service: {
      ...toServiceDTO(order.service),
      category: {
        id: order.service.category.id,
        name: order.service.category.name,
        icon: order.service.category.icon,
      },
    },
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    city: order.city,
    address: order.address,
    scheduledDate: order.scheduledDate,
    scheduledSlot: order.scheduledSlot,
    description: order.description,
    price: order.price,
    commissionRate: order.commissionRate,
    commissionAmount: order.commissionAmount,
    specialistEarning: order.specialistEarning,
    entryCode: statusVisible ? order.entryCode : null,
    paymentMethod: order.paymentMethod,
    acceptedAt: order.acceptedAt ? order.acceptedAt.toISOString() : null,
    arrivedAt: order.arrivedAt ? order.arrivedAt.toISOString() : null,
    workStartedAt: order.workStartedAt ? order.workStartedAt.toISOString() : null,
    completedAt: order.completedAt ? order.completedAt.toISOString() : null,
    paidAt: order.paidAt ? order.paidAt.toISOString() : null,
    customerRated: order.customerRated,
    specialistRated: order.specialistRated,
    specialist: specialistRow
      ? toSpecialistPublic(specialistRow, skillNames(specialistRow))
      : null,
    events: [...order.events].sort(byCreatedAtAsc).map((event) => toOrderEventDTO(event)),
    reviews: [...order.reviews].sort(byCreatedAtAsc).map((review) => toReviewDTO(review)),
  };
}

export function toOrderSummaryDTO(order: OrderSummaryRow): OrderSummaryDTO {
  return {
    id: order.id,
    code: order.code,
    status: order.status as OrderStatus,
    serviceName: order.service.name,
    categoryName: order.service.category.name,
    categoryIcon: order.service.category.icon,
    price: order.price,
    createdAt: order.createdAt.toISOString(),
    specialistName: order.specialist
      ? `${order.specialist.firstName} ${order.specialist.lastName}`
      : null,
  };
}

export function toOfferDTO(offer: OfferWithOrder): OfferDTO {
  return {
    id: offer.id,
    orderId: offer.orderId,
    orderCode: offer.order.code,
    serviceName: offer.order.service.name,
    categoryName: offer.order.service.category.name,
    price: offer.order.price,
    customerName: offer.order.customerName,
    customerPhone: offer.order.customerPhone,
    city: offer.order.city,
    address: offer.order.address,
    scheduledDate: offer.order.scheduledDate,
    scheduledSlot: offer.order.scheduledSlot,
    description: offer.order.description,
    createdAt: offer.createdAt.toISOString(),
  };
}
