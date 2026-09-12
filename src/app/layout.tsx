import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "HomeFix | متخصص خانگی در خدمت شما",
  description:
    "سفارش آنلاین تعمیرکار، سرویس کولر، لوله‌کش، برق‌کار و نظافت با متخصص‌های احراز‌هویت‌شده، کد ورود امن و پرداخت درون‌برنامه‌ای",
  keywords: [
    "تعمیرکار",
    "سرویس کولر",
    "لوله‌کشی",
    "برق‌کار",
    "نظافت منزل",
    "متخصص خانگی",
    "سرویس در محل",
    "HomeFix",
    "امداد خودرو",
  ],
  authors: [{ name: "HomeFix" }],
  openGraph: {
    title: "HomeFix | متخصص خانگی در خدمت شما",
    description:
      "از کولر تا لوله‌کشی — انتخاب کن، متخصص مناسب می‌رسد، با خیال راحت پرداخت کن. کد ورود امن، ردیابی زنده و پرداخت درون‌برنامه‌ای.",
    locale: "fa_IR",
    type: "website",
    siteName: "HomeFix",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#047857",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
