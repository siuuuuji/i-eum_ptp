# 이음(i-eum)

시니어가 AI와 음성으로 삶의 기억을 이야기하면 기록과 자서전으로 쌓이고, 가족이 보낸 소식은 정해진 시간에 라디오처럼 들려주는 가족 기억 플랫폼입니다. `앱PRD.pdf`(이음 플랫폼 PRD v0.1)를 기능 기준으로 구현했습니다.

## 이 저장소에 담긴 앱

| 앱 | 주소 | 설명 |
| --- | --- | --- |
| 이음(i-eum) | `/` | 시니어의 기억을 AI 음성 대화로 기록하는 가족 기억 플랫폼 |
| 천리말랑 퀘스트보드 | `/malang` | 백락정령·천리말랑이 두 사람이 할 일을 나누고 함께 해내는 투두 웹앱 ([문서](docs/MALANG-QUESTBOARD.md)) |

두 앱은 같은 Vite 프로젝트의 별도 진입점입니다. `npm run dev` 한 번으로 둘 다 뜹니다
(`http://localhost:5173/` 와 `http://localhost:5173/malang.html`).

---

## 이번 버전의 범위

- **화면/흐름**: PRD 8장의 필수 화면과 상태를 모두 시드 데이터 기반으로 구현했습니다 (역할 선택, 가족 연결, 온보딩, 역할별 홈, AI 기억 대화, 기억 보관함, 자서전, 가족 소식/라디오, 설정).
- **AI**: Google Gemini API로 (1) 기억 대화 후속 질문, (2) 대화 종료 후 제목·요약·태그·확인 필요 항목 정리, (3) 승인된 기억으로 자서전 페이지 초안 생성, (4) 가족 소식으로 라디오 방송 대본 생성을 실제로 호출합니다. 모든 프롬프트는 PRD 7장의 시스템 지침을 그대로 사용합니다.
- **음성**: 브라우저 내장 Web Speech API로 음성 인식(STT)과 음성 합성(TTS)을 처리합니다. 별도 음성 API 비용이 들지 않지만 브라우저 지원 범위(Chrome 계열 우선)를 탑니다.
- **데이터 저장**: 이번 범위에서는 실 서버/DB 연동을 제외했습니다. 모든 상태(가족 그룹, 기억, 자서전, 소식, 라디오, 설정)는 브라우저 `localStorage`에만 저장되는 데모/파일럿 프로토타입입니다. 데모 완료 조건에 따라 화면 안에서 기록자·가족 역할을 즉시 전환할 수 있는 역할 전환 버튼을 제공합니다.
- **권한/공개 범위**: 가족 전체/나만 보기/선택 공개 규칙과, 자서전 페이지가 원본 기억 중 가장 제한적인 권한을 상속하는 로직(BOOK-06)을 실제로 검증할 수 있습니다.

## 이전 버전과 달라진 점

기존 `src/App.tsx` 단일 파일 + Supabase 이메일 인증 기반 MVP는 최신 PRD 범위(역할별 경험, AI 음성 대화, 자서전, 가족 라디오 방송 생성)에 비해 기능이 훨씬 단순했습니다. 이번 작업에서는 PRD와 무관한 이전 Supabase 인증/DB 연동 코드(`src/lib/supabase.ts`, `@supabase/supabase-js` 의존성)를 제거하고, `docs/PRD-MVP.md`에 있던 예전 범위 대신 `앱PRD.pdf` 기준으로 전체를 다시 설계했습니다. `supabase/migrations`는 추후 실제 백엔드를 붙일 때 참고할 수 있도록 남겨두었습니다.

## 로컬 실행

Node.js 20 이상이 필요합니다.

```bash
npm install
npm run dev
```

`npm run dev`는 Vite dev 서버 안에 `/api/gemini` 프록시 미들웨어를 함께 띄우므로 별도 서버 없이 로컬에서 AI 기능까지 테스트할 수 있습니다.

## Gemini API 키 설정

`.env.local` 파일에 서버 전용 값으로 설정합니다. **`VITE_` 접두사를 붙이면 브라우저 번들에 그대로 노출되므로 절대 붙이지 마세요.**

```env
GEMINI_API_KEY=발급받은_Gemini_API_키
GEMINI_MODEL=gemini-2.0-flash
```

키는 `api/_gemini.ts`(서버 전용 모듈)에서만 읽으며, 클라이언트 코드와 네트워크 응답에는 절대 포함되지 않습니다(`api/gemini.ts`가 Vercel 서버리스 함수로, `vite.config.ts`의 dev 미들웨어가 로컬 개발용으로 동일한 역할을 합니다).

## 배포 (Vercel)

- GitHub 저장소를 Vercel에 Import 하면 `api/gemini.ts`가 자동으로 서버리스 함수로 배포됩니다.
- Vercel 프로젝트 환경 변수에 `GEMINI_API_KEY`(및 필요 시 `GEMINI_MODEL`)를 등록하세요.
- Build Command: `npm run build`, Output Directory: `dist`.

## Firebase Hosting으로 정적 배포만 하는 경우

Firebase Hosting은 정적 파일만 서빙하므로 `/api/gemini`가 동작하지 않습니다. AI 기능 없이 화면 프로토타입만 확인할 때 사용하세요.

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # 공개 폴더: dist, SPA 설정: Yes
npm run build
firebase deploy
```

## 알려진 제한 (다음 단계 후보)

- 계정/가족 그룹은 실제 DB가 아닌 로컬 저장소 시드 데이터입니다. 여러 기기 간 실시간 동기화는 지원하지 않습니다(PRD 12.3 B단계).
- 실시간 양방향 음성 스트리밍(예: Gemini Live API) 대신 STT → 텍스트 생성 → TTS 흐름으로 준실시간 대화를 구현했습니다.
- 가족의 사진/음성 소식 원본 파일은 저장하지 않고 설명 텍스트만 사용합니다.
- 자서전 PDF 내보내기, 가족 반응/수정 제안 승인 흐름은 P1 항목으로 화면에 안내만 되어 있고 완전히 구현되어 있지 않습니다.
- 뿌뿌 캐릭터는 제공된 캐릭터 시트를 참고해 단순화한 벡터 일러스트(`src/components/common/Mascot.tsx`)로 대체했습니다. 원본 3D 렌더링 이미지를 그대로 쓰려면 `public/mascot/`에 파일을 넣고 해당 컴포넌트에서 `<img>`로 교체하면 됩니다.

세부 제품 요구사항은 `앱PRD.pdf`(이음 플랫폼 PRD v0.1)에 정리되어 있습니다.
