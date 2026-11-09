import React from "react";

interface VoiceFlowLogoProps {
  className?: string;
  size?: number;
  style?: React.CSSProperties;
  alt?: string;
}

export function VoiceFlowLogo({
  className = "w-8 h-8",
  size,
  style,
  alt = "VoiceFlow Logo",
}: VoiceFlowLogoProps) {
  const customStyle: React.CSSProperties = {
    ...(size ? { width: size, height: size } : {}),
    ...style,
  };

  return (
    <img
      src="/logo.svg"
      alt={alt}
      className={`object-contain select-none shrink-0 ${className}`}
      style={customStyle}
      draggable={false}
    />
  );
}

export default VoiceFlowLogo;
