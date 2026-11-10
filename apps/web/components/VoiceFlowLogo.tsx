import React from "react";
import Image from "next/image";

interface VoiceFlowLogoProps {
  className?: string;
  size?: number;
  style?: React.CSSProperties;
  alt?: string;
}

export function VoiceFlowLogo({
  className = "w-8 h-8",
  size = 32,
  style,
  alt = "VoiceFlow Logo",
}: VoiceFlowLogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt={alt}
      width={size}
      height={size}
      className={`object-contain select-none shrink-0 ${className}`}
      style={style}
      draggable={false}
      priority
    />
  );
}

export default VoiceFlowLogo;
