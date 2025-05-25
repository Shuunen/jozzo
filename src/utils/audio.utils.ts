/**
 * Play the tea-pouring sound for 1 second, starting at a random 1s segment each time.
 */
const pouringSoundDurationMs = 1000
const pouringSoundTotalSegments = 8 // 0-1, 1-2, ..., 7-8

/**
 * Play a random 1s segment of the tea-pouring sound with a fadeout effect.
 */
export function playPouringSound() {
  const segment = Math.floor(Math.random() * pouringSoundTotalSegments)
  const audio = new Audio('/src/assets/tea-pouring.mp3')
  audio.currentTime = segment
  audio.volume = 1
  void audio.play()
  // Fade out over the last 200ms
  const fadeDuration = 200
  const fadeSteps = 10
  const fadeStepTime = fadeDuration / fadeSteps
  setTimeout(() => {
    let currentStep = 0
    const fadeInterval = setInterval(() => {
      currentStep += 1
      audio.volume = Math.max(0, 1 - currentStep / fadeSteps)
      if (currentStep >= fadeSteps) {
        clearInterval(fadeInterval)
        audio.pause()
        audio.currentTime = 0
      }
    }, fadeStepTime)
  }, pouringSoundDurationMs - fadeDuration)
}
