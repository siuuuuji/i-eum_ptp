import type { CSSProperties } from "react";

interface RefArtProps {
  src: string;
  alt: string;
  /** object-position. 인물 얼굴이 가려지지 않도록 장면마다 조절한다. */
  focal?: string;
  /** 0~1. 화면에 스며드는 정도. */
  opacity?: number;
  eager?: boolean;
}

/**
 * 레퍼런스 일러스트를 그대로 붙이지 않고,
 * 가장자리를 방사형 마스크로 흘려보낸 뒤 바탕색을 덧칠해
 * 화면 자체에서 번져 나온 것처럼 보이게 한다.
 */
export function RefArt({ src, alt, focal = "50% 38%", opacity = 0.86, eager = false }: RefArtProps) {
  const style = {
    "--art-pos": focal,
    "--art-opacity": opacity
  } as CSSProperties;

  return (
    <div className="mq-art" style={style}>
      <img className="mq-art__img" src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" />
      <div className="mq-art__bloom" aria-hidden="true" />
      <div className="mq-art__wash" aria-hidden="true" />
    </div>
  );
}
