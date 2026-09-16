import { useEffect, useCallback } from 'react'
import { audioManager } from './soundEffect'

export function useSoundEffect() {
  useEffect(() => {
    audioManager.resume()
  }, [])

  const playFadeIn = useCallback((volume = 0.3, duration = 0.8) => {
    return audioManager.playFadeIn({ volume, duration })
  }, [])

  const playFadeOut = useCallback((volume = 0.3, duration = 0.8) => {
    return audioManager.playFadeOut({ volume, duration })
  }, [])

  const playNotification = useCallback((volume = 0.2, duration = 0.2) => {
    return audioManager.playNotification({ volume, duration })
  }, [])

  const playClick = useCallback((volume = 0.15, duration = 0.05) => {
    return audioManager.playClick({ volume, duration })
  }, [])

  const playSuccess = useCallback((volume = 0.15, duration = 0.4) => {
    return audioManager.playSuccess({ volume, duration })
  }, [])

  const playError = useCallback((volume = 0.15, duration = 0.4) => {
    return audioManager.playError({ volume, duration })
  }, [])

  const playSceneTransition = useCallback((volume = 0.2, frequency = 440, duration = 1) => {
    return audioManager.playSceneTransition({ volume, frequency, duration })
  }, [])

  const fadeVolume = useCallback(async (startVolume: number, endVolume: number, duration: number) => {
    return audioManager.fadeVolume({ startVolume, endVolume, duration })
  }, [])

  const stop = useCallback((id: string) => {
    audioManager.stop(id)
  }, [])

  const stopAll = useCallback(() => {
    audioManager.stopAll()
  }, [])

  const setVolume = useCallback((value: number) => {
    audioManager.setVolume(value)
  }, [])

  const getVolume = useCallback(() => {
    return audioManager.getVolume()
  }, [])

  return {
    playFadeIn,
    playFadeOut,
    playNotification,
    playClick,
    playSuccess,
    playError,
    playSceneTransition,
    fadeVolume,
    stop,
    stopAll,
    setVolume,
    getVolume
  }
}
