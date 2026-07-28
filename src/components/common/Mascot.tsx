export type MascotMood = "calm" | "listening" | "speaking" | "happy" | "sleepy";

interface MascotProps {
  mood?: MascotMood;
  size?: number;
  className?: string;
}

/**
 * 뿌뿌 캐릭터 시트를 참고해 단순화한 플랫 벡터 일러스트.
 * 회색 몸통 · 하늘색 리본 · 분홍 귀안쪽/볼 특징을 유지한다.
 */
export function Mascot({ mood = "calm", size = 96, className }: MascotProps) {
  const eyes = eyeShapes(mood);
  const mouth = mouthShape(mood);
  return (
    <svg
      viewBox="0 0 160 160"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="이음 캐릭터 뿌뿌"
    >
      <ellipse cx="80" cy="146" rx="46" ry="8" fill="#0d2820" opacity="0.08" />
      {/* ears */}
      <path d="M34 66 C6 58 4 100 30 110 C46 116 54 96 50 78 C48 68 42 64 34 66 Z" fill="#9fabaf" />
      <path d="M38 74 C22 72 20 96 34 102 C42 105 46 92 44 82 C43 76 41 73 38 74 Z" fill="#f2c9cf" />
      <path d="M126 66 C154 58 156 100 130 110 C114 116 106 96 110 78 C112 68 118 64 126 66 Z" fill="#9fabaf" />
      <path d="M122 74 C138 72 140 96 126 102 C118 105 114 92 116 82 C117 76 119 73 122 74 Z" fill="#f2c9cf" />
      {/* head */}
      <ellipse cx="80" cy="88" rx="50" ry="46" fill="#b6c0c4" />
      {/* body hint */}
      <path d="M42 118 C42 148 118 148 118 118 L118 108 L42 108 Z" fill="#aab6bb" />
      {/* trunk */}
      <path
        d={
          mood === "speaking"
            ? "M72 104 C70 122 66 132 74 138 C82 143 90 134 87 126"
            : "M72 104 C70 120 64 128 70 134"
        }
        stroke="#8d999e"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      {/* tusks */}
      <rect x="60" y="100" width="7" height="14" rx="3.5" fill="#fbf6ec" />
      <rect x="93" y="100" width="7" height="14" rx="3.5" fill="#fbf6ec" />
      {/* blush */}
      <ellipse cx="52" cy="98" rx="8" ry="5" fill="#f2b3bb" opacity="0.75" />
      <ellipse cx="108" cy="98" rx="8" ry="5" fill="#f2b3bb" opacity="0.75" />
      {/* eyes + mouth */}
      {eyes}
      {mouth}
      {/* bow */}
      <g transform="translate(80 40)">
        <path d="M0 0 L-20 -10 C-26 -6 -26 6 -20 10 Z" fill="#8fb6de" />
        <path d="M0 0 L20 -10 C26 -6 26 6 20 10 Z" fill="#8fb6de" />
        <circle cx="0" cy="0" r="7" fill="#6f9bc7" />
      </g>
    </svg>
  );
}

function eyeShapes(mood: MascotMood) {
  if (mood === "happy" || mood === "sleepy") {
    return (
      <g stroke="#2b3230" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M62 84 Q68 76 74 84" />
        <path d="M86 84 Q92 76 98 84" />
      </g>
    );
  }
  if (mood === "listening") {
    return (
      <g fill="#2b3230">
        <circle cx="68" cy="82" r="6.5" />
        <circle cx="92" cy="82" r="6.5" />
        <circle cx="70" cy="79" r="1.6" fill="#fff" />
        <circle cx="94" cy="79" r="1.6" fill="#fff" />
      </g>
    );
  }
  return (
    <g fill="#2b3230">
      <circle cx="68" cy="84" r="5.5" />
      <circle cx="92" cy="84" r="5.5" />
      <circle cx="70" cy="82" r="1.4" fill="#fff" />
      <circle cx="94" cy="82" r="1.4" fill="#fff" />
    </g>
  );
}

function mouthShape(mood: MascotMood) {
  if (mood === "speaking") {
    return <ellipse cx="80" cy="98" rx="6" ry="5" fill="#6a5147" />;
  }
  if (mood === "happy") {
    return <path d="M72 96 Q80 104 88 96" stroke="#2b3230" strokeWidth="3.5" strokeLinecap="round" fill="none" />;
  }
  return <path d="M74 97 Q80 100 86 97" stroke="#2b3230" strokeWidth="3" strokeLinecap="round" fill="none" />;
}

interface LogoMarkProps {
  size?: number;
  tone?: "light" | "dark";
  className?: string;
}

/** 제공된 이음 로고(원 안 코끼리 라인 아이콘)를 단순 벡터로 재현. */
export function LogoMark({ size = 40, tone = "light", className }: LogoMarkProps) {
  const stroke = tone === "light" ? "#ffffff" : "#173f34";
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} role="img" aria-label="이음 로고">
      <circle cx="32" cy="32" r="29" fill="none" stroke={stroke} strokeWidth="2.4" />
      <path
        d="M22 24 C15 22 13 33 20 36 C25 38 28 32 26 27"
        stroke={stroke}
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="27" cy="27" r="1.8" fill={stroke} />
      <path
        d="M26 30 C33 30 40 28 42 34 C43 38 40 41 37 40"
        stroke={stroke}
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M35 34 C38 36 40 40 37 44"
        stroke={stroke}
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
