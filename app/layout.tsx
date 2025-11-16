import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeInitializer from "@/components/ThemeInitializer";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DuoStreak",
  description: "Track habits together with your partner",
  manifest: "/manifest.json",
  themeColor: "#f97316",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DuoStreak",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeInitializer />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
