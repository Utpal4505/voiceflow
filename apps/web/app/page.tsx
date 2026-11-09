import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import InteractiveDemo from "@/components/InteractiveDemo";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Comparison from "@/components/Comparison";
import SmartScreenGuide from "@/components/SmartScreenGuide";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import DownloadToast from "@/components/DownloadToast";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#212121] text-white flex flex-col selection:bg-[#FF5722]/25 selection:text-[#FF5722]">
      <Navbar />
      <div className="flex-1">
        <Hero />
        <InteractiveDemo />
        <Features />
        <HowItWorks />
        <Comparison />
        <SmartScreenGuide />
        <Faq />
      </div>
      <Footer />
      <DownloadToast />
    </main>
  );
}
