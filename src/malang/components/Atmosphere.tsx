import { useMemo } from "react";
import type { CSSProperties } from "react";

const MOTE_COUNT = 18;

/** 배경 하늘과 떠다니는 빛가루. 레퍼런스 그림의 공기감을 화면 전체로 넓힌다. */
export function Atmosphere() {
  const motes = useMemo(
    () =>
      Array.from({ length: MOTE_COUNT }, (_, i) => {
        const size = 3 + ((i * 7) % 6);
        return {
          key: i,
          style: {
            left: `${(i * 5.7 + ((i * i) % 9)) % 100}%`,
            "--s": `${size}px`,
            "--dur": `${16 + ((i * 3) % 14)}s`,
            "--delay": `${-(i * 1.7) % 18}s`,
            "--dx": `${((i % 5) - 2) * 26}px`
          } as CSSProperties
        };
      }),
    []
  );

  return (
    <>
      <div className="mq-sky" aria-hidden="true" />
      <div className="mq-motes" aria-hidden="true">
        {motes.map((m) => (
          <span key={m.key} className="mq-mote" style={m.style} />
        ))}
      </div>
    </>
  );
}
