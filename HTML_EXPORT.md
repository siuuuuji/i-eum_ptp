# HTML 내보내기 기능 📥

씬 데이터를 독립 실행형 인터랙티브 HTML 파일로 변환합니다.

## 특징

- ✅ **완전한 독립성** - 인터넷 연결 필요 없음 (이미지 URL 사용 시 제외)
- ✅ **반응형 디자인** - 모든 기기에서 정상 표시
- ✅ **풍부한 상호작용** - 화살표, 버튼, 인디케이터
- ✅ **자동 재생** - 선택 가능한 자동 재생 모드
- ✅ **키보드 네비게이션** - 화살표 키 지원
- ✅ **프린트 최적화** - 페이지 인쇄 가능

## 사용법

### 기본 사용

```typescript
import { useHTMLExport } from '@/lib/useHTMLExport'

function MyComponent() {
  const { exportAsHTML, isExporting } = useHTMLExport()

  const handleExport = async () => {
    await exportAsHTML(scenes, template, 'My Project')
  }

  return (
    <button onClick={handleExport} disabled={isExporting}>
      {isExporting ? '내보내는 중...' : '내보내기'}
    </button>
  )
}
```

### 옵션 포함

```typescript
await exportAsHTML(scenes, template, 'My Project', {
  autoPlay: true,        // 자동 재생 (5초 간격)
  showNavigation: true   // 네비게이션 버튼 표시
})
```

## API 레퍼런스

### `exportAsHTML(scenes, template, projectName?, options?)`

씬을 HTML로 내보내고 파일로 다운로드합니다.

**매개변수:**
- `scenes` (Scene[]): 씬 배열
  - `id` (string): 씬 ID
  - `index` (number): 씬 순서
  - `text` (string): 씬 텍스트
  - `imageUrl` (string, 선택): 이미지 URL
- `template` (Template): 템플릿 정보
  - `layout` (string): 레이아웃 타입
  - `font` (string): 폰트 이름
  - `color` (string): 색상 이름
  - `animation` (string): 애니메이션
- `projectName` (string, 선택): 프로젝트명 (기본값: "Interactive Scene")
- `options` (선택):
  - `autoPlay` (boolean): 자동 재생 여부 (기본값: false)
  - `showNavigation` (boolean): 네비게이션 표시 여부 (기본값: true)

**반환값:**
```typescript
{
  success: boolean    // 내보내기 성공 여부
  filename: string    // 저장된 파일명
}
```

### `getHTML(scenes, template, projectName?, options?)`

HTML 문자열만 반환 (다운로드 하지 않음)

```typescript
const html = await getHTML(scenes, template, 'My Project')
console.log(html) // HTML 소스
```

### React 훅 API

```typescript
const {
  isExporting,     // boolean - 내보내는 중 여부
  error,           // string | null - 에러 메시지
  progress,        // number - 진행도 (0-100)
  exportAsHTML,    // 함수 - HTML로 내보내기
  getHTML,         // 함수 - HTML 생성만 하기
  resetState       // 함수 - 상태 초기화
} = useHTMLExport()
```

## 생성되는 HTML 구조

### 기본 레이아웃

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- 메타데이터, 스타일 -->
  </head>
  <body>
    <!-- 헤더: 프로젝트명, 템플릿 정보 -->
    <div class="header"></div>

    <!-- 콘텐츠: 씬 컨테이너들 -->
    <div class="content">
      <div class="scene-container">
        <!-- 이미지 + 텍스트 -->
      </div>
    </div>

    <!-- 푸터: 네비게이션 컨트롤 -->
    <div class="footer">
      <!-- 이전/다음 버튼, 인디케이터 -->
    </div>

    <!-- JavaScript: 상호작용 로직 -->
    <script>...</script>
  </body>
</html>
```

## 레이아웃 타입

### 1. top - 이미지 위, 텍스트 아래
```
┌─────────────┐
│   이미지     │
├─────────────┤
│   텍스트     │
└─────────────┘
```

### 2. bottom - 이미지 아래, 텍스트 위
```
┌─────────────┐
│   텍스트     │
├─────────────┤
│   이미지     │
└─────────────┘
```

### 3. left - 이미지 좌측, 텍스트 우측
```
┌────┬────────┐
│ 이 │  텍스트 │
│ 미 │        │
│ 지 ├────────┤
└────┘
```

### 4. right - 이미지 우측, 텍스트 좌측
```
┌────────┬──┐
│ 텍스트 │이│
│       │미│
├────────┤지│
       └──┘
