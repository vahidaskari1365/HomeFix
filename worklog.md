# HomeFix — Shared Worklog

> ALL AGENTS: Read this file before starting. Append your section at the end when done.
> Product: **HomeFix** — Iranian home-services marketplace (customer ↔ platform ↔ specialist), Persian RTL UI.
> Stack: Next.js 16 App Router, TypeScript, Tailwind 4, shadcn/ui (New York), Prisma+SQLite, Zustand, TanStack Query, lucide-react, framer-motion, z-ai-web-dev-sdk (backend only).

## File Ownership (DO NOT touch files owned by the other agent)

- **Task 3-a (Backend agent)** owns: `src/app/api/**`, `src/lib/matching.ts`, `src/lib/commission.ts`, `src/lib/serialize.ts`, `src/lib/otp.ts`
- **Task 3-b (Frontend agent)** owns: `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`, `src/lib/store.ts`, `src/lib/format.ts`, `src/components/homefix/**`
- **Shared (already written by coordinator — DO NOT modify)**: `src/lib/types.ts`, `src/lib/db.ts`, `prisma/schema.prisma`, `prisma/seed.ts`
- Do NOT run `bun run dev` (coordinator manages the dev server). You MAY run `bun run lint`.

## Domain & Business Rules

Flow: customer books → platform matches specialist → specialist accepts → customer sees profile + entry code → specialist arrives & enters code → work → payment in-app → two-way rating → platform commission.

Commission (toman prices):
- First 10 successful orders of a specialist: **10%**
- After that: plan `FREE` → **15%**, plan `PRO` → **8%** (PRO = 199,000 toman/month, displayed only)
- Commission is computed & frozen on **payment** (`POST /api/orders/[id]/pay`).

Verification levels (shown as badges 🟢🔵🟣):
- L1: identity verified (nationalId present)
- L2: L1 + skills verified + interview passed
- L3: L2 + successfulOrders ≥ 10 + rating ≥ 4.5
- Recompute `verificationLevel` after register and after each payment.

Matching (on order create): candidates = specialists with `status="ACTIVE"`, `isAvailable=true`, having `SpecialistSkill` for the service. Sort by verificationLevel desc → rating desc → successfulOrders desc. Create `OrderOffer` (status PENDING) for the top candidate and set order status `OFFERED`. On reject: mark offer REJECTED, offer next candidate; if none remain → status back to `FINDING`.

Order status machine:
`FINDING → OFFERED → ACCEPTED → ARRIVED → IN_PROGRESS → COMPLETED → PAID`
(`CANCELED` possible; entry code: 4-digit, generated at ACCEPT; verified at ARRIVE; both arrival & payment logged as `OrderEvent`.)

OTP (demo): fixed code **"121212"**, returned as `devOtp` in login response.

## API Contract (all JSON; errors: `{ error: string }` with 4xx/5xx)

DTOs are defined in `src/lib/types.ts` (source of truth — import types from there). All `createdAt`-like fields are ISO strings. Serialize via `src/lib/serialize.ts` (backend) so shapes match exactly.

