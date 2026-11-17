/* v8 ignore start */
/* oxlint-disable @typescript-eslint/no-magic-numbers -- audio tuning values, each one is a taste setting */

interface PourSound {
  /** Stop the sound with a short fade out */
  readonly stop: () => void
  /** Follow the pour: how full the target is (0-1), how much liquid falls (0-1), seconds since the last update */
  readonly update: (fill: number, intensity: number, delta: number) => void
}

let audioContext: AudioContext | undefined // oxlint-disable-line @typescript-eslint/init-declarations
let noiseBuffer: AudioBuffer | undefined // oxlint-disable-line @typescript-eslint/init-declarations

const silentSound: PourSound = {
  /** Nothing to stop, audio is not available */
  stop() {
    /* silent */
  },
  /** Nothing to update, audio is not available */
  update() {
    /* silent */
  },
}

/**
 * Get the shared audio context, created on first use (after a user gesture)
 * @returns the context or undefined if not available
 */
function getAudioContext() {
  if (audioContext === undefined)
    try {
      audioContext = new AudioContext()
    } catch {
      return undefined
    }
  if (audioContext.state === 'suspended') void audioContext.resume()
  return audioContext
}

/**
 * Get two seconds of soft (brownish) noise, the raw material of the water sound
 * @param context the audio context
 * @returns the buffer
 */
function getNoiseBuffer(context: AudioContext) {
  if (noiseBuffer) return noiseBuffer
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let index = 0; index < data.length; index += 1) {
    last = (last + 0.04 * (Math.random() * 2 - 1)) / 1.04
    data[index] = last * 3.5
  }
  noiseBuffer = buffer
  return buffer
}

/**
 * A small bubble sound: a sine that chirps upward and fades quickly
 * @param context the audio context
 * @param destination where to send the sound
 * @param frequency the starting frequency
 */
function playBubble(context: AudioContext, destination: AudioNode, frequency: number) {
  const now = context.currentTime
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.frequency.setValueAtTime(frequency, now)
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.6, now + 0.06)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.09, now + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07)
  oscillator.connect(gain).connect(destination)
  oscillator.start(now)
  oscillator.stop(now + 0.08)
}

/**
 * Create the sound of a liquid pouring into a bottle: a filtered noise whose pitch rises while the bottle fills (like in real life),
 * a bit of splash and some bubbles. Drive it with update on each frame, and call stop at the end.
 * @returns the controls of the sound
 */
export function createPourSound() {
  const context = getAudioContext()
  if (!context) return silentSound
  const noise = context.createBufferSource()
  noise.buffer = getNoiseBuffer(context)
  noise.loop = true
  const resonance = context.createBiquadFilter()
  resonance.type = 'bandpass'
  resonance.Q.value = 5
  const body = context.createGain()
  body.gain.value = 0
  const splash = context.createBiquadFilter()
  splash.type = 'highpass'
  splash.frequency.value = 3000
  const splashGain = context.createGain()
  splashGain.gain.value = 0
  const master = context.createGain()
  master.gain.value = 0.5
  noise.connect(resonance).connect(body).connect(master)
  noise.connect(splash).connect(splashGain).connect(master)
  master.connect(context.destination)
  noise.start()
  return {
    /** Stop the sound with a short fade out */
    stop() {
      master.gain.setTargetAtTime(0, context.currentTime, 0.03)
      setTimeout(() => {
        noise.stop()
        noise.disconnect()
        master.disconnect()
      }, 250)
    },
    /**
     * Follow the pour
     * @param fill how full the target is, from 0 to 1
     * @param intensity how much liquid falls, from 0 to 1
     * @param delta seconds since the last update
     */
    update(fill: number, intensity: number, delta: number) {
      const now = context.currentTime
      // two octaves from an empty to a full bottle
      const frequency = 350 * 2 ** (Math.min(1, Math.max(0, fill)) * 2)
      resonance.frequency.setTargetAtTime(frequency, now, 0.03)
      body.gain.setTargetAtTime(intensity * 1.6, now, 0.04)
      splashGain.gain.setTargetAtTime(intensity * 0.08, now, 0.04)
      if (Math.random() < intensity * delta * 20) playBubble(context, master, frequency * (0.8 + Math.random() * 0.8))
    },
  }
}
