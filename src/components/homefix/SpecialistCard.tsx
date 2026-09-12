"use client";

// ============================================================
// HomeFix — specialist profile card (shown in TrackView)
// ============================================================

import { MapPin, ShieldCheck } from "lucide-react";
import { LevelBadges, StarRating } from "./bits";
import { formatToman, initialsAvatar, toFa } from "@/lib/format";
import type { SpecialistPublicDTO } from "@/lib/types";

export function SpecialistCard({ specialist }: { specialist: SpecialistPublicDTO }) {
  const sp = specialist;
  const planLabel = sp.plan === "PRO" ? "پلن حرفه‌ای" : "پلن رایگان";

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap items-start gap-4">
        {/* avatar */}
        <span className="arch-well grid size-16 shrink-0 place-items-center bg-gradient-to-b from-primary to-primary/75 text-xl font-extrabold text-primary-foreground shadow-glow-teal">
          {initialsAvatar(`${sp.firstName} ${sp.lastName}`)}
        </span>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-extrabold">
              {sp.firstName} {sp.lastName}
            </h3>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-bold text-secondary-foreground">
              {sp.skills[0]}
            </span>
            <span
              className={
                sp.plan === "PRO"
                  ? "rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-bold text-accent-foreground"
                  : "rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground"
              }
            >
              {planLabel}
            </span>
          </div>

          <StarRating value={sp.rating} count={sp.ratingCount} size={15} />

          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-primary" />
              {toFa(sp.successfulOrders)} سفارش موفق
            </span>
            <span>{toFa(sp.experienceYears)} سال سابقه</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {sp.city}، {sp.area}
            </span>
          </p>

          <LevelBadges level={sp.verificationLevel} />
        </div>
      </div>

      {sp.bio ? (
        <p className="mt-4 border-t pt-4 text-sm leading-relaxed text-muted-foreground">{sp.bio}</p>
      ) : null}
    </div>
  );
}
