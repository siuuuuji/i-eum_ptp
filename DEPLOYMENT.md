# 배포 가이드 🚀

NONEMAVL을 Vercel에 배포하는 방법입니다.

## 전제 조건

- Node.js 18 이상
- npm 또는 yarn
- Vercel 계정 (https://vercel.com)
- GitHub 계정

## 로컬 환경 설정

### 1. 환경 변수 설정

```bash
# .env 파일 생성
cp .env.example .env
```

`.env` 파일 편집:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_POLLINATIONS_API_URL=https://api.pollinations.ai/v1
```

**Gemini API 키 획득:**
1. https://ai.google.dev 방문
2. "Get API Key" 클릭
3. 새 API 키 생성
4. 키를 `.env`에 붙여넣기

### 2. 로컬 빌드 테스트

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:5173 방문
```

### 3. 프로덕션 빌드 테스트

```bash
# 빌드 실행
npm run build

# 빌드 결과물 미리보기
npm run preview
```

---

## Vercel 배포

### 방법 1: Vercel CLI (권장)

```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 배포
vercel
```

### 방법 2: GitHub 연동

1. **GitHub에 푸시**
   ```bash
   git push origin claude/photo-fade-transition-prototype-gjbern
   ```

2. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard 방문

3. **새 프로젝트 생성**
   - "Add New" → "Project" 클릭
   - GitHub 저장소 선택
   - Import

4. **환경 변수 설정**
   - Project Settings → Environment Variables
   - 다음 변수들 추가:
     - `VITE_GEMINI_API_KEY`: 당신의 Gemini API 키

5. **배포**
   - "Deploy" 클릭
   - 배포 완료 대기

### 방법 3: Vercel Dashboard 직접 업로드

1. **Vercel 대시보드** 방문
2. "Upload" → "Codebase Drag and Drop"
3. 프로젝트 폴더 업로드
4. 환경 변수 설정
5. 배포

---

## 배포 후 확인사항

### ✅ 체크리스트

- [ ] 배포 URL에 접속 가능
- [ ] 파일 업로드 정상 작동
- [ ] 분할 옵션 정상 작동
- [ ] 이미지 생성 정상 작동 (몇 초 소요)
- [ ] 효과음 정상 작동
- [ ] 내보내기 기능 정상 작동
- [ ] 모바일에서 UI 표시 정상

### 🔍 성능 확인

```bash
# Lighthouse 점수 확인
# Vercel 대시보드 → Analytics 탭에서 확인
```

---

## 환경 변수 관리

### Vercel 환경 변수 설정

1. **Project Settings 접속**
   - https://vercel.com/projects/[project-name]/settings/environment-variables

2. **변수 추가**
   ```
   Name: VITE_GEMINI_API_KEY
   Value: [Your API Key]
   ```

3. **재배포**
   - 환경 변수 변경 후 재배포 필요

### 로컬에서만 사용

`.env.local` (Git 제외):
```env
VITE_GEMINI_API_KEY=dev_key_here
```

---

## 커스텀 도메인 설정

1. **Domain Settings 접속**
   - Project Settings → Domains

2. **도메인 추가**
   - "Add Domain" 클릭
   - 도메인 입력

3. **DNS 설정**
   - 도메인 제공자에서 Vercel 네임서버로 변경
   - 또는 CNAME 레코드 추가

---

## 모니터링 및 로그

### Vercel 대시보드에서 확인

**Deployments 탭:**
- 배포 이력 확인
- 배포 로그 조회
- 롤백 가능

**Analytics 탭:**
- 성능 메트릭
- 에러 로그
- 사용자 통계

### 실시간 로그

```bash
# Vercel CLI로 로그 확인
vercel logs [project-name]
```

---

## 문제 해결

### 배포 실패

**1. 빌드 에러**
```bash
# 로컬에서 먼저 테스트
npm run build

# TypeScript 오류 확인
npm run typecheck
```

**2. 환경 변수 누락**
- Vercel 대시보드에서 환경 변수 확인
- 재배포

**3. 의존성 문제**
```bash
# 로컬에서 캐시 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 런타임 에러

**1. API 키 오류**
- 환경 변수에서 `VITE_GEMINI_API_KEY` 확인
- Vercel 재배포

**2. CORS 에러**
- Pollinations.ai는 CORS 지원
- 브라우저 콘솔에서 자세한 에러 확인

**3. 이미지 로드 실패**
- 캐시 삭제
- 브라우저 개발자 도구에서 네트워크 탭 확인

---

## 성능 최적화

### 캐싱 전략

```
정적 자산 (이미지, 폰트): 1년
API 응답: 1시간
HTML: 캐시 없음
```

vercel.json에서 이미 설정됨.

### 번들 크기 분석

```bash
# 분석 도구 설치
npm install --save-dev webpack-bundle-analyzer

# 빌드 시 분석
npm run build -- --analyze
```

### 이미지 최적화

- Pollinations.ai는 자동 최적화
- 1024x1024 기본 해상도
- WebP 자동 변환 (지원 브라우저)

---

## 보안 권장사항

### ✅ 완료 항목

- [x] HTTPS 자동 설정
- [x] 환경 변수 암호화
- [x] API 키 노출 방지 (.env 제외)

### 추가 권장사항

1. **API 키 로테이션**
   - 월 1회 API 키 변경

2. **Rate Limiting**
   - 사용자당 요청 제한 (향후)

3. **입력 검증**
   - 프롬프트 길이 제한
   - 프롬프트 내용 필터링

---

## 배포 후 업데이트

### 코드 업데이트

```bash
# 1. 로컬에서 변경
git add .
git commit -m "Update feature"

# 2. 푸시
git push origin claude/photo-fade-transition-prototype-gjbern

# 3. Vercel에서 자동 배포
# (GitHub 연동 시)
```

### 환경 변수 업데이트

1. Vercel 대시보드에서 직접 수정
2. "Redeploy" 버튼 클릭

---

## 배포 완료 확인

배포 URL 예시:
```
https://nonemavl.vercel.app
```

### 최종 체크

1. **URL 접속**
   ```bash
   curl https://[your-vercel-url]
   ```

2. **기능 테스트**
   - 텍스트 업로드
   - 분할 옵션 선택
   - 이미지 생성 (Pollinations.ai)
   - 내보내기

3. **성능 확인**
   - 페이지 로드 시간 < 2초
   - 이미지 생성 < 5초

---

## 지원 및 문제 보고

**문제 발생 시:**
1. Vercel 로그 확인
2. 로컬 환경 재구성
3. GitHub Issues에 보고

**연락처:**
- GitHub: [repository]
- Email: [support email]

---

## 다음 단계

배포 완료 후:
1. ✅ 사용자 테스트
2. ✅ 피드백 수집
3. ✅ 버그 수정
4. ✅ Phase 2 기능 구현 (프로젝트 저장)

---

**배포 버전**: 1.0.0  
**마지막 업데이트**: 2026-09-17
