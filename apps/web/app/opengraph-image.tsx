import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt = "VoiceFlow — 100% Offline AI Voice Typing for Windows";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#141414",
        padding: "60px 80px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "white",
      }}
    >
      {/* Top Header: Logo + Windows Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        {/* Logo Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="346 90 844 810"
            width="46"
            height="44"
          >
            <defs>
              <linearGradient id="og-tile" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#212121" />
                <stop offset="0.55" stopColor="#181818" />
                <stop offset="1" stopColor="#16171d" />
              </linearGradient>
              <linearGradient id="og-tileEdge" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffffff" stopOpacity="0.20" />
                <stop offset="0.4" stopColor="#ffffff" stopOpacity="0.06" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0.04" />
              </linearGradient>
              <linearGradient id="og-ribbon" x1="0.1" y1="0" x2="0.7" y2="1">
                <stop offset="0" stopColor="#ff9a73" />
                <stop offset="0.5" stopColor="#ff6d3f" />
                <stop offset="1" stopColor="#ff5722" />
              </linearGradient>
              <linearGradient id="og-arm" x1="0.2" y1="1" x2="0.8" y2="0">
                <stop offset="0" stopColor="#f4511e" />
                <stop offset="1" stopColor="#ff7a4d" />
              </linearGradient>
              <linearGradient id="og-fold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#a8340d" />
                <stop offset="1" stopColor="#e64a19" />
              </linearGradient>
              <linearGradient id="og-blade" x1="0.3" y1="1" x2="0.5" y2="0">
                <stop offset="0" stopColor="#e64a19" />
                <stop offset="1" stopColor="#ff8a5c" />
              </linearGradient>
              <linearGradient id="og-bars" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ff8a5c" />
                <stop offset="1" stopColor="#ff5722" />
              </linearGradient>
            </defs>
            <rect x="366" y="110" width="804" height="770" rx="175" fill="url(#og-tile)" />
            <rect x="367" y="111" width="802" height="768" rx="174" fill="none" stroke="url(#og-tileEdge)" strokeWidth="2" />
            <rect x="453" y="455" width="43" height="83" rx="21.5" fill="url(#og-bars)" />
            <rect x="514" y="407" width="49" height="174" rx="24.5" fill="url(#og-bars)" />
            <path
              d="M586 392 C620 392 640 420 655 465 C672 520 690 580 713 626 C718 633 712 638 700 642 C680 650 655 648 635 635 C600 612 587 570 587 520 Z"
              fill="url(#og-blade)"
            />
            <path
              d="M573 366 C600 335 640 322 678 328 C725 336 752 385 778 435 C805 485 830 520 850 526 C890 560 940 585 985 545 L940 615 C915 655 890 680 850 680 C800 680 760 640 725 575 C690 510 670 440 650 410 C630 380 600 368 573 366 Z"
              fill="url(#og-ribbon)"
            />
            <path
              d="M850 526 L960 345 C970 332 985 328 1000 328 L1088 328 C1102 328 1104 338 1098 348 L990 545 C950 580 890 560 850 526 Z"
              fill="url(#og-arm)"
            />
            <path
              d="M850 526 C890 560 950 585 985 545 L992 534 C960 570 900 565 862 508 Z"
              fill="url(#og-fold)"
            />
          </svg>
          <span
            style={{
              fontSize: "28px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              color: "#ffffff",
            }}
          >
            VoiceFlow
          </span>
        </div>

        {/* Windows Pill Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 18px",
            borderRadius: "9999px",
            backgroundColor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            fontSize: "14px",
            fontWeight: 600,
            color: "#cbd5e1",
          }}
        >
          {/* Microsoft 4-square SVG inline */}
          <svg width="16" height="16" viewBox="0 0 256 256" fill="none">
            <path
              fill="#0078d4"
              d="M0 0h121.329v121.329H0zm134.671 0H256v121.329H134.671zM0 134.671h121.329V256H0zm134.671 0H256V256H134.671z"
            />
          </svg>
          <span>Windows 11 &amp; 10 Native</span>
        </div>
      </div>

      {/* Center: Main Headline + Stealth HUD Card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "20px",
        }}
      >
        <div
          style={{
            fontSize: "64px",
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-2px",
            color: "#ffffff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span>Stop typing.</span>
          <span style={{ color: "#FF5722" }}>Start speaking.</span>
        </div>

        <p
          style={{
            fontSize: "22px",
            color: "#94a3b8",
            maxWidth: "800px",
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          100% Offline AI Voice Typing for Windows. Powered by local OpenAI
          Whisper with zero cloud egress.
        </p>

        {/* Stealth Floating HUD Mockup */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginTop: "10px",
            padding: "14px 28px",
            borderRadius: "18px",
            backgroundColor: "rgba(24, 24, 27, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "9999px",
              backgroundColor: "#FF5722",
            }}
          />
          <span
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "#f1f5f9",
            }}
          >
            Ctrl + Space
          </span>
          <span style={{ color: "#64748b" }}>|</span>
          <span
            style={{
              fontSize: "16px",
              fontFamily: "monospace",
              color: "#e2e8f0",
            }}
          >
            &quot;Schedule the architectural review for Thursday at 10 AM.&quot;
          </span>
        </div>
      </div>

      {/* Bottom Feature Pill Grid */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "28px",
          fontSize: "14px",
          color: "#64748b",
          fontWeight: 500,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "9999px",
              backgroundColor: "#10b981",
            }}
          />
          <span>Zero Cloud Telemetry</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "9999px",
              backgroundColor: "#10b981",
            }}
          />
          <span>Local AVX2 Vector Acceleration</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "9999px",
              backgroundColor: "#10b981",
            }}
          />
          <span>~25 MB Single Binary</span>
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
