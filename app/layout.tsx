import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "sonner";
import { AppProvider } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "STR Motives",
  description: "What's the motive?",
  appleWebApp: {
    capable: true,
    title: "Motives",
    statusBarStyle: "black-translucent",
  },
  other: { "mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  themeColor: "#090a0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} dark`}>
      <body>
        <AppProvider>{children}</AppProvider>
        <Toaster theme="dark" position="top-center" richColors />
      </body>
    </html>
  );
}
