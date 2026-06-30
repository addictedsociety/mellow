const CHIME_NOTES = [880, 1108.73, 1318.51] as const
const NOTE_SPACING_SECONDS = 0.16
const NOTE_DURATION_SECONDS = 0.4
const PEAK_GAIN_RATIO = 0.3

let audioContext: AudioContext | null = null

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') {
    return null
  }
  const AudioContextCtor =
    window.AudioContext ??
    (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextCtor) {
    return null
  }
  if (!audioContext) {
    audioContext = new AudioContextCtor()
  }
  return audioContext
}

export const playCompletionChime = (volume: number) => {
  const safeVolume = Math.min(1, Math.max(0, volume))
  if (safeVolume === 0) {
    return
  }

  const context = getAudioContext()
  if (!context) {
    return
  }

  // The context starts suspended until the first user gesture; resume on demand.
  if (context.state === 'suspended') {
    void context.resume()
  }

  const startTime = context.currentTime
  CHIME_NOTES.forEach((frequency, index) => {
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()
    const noteStart = startTime + index * NOTE_SPACING_SECONDS
    const noteEnd = noteStart + NOTE_DURATION_SECONDS

    oscillator.type = 'sine'
    oscillator.frequency.value = frequency

    gainNode.gain.setValueAtTime(0, noteStart)
    gainNode.gain.linearRampToValueAtTime(safeVolume * PEAK_GAIN_RATIO, noteStart + 0.02)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, noteEnd)

    oscillator.connect(gainNode).connect(context.destination)
    oscillator.start(noteStart)
    oscillator.stop(noteEnd)
  })
}
