"use client";

// ============================================================
// HomeFix — client-side view router & session state (zustand)
// Persisted fields: view, orderId, specialistId
// ============================================================

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type View =
  | "home"
  | "booking"
  | "track"
  | "my-orders"
  | "specialist-login"
  | "specialist-dashboard";

export interface BookingPreset {
  categoryId?: string;
  serviceId?: string;
  aiText?: string;
}

export type AuthTab = "login" | "register";

interface HomeFixState {
  view: View;
  orderId?: string;
  specialistId?: string;
  bookingPreset: BookingPreset;
  authTab: AuthTab;
  goHome: () => void;
  openBooking: (preset?: BookingPreset) => void;
  openTrack: (orderId: string) => void;
  openMyOrders: () => void;
  openSpecialistLogin: (tab?: AuthTab) => void;
  openSpecialist: (specialistId: string) => void;
  setAuthTab: (tab: AuthTab) => void;
  clearSpecialist: () => void;
}

export const useHomeFix = create<HomeFixState>()(
  persist(
    (set) => ({
      view: "home",
      orderId: undefined,
      specialistId: undefined,
      bookingPreset: {},
      authTab: "login",

      goHome: () => set({ view: "home", bookingPreset: {} }),

      openBooking: (preset?: BookingPreset) =>
        set({ view: "booking", bookingPreset: preset ?? {} }),

      openTrack: (orderId: string) => set({ view: "track", orderId }),

      openMyOrders: () => set({ view: "my-orders" }),

      openSpecialistLogin: (tab?: AuthTab) =>
        set({ view: "specialist-login", authTab: tab ?? "login" }),

      openSpecialist: (specialistId: string) =>
        set({ view: "specialist-dashboard", specialistId }),

      setAuthTab: (tab: AuthTab) => set({ authTab: tab }),

      clearSpecialist: () =>
        set({ specialistId: undefined, view: "home" }),
    }),
    {
      name: "homefix-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        view: s.view,
        orderId: s.orderId,
        specialistId: s.specialistId,
      }),
    }
  )
);
