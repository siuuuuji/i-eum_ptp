# Pollinations.ai 이미지 생성 🖼️

무료 AI 이미지 생성 API를 사용한 이미지 생성 시스템입니다.

## 특징

- ✅ **완전 무료** - API 키 불필요
- ✅ **빠른 생성** - 평균 2-5초
- ✅ **한글 지원** - 한글 프롬프트 직접 사용 가능
- ✅ **자동 캐싱** - 동일 프롬프트 재요청 시 즉시 반환
- ✅ **배치 생성** - 여러 이미지 일괄 생성

## 설치 및 사용

### 기본 사용

```typescript
import { useImageGenerator } from '@/lib/useImageGenerator'

function MyComponent() {
  const { generateImage, isLoading, imageUrl, error } = useImageGenerator()

  const handleGenerate = async () => {
    await generateImage('검은 구름 하늘, 외로운 소년')
  }

  return (
    <div>
      <button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? '생성 중...' : '이미지 생성'}
      </button>
      {imageUrl && <img src={imageUrl} alt="Generated" />}
      {error && <p>{error}</p>}
    </div>
  )
}
```

## API 레퍼런스

### `generateImage(options)`

일반 프롬프트로 이미지 생성

**매개변수:**
- `prompt` (string): 이미지 생성 프롬프트
- `width` (number, 선택): 이미지 너비 (기본값: 1024)
- `height` (number, 선택): 이미지 높이 (기본값: 1024)
- `seed` (number, 선택): 재현 가능한 결과를 위한 시드값

**반환값:**
- (string): 생성된 이미지 URL

**예제:**
```typescript
const url = await generateImage({
  prompt: '일몰, 해변, 황금빛',
  width: 768,
  height: 768
})
```

### `generateImageFromScene(sceneText)`

씬 텍스트를 기반으로 최적화된 프롬프트로 이미지 생성

**매개변수:**
- `sceneText` (string): 씬의 텍스트 내용
- `width` (number, 선택): 이미지 너비
- `height` (number, 선택): 이미지 높이

**반환값:**
- (string): 생성된 이미지 URL

**예제:**
```typescript
const url = await generateImageFromScene(
  '그 날 오후, 하늘은 검은 구름으로 물들어 있었다.'
)
```

### `generateImagesBatch(scenes)`

여러 씬의 이미지를 일괄 생성

**매개변수:**
- `scenes` (Array): 씬 배열
  - `id` (string): 씬 ID
  - `text` (string): 씬 텍스트

**반환값:**
- (Map<string, string>): 씬 ID → 이미지 URL 맵

**예제:**
```typescript
const results = await generateImagesBatch([
  { id: 'scene-1', text: '검은 구름 하늘' },
  { id: 'scene-2', text: '빈 거리' }
])
```

### `clearCache()`

캐시된 이미지 삭제

```typescript
clearCache()
```

### `resetState()`

컴포넌트 상태 초기화

```typescript
resetState()
```

## React 훅 API

```typescript
const {
  isLoading,        // boolean - 생성 중 여부
  error,            // string | null - 에러 메시지
  imageUrl,         // string | null - 생성된 이미지 URL
  generateImage,    // 함수 - 이미지 생성
  generateImageFromScene,  // 함수 - 씬 텍스트로 생성
  generateImagesBatch,     // 함수 - 배치 생성
  clearCache,       // 함수 - 캐시 삭제
  resetState,       // 함수 - 상태 초기화
  cacheSize         // number - 캐시된 이미지 개수
} = useImageGenerator()
```

## 실전 예제

### 씬 기반 이미지 생성

```typescript
function SceneCard({ scene }) {
  const { generateImageFromScene, imageUrl, isLoading, error } = useImageGenerator()

  useEffect(() => {
    // 씬 로드 시 자동으로 이미지 생성
    generateImageFromScene(scene.text).catch(console.error)
  }, [scene.text])

  if (isLoading) return <div>이미지 생성 중...</div>
  if (error) return <div>오류: {error}</div>
  if (!imageUrl) return <div>이미지 없음</div>

  return (
    <div>
      <img src={imageUrl} alt={scene.text} />
      <p>{scene.text}</p>
    </div>
  )
}
```

### 여러 씬 동시 생성

```typescript
async function GenerateAllSceneImages() {
  const { generateImagesBatch } = useImageGenerator()
  const [images, setImages] = useState<Map<string, string>>()

  const handleGenerate = async () => {
    const results = await generateImagesBatch(scenes)
    setImages(results)
  }

  return (
    <div>
      <button onClick={handleGenerate}>모든 씬 이미지 생성</button>
      {images && 
        scenes.map(scene => (
          <img key={scene.id} src={images.get(scene.id)} alt={scene.text} />
        ))
      }
    </div>
  )
}
```

### 프롬프트 미리보기

```typescript
function PromptPreview({ sceneText }) {
  const { generatePromptFromScene } = imageGenerator

  const prompt = generatePromptFromScene(sceneText)

  return (
    <div>
      <p>원본: {sceneText}</p>
      <p>생성될 프롬프트: {prompt}</p>
    </div>
  )
}
```

## 프롬프트 작성 팁

### 좋은 프롬프트 예

```
검은 구름, 외로운 소년, 거리, 영화적 조명, 4K, 디테일함
```

```
해질녘 해변, 황금빛, 조용한 분위기, 높은 품질 사진
```

```
도시 야경, 빗, 네온 불빛, 사이버펑크 스타일
```

### 주의사항

1. **구체성** - 더 구체적할수록 좋음
2. **스타일 키워드** - "cinematic", "atmospheric", "4k" 등 추가
3. **한글/영문 혼용** - 둘 다 지원
4. **불가능한 요청 피하기** - 너무 구체적인 인물 요청 등

## 성능 최적화

### 캐싱 활용

동일한 프롬프트 재요청 시 캐시에서 즉시 반환됩니다.

```typescript
// 첫 요청 - 2-5초
await generateImage({ prompt: '하늘' })

// 재요청 - 즉시 반환
await generateImage({ prompt: '하늘' })
```

### 배치 생성 최적화

여러 이미지를 생성할 때, 자동으로 요청 사이에 지연을 추가하여 API 부하를 줄입니다.

```typescript
// 각 이미지 사이에 500ms 지연
const results = await generateImagesBatch(scenes)
```

## 트러블슈팅

### 이미지 생성이 실패하는 경우

1. **네트워크 확인** - 인터넷 연결 확인
2. **프롬프트 확인** - 프롬프트가 비어있지 않은지 확인
3. **재시도** - 서버 부하로 실패할 수 있으니 재시도

### 이미지가 로드되지 않는 경우

1. **CORS 확인** - 브라우저 콘솔에서 CORS 에러 확인
2. **이미지 URL 확인** - URL이 정상인지 확인
3. **캐시 삭제** - `clearCache()` 호출 후 재시도

## 브라우저 호환성

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

## 데이터 사용

- 🔒 프롬프트는 서버에 저장되지 않습니다
- 🔒 생성된 이미지는 캐시됩니다
- ✅ HTTPS를 통한 안전한 통신

## 라이선스

Pollinations.ai는 생성된 이미지의 상업적 사용을 허용합니다.
자세한 내용은 https://pollinations.ai 를 참조하세요.
