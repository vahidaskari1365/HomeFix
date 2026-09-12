// ============================================================
// HomeFix — category icon mapping (API icon string → lucide)
// NOTE: record is pre-populated so dynamic lookup is safe.
// ============================================================

import {
  AirVent,
  Building2,
  DoorOpen,
  Droplets,
  Fan,
  Flame,
  Hammer,
  Home,
  KeyRound,
  Lamp,
  Lightbulb,
  Paintbrush,
  PaintRoller,
  Plug,
  Refrigerator,
  Settings,
  ShowerHead,
  Sparkles,
  Truck,
  WashingMachine,
  Waves,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  AirVent,
  Droplets,
  Zap,
  Flame,
  WashingMachine,
  Sparkles,
  Truck,
  PaintRoller,
  Wrench,
  Plug,
  Hammer,
  Paintbrush,
  DoorOpen,
  ShowerHead,
  Refrigerator,
  Lamp,
  Fan,
  Settings,
  Waves,
  Home,
  Building2,
  KeyRound,
};

/** Resolve a category icon string with a Wrench fallback. */
export function categoryIcon(icon: string | null | undefined): LucideIcon {
  if (icon && CATEGORY_ICONS[icon]) return CATEGORY_ICONS[icon];
  return Wrench;
}

export const FALLBACK_CATEGORY_COLOR = "#059669";

/** Tile style from a hex category color (e.g. "#059669"). */
export function categoryColorStyle(color: string | null | undefined): {
  backgroundColor: string;
  color: string;
} {
  const base =
    color && /^#[0-9a-fA-F]{6}$/.test(color) ? color : FALLBACK_CATEGORY_COLOR;
  return { backgroundColor: `${base}1f`, color: base };
}
