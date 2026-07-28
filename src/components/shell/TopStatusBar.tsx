import { useEffect, useState } from "react";
import { Bell, Mic, Volume2 } from "lucide-react";
import { LogoMark } from "../common/Mascot";

export type MicState = "idle" | "listening" | "speaking";

interface TopStatusBarProps {
  groupName: string;
  viewerName: string;
  viewerRelationship: string;
  unreadCount: number;
  micState?: MicState;
  onOpenProfile: () => void;
}

function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);
  return online;
}

export function TopStatusBar({ groupName, viewerName, viewerRelationship, unreadCount, micState, onOpenProfile }: TopStatusBarProps) {
  const online = useOnlineStatus();

  return (
    <header className="topbar">
      <div className="topbar-main">
        <div className="brand">
          <LogoMark size={30} tone="light" />
          <div>
            <span className="brand-mark">이음</span>
            <small className="brand-group">{groupName}</small>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="icon-chip" onClick={onOpenProfile} aria-label="내 정보">
            {viewerRelationship} {viewerName}
          </button>
        </div>
      </div>
      <div className="status-strip">
        <span className={`icon-chip ${online ? "" : "offline"}`}>
          <span className="dot" />
          {online ? "연결됨" : "오프라인"}
        </span>
        {unreadCount > 0 && (
          <span>
            <Bell size={14} /> 새 소식 <b className="badge-unread">{unreadCount}</b>
          </span>
        )}
        {micState === "listening" && (
          <span>
            <Mic size={14} /> 듣는 중
          </span>
        )}
        {micState === "speaking" && (
          <span>
            <Volume2 size={14} /> 말하는 중
          </span>
        )}
      </div>
    </header>
  );
}
