// POST /api/ai/suggest — suggest a service from free-form Persian text
// LLM via z-ai-web-dev-sdk with a robust keyword fallback. NEVER throws.

import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import type { AiSuggestionDTO } from "@/lib/types";
import { readJsonObject, stringField } from "@/lib/order-service";

export const runtime = "nodejs";
export const maxDuration = 30;

interface ServiceLite {
  id: string;
  name: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
}

// Keyword fallback rules — category slug + trigger keywords (ordered, first match wins)
const FALLBACK_RULES: Array<{ slug: string; keywords: string[] }> = [
  {
    slug: "ac",
    keywords: ["کولر", "اسپلیت", "چیلر", "گاز کولر", "خنک نمی", "سرد نمی", "سرویس کولر"],
  },
  {
    slug: "plumbing",
    keywords: ["نشتی", "نشت", "لوله", "سینک", "گرفتگی", "گرفته", "فاضلاب", "کفشور", "سیفون", "شیرآلات", "شیر آب"],
  },
  {
    slug: "electrical",
    keywords: ["برق", "پریز", "کلید", "لوستر", "چراغ", "اتصالی", "فیوز", "دزدگیر", "برق کار"],
  },
  {
    slug: "boiler",
    keywords: ["پکیج", "آبگرمکن", "شوفاژ", "رادیاتور", "بویلر", "آب گرم"],
  },
  {
    slug: "appliances",
    keywords: ["لباسشویی", "ظرفشویی", "یخچال", "فریزر", "ماشین لباسشویی", "ماشین ظرفشویی"],
  },
  {
    slug: "cleaning",
    keywords: ["نظافت", "مبل", "فرش", "قالی", "تمیز", "خانه تکانی", "شویی"],
  },
  {
    slug: "moving",
    keywords: ["اسباب کشی", "باربری", "جابه جایی", "نقل مکان", "نیسان", "کارگر بار"],
  },
  {
    slug: "painting",
    keywords: ["نقاشی", "گچ", "سفیدکاری", "بلکا", "رول پلاستیک", "رنگ ساختمان", "رنگ آمیزی"],
  },
];

/** Normalize Persian text: ZWNJ → space, Arabic → Persian chars, squash spaces. */
function normalizePersianText(input: string): string {
  return input
    .replace(/\u200c/g, " ")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extract the first JSON object from an LLM answer (strips markdown fences). */
function extractJsonObject(raw: string): Record<string, unknown> | null {
  if (!raw) return null;
  let text = raw.trim();
  text = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;

  try {
    const parsed: unknown = JSON.parse(text.slice(start, end + 1));
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

/** Keyword fallback: match a rule, then pick the best service in that category. */
function pickFallbackService(
  normalizedText: string,
  services: ServiceLite[]
): ServiceLite | null {
  const rule = FALLBACK_RULES.find((r) =>
    r.keywords.some((keyword) => normalizedText.includes(keyword))
  );
  if (!rule) return null;

  const inCategory = services.filter((s) => s.categorySlug === rule.slug);
  if (inCategory.length === 0) return null;

  // AC preference: «سرویس و شارژ کولر گازی» for service/charge/no-cooling mentions
  if (
    rule.slug === "ac" &&
    ["سرویس", "شارژ", "شایرج", "خنک نمی", "گاز"].some((k) =>
      normalizedText.includes(k)
    )
  ) {
    const preferred = inCategory.find((s) => s.name.includes("سرویس و شارژ"));
    if (preferred) return preferred;
  }

  // Otherwise pick the service whose name shares the most words with the text
  let best = inCategory[0];
  let bestScore = -1;
  for (const service of inCategory) {
    const words = normalizePersianText(service.name)
      .split(" ")
      .filter((word) => word.length > 2);
    const score = words.filter((word) => normalizedText.includes(word)).length;
    if (score > bestScore) {
      bestScore = score;
      best = service;
    }
  }
  return best;
}

export async function POST(req: Request) {
  try {
    const body = await readJsonObject(req);
    const text = stringField(body?.text);
    if (!text) {
      return NextResponse.json({ suggestion: null });
    }

    const services = await db.service.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { basePrice: "asc" },
    });
    if (services.length === 0) {
      return NextResponse.json({ suggestion: null });
    }

    const lite: ServiceLite[] = services.map((service) => ({
      id: service.id,
      name: service.name,
      categoryId: service.categoryId,
      categorySlug: service.category.slug,
      categoryName: service.category.name,
    }));

    let serviceId: string | null = null;
    let reason = "";

    // 1) LLM attempt (any failure falls through to the keyword fallback)
    try {
      const serviceList = lite
        .map((s) => `- ${s.id} | ${s.name} | ${s.categoryName}`)
        .join("\n");
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "تو دستیار هوشمند پلتفرم خدمات خانگی HomeFix هستی. با توجه به توضیح مشتری، مناسب‌ترین خدمت را از فهرست زیر انتخاب کن.\n" +
              "فهرست خدمات (شناسه | نام خدمت | دسته):\n" +
              serviceList +
              "\n" +
              'فقط و فقط یک JSON معتبر با این ساختار برگردان و هیچ متن دیگری ننویس:\n' +
              '{"serviceId":"شناسه خدمت","reason":"دلیل کوتاه به فارسی حداکثر ۱۲۰ کاراکتر"}',
          },
          { role: "user", content: text },
        ],
        thinking: { type: "disabled" },
      });

      const rawContent = completion?.choices?.[0]?.message?.content;
      const content = typeof rawContent === "string" ? rawContent : "";
      const parsed = extractJsonObject(content);
      const candidateId =
        parsed && typeof parsed.serviceId === "string" ? parsed.serviceId : null;

      if (candidateId && lite.some((s) => s.id === candidateId)) {
        serviceId = candidateId;
        if (parsed && typeof parsed.reason === "string" && parsed.reason.trim()) {
          reason = parsed.reason.trim();
        }
      }
    } catch {
      // LLM unavailable → keyword fallback below
    }

    // 2) keyword fallback
    if (!serviceId) {
      const normalized = normalizePersianText(text);
      const fallback = pickFallbackService(normalized, lite);
      if (fallback) {
        serviceId = fallback.id;
        reason = `بر اساس توضیح شما، خدمت «${fallback.name}» در دسته ${fallback.categoryName} مناسب‌ترین گزینه است.`;
        console.log("[ai/suggest] keyword fallback used:", normalized.slice(0, 60));
      }
    }

    if (!serviceId) {
      return NextResponse.json({ suggestion: null });
    }

    const service = services.find((s) => s.id === serviceId) ?? services[0];
    const suggestion: AiSuggestionDTO = {
      serviceId: service.id,
      serviceName: service.name,
      categoryId: service.categoryId,
      reason: (reason || `خدمت «${service.name}» برای درخواست شما مناسب است.`).slice(
        0,
        120
      ),
    };

    return NextResponse.json({ suggestion });
  } catch {
    return NextResponse.json({ suggestion: null });
  }
}