| Method & Path | Body | Response |
|---|---|---|
| GET `/api/catalog` | — | `{ categories: CategoryDTO[] }` (each with `services: ServiceDTO[]`, sorted) |
| GET `/api/stats` | — | `{ stats: StatsDTO }` (specialistsCount, ordersCount, avgRating, topSpecialists[≤4]) |
| POST `/api/ai/suggest` | `{ text: string }` | `{ suggestion: { serviceId, serviceName, categoryId, reason } } \| { suggestion: null }` — LLM via z-ai-web-dev-sdk, keyword fallback, never throws |
| POST `/api/orders` | `{ customerName, customerPhone, city, address, serviceId, scheduledDate(ISO yyyy-mm-dd), scheduledSlot("09:00-11:00"…), description? }` | `{ order: OrderDTO }` (status FINDING→OFFERED with pending offer created) |
| GET `/api/orders?phone=09…` | — | `{ orders: OrderSummaryDTO[] }` newest first |
| GET `/api/orders/[id]` | — | `{ order: OrderDTO }` (specialist field null until ACCEPTED) |
| POST `/api/orders/[id]/accept` | — | `{ order: OrderDTO }` — accepts the PENDING offer, sets entryCode, acceptedAt, event |
| POST `/api/orders/[id]/reject` | — | `{ order: OrderDTO }` — reject current offer, offer next / FINDING |
| POST `/api/orders/[id]/arrive` | `{ entryCode: string }` | `{ order: OrderDTO }` or 400 `{ error: "کد ورود اشتباه است" }` → ARRIVED + ENTRY event |
| POST `/api/orders/[id]/start-work` | — | `{ order: OrderDTO }` → IN_PROGRESS |
| POST `/api/orders/[id]/complete` | `{ finalPrice?: number }` | `{ order: OrderDTO }` → COMPLETED (price updated if finalPrice) |
| POST `/api/orders/[id]/pay` | `{ method: "online" \| "wallet" }` | `{ order: OrderDTO }` → PAID, commission frozen, specialist stats + level updated, PAYMENT event |
| POST `/api/orders/[id]/review` | `{ by: "CUSTOMER"\|"SPECIALIST", rating: 1..5, comment? }` | `{ order: OrderDTO }` — updates specialist rating when by=CUSTOMER |
| POST `/api/orders/[id]/emergency` | `{ message: string }` | `{ order: OrderDTO, supportPhone: "021-91007800" }` — EMERGENCY event |
| POST `/api/specialists/login` | `{ phone }` | `{ exists: boolean, devOtp?: "121212" }` |
| POST `/api/specialists/verify` | `{ phone, otp }` | `{ specialist: SpecialistPrivateDTO }` or 401 |
| POST `/api/specialists/register` | `{ firstName, lastName, phone, city, area, nationalId, cardNumber?, bio?, experienceYears, serviceIds: string[] }` | `{ specialist: SpecialistPrivateDTO }` — sets identityVerified, skillsVerified, interviewPassed → level 2, status ACTIVE |
| GET `/api/specialists/[id]` | — | `{ dashboard: SpecialistDashboardDTO }` (specialist, offers[], activeOrders[], history[], earnings{total,month,today,pending}) |
| POST `/api/specialists/[id]/availability` | `{ isAvailable: boolean }` | `{ specialist: SpecialistPrivateDTO }` |
| POST `/api/specialists/[id]/plan` | `{ plan: "FREE"\|"PRO" }` | `{ specialist: SpecialistPrivateDTO }` |

**Next.js 16 note:** dynamic route params are async: `export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; ... }`

Statuses (Persian labels — frontend): FINDING=«در حال یافتن متخصص», OFFERED=«در انتظار تأیید متخصص», ACCEPTED=«متخصص پذیرفت», ARRIVED=«متخصص رسید», IN_PROGRESS=«در حال انجام کار», COMPLETED=«کار انجام شد», PAID=«پرداخت شد».

