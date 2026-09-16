import { Volume2, VolumeX } from 'lucide-react'
import { useSoundEffect } from '../../lib/useSoundEffect'

export function SoundEffectDemo() {
  const sound = useSoundEffect()

  return (
    <div className="p-4 space-y-4 bg-slate-900 rounded-lg border border-slate-700">
      <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
        <Volume2 size={16} />
        효과음 테스트
      </h3>

      {/* 음량 조절 */}
      <div className="space-y-2">
        <label className="text-xs text-slate-400">전체 음량</label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="50"
            onChange={(e) => sound.setVolume(parseInt(e.target.value) / 100)}
            className="flex-1 h-1 bg-slate-700 rounded-lg cursor-pointer"
          />
          <VolumeX size={16} className="text-slate-400" />
        </div>
      </div>

      {/* 장면 효과음 */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-300">씬 전환</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => sound.playFadeIn()}
            className="px-3 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition"
          >
            페이드인 ↗️
          </button>
          <button
            onClick={() => sound.playFadeOut()}
            className="px-3 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition"
          >
            페이드아웃 ↙️
          </button>
          <button
            onClick={() => sound.playSceneTransition()}
            className="px-3 py-2 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white rounded transition"
          >
            장면 전환 🎬
          </button>
        </div>
      </div>

      {/* 상호작용 효과음 */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-300">상호작용</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => sound.playClick()}
            className="px-3 py-2 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-white rounded transition"
          >
            클릭 🔘
          </button>
          <button
            onClick={() => sound.playNotification()}
            className="px-3 py-2 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-white rounded transition"
          >
            알림 🔔
          </button>
        </div>
      </div>

      {/* 상태 효과음 */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-300">결과</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => sound.playSuccess()}
            className="px-3 py-2 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded transition"
          >
            성공 ✅
          </button>
          <button
            onClick={() => sound.playError()}
            className="px-3 py-2 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded transition"
          >
            에러 ❌
          </button>
        </div>
      </div>

      {/* 일괄 제어 */}
      <button
        onClick={() => sound.stopAll()}
        className="w-full px-3 py-2 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-white rounded transition"
      >
        모든 소리 중지 🔇
      </button>

      {/* 사용 예시 */}
      <div className="mt-4 p-3 bg-slate-800 rounded text-xs text-slate-300 space-y-1">
        <p className="font-semibold text-slate-200">💡 사용 방법:</p>
        <code className="block text-slate-400">
          {'const sound = useSoundEffect()'}
          <br />
          {'sound.playFadeIn(0.3, 0.8)'}
          <br />
          {'sound.setVolume(0.5)'}
        </code>
      </div>
    </div>
  )
}
