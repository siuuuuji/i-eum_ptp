import { PERSONAS } from "../types";
import type { Scene, SceneKey } from "../lib/scene";
import { ART_FOCAL, SCENE_IMAGES, SCENE_PREVIEWS, isLate } from "../lib/scene";
import { countdownLabel, dueLabel, elapsedLabel } from "../lib/time";
import { RefArt } from "./RefArt";

interface SceneStageProps {
  scene: Scene;
  now: number;
  preview: SceneKey | null;
  onPreview: (key: SceneKey | null) => void;
}

export function SceneStage({ scene, now, preview, onPreview }: SceneStageProps) {
  const focus = scene.focus;

  return (
    <section className="mq-stage" aria-label="숲의 지금">
      <div className="mq-stage__art" aria-hidden={false}>
        {SCENE_IMAGES.map((src) => {
          const active = src === scene.image;
          return (
            <div className="mq-stage__layer" key={src} data-active={active}>
              <RefArt
                src={src}
                alt={active ? scene.alt : ""}
                focal={ART_FOCAL[src]}
                opacity={0.88}
                eager
              />
            </div>
          );
        })}
      </div>
      <div className="mq-stage__scrim" aria-hidden="true" />

      <div className="mq-stage__body">
        <div className="mq-stage__top">
          <span className="mq-stage__badge">
            <span className="mq-dot" style={{ ["--pin" as string]: badgeColor(scene.key) }} aria-hidden="true" />
            {scene.badge}
          </span>
          {scene.shout ? (
            <p className="mq-shout" key={scene.key}>
              {scene.shout}
            </p>
          ) : null}
        </div>

        <div className="mq-murmur">
          {scene.murmur.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>

        <div className="mq-stage__card">
          <h2 className="mq-stage__headline">{scene.headline}</h2>
          <p className="mq-stage__caption">{scene.caption}</p>
          {focus ? (
            <div className="mq-stage__meta">
              <span className="mq-chip" style={{ borderColor: PERSONAS[focus.assigneeId].accent }}>
                맡은 사람 · {PERSONAS[focus.assigneeId].name}
              </span>
              {focus.dueAt !== null ? (
                <span className={`mq-chip ${focus.completedAt === null && now > focus.dueAt ? "mq-chip--alarm" : "mq-chip--gold"}`}>
                  기한 {dueLabel(focus.dueAt, now)} · {countdownLabel(focus.dueAt, focus.completedAt ?? now)}
                </span>
              ) : (
                <span className="mq-chip">기한 없는 자유 과제</span>
              )}
              {focus.completedAt === null ? (
                <span className="mq-chip">{elapsedLabel(focus.createdAt, now)}</span>
              ) : (
                <span className={`mq-chip ${isLate(focus) ? "mq-chip--alarm" : "mq-chip--leaf"}`}>
                  {isLate(focus) ? "기한을 넘겨 완료" : "기한 안에 완료"}
                </span>
              )}
            </div>
          ) : null}
        </div>

        <div className="mq-preview">
          <span className="mq-preview__label">장면 미리보기</span>
          {SCENE_PREVIEWS.map((p) => (
            <button
              key={p.key}
              type="button"
              className="mq-preview__btn"
              aria-pressed={preview === p.key}
              onClick={() => onPreview(preview === p.key ? null : p.key)}
            >
              {p.label}
            </button>
          ))}
          {preview ? (
            <button type="button" className="mq-preview__btn" onClick={() => onPreview(null)}>
              ↺ 지금 상태로
            </button>
          ) : (
            <span className="mq-preview__label">지금은 실제 상태예요</span>
          )}
        </div>
      </div>
    </section>
  );
}

function badgeColor(key: SceneKey): string {
  switch (key) {
    case "overdue":
      return "#c96b6b";
    case "celebrate":
      return "#d9899f";
    case "allclear":
      return "#8aa886";
    case "poke":
      return "#cfa95f";
    default:
      return "#a9c9ea";
  }
}
