import logoPng from "../../assets/logo.png";

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
      src={logoPng}
      alt={alt}
      width={size}
      height={size}
      className={`object-contain select-none shrink-0 ${className}`}
      draggable={false}
    />
  );
}
