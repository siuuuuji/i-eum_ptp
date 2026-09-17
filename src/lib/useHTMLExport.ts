import { useCallback, useState } from 'react'
import { htmlExporter } from '../utils/htmlExporter'

interface Scene {
  id: string
  index: number
  text: string
  imageUrl?: string
}

interface Template {
  layout: string
  font: string
  color: string
  animation: string
}

interface ExportState {
  isExporting: boolean
  error: string | null
  progress: number
}

export function useHTMLExport() {
  const [state, setState] = useState<ExportState>({
    isExporting: false,
    error: null,
    progress: 0
  })

  const exportAsHTML = useCallback(
    async (
      scenes: Scene[],
      template: Template,
      projectName = 'Interactive Scene',
      options: { autoPlay?: boolean; showNavigation?: boolean } = {}
    ) => {
      setState({ isExporting: true, error: null, progress: 20 })

      try {
        if (scenes.length === 0) {
          throw new Error('내보낼 씬이 없습니다.')
        }

        setState({ isExporting: true, error: null, progress: 40 })

        // HTML 생성
        const html = await htmlExporter.generateHTML({
          scenes,
          template,
          projectName,
          autoPlay: options.autoPlay ?? false,
          showNavigation: options.showNavigation ?? true
        })

        setState({ isExporting: true, error: null, progress: 80 })

        // 파일명 생성 (한글 지원)
        const timestamp = new Date().toISOString().slice(0, 10)
        const filename = `${projectName}-${timestamp}.html`

        // 다운로드
        await htmlExporter.downloadHTML(html, filename)

        setState({ isExporting: false, error: null, progress: 100 })

        return { success: true, filename }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '내보내기 실패'

        setState({
          isExporting: false,
          error: errorMessage,
          progress: 0
        })

        throw error
      }
    },
    []
  )

  const getHTML = useCallback(
    async (
      scenes: Scene[],
      template: Template,
      projectName = 'Interactive Scene',
      options: { autoPlay?: boolean; showNavigation?: boolean } = {}
    ) => {
      try {
        return await htmlExporter.generateHTML({
          scenes,
          template,
          projectName,
          autoPlay: options.autoPlay ?? false,
          showNavigation: options.showNavigation ?? true
        })
      } catch (error) {
        throw error instanceof Error ? error : new Error('HTML 생성 실패')
      }
    },
    []
  )

  const resetState = useCallback(() => {
    setState({
      isExporting: false,
      error: null,
      progress: 0
    })
  }, [])

  return {
    ...state,
    exportAsHTML,
    getHTML,
    resetState
  }
}
