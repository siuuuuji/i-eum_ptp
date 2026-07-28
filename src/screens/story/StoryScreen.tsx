import { Mic } from "lucide-react";
import { MemoryVault } from "./MemoryVault";

interface StoryScreenProps {
  viewerId: string;
  recorderView: boolean;
  onStartConversation: () => void;
}

export function StoryScreen({ viewerId, recorderView, onStartConversation }: StoryScreenProps) {
  return (
    <section className="screen">
      <div className="page-title">
        <small>MY STORY</small>
        <h1>{recorderView ? "차곡차곡 쌓인 기억" : "허용된 기억 보기"}</h1>
        <p>{recorderView ? "남겨 주신 이야기가 한 권의 삶이 됩니다." : "기록자가 공개한 이야기에 반응해 보세요."}</p>
      </div>

      {recorderView && (
        <button className="btn btn-primary" style={{ marginBottom: 16 }} onClick={onStartConversation}>
          <Mic size={18} /> 오늘 이야기 시작
        </button>
      )}

      <MemoryVault viewerId={viewerId} />
    </section>
  );
}
