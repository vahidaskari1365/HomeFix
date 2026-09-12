"use client";

// ============================================================
// HomeFix — single-page shell
// Providers → mounted gate → Header / animated view switch / Footer
// The ONLY route is "/" — views are driven by the zustand store.
// ============================================================

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Wrench } from "lucide-react";
import { Providers } from "@/components/homefix/Providers";
import { Header } from "@/components/homefix/Header";
import { Footer } from "@/components/homefix/Footer";
import { HomeView } from "@/components/homefix/HomeView";
import { BookingWizard } from "@/components/homefix/BookingWizard";
import { TrackView } from "@/components/homefix/TrackView";
import { MyOrdersView } from "@/components/homefix/MyOrdersView";
import { SpecialistAuthView } from "@/components/homefix/SpecialistAuthView";
import { SpecialistDashboardView } from "@/components/homefix/SpecialistDashboardView";
import { useHomeFix, type View } from "@/lib/store";
import { useMounted } from "@/components/homefix/bits";

// ---------- LocalBusiness JSON-LD (service-area business) ----------
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: "HomeFix",
  telephone: "+982191007800",
  areaServed: ["تهران", "کرج", "اصفهان", "مشهد", "شیراز"],
  priceRange: "تومان",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "1320",
  },
};

const VIEW_COMPONENTS: Record<View, () => React.JSX.Element> = {
  home: HomeView,
  booking: BookingWizard,
  track: TrackView,
  "my-orders": MyOrdersView,
  "specialist-login": SpecialistAuthView,
  "specialist-dashboard": SpecialistDashboardView,
};

function Shell() {
  const view = useHomeFix((s) => s.view);
  const mounted = useMounted();

  // scroll to top on every view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  if (!mounted) {
    return <BootSkeleton />;
  }

  const ActiveView = VIEW_COMPONENTS[view] ?? HomeView;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <AnimatePresence mode="wait">
        <motion.main
          key={view}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="flex-1"
        >
          <ActiveView />
        </motion.main>
      </AnimatePresence>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
    </div>
  );
}

/** Skeleton shown until the persisted store has rehydrated (client-only). */
function BootSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="sticky top-0 z-40 h-16 border-b bg-background/80 backdrop-blur-md" />
      <main className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.span
            className="arch-well relative grid size-16 place-items-center overflow-hidden bg-primary text-primary-foreground shadow-glow-teal"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="pattern-khatam-light absolute inset-0 opacity-60" aria-hidden />
            <Wrench className="relative size-8" />
          </motion.span>
          <p className="text-sm font-bold text-muted-foreground">HomeFix در حال آماده‌سازی…</p>
        </div>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Providers>
      <Shell />
    </Providers>
  );
}
