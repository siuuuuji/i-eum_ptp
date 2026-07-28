import { Mascot } from "../../components/common/Mascot";

export function SplashScreen() {
  return (
    <div className="loading">
      <Mascot mood="calm" size={110} />
      <div>
        <div style={{ font: "700 2.1rem 'Gowun Batang', serif" }}>이음</div>
        <p>가족의 기억을 불러오고 있어요.</p>
      </div>
    </div>
  );
}
