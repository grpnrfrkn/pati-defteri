/** Kedinin sesleri tarayıcıda üretilir; ses dosyası yoktur. */

const KEY = 'pati.ses'

export const soundEnabled = () => localStorage.getItem(KEY) !== 'kapali'
export const setSoundEnabled = (on: boolean) => localStorage.setItem(KEY, on ? 'acik' : 'kapali')

let audio: AudioContext | null = null

function context(): AudioContext | null {
  if (!soundEnabled()) return null
  try {
    audio ??= new AudioContext()
    if (audio.state === 'suspended') void audio.resume()
    return audio
  } catch {
    return null
  }
}

export function purr() {
  const a = context()
  if (!a) return
  const t = a.currentTime
  const tone = a.createOscillator()
  tone.type = 'sawtooth'
  tone.frequency.value = 52
  const filter = a.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 200
  const gain = a.createGain()
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.linearRampToValueAtTime(0.07, t + 0.2)
  gain.gain.linearRampToValueAtTime(0.0001, t + 1.6)
  // Mırıltının titreşimi
  const flutter = a.createOscillator()
  flutter.frequency.value = 24
  const depth = a.createGain()
  depth.gain.value = 0.04
  flutter.connect(depth).connect(gain.gain)
  tone.connect(filter).connect(gain).connect(a.destination)
  tone.start(t)
  flutter.start(t)
  tone.stop(t + 1.7)
  flutter.stop(t + 1.7)
}

export function meow() {
  const a = context()
  if (!a) return
  const t = a.currentTime
  const tone = a.createOscillator()
  tone.type = 'triangle'
  tone.frequency.setValueAtTime(520, t)
  tone.frequency.linearRampToValueAtTime(820, t + 0.12)
  tone.frequency.linearRampToValueAtTime(460, t + 0.5)
  const gain = a.createGain()
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.linearRampToValueAtTime(0.09, t + 0.06)
  gain.gain.linearRampToValueAtTime(0.0001, t + 0.55)
  tone.connect(gain).connect(a.destination)
  tone.start(t)
  tone.stop(t + 0.6)
}
