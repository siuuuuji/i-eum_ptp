interface ImageGenerationOptions {
  prompt: string
  width?: number
  height?: number
  seed?: number
}

interface GeneratedImage {
  url: string
  prompt: string
  timestamp: number
}

class ImageGeneratorService {
  private readonly API_BASE = 'https://image.pollinations.ai'
  private cache: Map<string, GeneratedImage> = new Map()
  private isGenerating: boolean = false

  /**
   * 프롬프트를 기반으로 이미지 생성
   * @param prompt 이미지 생성 프롬프트 (한글/영문 가능)
   * @param width 이미지 너비 (기본값: 1024)
   * @param height 이미지 높이 (기본값: 1024)
   * @returns 생성된 이미지 URL
   */
  async generateImage(options: ImageGenerationOptions): Promise<string> {
    const { prompt, width = 1024, height = 1024, seed } = options

    // 캐시 확인
    const cacheKey = `${prompt}-${width}-${height}`
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!
      return cached.url
    }

    if (!prompt || prompt.trim().length === 0) {
      throw new Error('이미지 생성을 위해 프롬프트가 필요합니다.')
    }

    try {
      this.isGenerating = true

      // URL 인코딩 (한글도 지원)
      const encodedPrompt = encodeURIComponent(prompt)
      const seedParam = seed ? `&seed=${seed}` : ''
      const url = `${this.API_BASE}/prompt/${encodedPrompt}?width=${width}&height=${height}${seedParam}`

      // 이미지 가용성 확인 (HEAD 요청)
      const headResponse = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(30000)
      })

      if (!headResponse.ok) {
        throw new Error(`이미지 생성 실패: ${headResponse.status}`)
      }

      // 캐시에 저장
      const imageData: GeneratedImage = {
        url,
        prompt,
        timestamp: Date.now()
      }
      this.cache.set(cacheKey, imageData)

      return url
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`이미지 생성 오류: ${error.message}`)
      }
      throw new Error('이미지 생성 중 알 수 없는 오류가 발생했습니다.')
    } finally {
      this.isGenerating = false
    }
  }

  /**
   * 씬 텍스트를 바탕으로 최적화된 프롬프트 생성
   */
  generatePromptFromScene(sceneText: string): string {
    // 씬의 첫 30자를 기반으로 영상적 프롬프트 생성
    const summary = sceneText.substring(0, 100)

    // 한글 키워드 추출 및 영상적 표현으로 변환
    const keywords = [
      ...new Set(
        summary
          .split(' ')
          .filter((word) => word.length > 2)
          .slice(0, 3)
      )
    ]

    const styleKeywords = [
      'cinematic',
      'atmospheric',
      '4k',
      'detailed',
      'professional photography'
    ]

    return `${summary}, ${styleKeywords.join(', ')}`
  }

  /**
   * 배치 이미지 생성 (여러 씬의 이미지 생성)
   */
  async generateImagesBatch(
    scenes: Array<{ id: string; text: string }>
  ): Promise<Map<string, string>> {
    const results = new Map<string, string>()

    for (const scene of scenes) {
      try {
        const prompt = this.generatePromptFromScene(scene.text)
        const url = await this.generateImage({ prompt })
        results.set(scene.id, url)

        // API 요청 제한을 고려하여 약간의 지연
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (error) {
        console.warn(`씬 ${scene.id} 이미지 생성 실패:`, error)
        // 실패한 씬은 스킵하고 계속 진행
      }
    }

    return results
  }

  /**
   * 캐시 비우기
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * 생성 중 여부 확인
   */
  isGenerating_(): boolean {
    return this.isGenerating
  }

  /**
   * 캐시된 이미지 개수
   */
  getCacheSize(): number {
    return this.cache.size
  }

  /**
   * 캐시된 모든 이미지 조회
   */
  getCachedImages(): GeneratedImage[] {
    return Array.from(this.cache.values())
  }
}

export const imageGenerator = new ImageGeneratorService()
export default imageGenerator
