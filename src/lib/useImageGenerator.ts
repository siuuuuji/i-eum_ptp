import { useCallback, useState } from 'react'
import { imageGenerator } from '../utils/imageGenerator'

interface ImageGenerationState {
  isLoading: boolean
  error: string | null
  imageUrl: string | null
}

export function useImageGenerator() {
  const [state, setState] = useState<ImageGenerationState>({
    isLoading: false,
    error: null,
    imageUrl: null
  })

  const generateImage = useCallback(
    async (prompt: string, width?: number, height?: number) => {
      setState({ isLoading: true, error: null, imageUrl: null })

      try {
        const url = await imageGenerator.generateImage({
          prompt,
          width,
          height
        })

        setState({
          isLoading: false,
          error: null,
          imageUrl: url
        })

        return url
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '이미지 생성 실패'

        setState({
          isLoading: false,
          error: errorMessage,
          imageUrl: null
        })

        throw error
      }
    },
    []
  )

  const generateImageFromScene = useCallback(
    async (sceneText: string, width?: number, height?: number) => {
      const prompt = imageGenerator.generatePromptFromScene(sceneText)
      return generateImage(prompt, width, height)
    },
    [generateImage]
  )

  const generateImagesBatch = useCallback(
    async (scenes: Array<{ id: string; text: string }>) => {
      setState({ isLoading: true, error: null, imageUrl: null })

      try {
        const results = await imageGenerator.generateImagesBatch(scenes)
        setState({
          isLoading: false,
          error: null,
          imageUrl: null
        })
        return results
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '배치 이미지 생성 실패'

        setState({
          isLoading: false,
          error: errorMessage,
          imageUrl: null
        })

        throw error
      }
    },
    []
  )

  const clearCache = useCallback(() => {
    imageGenerator.clearCache()
  }, [])

  const resetState = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      imageUrl: null
    })
  }, [])

  return {
    ...state,
    generateImage,
    generateImageFromScene,
    generateImagesBatch,
    clearCache,
    resetState,
    cacheSize: imageGenerator.getCacheSize()
  }
}
