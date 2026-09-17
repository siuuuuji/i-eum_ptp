import { useState } from 'react'
import { Download, Loader, AlertCircle, CheckCircle } from 'lucide-react'
import { useHTMLExport } from '../../lib/useHTMLExport'

// 데모 데이터
const DEMO_SCENES = [
  {
    id: 'scene-1',
    index: 0,
    text: '그 날 오후, 하늘은 검은 구름으로 물들어 있었다. 소년은 거리를 걸어간다.',
    imageUrl: 'https://image.pollinations.ai/prompt/검은구름하늘,외로운소년,거리'
  },
  {
    id: 'scene-2',
    index: 1,
    text: '바람이 차갑게 뺨을 스친다. 거리는 적막함으로 가득 찼다.',
    imageUrl: 'https://image.pollinations.ai/prompt/바람,차가운밤,거리'
  },
  {
    id: 'scene-3',
    index: 2,
    text: '도시의 불빛들이 하나둘 꺼지고 있었다. 이것이 끝인가?',
    imageUrl: 'https://image.pollinations.ai/prompt/도시야경,밤,불빛'
  }
]

const DEMO_TEMPLATE = {
  layout: 'top',
  font: 'Noto Sans',
  color: '신비로운 보라',
  animation: 'fade'
}

export function HTMLExportDemo() {
  const { isExporting, error, progress, exportAsHTML } = useHTMLExport()
  const [projectName, setProjectName] = useState('나의 씬')
  const [autoPlay, setAutoPlay] = useState(false)
  const [showNavigation, setShowNavigation] = useState(true)
  const [exported, setExported] = useState(false)

  const handleExport = async () => {
    setExported(false)
    try {
      const result = await exportAsHTML(DEMO_SCENES, DEMO_TEMPLATE, projectName, {
        autoPlay,
        showNavigation
      })
      setExported(true)
      console.log('내보내기 완료:', result)
    } catch (err) {
      console.error('내보내기 실패:', err)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6 bg-slate-900 rounded-lg border border-slate-700">
      <div className="flex items-center gap-3">
        <Download size={20} className="text-blue-400" />
        <h3 className="text-lg font-bold text-white">HTML 내보내기</h3>
      </div>

      {/* 프로젝트명 입력 */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-300">프로젝트명</label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="프로젝트 이름을 입력하세요"
          className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* 옵션 */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300">옵션</label>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoPlay}
              onChange={(e) => setAutoPlay(e.target.checked)}
              className="w-4 h-4 bg-slate-700 border border-slate-600 rounded"
            />
            <span className="text-sm text-slate-300">자동 재생 (5초 간격)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showNavigation}
              onChange={(e) => setShowNavigation(e.target.checked)}
              className="w-4 h-4 bg-slate-700 border border-slate-600 rounded"
            />
            <span className="text-sm text-slate-300">네비게이션 표시</span>
          </label>
        </div>
      </div>

      {/* 내보내기 버튼 */}
      <button
        onClick={handleExport}
        disabled={isExporting || !projectName.trim()}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition"
      >
        {isExporting ? (
          <>
            <Loader size={16} className="animate-spin" />
            내보내는 중... ({progress}%)
          </>
        ) : exported ? (
          <>
            <CheckCircle size={16} />
            내보내기 완료!
          </>
        ) : (
          <>
            <Download size={16} />
            HTML로 내보내기
          </>
        )}
      </button>

      {/* 진행률 바 */}
      {isExporting && (
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* 에러 표시 */}
      {error && (
        <div className="flex gap-3 p-4 bg-red-900/30 border border-red-600 rounded-lg">
          <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-300">내보내기 실패</p>
            <p className="text-xs text-red-200 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* 성공 메시지 */}
      {exported && (
        <div className="flex gap-3 p-4 bg-green-900/30 border border-green-600 rounded-lg">
          <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-300">내보내기 완료!</p>
            <p className="text-xs text-green-200 mt-1">
              파일이 다운로드 폴더에 저장되었습니다.
            </p>
          </div>
        </div>
      )}

      {/* 정보 */}
      <div className="p-4 bg-slate-800 rounded-lg text-xs text-slate-400 space-y-2">
        <p className="font-semibold text-slate-300">📝 생성되는 HTML 파일:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>완전한 독립 실행형 파일</li>
          <li>모든 이미지 URL 포함</li>
          <li>효과음 Web Audio API</li>
          <li>화살표/버튼 네비게이션</li>
          <li>반응형 디자인</li>
        </ul>
      </div>

      {/* 사용 예제 */}
      <div className="p-4 bg-slate-800 rounded-lg text-xs text-slate-400">
        <p className="font-semibold text-slate-300 mb-2">💡 사용 방법:</p>
        <code className="block text-slate-300 bg-slate-900 p-2 rounded">
          {`const { exportAsHTML } = useHTMLExport()\nawait exportAsHTML(scenes, template, "프로젝트명")`}
        </code>
      </div>

      {/* 데모 정보 */}
      <div className="p-4 bg-slate-800 rounded-lg text-xs text-slate-400 space-y-1">
        <p className="font-semibold text-slate-300">🎬 현재 데모 설정:</p>
        <p>• 씬: {DEMO_SCENES.length}개</p>
        <p>• 레이아웃: {DEMO_TEMPLATE.layout}</p>
        <p>• 폰트: {DEMO_TEMPLATE.font}</p>
        <p>• 색상: {DEMO_TEMPLATE.color}</p>
      </div>
    </div>
  )
}
