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

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0C12] text-slate-100 flex flex-col">
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
    </main>
  );
}
