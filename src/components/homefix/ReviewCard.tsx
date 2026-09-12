"use client";

// ============================================================
// HomeFix — customer review card (PAID state)
// ============================================================

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiPost } from "./api";
import { StarRating } from "./bits";
import type { OrderDTO } from "@/lib/types";

export function ReviewCard({ order }: { order: OrderDTO }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const specialistRated = order.specialistRated;
  const specialistReview = order.reviews.find((r) => r.by === "SPECIALIST");

  const submit = useMutation({
    mutationFn: () =>
      apiPost<{ order: OrderDTO }>(`/api/orders/${order.id}/review`, {
        by: "CUSTOMER",
        rating,
        ...(comment.trim() ? { comment: comment.trim() } : {}),
      }),
    onSuccess: () => {
      toast.success("ممنون از امتیازت! 🌟");
      queryClient.invalidateQueries({ queryKey: ["order", order.id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "ثبت امتیاز ناموفق بود"),
  });

  if (order.customerRated) {
    return (
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <h3 className="font-extrabold">امتیاز شما</h3>
        <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          امتیاز شما ثبت شد؛ ممنون!
        </p>
        {specialistRated ? (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5 text-xs font-bold text-accent-foreground">
            متخصص هم به شما امتیاز داد ⭐
            {specialistReview?.rating ? `(${specialistReview.rating} از ۵)` : ""}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <h3 className="font-extrabold">به متخصص امتیاز بدهید</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        تجربه‌ات را بگو تا کیفیت خدمات برای همه بهتر شود.
      </p>
      <StarRating value={rating} onChange={setRating} size={28} className="mt-4" />
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="نظرت را بنویس (اختیاری)…"
        rows={3}
        className="mt-4 resize-none"
        aria-label="نظر شما"
      />
      <Button
        className="mt-4 min-h-11 w-full"
        disabled={submit.isPending || rating < 1}
        onClick={() => submit.mutate()}
      >
        ثبت امتیاز
      </Button>
    </div>
  );
}
