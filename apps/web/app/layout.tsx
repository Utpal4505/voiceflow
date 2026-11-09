import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#212121",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://voiceflow.app"),
  title: "VoiceFlow — 100% Offline AI Voice Typing for Windows",
  description:
    "Type at the speed of thought. Press Ctrl + Space anywhere on Windows. Powered by local CPU-accelerated OpenAI Whisper. 100% private, zero cloud, zero subscriptions.",
  keywords: [
    "voice typing",
    "offline dictation",
    "OpenAI Whisper",
    "Windows speech to text",
    "local AI",
    "whisper.cpp",
    "VoiceFlow",
    "speech recognition",
  ],
  authors: [{ name: "VoiceFlow Team" }],
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "VoiceFlow — 100% Offline AI Voice Typing for Windows",
    description:
      "Type at the speed of thought. Press Ctrl + Space anywhere on Windows. Powered by local CPU-accelerated OpenAI Whisper. Zero audio leaves your computer.",
    url: "https://voiceflow.app",
    siteName: "VoiceFlow",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VoiceFlow — 100% Offline AI Voice Typing for Windows",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VoiceFlow — 100% Offline AI Voice Typing for Windows",
    description:
      "Type at the speed of thought. Press Ctrl + Space anywhere on Windows. 100% private, zero cloud.",
    images: ["/og-image.png"],
  },
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "VoiceFlow",
  operatingSystem: "Windows 10, Windows 11 (64-bit)",
  applicationCategory: "ProductivityApplication",
  applicationSubCategory: "Speech Recognition & Dictation",
  offers: {
    "@type": "Offer",
    price: "0.00",
    priceCurrency: "USD",
  },
  description:
    "100% Offline AI Voice Typing for Windows. Press Ctrl + Space anywhere on Windows to dictate instantly with local CPU-accelerated OpenAI Whisper. Zero audio leaves your computer.",
  softwareVersion: "0.1.0",
  fileSize: "25MB",
  downloadUrl:
    "https://github.com/Utpal4505/voiceflow-releases/releases/latest/download/VoiceFlow-Setup.exe",
  featureList: [
    "100% offline speech recognition",
    "On-device CPU AVX2 acceleration with OpenAI Whisper",
    "Global Windows keyboard simulation (Ctrl + Space)",
    "Zero cloud telemetry and volatile RAM audio processing",
    "Stealth HUD with WS_EX_NOACTIVATE window focus preservation",
    "Local encrypted SQLite history vault",
    "Custom vocabulary and technical dictionary manager",
  ],
  screenshot: "https://voiceflow.app/og-image.png",
  author: {
    "@type": "Organization",
    name: "VoiceFlow Team",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} scroll-smooth`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareApplicationSchema),
          }}
        />
      </head>
      <body className="min-h-screen bg-[#212121] font-sans text-white antialiased selection:bg-[#FF5722]/25 selection:text-[#FF5722]">
        {children}
      </body>
    </html>
  );
}
