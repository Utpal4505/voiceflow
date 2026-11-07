import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoiceFlow — 100% Offline AI Voice Typing for Windows",
  description:
    "Type at the speed of thought. Press Ctrl + Space anywhere on Windows. Powered by local CPU-accelerated OpenAI Whisper. 100% private, zero cloud, zero subscriptions.",
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-[#0B0C12] text-slate-100 antialiased selection:bg-[#514BFA]/40 selection:text-white">
        {children}
      </body>
    </html>
  );
}
