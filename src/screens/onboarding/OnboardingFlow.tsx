import { useState } from "react";
import { BookHeart, Check, Play, Users } from "lucide-react";
import { useStore } from "../../state/store";
import { useToast } from "../../components/common/Toast";
import { Mascot } from "../../components/common/Mascot";
import { speak } from "../../lib/speech";
import { FAMILY_ADMIN_ID, RECORDER_ID } from "../../data/seed";
import type { AiVoiceSettings, Visibility } from "../../types";

type SignupRole = "recorder" | "family";

const RELATIONSHIPS = ["딸", "아들", "며느리", "사위", "손녀", "손자", "기타"];

export function OnboardingFlow() {
  const store = useStore();
  const { notify } = useToast();
  const family = store.state.family;

  const [signupRole, setSignupRole] = useState<SignupRole | null>(null);
  const [step, setStep] = useState(0);

  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  const [inviteInput, setInviteInput] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteVerified, setInviteVerified] = useState(false);

  const [relationship, setRelationship] = useState("딸");
  const [displayName, setDisplayName] = useState("");

  const [consentRequired, setConsentRequired] = useState(false);
  const [consentVoice, setConsentVoice] = useState(true);
  const [consentAi, setConsentAi] = useState(true);
  const [consentSharing, setConsentSharing] = useState(true);

  const [voiceTone, setVoiceTone] = useState<AiVoiceSettings["tone"]>("warm");
  const [voiceRate, setVoiceRate] = useState<AiVoiceSettings["rate"]>("normal");
  const [defaultVisibility, setDefaultVisibility] = useState<Visibility>("family");
  const [notifPermission, setNotifPermission] = useState<"default" | "granted" | "denied">(
    typeof Notification !== "undefined" ? (Notification.permission as "default" | "granted" | "denied") : "denied"
  );

  const steps =
    signupRole === "family"
      ? ["role", "phone", "otp", "invite", "relationship", "consent", "prefs"]
      : ["role", "phone", "otp", "inviteShare", "consent", "prefs"];
  const stepId = steps[step];

  function goNext() {
    setStep((s) => Math.min(steps.length - 1, s + 1));
  }
  function goBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  function requestOtp() {
    if (phone.replace(/\D/g, "").length < 10) {
      notify("휴대전화 번호를 정확히 입력해 주세요.");
      return;
    }
    setOtpSent(true);
    notify("인증번호를 보냈어요. (데모: 아무 6자리 숫자면 통과돼요)");
  }

  function verifyOtp() {
    if (otp.length !== 6) {
      setOtpError("6자리 숫자를 입력해 주세요.");
      return;
    }
    if (otp === "000000") {
      setOtpError("인증번호가 올바르지 않아요. 다시 시도해 주세요.");
      return;
    }
    setOtpError("");
    goNext();
  }

  function verifyInvite() {
    const code = inviteInput.trim().toUpperCase();
    if (!code) {
      setInviteError("초대 코드를 입력해 주세요.");
      return;
    }
    if (code === "EXPIRE1") {
      setInviteError("만료된 코드예요. 기록자에게 새 코드를 요청해 주세요.");
      return;
    }
    if (code !== family.inviteCode) {
      setInviteError("코드를 다시 확인해 주세요. 잘못된 코드예요.");
      return;
    }
    setInviteError("");
    setInviteVerified(true);
    notify("가족과 연결됐어요.");
    goNext();
  }

  function requestNotificationPermission() {
    if (typeof Notification === "undefined") {
      notify("이 브라우저에서는 알림을 지원하지 않아요.");
      return;
    }
    void Notification.requestPermission().then((result) => setNotifPermission(result));
  }

  function previewVoice() {
    const ok = speak(`안녕하세요. 오늘도 편안하게 이야기 나눠요.`, { rate: voiceRate });
    if (!ok) notify("이 기기에서는 음성 미리듣기를 지원하지 않아요.");
  }

  function finish() {
    store.completeOnboarding({
      requiredAccepted: consentRequired,
      voiceProcessing: consentVoice,
      aiGeneration: consentAi,
      familySharing: consentSharing
    });
    if (signupRole === "recorder") {
      store.updateAiVoice({ tone: voiceTone, rate: voiceRate });
      store.updateDefaultVisibility(defaultVisibility);
      store.setActiveViewer(RECORDER_ID);
    } else {
      store.setActiveViewer(FAMILY_ADMIN_ID);
    }
    store.updateSchedule({ notifyConversation: notifPermission !== "denied", notifyRadio: notifPermission !== "denied" });
    notify("이음에 오신 것을 환영해요.");
  }

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <Mascot mood={step === steps.length - 1 ? "happy" : "calm"} size={84} />
        <h1>
          {signupRole === "family" ? "가족의 이야기를\n함께 들어요" : "오늘의 기억을\n편안하게 들려주세요"}
        </h1>
        <p>{STEP_COPY[stepId] ?? ""}</p>
      </div>

      <div className="auth-body">
        <div className="step-dots" aria-hidden>
          {steps.map((s, i) => (
            <span key={s} className={i <= step ? "active" : ""} />
          ))}
        </div>

        {stepId === "role" && (
          <RoleStep
            onSelect={(role) => {
              setSignupRole(role);
              goNext();
            }}
          />
        )}

        {stepId === "phone" && (
          <div className="choice-group">
            <h2>휴대전화로 본인 확인</h2>
            <label className="field">
              휴대전화 번호
              <input
                inputMode="numeric"
                placeholder="010-0000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
            <button className="btn btn-primary" onClick={requestOtp}>
              인증번호 받기
            </button>
            {otpSent && (
              <button className="btn btn-text" onClick={goNext}>
                인증번호를 받았어요 · 다음
              </button>
            )}
            <button className="btn btn-text" onClick={goBack}>
              뒤로
            </button>
          </div>
        )}

        {stepId === "otp" && (
          <div className="choice-group">
            <h2>인증번호를 입력해 주세요</h2>
            <label className="field">
              6자리 인증번호
              <input
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
              />
            </label>
            {otpError && <p className="helper-text" style={{ color: "var(--error)" }}>{otpError}</p>}
            <button className="btn btn-primary" onClick={verifyOtp}>
              확인
            </button>
            <button className="btn btn-text" onClick={goBack}>
              뒤로
            </button>
          </div>
        )}

        {stepId === "invite" && (
          <div className="choice-group">
            <h2>가족 초대 코드를 입력해 주세요</h2>
            <p className="helper-text">기록자에게 받은 6자리 코드를 입력하면 가족 공간에 연결돼요.</p>
            <label className="field">
              초대 코드
              <input
                maxLength={6}
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value.toUpperCase())}
                placeholder="예: IEUM26"
              />
            </label>
            {inviteError && <p className="helper-text" style={{ color: "var(--error)" }}>{inviteError}</p>}
            {inviteVerified && <p className="helper-text" style={{ color: "var(--forest)" }}>연결 완료 ✓</p>}
            <button className="btn btn-primary" onClick={verifyInvite}>
              연결하기
            </button>
            <button className="btn btn-text" onClick={goBack}>
              뒤로
            </button>
          </div>
        )}

        {stepId === "inviteShare" && (
          <div className="choice-group">
            <h2>가족을 초대해 주세요</h2>
            <p className="helper-text">이 코드를 가족에게 알려주면 같은 가족 공간에 연결돼요. 나중에 설정에서도 볼 수 있어요.</p>
            <div className="invite-card">
              <small>가족 연결 코드</small>
              <strong>{family.inviteCode}</strong>
              <button
                className="btn btn-secondary btn-inline"
                onClick={() => {
                  void navigator.clipboard?.writeText(family.inviteCode);
                  notify("초대 코드를 복사했어요.");
                }}
              >
                코드 복사
              </button>
            </div>
            <button className="btn btn-primary" onClick={goNext}>
              다음
            </button>
            <button className="btn btn-text" onClick={goBack}>
              뒤로
            </button>
          </div>
        )}

        {stepId === "relationship" && (
          <div className="choice-group">
            <h2>가족과의 관계를 알려주세요</h2>
            <div className="choice-group" style={{ gridTemplateColumns: "1fr 1fr", display: "grid" }}>
              {RELATIONSHIPS.map((r) => (
                <button
                  key={r}
                  className={`choice-card ${relationship === r ? "selected" : ""}`}
                  onClick={() => setRelationship(r)}
                >
                  <strong>{r}</strong>
                </button>
              ))}
            </div>
            <label className="field">
              표시 이름
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="가족에게 보일 이름" />
            </label>
            <button className="btn btn-primary" onClick={goNext} disabled={!displayName.trim()}>
              다음
            </button>
            <button className="btn btn-text" onClick={goBack}>
              뒤로
            </button>
          </div>
        )}

        {stepId === "consent" && (
          <div className="choice-group">
            <h2>동의가 필요해요</h2>
            <div className={`consent-item required`}>
              <input type="checkbox" checked={consentRequired} onChange={(e) => setConsentRequired(e.target.checked)} />
              <div>
                <strong>서비스 이용약관 및 개인정보 처리방침</strong>
                <small>이음 이용을 위해 꼭 필요한 동의예요.</small>
              </div>
            </div>
            <div className="consent-item">
              <input type="checkbox" checked={consentVoice} onChange={(e) => setConsentVoice(e.target.checked)} />
              <div>
                <strong>음성 처리 동의</strong>
                <small>AI 음성 대화를 인식하고 처리하기 위해 사용해요.</small>
              </div>
            </div>
            <div className="consent-item">
              <input type="checkbox" checked={consentAi} onChange={(e) => setConsentAi(e.target.checked)} />
              <div>
                <strong>AI 생성 활용 동의</strong>
                <small>말씀을 바탕으로 기억 카드와 자서전 초안을 만드는 데 사용해요.</small>
              </div>
            </div>
            <div className="consent-item">
              <input type="checkbox" checked={consentSharing} onChange={(e) => setConsentSharing(e.target.checked)} />
              <div>
                <strong>가족 공개 동의</strong>
                <small>허용한 범위의 가족에게만 기록을 보여줘요.</small>
              </div>
            </div>
            <button className="btn btn-primary" onClick={goNext} disabled={!consentRequired}>
              다음
            </button>
            <button className="btn btn-text" onClick={goBack}>
              뒤로
            </button>
          </div>
        )}

        {stepId === "prefs" && (
          <div className="choice-group">
            <h2>{signupRole === "recorder" ? "목소리와 알림을 맞춰볼까요" : "알림 시간을 확인해 주세요"}</h2>

            {signupRole === "recorder" && (
              <>
                <p className="helper-text">AI의 말투와 속도를 골라 보세요. 다음 대화부터 적용돼요.</p>
                <div className="segmented">
                  {(["warm", "calm", "bright"] as const).map((t) => (
                    <button key={t} className={voiceTone === t ? "active" : ""} onClick={() => setVoiceTone(t)}>
                      {{ warm: "다정하게", calm: "차분하게", bright: "밝게" }[t]}
                    </button>
                  ))}
                </div>
                <div className="segmented">
                  {(["slow", "normal", "fast"] as const).map((r) => (
                    <button key={r} className={voiceRate === r ? "active" : ""} onClick={() => setVoiceRate(r)}>
                      {{ slow: "느림", normal: "보통", fast: "빠름" }[r]}
                    </button>
                  ))}
                </div>
                <button className="btn btn-secondary" onClick={previewVoice}>
                  <Play size={16} /> 1문장 미리 듣기
                </button>

                <p className="helper-text">저장할 기억의 기본 공개 범위를 골라 주세요. 언제든 바꿀 수 있어요.</p>
                <div className="segmented">
                  {(["family", "private"] as const).map((v) => (
                    <button key={v} className={defaultVisibility === v ? "active" : ""} onClick={() => setDefaultVisibility(v)}>
                      {v === "family" ? "가족 전체" : "나만 보기"}
                    </button>
                  ))}
                </div>
              </>
            )}

            {signupRole === "family" && (
              <p className="helper-text">가족 라디오는 하루 1~2회 정해진 시간에 들려드려요. 기록자의 비공개 기억은 보이지 않아요.</p>
            )}

            <button className="btn btn-secondary" onClick={requestNotificationPermission}>
              알림 허용하기 {notifPermission === "granted" ? "· 허용됨" : notifPermission === "denied" ? "· 거부됨" : ""}
            </button>

            <button className="btn btn-primary" onClick={finish}>
              <Check size={18} /> 시작하기
            </button>
            <button className="btn btn-text" onClick={finish}>
              건너뛰기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const STEP_COPY: Record<string, string> = {
  role: "천천히 말하고, 함께 듣고, 오래 간직하세요.",
  phone: "번호는 본인 확인에만 사용돼요.",
  otp: "문자로 받은 6자리 숫자를 입력해 주세요.",
  invite: "기록자가 알려준 코드로 안전하게 연결돼요.",
  relationship: "가족 호칭은 방송과 화면에 그대로 쓰여요.",
  consent: "무엇에 동의하는지 하나씩 알려드려요.",
  prefs: "언제든 설정에서 다시 바꿀 수 있어요."
};

function RoleStep({ onSelect }: { onSelect: (role: SignupRole) => void }) {
  return (
    <div className="choice-group">
      <h2>이음을 어떻게 시작할까요?</h2>
      <button className="choice-card" onClick={() => onSelect("recorder")}>
        <BookHeart size={22} />
        <div>
          <strong>내 이야기를 기록할게요</strong>
          <small>AI와 음성으로 삶의 기억을 남겨요.</small>
        </div>
      </button>
      <button className="choice-card" onClick={() => onSelect("family")}>
        <Users size={22} />
        <div>
          <strong>가족과 함께할게요</strong>
          <small>소식을 전하고 기억을 함께 봐요.</small>
        </div>
      </button>
    </div>
  );
}
