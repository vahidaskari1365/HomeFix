// ============================================================
// HomeFix — Commission & verification-level logic
// Owned by: Task 3-a (backend)
// ============================================================

import type { Plan } from "@/lib/types";

/**
 * Platform commission rate for a specialist (frozen at payment time).
 * - First 10 successful orders: 10%
 * - After that: PRO plan → 8%, FREE plan → 15%
 */
export function commissionRateFor(successfulOrders: number, plan: Plan): number {
  if (successfulOrders < 10) return 0.1;
  return plan === "PRO" ? 0.08 : 0.15;
}

export interface CommissionSplit {
  commissionAmount: number;
  specialistEarning: number;
}

export function computeCommission(price: number, rate: number): CommissionSplit {
  const commissionAmount = Math.round(price * rate);
  return { commissionAmount, specialistEarning: price - commissionAmount };
}

export interface VerificationFlags {
  identityVerified: boolean;
  skillsVerified: boolean;
  interviewPassed: boolean;
  successfulOrders: number;
  rating: number;
}

/**
 * Base verification level from flags:
 * L1: identity verified
 * L2: L1 + skills verified + interview passed
 * L3: L2 + successfulOrders >= 10 + rating >= 4.5
 */
export function baseVerificationLevel(flags: VerificationFlags): 1 | 2 | 3 {
  let level: 1 | 2 | 3 = 1;
  if (flags.identityVerified && flags.skillsVerified && flags.interviewPassed) {
    level = 2;
    if (flags.successfulOrders >= 10 && flags.rating >= 4.5) {
      level = 3;
    }
  }
  return level;
}

/** Recomputed level must never decrease below the current level. */
export function nextVerificationLevel(
  currentLevel: number,
  flags: VerificationFlags
): number {
  return Math.max(currentLevel, baseVerificationLevel(flags));
}
