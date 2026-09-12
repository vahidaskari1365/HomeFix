// ============================================================
// HomeFix — In-memory OTP store (demo)
// Fixed demo code: "121212" (returned as devOtp on login)
// Owned by: Task 3-a (backend)
// ============================================================

export const DEMO_OTP = "121212";

const OTP_TTL_MS = 5 * 60 * 1000;

interface OtpEntry {
  code: string;
  expiresAt: number;
}

// Keep the store on globalThis so Next.js HMR does not wipe it.
const globalForOtp = globalThis as unknown as {
  homeFixOtpStore?: Map<string, OtpEntry>;
};

const otpStore: Map<string, OtpEntry> =
  globalForOtp.homeFixOtpStore ?? new Map<string, OtpEntry>();
globalForOtp.homeFixOtpStore = otpStore;

/** Issue (or refresh) the OTP for a phone number. Demo: always "121212". */
export function issueOtp(phone: string): string {
  otpStore.set(phone, { code: DEMO_OTP, expiresAt: Date.now() + OTP_TTL_MS });
  return DEMO_OTP;
}

/** Verify an OTP for a phone number. Accepts the fixed demo code too. */
export function verifyOtp(phone: string, code: string): boolean {
  const normalized = code.trim();
  if (!normalized) return false;

  // Fixed demo code is always accepted.
  if (normalized === DEMO_OTP) {
    otpStore.delete(phone);
    return true;
  }

  const entry = otpStore.get(phone);
  if (!entry) return false;

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phone);
    return false;
  }

  if (entry.code !== normalized) return false;

  otpStore.delete(phone); // one-time use
  return true;
}
