import logoSvg from "../../assets/logo.svg";

interface Props {
  className?: string;
  size?: number | string;
  alt?: string;
}

export default function VoiceFlowLogo({
  className = "h-7 w-7",
  size,
  alt = "VoiceFlow Logo",
}: Props) {
  return (
    <img
      src={logoSvg}
      alt={alt}
      width={size}
      height={size}
      className={`object-contain select-none shrink-0 ${className}`}
      draggable={false}
    />
  );
}
