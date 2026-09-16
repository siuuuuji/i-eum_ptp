# 효과음 시스템 🎵

Web Audio API를 기반으로 한 순수 생성 효과음 시스템입니다.

## 특징

- ✅ 외부 파일 없음 (완전히 순수한 Web Audio API)
- ✅ 동적 음성 생성
- ✅ 실시간 음량 조절
- ✅ 복합 효과 지원 (페이드, 트렌지션 등)
- ✅ 브라우저 호환성 우수

## 설치 및 사용

### 기본 사용

```typescript
import { useSoundEffect } from '@/lib/useSoundEffect'

function MyComponent() {
  const sound = useSoundEffect()

  return (
    <button onClick={() => sound.playClick()}>
      클릭
    </button>
  )
}
```

## API 레퍼런스

### 장면 효과음

#### `playFadeIn(volume?, duration?)`
신비로운 페이드인 효과음 (우상향 음)

```typescript
sound.playFadeIn(0.3, 0.8) // 음량 30%, 0.8초
```

#### `playFadeOut(volume?, duration?)`
마무리 페이드아웃 효과음 (우하향 음)

```typescript
sound.playFadeOut(0.3, 0.8)
```

#### `playSceneTransition(volume?, frequency?, duration?)`
부드러운 장면 전환 음악

```typescript
sound.playSceneTransition(0.2, 440, 1) // 기본 음 440Hz, 1초
```

### 상호작용 효과음

#### `playClick(volume?, duration?)`
버튼 클릭 효과음

```typescript
sound.playClick(0.15, 0.05)
```

#### `playNotification(volume?, duration?)`
알림 효과음 (두 음의 조합)

```typescript
sound.playNotification(0.2, 0.2)
```

### 상태 효과음

#### `playSuccess(volume?, duration?)`
성공 (주요 3화음 C5-E5-G5)

```typescript
sound.playSuccess(0.15, 0.4)
```

#### `playError(volume?, duration?)`
에러 (불안감 연출 F4-D4)

```typescript
sound.playError(0.15, 0.4)
```

### 제어 기능

#### `setVolume(value)`
전체 음량 설정 (0.0 ~ 1.0)

```typescript
sound.setVolume(0.5) // 50%
```

#### `getVolume()`
현재 음량 조회

```typescript
const currentVolume = sound.getVolume()
```

#### `fadeVolume(startVolume, endVolume, duration)`
음량 페이드 (비동기)

```typescript
await sound.fadeVolume(1.0, 0.0, 2) // 2초에 걸쳐 페이드아웃
```

#### `stop(id)`
특정 효과음 중지

```typescript
const id = sound.playFadeIn()
sound.stop(id)
```

#### `stopAll()`
모든 효과음 중지

```typescript
sound.stopAll()
```

## 실전 예제

### 페이지 로드 효과음

```typescript
function App() {
  const sound = useSoundEffect()

  useEffect(() => {
    sound.playFadeIn(0.2, 0.6) // 부드러운 시작
  }, [])

  return <div>...</div>
}
```

### 사용자 상호작용 피드백

```typescript
function NewsSubmit() {
  const sound = useSoundEffect()
  
  const handleSubmit = async () => {
    sound.playClick() // 즉각적인 피드백
    try {
      await submitNews()
      sound.playSuccess() // 성공 알림
    } catch {
      sound.playError() // 에러 알림
    }
  }

  return <button onClick={handleSubmit}>제출</button>
}
```

### 장면 전환 효과

```typescript
function SceneTransition() {
  const sound = useSoundEffect()

  const goToNextScene = async () => {
    sound.playFadeOut() // 현재 장면 페이드아웃
    // 장면 전환 로직...
    sound.playFadeIn() // 새 장면 페이드인
  }

  return <button onClick={goToNextScene}>다음</button>
}
```

### 음량 제어

```typescript
function VolumeControl() {
  const sound = useSoundEffect()

  return (
    <input
      type="range"
      min="0"
      max="100"
      onChange={(e) => sound.setVolume(parseInt(e.target.value) / 100)}
    />
  )
}
```

## 데모 컴포넌트

모든 효과음을 테스트할 수 있는 데모 컴포넌트:

```typescript
import { SoundEffectDemo } from '@/components/common/SoundEffectDemo'

export default function App() {
  return <SoundEffectDemo />
}
```

## 음성 설계

각 효과음은 특정한 감정을 유발하도록 설계되었습니다:

| 효과음 | 주파수 범위 | 감정 | 용도 |
|--------|----------|------|------|
| 페이드인 | 200~800Hz | 기대감 | 씬 시작 |
| 페이드아웃 | 800~200Hz | 마무리 | 씬 종료 |
| 클릭 | 150Hz + 고주파 필터 | 즉각성 | 버튼 클릭 |
| 성공 | C5-E5-G5 화음 | 긍정 | 작업 완료 |
| 에러 | F4-D4 화음 | 경고 | 오류 발생 |
| 알림 | 800→600Hz | 주의 | 알림 |

## 브라우저 호환성

- ✅ Chrome 14+
- ✅ Firefox 25+
- ✅ Safari 6+
- ✅ Edge 12+
- ⚠️ IE 11 (지원 안 함)

## 주의사항

1. **사용자 상호작용 필요**: 대부분의 브라우저는 사용자 상호작용 후 오디오 재생을 허용합니다.
2. **음량 설정**: 사용자의 귀를 보호하기 위해 적절한 음량을 설정하세요.
3. **성능**: 너무 많은 효과음을 동시에 재생하면 성능이 저하될 수 있습니다.

## 커스터마이징

새로운 효과음을 추가하려면 `soundEffect.ts`에 메서드를 추가하세요:

```typescript
playCustomSound(options: SoundConfig = {}): string {
  const id = `custom-${Date.now()}`
  const context = this.getContext()
  const gain = this.getMasterGain()

  const osc = context.createOscillator()
  const oscGain = context.createGain()

  // 당신의 사운드 로직...

  osc.connect(oscGain)
  oscGain.connect(gain)
  osc.start(context.currentTime)
  osc.stop(context.currentTime + (options.duration || 0.5))

  return id
}
```
