import type { BoardState, UserId } from "../types";
import type { SceneKey } from "../lib/scene";
import { deriveScene } from "../lib/scene";
import type { NewTaskInput } from "../lib/store";
import { SceneStage } from "../components/SceneStage";
import { TaskColumn } from "../components/TaskColumn";
import { Composer } from "../components/Composer";

interface DashboardProps {
  board: BoardState;
  now: number;
  viewer: UserId;
  preview: SceneKey | null;
  onPreview: (key: SceneKey | null) => void;
  onAssign: (input: NewTaskInput) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function Dashboard({ board, now, viewer, preview, onPreview, onAssign, onToggle, onRemove }: DashboardProps) {
  const scene = deriveScene(board, now, preview);

  const baekrakTasks = board.tasks.filter((t) => t.assigneeId === "baekrak");
  const mallangTasks = board.tasks.filter((t) => t.assigneeId === "mallang");

  return (
    <>
      <SceneStage scene={scene} now={now} preview={preview} onPreview={onPreview} />

      <div className="mq-board">
        <TaskColumn
          owner="baekrak"
          tasks={baekrakTasks}
          now={now}
          viewer={viewer}
          onToggle={onToggle}
          onRemove={onRemove}
        />
        <TaskColumn
          owner="mallang"
          tasks={mallangTasks}
          now={now}
          viewer={viewer}
          onToggle={onToggle}
          onRemove={onRemove}
        />
      </div>

      <Composer viewer={viewer} onAssign={onAssign} />
    </>
  );
}
