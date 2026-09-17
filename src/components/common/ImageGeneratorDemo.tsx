import { useState } from 'react'
import { Image, Loader, AlertCircle } from 'lucide-react'
import { useImageGenerator } from '../../lib/useImageGenerator'

export function ImageGeneratorDemo() {
  const { isLoading, error, imageUrl, generateImageFromScene, resetState } = useImageGenerator()
  const [prompt, setPrompt] = useState('')

  const exampleScenes = [
    '그 날 오후, 하늘은 검은 구름으로 물들어 있었다.',
    '바람이 차갑게 뺨을 스친다. 거리는 적막함으로 가득 찼다.',
    '달빛 아래 도시의 불빛들이 하나둘 꺼지고 있었다.',
    '마지막 기차는 이미 떠나가고 없었다. 플랫폼은 텅 비어있었다.'
  ]

  const handleGenerateFromScene = async (scene: string) => {
    setPrompt(scene)
    try {
      await generateImageFromScene(scene, 768, 768)
    } catch {
      // 에러는 상태에 의해 처리됨
    }
  }

  const handleReset = () => {
    setPrompt('')
    resetState()
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6 bg-slate-900 rounded-lg border border-slate-700">
      <div className="flex items-center gap-3">
        <Image size={20} className="text-blue-400" />
        <h3 className="text-lg font-bold text-white">Pollinations.ai 이미지 생성</h3>
      </div>

      {/* 입력 영역 */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-300">씬 텍스트</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="이미지를 생성할 씬 텍스트를 입력하세요..."
          className="w-full h-24 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
        />
        <p className="text-xs text-slate-400">💡 팁: 한글도 지원됩니다!</p>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={() => handleGenerateFromScene(prompt)}
          disabled={isLoading || !prompt.trim()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition"
        >
          {isLoading ? (
            <>
              <Loader size={16} className="animate-spin" />
              생성 중...
            </>
          ) : (
            <>
              <Image size={16} />
              이미지 생성
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition"
        >
          초기화
        </button>
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="flex gap-3 p-4 bg-red-900/30 border border-red-600 rounded-lg">
          <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-300">생성 실패</p>
            <p className="text-xs text-red-200 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* 생성된 이미지 표시 */}
      {imageUrl && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-300">생성된 이미지</p>
          <div className="bg-slate-800 rounded-lg overflow-hidden">
            <img src={imageUrl} alt="Generated" className="w-full h-auto" />
          </div>
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
          >
            새 탭에서 보기 →
          </a>
        </div>
      )}

      {/* 예제 씬 */}
      <div className="space-y-3 pt-6 border-t border-slate-700">
        <p className="text-sm font-medium text-slate-300">예제 씬</p>
        <div className="grid grid-cols-1 gap-2">
          {exampleScenes.map((scene, idx) => (
            <button
              key={idx}
              onClick={() => handleGenerateFromScene(scene)}
              disabled={isLoading}
              className="text-left p-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-slate-300 hover:text-slate-200 rounded-lg transition"
            >
              {scene}
            </button>
          ))}
        </div>
      </div>

      {/* 정보 */}
      <div className="p-4 bg-slate-800 rounded-lg text-xs text-slate-400 space-y-2">
        <p className="font-semibold text-slate-300">📝 사용 방법:</p>
        <code className="block text-slate-300 bg-slate-900 p-2 rounded">
          {`const { generateImageFromScene } = useImageGenerator()\nawait generateImageFromScene("씬 텍스트")`}
        </code>
      </div>

      {/* 특징 */}
      <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 pt-4 border-t border-slate-700">
        <div>
          <p className="font-semibold text-slate-200">✅ 무료</p>
          <p className="text-slate-400">완전 무료 API</p>
        </div>
        <div>
          <p className="font-semibold text-slate-200">⚡ 빠름</p>
          <p className="text-slate-400">2-5초 생성</p>
        </div>
        <div>
          <p className="font-semibold text-slate-200">🌐 한글 지원</p>
          <p className="text-slate-400">한글 프롬프트 가능</p>
        </div>
        <div>
          <p className="font-semibold text-slate-200">💾 캐싱</p>
          <p className="text-slate-400">자동 캐싱</p>
        </div>
      </div>
    </div>
  )
}
