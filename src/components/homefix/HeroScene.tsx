"use client";

// ============================================================
// HomeFix — Hero motion scene (custom SVG motion graphic)
// داستان لوپ‌شونده: تکنسین با موتور می‌رسد ← کد ورود را نشان
// می‌دهد ← وارد خانه می‌شود ← کار انجام و کولر روشن می‌شود.
// All colors read CSS variables → dark-mode aware.
// ============================================================

import { motion, useReducedMotion } from "framer-motion";

// ---------- loop timing ----------
const LOOP = 10; // seconds
const loopTransition = (times: number[], ease: string[] | string = "linear") => ({
  duration: LOOP,
  times,
  repeat: Infinity,
  repeatDelay: 0.4,
  ease,
});

// palette (CSS vars with hex fallbacks)
const C = {
  skyTop: "var(--hf-sky-top, #fdf7ea)",
  skyBottom: "var(--hf-sky-bottom, #e4f2ef)",
  sun: "var(--brass, #e69512)",
  cloud: "var(--card, #fffdf7)",
  ground: "var(--hf-ground, #eadfc6)",
  street: "var(--hf-street, #cdbb96)",
  wall: "var(--hf-wall, #fdf3df)",
  wallLine: "var(--hf-wall-line, #d9c6a0)",
  roof: "var(--primary, #155e56)",
  roofDark: "var(--hf-roof-dark, #0f463f)",
  glass: "var(--hf-glass, #d8eeea)",
  door: "var(--primary, #155e56)",
  doorway: "var(--hf-doorway, #33261598)",
  brass: "var(--brass, #e69512)",
  terra: "var(--terra, #d95f36)",
  ink: "var(--foreground, #14201f)",
  scooter: "var(--hf-scooter, #12625a)",
  smoke: "var(--muted-foreground, #5c6f6c)",
};

