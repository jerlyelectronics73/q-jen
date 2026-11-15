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
    default: "Q-JEN | Made in India Variable Frequency Drives (VFD)",
    template: "%s | Q-JEN India",
  },
  description:
    "Buy Made-in-India Q-JEN Variable Frequency Drives (15kW–220kW) from Jerly Electronics, Madurai. QCI verified & GeM registered OEM manufacturer.",
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
    title: "Q-JEN | Made in India Variable Frequency Drives (VFD)",
    description:
      "Buy Made-in-India Q-JEN Variable Frequency Drives (15kW–220kW) from Jerly Electronics, Madurai. QCI verified & GeM registered OEM manufacturer.",
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
    title: "Q-JEN | Made in India Variable Frequency Drives (VFD)",
    description:
      "Buy Made-in-India Q-JEN Variable Frequency Drives (15kW–220kW) from Jerly Electronics, Madurai. QCI verified & GeM registered OEM manufacturer.",
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "fciev6T4zo1Vw_cSaewv2aTFv_cvI2PcUv4a_u1Xgg0",
    other: {
      "msvalidate.01": "C4B93E9364E6C337B4038476AFF69ECD",
    },
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
