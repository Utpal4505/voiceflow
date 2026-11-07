# @voiceflow/web

Product showcase, interactive audio demo, and documentation website for **VoiceFlow**, built on **Next.js 15**, **React 19**, and **Tailwind CSS**.

## Overview

The web package serves as the public landing page and interactive showcase for VoiceFlow:
- **Hero & Value Proposition (`Hero.tsx`)**: Highlights 100% offline dictation, system-wide hotkeys, and direct download buttons for latest releases.
- **Interactive Audio Demo (`InteractiveDemo.tsx`)**: In-browser audio recording testbed showcasing real-time transcription and voice waveforms.
- **Feature Showcase (`Features.tsx`)**: Bento grid detailing air-gapped privacy, AVX2 acceleration, non-activating HUD, and autostart capabilities.
- **Side-by-Side Comparison (`Comparison.tsx`)**: Direct comparison against cloud dictation services (Wispr Flow, Otter.ai, Dragon).
- **Windows SmartScreen Guide (`SmartScreenGuide.tsx`)**: Visual walkthrough helping Windows users understand open-source executable verification.
- **FAQ (`Faq.tsx`)**: Answers to common questions regarding offline performance, privacy, RAM consumption, and supported hardware.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19 + Lucide Icons
- **Styling**: Tailwind CSS + custom glassmorphic animations
- **Package Manager**: pnpm

## Development

```bash
# Start local development server on http://localhost:3000
pnpm dev

# Build static/SSR production application
pnpm build

# Preview production build locally
pnpm start
```
