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
  themeColor: "#0B0C12",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
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
  },
  twitter: {
    card: "summary_large_image",
    title: "VoiceFlow — 100% Offline AI Voice Typing for Windows",
    description:
      "Type at the speed of thought. Press Ctrl + Space anywhere on Windows. 100% private, zero cloud.",
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
      className={`${geistSans.variable} ${geistMono.variable} dark scroll-smooth`}
    >
      <body className="min-h-screen bg-[#07080D] font-sans text-slate-100 antialiased selection:bg-[#514BFA]/40 selection:text-white">
        {children}
      </body>
    </html>
  );
}