Seed data (already seeded): 8 categories / ~30 services / 8 specialists (phones 09121000001…09121000008; #1 محمد رضایی PRO L3 rating 4.9; #8 جواد افشار unavailable) + a few historical PAID orders.

## Task ID order

- 1, 2, 3 — coordinator (done): skills install, schema, seed, contract
- 3-a — backend API routes
- 3-b — frontend SPA (RTL Persian)
- 4 — integration + browser verification (coordinator)
- 5 — git commit & push (coordinator)

---
Task ID: 3-a
Agent: full-stack-developer (backend)
Task: Implement HomeFix backend API per contract

Work Log:
- Read worklog.md, types.ts, db.ts, prisma/schema.prisma and prisma/seed.ts to absorb contract, DTO shapes and seed data
- Created shared libs: `src/lib/commission.ts` (rate 10% <10 orders / 8% PRO / 15% FREE, commission split, verification-level recompute that never decreases), `src/lib/otp.ts` (globalThis Map store, fixed demo code "121212", TTL 5min, one-time use), `src/lib/serialize.ts` (typed Prisma→DTO mappers incl. `orderFullInclude` const + GetPayload types; specialist & entryCode exposed only for ACCEPTED/ARRIVED/IN_PROGRESS/COMPLETED/PAID), `src/lib/matching.ts` (candidates = ACTIVE + available + skill match, sort level desc → rating desc → successfulOrders desc; offer-next + auto FINDING fallback), `src/lib/order-service.ts` (findOrderFull/loadOrderDTO, addOrderEvent, jsonError, readJsonObject, stringField, numberField helpers)
- Implemented all 20 route handlers under `src/app/api/**` (Next 16 async params, JSON errors in Persian, try/catch everywhere): catalog, stats, ai/suggest (LLM + robust JSON extraction + ordered Persian keyword fallback incl. AC "سرویس و شارژ" preference; runtime nodejs, maxDuration 30, never throws), orders list/create (validation, HF-code with collision retry, matching → OFFERED/FINDING, initial STATUS event), order detail, accept (entryCode 4-digit + ACCEPTED/ENTRY events), reject (mark REJECTED → next candidate or FINDING), arrive (entry-code compare → ARRIVED), start-work, complete (optional finalPrice >0 and <100,000,000), pay (idempotent, commission frozen, specialist stats + verificationLevel recompute, PAYMENT event with fa-IR formatted amounts), review (1..5, per-side once, CUSTOMER rating updates specialist aggregate), emergency (EMERGENCY event + supportPhone), specialists login/verify/register (409 duplicate phone, level-2 ACTIVE), dashboard (offers/activeOrders/history/earnings with total/month/today/pending), availability, plan
- Full lifecycle smoke-tested via curl against the running dev server: create→offer→accept→arrive(wrong+correct code)→start→complete(finalPrice)→pay(8%/15%/10% paths verified)→review(+duplicate 400)→emergency; reject→FINDING; second-candidate re-offer; register; duplicate 409; validation 400s; dashboard earnings (total/month/today/pending); idempotent pay; 404s. AI suggest verified live (LLM + fallback, ZWNJ normalization, empty body → null)
- Re-ran `bun prisma/seed.ts` after testing to restore the pristine demo dataset (test orders/specialist removed)
- `bun run lint`: zero issues in backend files (remaining lint output is from the parallel frontend agent's files). `tsc --noEmit`: zero errors in src/

Stage Summary:
- Endpoints implemented (all JSON, errors `{ error: "پیام فارسی" }`): GET /api/catalog, GET /api/stats, POST /api/ai/suggest, GET+POST /api/orders, GET /api/orders/[id], POST /api/orders/[id]/{accept,reject,arrive,start-work,complete,pay,review,emergency}, POST /api/specialists/{login,verify,register}, GET /api/specialists/[id], POST /api/specialists/[id]/{availability,plan}
- Files created: src/lib/{serialize,matching,commission,otp,order-service}.ts + 19 route.ts files under src/app/api/**
- Decisions for integration agent: order creation returns HTTP 201 (others 200); DTO shapes exactly per types.ts — `specialist` and `entryCode` in OrderDTO are null until status ≥ ACCEPTED; pay is idempotent (PAID → returns current order); reject works only in OFFERED; review only in PAID and once per side; dashboard `earnings.pending` covers active orders (ACCEPTED/ARRIVED/IN_PROGRESS) priced at current commissionPreview; order create validates scheduledDate as yyyy-mm-dd and slot against TIME_SLOTS; phone regex ^09\d{9}$ everywhere; demo OTP "121212" always accepted by verify
- DB re-seeded to clean state (8 cats / 25 services / 8 specialists / 3 historical orders) — safe for frontend demo
---
---
Task ID: 3-b (completed by coordinator after agent interruption)
Agent: coordinator (frontend finished + integration fixes)
Task: Finish HomeFix frontend, fix lint, verify end-to-end in browser

Work Log:
- Frontend agent completed all views/components before connection loss (20 files under src/components/homefix, layout, globals.css, store.ts, format.ts, page.tsx with JSON-LD)
- Fixed 4 lint errors: replaced render-time `categoryIcon()` calls with direct `CATEGORY_ICONS[...] ?? Wrench` lookups (TrackView, SpecialistDashboardView)
- Replaced setState-in-effect mounted gates with `useSyncExternalStore`-based `useMounted` in bits.tsx (used by page.tsx + Header.tsx)
- Silenced false-positive custom-font warning in layout.tsx (App Router link tag is correct)
- `bun run lint`: 0 problems; tsc clean for src/

Browser verification (Agent Browser, desktop 1280px + mobile 390px, light + dark):
- Home: hero, stats, catalog (8 categories), 9-step flow, plans, top specialists — all render
- Golden path PASSED: booking wizard (کولر گازی→سرویس→امروز→۱۷-۱۹) → order HF-617825 → OFFERED → simulate-accept → specialist profile (محمد رضایی ⭐۴٫۹ L3) + entry code ۵۴۲۳ + live map sim → specialist OTP login (121212) → dashboard (commission 8% PRO) → entry code verify → start → complete → customer payment (commission split 55,200/634,800 correct) → 5-star review
- AI assistant: "یخچالم سرد نمیکنه" → correctly suggested تعمیر یخچال و فریزر with CTA
- Register wizard (6 steps) renders; mobile responsive + sticky footer + dark mode OK
- No runtime errors in dev server during whole session

Stage Summary:
- App fully functional end-to-end; ready for git push
