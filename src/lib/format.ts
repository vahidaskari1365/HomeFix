// ============================================================
// HomeFix — Persian formatting helpers
// ============================================================

import { SLOT_LABELS } from "./types";

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** Latin digits → Persian digits */
export function toFa(value: string | number): string {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

/** Persian/Arabic digits → Latin digits (for phone/id inputs) */
export function toEnDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** «۶۹۰٬۰۰۰ تومان» */
export function formatToman(n: number): string {
  try {
    return `${new Intl.NumberFormat("fa-IR").format(n)} تومان`;
  } catch {
    return `${toFa(n)} تومان`;
  }
}

function parseIso(iso: string): Date {
  // plain "yyyy-mm-dd" would parse as UTC midnight → shift a day in some TZs
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return new Date(`${iso}T12:00:00`);
  return new Date(iso);
}

/** «سه‌شنبه ۱۵ آبان» */
export function formatDateFa(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(parseIso(iso));
  } catch {
    return iso;
  }
}

/** «سه‌شنبه ۱۵ آبان، ساعت ۱۴:۳۰» */
export function formatDateTimeFa(iso: string): string {
  try {
    const d = parseIso(iso);
    const date = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(d);
    const time = new Intl.DateTimeFormat("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
    return `${date}، ساعت ${time}`;
  } catch {
    return iso;
  }
}

/** Persian label for a TIME_SLOT value like "09:00-11:00" */
export function slotLabel(slot: string): string {
  return SLOT_LABELS[slot] ?? toFa(slot);
}

/** First letters of a Persian name, e.g. «محمد رضایی» → «م‌ر» */
export function initialsAvatar(name: string | null | undefined): string {
  if (!name || !name.trim()) return "؟";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return last ? `${first}‌${last}` : first;
}

export interface DayChip {
  iso: string;
  label: string;
  sub: string;
}

/** Next `count` days as booking date chips: «امروز / فردا / weekday» */
export function nextDays(count = 3): DayChip[] {
  const out: DayChip[] = [];
  const labels = ["امروز", "فردا"];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    const weekday = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      weekday: "long",
    }).format(d);
    const monthDay = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      day: "numeric",
      month: "long",
    }).format(d);
    out.push({
      iso,
      label: labels[i] ?? weekday,
      sub: labels[i] ? weekday : monthDay,
    });
  }
  return out;
}

/** minutes elapsed since an ISO timestamp, floored */
export function minutesSince(iso: string): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.floor((Date.now() - then) / 60000));
}
