interface KindKartLogoProps {
  size?: number;
  className?: string;
}

export function KindKartLogo({ size = 40, className = "" }: KindKartLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer tech circle with movement arrows */}
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="8 4"
        className="animate-spin-slow"
        style={{ animationDuration: '20s' }}
      />
      
      {/* Movement arrows - representing distribution */}
      <path
        d="M 70 30 L 85 30 L 85 25 L 95 33 L 85 41 L 85 36 L 70 36 Z"
        fill="currentColor"
        opacity="0.7"
      />
      <path
        d="M 30 70 L 15 70 L 15 75 L 5 67 L 15 59 L 15 64 L 30 64 Z"
        fill="currentColor"
        opacity="0.7"
      />
      
      {/* Shopping cart below - small and subtle */}
      <path
        d="M 35 75 L 37 75 L 40 62 L 60 62 L 62 70 L 65 70 L 62 58 L 38 58 L 35 75 Z"
        fill="currentColor"
        opacity="0.6"
      />
      <circle cx="42" cy="77" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="58" cy="77" r="2" fill="currentColor" opacity="0.6" />
      
      {/* Heart shape - representing kindness - positioned inside the cart */}
      <path
        d="M 50 58 C 50 58, 35 42, 35 33 C 35 25, 41 22, 46 25 C 48 27, 50 31, 50 31 C 50 31, 52 27, 54 25 C 59 22, 65 25, 65 33 C 65 42, 50 58, 50 58 Z"
        fill="currentColor"
        className="drop-shadow-lg"
      />
      
      {/* Digital/tech pixels inside heart */}
      <rect x="45" y="32" width="3" height="3" fill="white" opacity="0.9" />
      <rect x="52" y="32" width="3" height="3" fill="white" opacity="0.9" />
      <rect x="42" y="38" width="3" height="3" fill="white" opacity="0.8" />
      <rect x="49" y="38" width="3" height="3" fill="white" opacity="0.8" />
      <rect x="55" y="38" width="3" height="3" fill="white" opacity="0.8" />
      <rect x="49" y="44" width="3" height="3" fill="white" opacity="0.7" />
      
      {/* Connection nodes - tech element */}
      <circle cx="50" cy="28" r="2" fill="white" />
      <circle cx="40" cy="36" r="2" fill="white" />
      <circle cx="60" cy="36" r="2" fill="white" />
    </svg>
  );
}