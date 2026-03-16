import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Stackwatch — Monitor your dev stack limits",
    template: "%s | Stackwatch",
  },
  description:
    "Get alerted before you hit limits on GitHub Actions, Vercel, and Supabase. One dashboard for all your dev tool usage.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://stackwatch.app"
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