```

### 5. full - 풀 스크린 이미지 + 오버레이
```
┌──────────────┐
│   이미지 배경 │
│ (텍스트 오버)│
└──────────────┘
```

### 6. grid - 그리드 레이아웃
```
┌──┬──┬──┐
│이│미│지│
├──┼──┼──┤
│텍│스│트│
└──┴──┴──┘
```

## 색상 스키마

### 차가운 블루
- Primary: #0f172a
- Accent: #3b82f6
- Text: #f1f5f9

### 따뜻한 오렌지
- Primary: #7c2d12
- Accent: #f97316
- Text: #fefce8

### 신비로운 보라
- Primary: #2e1065
- Accent: #a855f7
- Text: #faf5ff

### 세련된 회색
- Primary: #1f2937
- Accent: #9ca3af
- Text: #f9fafb

### 생생한 무지개
- Primary: #831843
- Accent: #ec4899
- Text: #fdf2f8

### 어두운 밤
- Primary: #0c0a09
- Accent: #78716c
- Text: #faf8f7

## 상호작용 기능

### 네비게이션 방식

1. **버튼 클릭**
   - "이전" / "다음" 버튼

2. **인디케이터 클릭**
   - 씬 넘버 아래 점 클릭

3. **키보드**
   - 좌향키: 이전 씬
   - 우향키: 다음 씬

4. **터치** (모바일)
   - 스와이프 지원 (향후)

### 자동 재생

옵션 활성화 시:
- 각 씬 5초 표시
- 마지막 씬 후 중지
- 수동 조작 시 중지

## 실전 예제

### 기본 내보내기

```typescript
function ExportButton() {
  const { exportAsHTML, isExporting } = useHTMLExport()

  return (
    <button
      onClick={() => exportAsHTML(scenes, template, '나의 씬')}
      disabled={isExporting}
    >
      {isExporting ? '내보내는 중...' : 'HTML 내보내기'}
    </button>
  )
}
```

### 옵션 설정

```typescript
async function ExportWithOptions() {
  const { exportAsHTML } = useHTMLExport()

  await exportAsHTML(scenes, template, '스토리', {
    autoPlay: true,        // 자동 재생
    showNavigation: true   // 네비게이션 표시
  })
}
```

### 진행도 표시

```typescript
function ExportWithProgress() {
  const { exportAsHTML, progress, isExporting } = useHTMLExport()

  return (
    <div>
      <button onClick={() => exportAsHTML(scenes, template, '프로젝트')}>
        내보내기
      </button>
      {isExporting && (
        <progress value={progress} max={100} />
      )}
    </div>
  )
}
```

### HTML 문자열 처리

```typescript
async function GetHTMLString() {
  const { getHTML } = useHTMLExport()

  // HTML 문자열만 받기 (다운로드 안 함)
  const html = await getHTML(scenes, template, '프로젝트')

  // 클립보드에 복사
  await navigator.clipboard.writeText(html)

  // 또는 전송
  await fetch('/api/save', {
    method: 'POST',
    body: html
  })
}
```

## 성능 최적화

### 이미지 최적화

- Pollinations.ai 이미지 사용 권장 (1024x1024)
- 또는 WebP 형식 사용
- 로컬 테스트 시 data URL 사용 가능

```typescript
// Base64로 변환 (로컬 테스트 전용)
const canvas = document.createElement('canvas')
canvas.width = 1024
canvas.height = 1024
const dataUrl = canvas.toDataURL('image/webp')
```

### 파일 크기

- 이미지 3개 + 텍스트: ~100-200KB
- 이미지 10개: ~500KB-1MB
- 최적화 후: 50-70% 감소

## 배포 및 공유

### 온라인 공유

생성된 HTML 파일을 직접 공유:
1. GitHub Pages
2. Netlify Drop
3. Vercel
4. 이메일 첨부

### 웹 통합

```html
<!-- iframe으로 임베드 -->
<iframe
  src="path/to/exported.html"
  width="100%"
  height="600px"
></iframe>
```

### 자체 호스팅

```bash
# 간단한 HTTP 서버
python -m http.server 8000
# http://localhost:8000/exported.html
```

## 제약사항

### 이미지 URL 제약
- 외부 이미지 URL 사용 시 인터넷 필요
- CORS 정책 준수
- Pollinations.ai는 CORS 지원

### 브라우저 호환성
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- IE 미지원

## 문제 해결

### 파일 다운로드 안 됨
1. 브라우저 다운로드 설정 확인
2. 팝업 차단 확인
3. 파일명에 특수문자 없는지 확인

### 이미지 미표시
1. 이미지 URL 유효성 확인
2. 네트워크 연결 확인
3. CORS 정책 확인
4. 브라우저 콘솔 에러 확인

### 스타일 깨짐
1. CSS 인라인 포함 확인
2. 폰트 로드 확인
3. 색상값 확인

## 향후 계획

### v1.1
- [ ] 스와이프 제스처 (모바일)
- [ ] 전체화면 모드
- [ ] 음성 나레이션

### v1.2
- [ ] 비디오 내보내기
- [ ] PDF 내보내기
- [ ] 사용자 정의 CSS

### v2.0
- [ ] 협업 공유
- [ ] 온라인 호스팅
- [ ] 분석 추적

---

**문서 버전**: 1.0  
**마지막 업데이트**: 2026-09-17
