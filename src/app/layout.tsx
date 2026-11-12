import type { Metadata, Viewport } from "next";
import {
  Plus_Jakarta_Sans,
  Space_Grotesk,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { BRAND, SITE_URL } from "@/lib/constants";
import { MotionProvider } from "@/components/motion/MotionPrimitives";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#060A30",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Q-JEN | Made in India Variable Frequency Drives (15kW – 220kW)",
    template: "%s | Q-JEN India VFDs",
  },
  description:
    "Q-JEN Variable Frequency Drives (AC Drives) from 15kW / 20HP to 220kW / 300HP. Designed and manufactured in Madurai, Tamil Nadu by Jerly Electronics and Cooling Services — QCI Verified Manufacturer & GeM OEM Registered Seller.",
  keywords: [
    "VFD",
    "variable frequency drive",
    "AC drive",
    "VFD India",
    "made in India VFD",
    "Q-JEN VFD",
    "Jerly Electronics",
    "Madurai VFD manufacturer",
    "15kW 20HP VFD",
    "220kW 300HP VFD",
  ],
  authors: [{ name: BRAND.legalOwner }],
  creator: BRAND.legalOwner,
  publisher: BRAND.legalOwner,
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Q-JEN India",
    title: "Q-JEN | Made in India Variable Frequency Drives (15kW – 220kW)",
    description:
      "Industrial Variable Frequency Drives designed and manufactured in Madurai, Tamil Nadu, India. Buy direct via WhatsApp.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Q-JEN Industrial Variable Frequency Drives — Made in India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Q-JEN | Made in India Variable Frequency Drives",
    description:
      "Industrial VFDs from 15kW to 220kW designed & manufactured in Madurai, India by Jerly Electronics and Cooling Services.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-[#1C66EB] selection:text-white">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
