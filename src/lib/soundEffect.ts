interface SoundConfig {
  frequency?: number
  duration?: number
  type?: OscillatorType
  volume?: number
}

interface FadeOptions {
  startVolume: number
  endVolume: number
  duration: number
}

class AudioManager {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private activeOscillators: Map<string, OscillatorNode> = new Map()
  private activeGains: Map<string, GainNode> = new Map()

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return this.audioContext
  }

  private getMasterGain(): GainNode {
    const context = this.getContext()
    if (!this.masterGain) {
      this.masterGain = context.createGain()
      this.masterGain.gain.value = 0.5
      this.masterGain.connect(context.destination)
    }
    return this.masterGain
  }

  setVolume(value: number) {
    const gain = this.getMasterGain()
    gain.gain.value = Math.max(0, Math.min(1, value))
  }

  getVolume(): number {
    return this.getMasterGain().gain.value
  }

  // 페이드인 효과음 (신비로움)
  playFadeIn(options: SoundConfig = {}): string {
    const id = `fadeIn-${Date.now()}`
    const context = this.getContext()
    const gain = this.getMasterGain()

    const osc = context.createOscillator()
    const oscGain = context.createGain()

    osc.type = options.type || 'sine'
    osc.frequency.setValueAtTime(200, context.currentTime)
    osc.frequency.exponentialRampToValueAtTime(800, context.currentTime + (options.duration || 0.8))

    oscGain.gain.setValueAtTime(0, context.currentTime)
    oscGain.gain.linearRampToValueAtTime(options.volume || 0.3, context.currentTime + 0.1)
    oscGain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + (options.duration || 0.8))

    osc.connect(oscGain)
    oscGain.connect(gain)

    osc.start(context.currentTime)
    osc.stop(context.currentTime + (options.duration || 0.8))

    this.activeOscillators.set(id, osc)
    return id
  }

  // 페이드아웃 효과음 (마무리)
  playFadeOut(options: SoundConfig = {}): string {
    const id = `fadeOut-${Date.now()}`
    const context = this.getContext()
    const gain = this.getMasterGain()

    const osc = context.createOscillator()
    const oscGain = context.createGain()

    osc.type = options.type || 'sine'
    osc.frequency.setValueAtTime(800, context.currentTime)
    osc.frequency.exponentialRampToValueAtTime(200, context.currentTime + (options.duration || 0.8))

    oscGain.gain.setValueAtTime(options.volume || 0.3, context.currentTime)
    oscGain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + (options.duration || 0.8))

    osc.connect(oscGain)
    oscGain.connect(gain)

    osc.start(context.currentTime)
    osc.stop(context.currentTime + (options.duration || 0.8))

    this.activeOscillators.set(id, osc)
    return id
  }

  // 알림 효과음
  playNotification(options: SoundConfig = {}): string {
    const id = `notification-${Date.now()}`
    const context = this.getContext()
    const gain = this.getMasterGain()

    const osc = context.createOscillator()
    const oscGain = context.createGain()

    osc.type = 'sine'

    // 두 음의 조합
    const now = context.currentTime
    const duration = options.duration || 0.2

    osc.frequency.setValueAtTime(800, now)
    osc.frequency.setValueAtTime(600, now + duration)

    oscGain.gain.setValueAtTime(options.volume || 0.2, now)
    oscGain.gain.linearRampToValueAtTime(0, now + duration)

    osc.connect(oscGain)
    oscGain.connect(gain)

    osc.start(now)
    osc.stop(now + duration)

    this.activeOscillators.set(id, osc)
    return id
  }

  // 클릭 효과음
  playClick(options: SoundConfig = {}): string {
    const id = `click-${Date.now()}`
    const context = this.getContext()
    const gain = this.getMasterGain()

    const osc = context.createOscillator()
    const oscGain = context.createGain()
    const filter = context.createBiquadFilter()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(150, context.currentTime)

    filter.type = 'highpass'
    filter.frequency.setValueAtTime(5000, context.currentTime)

    oscGain.gain.setValueAtTime(options.volume || 0.15, context.currentTime)
    oscGain.gain.linearRampToValueAtTime(0, context.currentTime + (options.duration || 0.05))

    osc.connect(oscGain)
    oscGain.connect(filter)
    filter.connect(gain)

    osc.start(context.currentTime)
    osc.stop(context.currentTime + (options.duration || 0.05))

    this.activeOscillators.set(id, osc)
    return id
  }

  // 성공 효과음
  playSuccess(options: SoundConfig = {}): string {
    const id = `success-${Date.now()}`
    const context = this.getContext()
    const gain = this.getMasterGain()

    const notes = [523.25, 659.25, 783.99] // C5, E5, G5 - 주요 3화음
    const duration = options.duration || 0.4
    const noteDuration = duration / notes.length

    notes.forEach((freq, index) => {
      const osc = context.createOscillator()
      const oscGain = context.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, context.currentTime)

      oscGain.gain.setValueAtTime(options.volume || 0.15, context.currentTime + index * noteDuration)
      oscGain.gain.linearRampToValueAtTime(0, context.currentTime + (index + 1) * noteDuration)

      osc.connect(oscGain)
      oscGain.connect(gain)

      osc.start(context.currentTime + index * noteDuration)
      osc.stop(context.currentTime + (index + 1) * noteDuration)

      this.activeOscillators.set(`${id}-${index}`, osc)
    })

    return id
  }

  // 에러 효과음
  playError(options: SoundConfig = {}): string {
    const id = `error-${Date.now()}`
    const context = this.getContext()
    const gain = this.getMasterGain()

    const notes = [349.23, 293.66] // F4, D4 - 불안감 연출
    const duration = options.duration || 0.4
    const noteDuration = duration / notes.length

    notes.forEach((freq, index) => {
      const osc = context.createOscillator()
      const oscGain = context.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, context.currentTime)

      oscGain.gain.setValueAtTime(options.volume || 0.15, context.currentTime + index * noteDuration)
      oscGain.gain.linearRampToValueAtTime(0, context.currentTime + (index + 1) * noteDuration)

      osc.connect(oscGain)
      oscGain.connect(gain)

      osc.start(context.currentTime + index * noteDuration)
      osc.stop(context.currentTime + (index + 1) * noteDuration)

      this.activeOscillators.set(`${id}-${index}`, osc)
    })

    return id
  }

  // 장면 전환 음악 (부드러운 전환)
  playSceneTransition(options: SoundConfig = {}): string {
    const id = `transition-${Date.now()}`
    const context = this.getContext()
    const gain = this.getMasterGain()

    const osc = context.createOscillator()
    const oscGain = context.createGain()
    const reverb = context.createConvolver()

    osc.type = 'sine'

    // 부드러운 음의 변화
    const startFreq = options.frequency || 440
    const duration = options.duration || 1

    osc.frequency.setValueAtTime(startFreq, context.currentTime)
    osc.frequency.exponentialRampToValueAtTime(startFreq * 1.5, context.currentTime + duration * 0.5)
    osc.frequency.exponentialRampToValueAtTime(startFreq, context.currentTime + duration)

    oscGain.gain.setValueAtTime(options.volume || 0.2, context.currentTime)
    oscGain.gain.linearRampToValueAtTime(0, context.currentTime + duration)

    osc.connect(oscGain)
    oscGain.connect(gain)

    osc.start(context.currentTime)
    osc.stop(context.currentTime + duration)

    this.activeOscillators.set(id, osc)
    return id
  }

  // 음량 페이드
  fadeVolume(options: FadeOptions): Promise<void> {
    return new Promise((resolve) => {
      const gain = this.getMasterGain()
      const context = this.getContext()

      gain.gain.setValueAtTime(options.startVolume, context.currentTime)
      gain.gain.linearRampToValueAtTime(options.endVolume, context.currentTime + options.duration)

      setTimeout(resolve, options.duration * 1000)
    })
  }

  // 재생 중지
  stop(id: string): void {
    const osc = this.activeOscillators.get(id)
    if (osc) {
      try {
        osc.stop()
      } catch {
        // 이미 중지됨
      }
      this.activeOscillators.delete(id)
    }

    const gainNode = this.activeGains.get(id)
    if (gainNode) {
      this.activeGains.delete(id)
    }
  }

  // 모든 소리 중지
  stopAll(): void {
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop()
      } catch {
        // 이미 중지됨
      }
    })
    this.activeOscillators.clear()
    this.activeGains.clear()
  }

  // 오디오 컨텍스트 재개 (사용자 상호작용 후)
  resume(): Promise<void> {
    const context = this.getContext()
    if (context.state === 'suspended') {
      return context.resume()
    }
    return Promise.resolve()
  }
}

export const audioManager = new AudioManager()

export default audioManager