export function HeroScene() {
  const reduce = useReducedMotion();

  // ------- keyframe helpers (fractions of the loop) -------
  // scooter: drive in → park → drive away
  const scooterX = [700, 468, 468, 700];
  const scooterTimes = [0, 0.2, 0.84, 1];
  const riderOpacity = [1, 1, 1, 0.12, 0.12, 1, 1];
  const riderOpacityTimes = [0, 0.2, 0.36, 0.42, 0.8, 0.86, 1];


  return (
    <svg
      viewBox="0 0 640 500"
      className="h-auto w-full"
      role="img"
      aria-label="تصویر متحرک: تکنسین HomeFix به خانه می‌رسد، کد ورود را تأیید می‌کند و کار انجام می‌شود"
    >
      <defs>
        <linearGradient id="hf-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.skyTop} />
          <stop offset="100%" stopColor={C.skyBottom} />
        </linearGradient>
        <linearGradient id="hf-roofg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.roof} />
          <stop offset="100%" stopColor={C.roofDark} />
        </linearGradient>
        <radialGradient id="hf-glow" cx="50%" cy="42%" r="65%">
          <stop offset="0%" stopColor={C.brass} stopOpacity="0.16" />
          <stop offset="100%" stopColor={C.brass} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ===== sky ===== */}
      <rect width="640" height="500" fill="url(#hf-sky)" rx="24" />
      <rect width="640" height="500" fill="url(#hf-glow)" rx="24" />

      {/* sun with slow rotating rays */}
      <g transform="translate(88,84)">
        <g className={reduce ? "" : "animate-spin-slow"}>
          {Array.from({ length: 8 }).map((_, i) => (
            <rect
              key={i}
              x="-2.2"
              y="-46"
              width="4.4"
              height="14"
              rx="2.2"
              fill={C.sun}
              opacity="0.85"
              transform={`rotate(${i * 45})`}
            />
          ))}
        </g>
        <circle r="26" fill={C.sun} opacity="0.92" />
        <circle r="19" fill={C.cloud} opacity="0.35" />
      </g>

      {/* clouds */}
      <motion.g
        animate={reduce ? {} : { x: [0, 26, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        opacity="0.9"
      >
        <g fill={C.cloud}>
          <ellipse cx="500" cy="86" rx="42" ry="16" />
          <ellipse cx="530" cy="74" rx="28" ry="13" />
          <ellipse cx="470" cy="76" rx="22" ry="11" />
        </g>
      </motion.g>
      <motion.g
        animate={reduce ? {} : { x: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        opacity="0.75"
      >
        <g fill={C.cloud}>
          <ellipse cx="300" cy="60" rx="34" ry="12" />
          <ellipse cx="326" cy="52" rx="20" ry="10" />
        </g>
      </motion.g>

      {/* ===== ground & street ===== */}
      <rect x="0" y="404" width="640" height="96" fill={C.ground} />
      <rect x="0" y="440" width="640" height="60" fill={C.street} />
      <line
        x1="0"
        y1="470"
        x2="640"
        y2="470"
        stroke={C.wall}
        strokeWidth="4"
        strokeDasharray="26 22"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* bushes */}
      <g fill={C.roof} opacity="0.28">
        <ellipse cx="48" cy="404" rx="30" ry="14" />
        <ellipse cx="88" cy="406" rx="22" ry="11" />
        <ellipse cx="600" cy="405" rx="26" ry="12" />
      </g>

      {/* ===== house ===== */}
      <g>
        {/* ground shadow */}
        <ellipse cx="245" cy="432" rx="160" ry="12" fill={C.ink} opacity="0.07" />

        {/* chimney + smoke */}
        <rect x="150" y="120" width="26" height="52" rx="6" fill={C.roofDark} />
        {[0, 1, 2].map((i) =>
          reduce ? null : (
            <motion.circle
              key={i}
              cx="163"
              cy="112"
              r="7"
              fill={C.smoke}
              opacity="0"
              animate={{ cy: [112, 76], cx: [163, 172], r: [6, 11], opacity: [0, 0.3, 0] }}
              transition={{
                duration: 3.4,
                repeat: Infinity,
                delay: i * 1.1,
                ease: "easeOut",
              }}
            />
          )
        )}

        {/* roof */}
        <polygon points="90,178 245,96 400,178 376,178 245,112 114,178" fill={C.roofDark} opacity="0.9" />
        <polygon points="102,178 245,102 388,178" fill="url(#hf-roofg)" />
        <circle cx="245" cy="94" r="7" fill={C.brass} />

        {/* wall */}
        <rect x="118" y="178" width="254" height="254" fill={C.wall} stroke={C.wallLine} strokeWidth="2" />
        {/* plaster texture lines */}
        <g stroke={C.wallLine} strokeWidth="1" opacity="0.5">
          <line x1="118" y1="240" x2="372" y2="240" />
          <line x1="118" y1="310" x2="372" y2="310" />
        </g>

        {/* arched window */}
        <g>
          <path
            d="M160 196 h84 a0 0 0 0 1 0 0 v46 a42 42 0 0 0 -84 0 z"
            fill="none"
          />
          <path d="M160 242 a42 42 0 0 1 84 0 v0 h-84 z" fill={C.glass} stroke={C.roof} strokeWidth="5" />
          <rect x="160" y="242" width="84" height="8" fill={C.roof} />
          <line x1="202" y1="204" x2="202" y2="242" stroke={C.roof} strokeWidth="4" />
          {/* light reflection */}
          <line x1="176" y1="236" x2="192" y2="212" stroke="#ffffff" strokeWidth="4" opacity="0.7" strokeLinecap="round" />
        </g>

        {/* AC unit under window */}
        <g>
          <rect x="170" y="278" width="64" height="34" rx="7" fill={C.cloud} stroke={C.wallLine} strokeWidth="2" />
          <circle cx="202" cy="295" r="11" fill={C.glass} stroke={C.wallLine} strokeWidth="1.5" />
          <g className={reduce ? "" : "animate-spin-slow"}>
            <path
              d="M202 295 m0 -8 a8 8 0 0 1 0 16 a4 8 0 0 0 0 -16 M202 295 m-8 0 a8 8 0 0 1 16 0 a8 4 0 0 1 -16 0"
              fill={C.roof}
              opacity="0.75"
            />
          </g>
          <line x1="222" y1="286" x2="228" y2="304" stroke={C.wallLine} strokeWidth="2" strokeLinecap="round" />
          {/* cool air waves — visible during work phase */}
          {[0, 1, 2].map((i) =>
            reduce ? null : (
              <motion.path
                key={i}
                d={`M${180 + i * 16} 322 q5 7 0 14 q-5 7 0 14`}
                fill="none"
                stroke={C.roof}
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0"
                animate={{ opacity: [0, 0, 0.8, 0.8, 0], y: [0, 0, 6, 12, 18] }}
                transition={loopTransition([0, 0.46, 0.52, 0.8, 0.9])}
              />
            )
          )}
        </g>

        {/* HomeFix shield sign */}
        <g transform="translate(245,196)">
          <path d="M-14 -12 h28 v14 a14 14 0 0 1 -14 14 a14 14 0 0 1 -14 -14 z" fill={C.brass} />
          <path
            d="M-5 1 l4 5 l8 -9"
            fill="none"
            stroke="#fffdf7"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* doorway (dark, revealed when door opens) */}
        <path d="M292 432 v-78 a38 38 0 0 1 76 0 v78 z" fill={C.doorway} stroke={C.wallLine} strokeWidth="2" />

        {/* the door — hinged on its left edge */}
        <motion.g
          style={{ originX: "292px", originY: "432px" }}
          animate={reduce ? {} : { scaleX: [1, 1, 0.1, 0.1, 1, 1] }}
          transition={loopTransition([0, 0.32, 0.4, 0.8, 0.88, 1])}
        >
          <path d="M292 432 v-78 a38 38 0 0 1 76 0 v78 z" fill={C.door} />
          <path d="M292 432 v-78 a38 38 0 0 1 38 -38 v116 z" fill={C.roofDark} opacity="0.25" />
          <circle cx="354" cy="390" r="4.5" fill={C.brass} />
        </motion.g>
        {/* door step */}
        <rect x="284" y="430" width="92" height="10" rx="5" fill={C.wallLine} />

        {/* done badge — pops when work is finished */}
        <motion.g
          animate={
            reduce
              ? { opacity: 0 }
              : {
                  opacity: [0, 0, 1, 1, 0, 0],
                  scale: [0.4, 0.4, 1.15, 1, 0.5, 0.4],
                }
          }
          style={{ originX: "330px", originY: "210px" }}
          transition={loopTransition([0, 0.52, 0.58, 0.8, 0.86, 1])}
        >
          <circle cx="330" cy="210" r="20" fill={C.brass} stroke={C.wall} strokeWidth="4" />
          <path
            d="M321 210 l7 7 l12 -13"
            fill="none"
            stroke="#fffdf7"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>

        {/* sparkles around house */}
        {[
          { x: 140, y: 168, s: 1 },
          { x: 372, y: 150, s: 0.8 },
          { x: 410, y: 236, s: 0.7 },
        ].map((p, i) =>
          reduce ? null : (
            <motion.path
              key={i}
              d="M0 -10 L2.6 -2.6 L10 0 L2.6 2.6 L0 10 L-2.6 2.6 L-10 0 L-2.6 -2.6 Z"
              fill={C.brass}
              transform={`translate(${p.x},${p.y}) scale(${p.s})`}
              animate={{ opacity: [0, 0, 1, 0, 0], scale: [0.3, 0.3, 1.1, 0.4, 0.3] }}
              transition={loopTransition([0, 0.54 + i * 0.03, 0.6 + i * 0.03, 0.78 + i * 0.02, 1])}
            />
          )
        )}
      </g>

      {/* ===== scooter + rider ===== */}
      <motion.g
        animate={reduce ? { x: 468 } : { x: scooterX }}
        transition={reduce ? { duration: 0 } : loopTransition(scooterTimes, ["easeOut", "linear", "easeIn"])}
      >
        {/* ground shadow */}
        <motion.ellipse
          cx="0"
          cy="492"
          rx="66"
          ry="9"
          fill={C.ink}
          opacity="0.1"
          animate={reduce ? {} : { opacity: [0, 0.1, 0.1, 0] }}
          transition={loopTransition([0, 0.08, 0.86, 1])}
        />

        {/* speed lines while moving */}
        {[0, 1, 2].map((i) =>
          reduce ? null : (
            <motion.line
              key={i}
              x1={-46 - i * 12}
              y1={452 + i * 12}
              x2={-14 - i * 12}
              y2={452 + i * 12}
              stroke={C.ink}
              strokeWidth="3.4"
              strokeLinecap="round"
              opacity="0"
              animate={{ opacity: [0, 0.4, 0, 0] }}
              transition={loopTransition([0, 0.08, 0.2, 1])}
            />
          )
        )}

        {/* dust puffs on stop */}
        {[0, 1].map((i) =>
          reduce ? null : (
            <motion.circle
              key={i}
              cx={-30 - i * 14}
              cy="486"
              r="7"
              fill={C.ground}
              animate={{ opacity: [0, 0.9, 0], r: [4, 9, 12], cx: [-30 - i * 14, -44 - i * 14, -60 - i * 14] }}
              transition={loopTransition([0, 0.2, 0.3])}
            />
          )
        )}

        <g>
          {/* rear box (brass) */}
          <rect x="-52" y="404" width="34" height="30" rx="6" fill={C.brass} stroke={C.roofDark} strokeWidth="2" />
          <path d="M-40 434 v8" stroke={C.roofDark} strokeWidth="2" />

          {/* body */}
          <path
            d="M-30 462 q0 -16 16 -16 h22 l14 -22 h10 v38 z"
            fill={C.scooter}
            stroke={C.roofDark}
            strokeWidth="2"
          />
          {/* front column + handlebar */}
          <path d="M32 424 l-6 -26 h-12" fill="none" stroke={C.roofDark} strokeWidth="5" strokeLinecap="round" />
          <rect x="26" y="418" width="14" height="44" rx="7" fill={C.scooter} stroke={C.roofDark} strokeWidth="2" />
          <path d="M22 392 h16" stroke={C.roofDark} strokeWidth="5" strokeLinecap="round" />

          {/* seat */}
          <rect x="-26" y="440" width="26" height="9" rx="4.5" fill={C.roofDark} />

          {/* wheels */}
          {[
            { cx: -22 },
            { cx: 34 },
          ].map((w, i) => (
            <g key={i}>
              <circle cx={w.cx} cy="474" r="15" fill={C.ink} />
              <motion.g
                className="svg-center-origin"
                animate={reduce ? {} : { rotate: [0, -1300, -1300, -2600] }}
                transition={loopTransition(scooterTimes, ["easeOut", "linear", "easeIn"])}
              >
                <circle cx={w.cx} cy="474" r="8" fill={C.cloud} />
                <path d={`M${w.cx} 466 v16 M${w.cx - 8} 474 h16`} stroke={C.ink} strokeWidth="2.4" />
              </motion.g>
            </g>
          ))}

          {/* rider */}
          <motion.g
            animate={reduce ? {} : { opacity: riderOpacity }}
            transition={loopTransition(riderOpacityTimes)}
          >
            {/* leg */}
            <path d="M-6 452 q-4 14 -12 18" fill="none" stroke={C.ink} strokeWidth="7" strokeLinecap="round" />
            {/* torso */}
            <path d="M-4 444 q2 -22 14 -28 l10 8 q-6 22 -12 30 z" fill={C.terra} stroke={C.roofDark} strokeWidth="2" />
            {/* arm to handlebar */}
            <path d="M10 420 q10 -2 16 -4" fill="none" stroke={C.terra} strokeWidth="6" strokeLinecap="round" />
            {/* head + brass helmet */}
            <circle cx="14" cy="404" r="11" fill="#f2c9a0" />
            <path d="M2 402 a12 12 0 0 1 24 -4 l-24 4 z" fill={C.brass} />
            <rect x="0" y="400" width="28" height="4.5" rx="2.2" fill={C.brass} opacity="0.85" />
          </motion.g>
        </g>

        {/* entry-code chip (pops after stop) */}
        <motion.g
          animate={
            reduce
              ? { opacity: 1 }
              : {
                  opacity: [0, 0, 1, 1, 0, 0],
                  scale: [0.5, 0.5, 1.12, 1, 0.8, 0.5],
                  y: [8, 8, 0, 0, 6, 8],
                }
          }
          style={{ originX: "72px", originY: "378px" }}
          transition={loopTransition([0, 0.26, 0.32, 0.62, 0.68, 1])}
        >
          <g transform="translate(8,356)">
            <rect x="0" y="0" width="128" height="44" rx="14" fill={C.cloud} stroke={C.brass} strokeWidth="2.5" />
            <circle cx="22" cy="22" r="8" fill="none" stroke={C.brass} strokeWidth="3" />
            <line x1="28" y1="27" x2="36" y2="35" stroke={C.brass} strokeWidth="3" strokeLinecap="round" />
            <text
              x="52"
              y="29"
              fontSize="19"
              fontWeight="800"
              fill={C.ink}
              style={{ fontFamily: "Vazirmatn, sans-serif" }}
            >
              ۴۲۳۱
            </text>
            <path d="M64 -10 l5 5 l9 -10" fill="none" stroke={C.brass} strokeWidth="0" />
          </g>
        </motion.g>
      </motion.g>

      {/* soft vignette frame */}
      <rect width="640" height="500" rx="24" fill="none" stroke={C.wallLine} strokeWidth="2" opacity="0.6" />
    </svg>
  );
}
