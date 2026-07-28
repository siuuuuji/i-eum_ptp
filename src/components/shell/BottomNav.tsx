import { BookOpen, Home, Mic, Radio, Settings } from "lucide-react";
import type { Tab } from "../../App";

const ITEMS: { tab: Tab; label: string; icon: React.ReactNode; prominent?: boolean }[] = [
  { tab: "home", label: "홈", icon: <Home /> },
  { tab: "story", label: "이야기", icon: <Mic /> },
  { tab: "radio", label: "가족 라디오", icon: <Radio />, prominent: true },
  { tab: "book", label: "내 책", icon: <BookOpen /> },
  { tab: "more", label: "더보기", icon: <Settings /> }
];

export function BottomNav({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav className="bottom-nav" aria-label="주요 메뉴">
      {ITEMS.map((item) => (
        <button
          key={item.tab}
          className={`${active === item.tab ? "active" : ""} ${item.prominent ? "prominent" : ""}`}
          onClick={() => onChange(item.tab)}
          aria-current={active === item.tab ? "page" : undefined}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
