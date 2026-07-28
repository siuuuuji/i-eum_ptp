import { useMemo, useState } from "react";
import { StoreProvider, useStore } from "./state/store";
import { ToastProvider } from "./components/common/Toast";
import { SplashScreen } from "./screens/onboarding/SplashScreen";
import { OnboardingFlow } from "./screens/onboarding/OnboardingFlow";
import { TopStatusBar } from "./components/shell/TopStatusBar";
import { BottomNav } from "./components/shell/BottomNav";
import { RoleSwitcher } from "./components/shell/RoleSwitcher";
import { RecorderHome } from "./screens/home/RecorderHome";
import { FamilyHome } from "./screens/home/FamilyHome";
import { StoryScreen } from "./screens/story/StoryScreen";
import { BookScreen } from "./screens/book/BookScreen";
import { RadioScreen } from "./screens/radio/RadioScreen";
import { MoreScreen } from "./screens/more/MoreScreen";
import { ConversationScreen } from "./screens/conversation/ConversationScreen";
import { NewsComposeScreen } from "./screens/news/NewsComposeScreen";
import { canViewMemory, isRecorderViewer } from "./lib/visibility";
import { useSplashTimer } from "./lib/useSplashTimer";

export type Tab = "home" | "story" | "radio" | "book" | "more";
export type Overlay = "conversation" | "newsCompose" | null;

function Shell() {
  const store = useStore();
  const { state } = store;
  const [tab, setTab] = useState<Tab>("home");
  const [overlay, setOverlay] = useState<Overlay>(null);

  const viewer = useMemo(
    () => state.family.members.find((m) => m.id === state.activeViewerId) ?? state.family.members[0],
    [state.family.members, state.activeViewerId]
  );
  const recorderView = isRecorderViewer(viewer.id, state.family);

  const unreadCount = recorderView
    ? state.pages.filter((p) => p.status === "needs_review").length +
      state.newsItems.filter((n) => n.status === "scheduled").length
    : state.memories.filter(
        (m) => canViewMemory(m, viewer.id, state.family) && Date.now() - new Date(m.createdAt).getTime() < 3 * 24 * 60 * 60 * 1000
      ).length;

  if (!state.onboardingComplete) {
    return <OnboardingFlow />;
  }

  if (overlay === "conversation") {
    return <ConversationScreen onClose={() => setOverlay(null)} />;
  }
  if (overlay === "newsCompose") {
    return <NewsComposeScreen onClose={() => setOverlay(null)} />;
  }

  return (
    <div className="app-shell">
      <TopStatusBar
        groupName={state.family.name}
        viewerName={viewer.displayName}
        viewerRelationship={viewer.relationship}
        unreadCount={unreadCount}
        onOpenProfile={() => setTab("more")}
      />

      <main>
        {tab === "home" &&
          (recorderView ? (
            <RecorderHome
              onStartConversation={() => setOverlay("conversation")}
              onOpenRadio={() => setTab("radio")}
              onOpenBook={() => setTab("book")}
            />
          ) : (
            <FamilyHome viewerId={viewer.id} onComposeNews={() => setOverlay("newsCompose")} onOpenBook={() => setTab("book")} />
          ))}

        {tab === "story" && (
          <StoryScreen
            viewerId={viewer.id}
            recorderView={recorderView}
            onStartConversation={() => setOverlay("conversation")}
          />
        )}

        {tab === "radio" && <RadioScreen viewerId={viewer.id} recorderView={recorderView} onComposeNews={() => setOverlay("newsCompose")} />}

        {tab === "book" && <BookScreen viewerId={viewer.id} recorderView={recorderView} />}

        {tab === "more" && <MoreScreen viewer={viewer} recorderView={recorderView} />}
      </main>

      <RoleSwitcher members={state.family.members} activeId={state.activeViewerId} onSwitch={store.setActiveViewer} />
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

export default function App() {
  const showSplash = useSplashTimer(900);
  return (
    <ToastProvider>
      <StoreProvider>{showSplash ? <SplashScreen /> : <Shell />}</StoreProvider>
    </ToastProvider>
  );
}
