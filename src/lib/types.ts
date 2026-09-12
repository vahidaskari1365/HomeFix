// ============================================================
// HomeFix — Shared API contract types (source of truth)
// DO NOT EDIT without updating worklog.md contract section.
// ============================================================

export type OrderStatus =
  | "FINDING"
  | "OFFERED"
  | "ACCEPTED"
  | "ARRIVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "PAID"
  | "CANCELED";

export type Plan = "FREE" | "PRO";
export type ReviewBy = "CUSTOMER" | "SPECIALIST";
export type OrderEventType = "STATUS" | "EMERGENCY" | "ENTRY" | "PAYMENT" | "NOTE";
export type PaymentMethod = "online" | "wallet";

export interface ServiceDTO {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  durationMin: number;
  categoryId: string;
}

export interface CategoryDTO {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  icon: string;
  color: string | null;
  services: ServiceDTO[];
}

export interface SpecialistPublicDTO {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  city: string;
  area: string;
  bio: string | null;
  experienceYears: number;
  verificationLevel: 1 | 2 | 3;
  plan: Plan;
  isAvailable: boolean;
  rating: number;
  ratingCount: number;
  successfulOrders: number;
  totalOrders: number;
  skills: string[];
}

export interface SpecialistPrivateDTO extends SpecialistPublicDTO {
  phone: string;
  commissionPreview: number;
}

export interface OrderEventDTO {
  id: string;
  type: OrderEventType;
  title: string;
  detail: string | null;
  createdAt: string;
}

export interface ReviewDTO {
  id: string;
  by: ReviewBy;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface OrderDTO {
  id: string;
  code: string;
  status: OrderStatus;
  createdAt: string;
  service: ServiceDTO & { category: { id: string; name: string; icon: string } };
  customerName: string;
  customerPhone: string;
  city: string;
  address: string;
  scheduledDate: string;
  scheduledSlot: string;
  description: string | null;
  price: number;
  commissionRate: number;
  commissionAmount: number;
  specialistEarning: number;
  entryCode: string | null;
  paymentMethod: string | null;
  acceptedAt: string | null;
  arrivedAt: string | null;
  workStartedAt: string | null;
  completedAt: string | null;
  paidAt: string | null;
  customerRated: boolean;
  specialistRated: boolean;
  specialist: SpecialistPublicDTO | null; // null until ACCEPTED
  events: OrderEventDTO[];
  reviews: ReviewDTO[];
}

export interface OrderSummaryDTO {
  id: string;
  code: string;
  status: OrderStatus;
  serviceName: string;
  categoryName: string;
  categoryIcon: string;
  price: number;
  createdAt: string;
  specialistName: string | null;
}

export interface OfferDTO {
  id: string;
  orderId: string;
  orderCode: string;
  serviceName: string;
  categoryName: string;
  price: number;
  customerName: string;
  customerPhone: string;
  city: string;
  address: string;
  scheduledDate: string;
  scheduledSlot: string;
  description: string | null;
  createdAt: string;
}

export interface SpecialistEarningsDTO {
  total: number;
  month: number;
  today: number;
  pending: number;
}

export interface SpecialistDashboardDTO {
  specialist: SpecialistPrivateDTO;
  offers: OfferDTO[];
  activeOrders: OrderDTO[];
  history: OrderSummaryDTO[];
  earnings: SpecialistEarningsDTO;
}

export interface StatsDTO {
  specialistsCount: number;
  ordersCount: number;
  avgRating: number;
  topSpecialists: SpecialistPublicDTO[];
}

export interface AiSuggestionDTO {
  serviceId: string;
  serviceName: string;
  categoryId: string;
  reason: string;
}

// ---------- time slots ----------
export const TIME_SLOTS = [
  "09:00-11:00",
  "11:00-13:00",
  "13:00-15:00",
  "15:00-17:00",
  "17:00-19:00",
  "19:00-21:00",
] as const;

export const SLOT_LABELS: Record<string, string> = {
  "09:00-11:00": "۹ تا ۱۱ صبح",
  "11:00-13:00": "۱۱ تا ۱۳",
  "13:00-15:00": "۱۳ تا ۱۵",
  "15:00-17:00": "۱۵ تا ۱۷",
  "17:00-19:00": "۱۷ تا ۱۹",
  "19:00-21:00": "۱۹ تا ۲۱ شب",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  FINDING: "در حال یافتن متخصص",
  OFFERED: "در انتظار تأیید متخصص",
  ACCEPTED: "متخصص پذیرفت",
  ARRIVED: "متخصص به محل رسید",
  IN_PROGRESS: "در حال انجام کار",
  COMPLETED: "کار انجام شد",
  PAID: "پرداخت شد",
  CANCELED: "لغو شد",
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "FINDING",
  "OFFERED",
  "ACCEPTED",
  "ARRIVED",
  "IN_PROGRESS",
  "COMPLETED",
  "PAID",
];

export const SUPPORT_PHONE = "021-91007800";
