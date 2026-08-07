import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

// ✅ خط HayyakumAllah محلياً (4 أوزان)
const hayyakum = localFont({
  src: [
    {
      path: "../fonts/HayyakumAllah-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/HayyakumAllah-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/HayyakumAllah-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/HayyakumAllah-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-hayyakum",
  display: "swap",
});

export const metadata: Metadata = {
  title: "نظام حلقة جامع الخضر",
  description: "نظام لتسهيل تسجيل حضور الطلاب وحفظهم في حلقة جامع الخضر",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${hayyakum.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}
