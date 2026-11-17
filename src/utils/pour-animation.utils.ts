import { type Point, interiorBottom, interiorPoints, interiorTop, neckHalfWidth, slotHeight } from './bottle-shape.utils'
/* v8 ignore start */
/* oxlint-disable @typescript-eslint/no-magic-numbers, @typescript-eslint/max-params, id-length, max-lines, max-depth -- numeric simulation: tuning values and geometry, split by physical step rather than by line count */
import { pour } from './bottle.utils'
import type { Bottle, Color } from './colors.utils'
import { createPourSound } from './pour-sound.utils'

/**
 * Realistic pouring animation.
 * - the liquid of both bottles is drawn on a canvas, with a surface that always stays horizontal, even when the bottle is tilted
 * - the bottle tilts progressively so the liquid level always reaches the lip of the neck, like in real life
 * - the stream is made of particles with gravity, merged into one body of liquid thanks to a "gooey" svg filter
 * - the bottle element itself (the glass, drawn above the canvas) is moved by css transform, in sync with the canvas
 */

interface Particle {
  isSplash: boolean
  radius: number
  vx: number
  vy: number
  x: number
  y: number
}

interface Bubble {
  phase: number
  radius: number
  vy: number
  x: number
  y: number
}

interface PourOptions {
  readonly from: number
  readonly fromBottle: Readonly<Bottle>
  readonly to: number
  readonly toBottle: Readonly<Bottle>
}

// timeline
const moveInDuration = 450
const moveOutDuration = 500
const msPerLayer = 520
const fallDelay = 280
// physics
const gravity = 2400
const lipHeight = 40
const maxTilt = 130
const emissionRate = 260
const toRadians = Math.PI / 180
const filterId = 'jozzo-goo'

/**
 * Rotate a point around the origin
 * @param point the point
 * @param radians the angle
 * @returns the rotated point
 */
function rotate(point: Point, radians: number) {
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  return { x: point.x * cos - point.y * sin, y: point.x * sin + point.y * cos }
}

/**
 * Get the inside of the bottle, rotated
 * @param radians the rotation
 * @returns the points
 */
function getCorners(radians: number) {
  return interiorPoints.map(point => rotate(point, radians))
}

/**
 * Area of the polygon that is under a horizontal line (y grows downward)
 * @param corners the polygon
 * @param level the y of the line
 * @returns the area
 */
function getAreaBelow(corners: Point[], level: number) {
  const clipped: Point[] = []
  for (const [index, a] of corners.entries()) {
    const b = corners[(index + 1) % corners.length] ?? a
    const isAInside = a.y >= level
    const isBInside = b.y >= level
    if (isAInside) clipped.push(a)
    if (isAInside !== isBInside) {
      const ratio = (level - a.y) / (b.y - a.y)
      clipped.push({ x: a.x + ratio * (b.x - a.x), y: level })
    }
  }
  let area = 0
  for (const [index, a] of clipped.entries()) {
    const b = clipped[(index + 1) % clipped.length] ?? a
    area += a.x * b.y - b.x * a.y
  }
  return Math.abs(area) / 2
}

/**
 * Find the y of the liquid surface for a volume in a rotated bottle
 * @param corners the rotated bottle
 * @param volume the volume of liquid
 * @returns the y of the surface, relative to the bottle center
 */
function getLevel(corners: Point[], volume: number) {
  const ys = corners.map(corner => corner.y)
  let low = Math.min(...ys)
  let high = Math.max(...ys)
  for (let step = 0; step < 36; step += 1) {
    const middle = (low + high) / 2
    if (getAreaBelow(corners, middle) > volume) low = middle
    else high = middle
  }
  return (low + high) / 2
}

const uprightCorners = getCorners(0)

/**
 * Volume of liquid when the bottle contains a number of layers, so the levels match the layers of the dom
 * @param layers the number of layers
 * @returns the volume
 */
function getVolume(layers: number) {
  return getAreaBelow(uprightCorners, interiorBottom - layers * slotHeight)
}

/**
 * Find how much a bottle must be tilted so its liquid level exactly reaches the lip of its neck
 * @param volume the volume of liquid in the bottle
 * @param direction 1 to tilt to the right, -1 to the left
 * @returns the tilt in degrees (positive)
 */
function getLipTilt(volume: number, direction: number) {
  const corner = { x: direction * neckHalfWidth, y: interiorTop }
  let low = 0
  let high = maxTilt
  for (let step = 0; step < 30; step += 1) {
    const middle = (low + high) / 2
    const radians = direction * middle * toRadians
    const area = getAreaBelow(getCorners(radians), rotate(corner, radians).y)
    if (area > volume) low = middle
    else high = middle
  }
  return (low + high) / 2
}

/**
 * Smooth easing
 * @param value between 0 and 1
 * @returns the eased value
 */
function ease(value: number) {
  const clamped = Math.min(1, Math.max(0, value))
  return clamped < 0.5 ? 4 * clamped ** 3 : 1 - (-2 * clamped + 2) ** 3 / 2
}

/**
 * Get the real css color of a liquid
 * @param color the color name
 * @returns the css color
 */
function resolveColor(color: Color) {
  const probe = document.createElement('div')
  probe.className = `bg-${color}-500`
  document.body.append(probe)
  const resolved = getComputedStyle(probe).backgroundColor
  probe.remove()
  return resolved
}

/**
 * Add the svg filter that merges particles into one liquid body
 */
function ensureGooFilter() {
  if (document.querySelector(`#${filterId}`)) return
  const wrapper = document.createElement('div')
  wrapper.innerHTML = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><filter id="${filterId}" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" /><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" /></filter></defs></svg>`
  document.body.append(wrapper)
}

/**
 * Create a canvas covering the viewport
 * @param zIndex the z-index
 * @param filter the optional css filter
 * @returns the canvas and its context
 */
function createCanvas(zIndex: number, filter = '') {
  const ratio = window.devicePixelRatio || 1
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(window.innerWidth * ratio)
  canvas.height = Math.round(window.innerHeight * ratio)
  canvas.style.cssText = `position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:${zIndex};${filter ? `filter:${filter};` : ''}`
  document.body.append(canvas)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('canvas context not available')
  return { canvas, context, ratio }
}

/**
 * Draw the liquid of a bottle, bands are ordered from the bottom to the top
 * @param context the canvas context
 * @param center the center of the bottle
 * @param radians the tilt of the bottle
 * @param bands the colors, from bottom to top
 * @param volume the volume of liquid
 * @param amplitude the amplitude of the waves at the surface
 * @param time the time in ms
 */
function drawLiquid(context: CanvasRenderingContext2D, center: Point, radians: number, bands: string[], volume: number, amplitude: number, time: number) {
  const corners = getCorners(radians)
  const absolute = corners.map(corner => ({ x: corner.x + center.x, y: corner.y + center.y }))
  const minX = Math.min(...absolute.map(corner => corner.x)) - 2
  const maxX = Math.max(...absolute.map(corner => corner.x)) + 2
  const bottomY = Math.max(...absolute.map(corner => corner.y)) + 2
  /**
   * Height of the waves at the surface
   * @param x the horizontal position
   * @returns the vertical offset
   */
  const wave = (x: number) => (amplitude * (Math.sin(x * 0.16 + time * 0.008) + 0.5 * Math.sin(x * 0.31 - time * 0.011))) / 1.5
  context.save()
  context.beginPath()
  for (const [index, corner] of absolute.entries())
    if (index === 0) context.moveTo(corner.x, corner.y)
    else context.lineTo(corner.x, corner.y)

  context.closePath()
  context.clip()
  // from the top to the bottom, each band covers everything under its surface
  for (let index = bands.length - 1; index >= 0; index -= 1) {
    if (getVolume(index) >= volume) continue
    const level = getLevel(corners, Math.min(volume, getVolume(index + 1))) + center.y
    context.fillStyle = bands[index] ?? ''
    context.beginPath()
    context.moveTo(minX, bottomY)
    for (let x = minX; x <= maxX; x += 4) context.lineTo(x, level + wave(x))
    context.lineTo(maxX, level + wave(maxX))
    context.lineTo(maxX, bottomY)
    context.closePath()
    context.fill()
    // light catching the surface, same as the inset shadow of the layers in the dom (.liquid-layer), only where the liquid really has a surface
    const hasSurface = index === bands.length - 1 || bands[index + 1] !== bands[index] || getVolume(index + 1) > volume
    if (!hasSurface) continue
    context.beginPath()
    context.moveTo(minX, level + wave(minX) + 0.75)
    for (let x = minX; x <= maxX; x += 4) context.lineTo(x, level + wave(x) + 0.75)
    context.lineTo(maxX, level + wave(maxX) + 0.75)
    context.strokeStyle = 'rgba(255, 255, 255, 0.35)'
    context.lineWidth = 1.5
    context.stroke()
  }
  context.restore()
}

/**
 * Draw the bubbles rising inside a bottle
 * @param context the canvas context
 * @param center the center of the bottle
 * @param bubbles the bubbles
 * @param alpha the opacity
 */
function drawBubbles(context: CanvasRenderingContext2D, center: Point, bubbles: Bubble[], alpha: number) {
  if (bubbles.length === 0 || alpha <= 0) return
  context.save()
  context.beginPath()
  for (const [index, corner] of uprightCorners.entries())
    if (index === 0) context.moveTo(corner.x + center.x, corner.y + center.y)
    else context.lineTo(corner.x + center.x, corner.y + center.y)

  context.closePath()
  context.clip()
  context.globalAlpha = alpha
  for (const bubble of bubbles) {
    context.beginPath()
    context.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2)
    context.fillStyle = 'rgba(255, 255, 255, 0.16)'
    context.fill()
    context.strokeStyle = 'rgba(255, 255, 255, 0.65)'
    context.lineWidth = 0.9
    context.stroke()
    // tiny reflection
    context.beginPath()
    context.arc(bubble.x - bubble.radius * 0.35, bubble.y - bubble.radius * 0.35, Math.max(0.5, bubble.radius * 0.22), 0, Math.PI * 2)
    context.fillStyle = 'rgba(255, 255, 255, 0.9)'
    context.fill()
  }
  context.restore()
}

/**
 * Freeze the position of an element (selection and hover offsets) so it does not move while we animate it
 * @param element the element
 */
function freeze(element: HTMLElement) {
  element.style.translate = getComputedStyle(element).translate
  element.style.transition = 'none'
}

/**
 * Release an element frozen
 * @param element the element
 */
function release(element: HTMLElement) {
  element.style.translate = ''
  element.style.transition = ''
  element.style.transform = ''
}

/**
 * Get the colors of a bottle, without the empty spaces
 * @param bottle the bottle
 * @returns the colors, from the top to the bottom
 */
function getFilled(bottle: Readonly<Bottle>) {
  return bottle.filter(color => color !== '')
}

/**
 * Animate a bottle pouring into another one
 * @param options the options
 * @param options.from the index of the pouring bottle
 * @param options.fromBottle the content of the pouring bottle
 * @param options.to the index of the target bottle
 * @param options.toBottle the content of the target bottle
 * @returns undefined if nothing to animate, else the duration and a promise resolved at the end
 */
export function animatePour(options: PourOptions) {
  const { from, fromBottle, to, toBottle } = options
  const [fromAfter] = pour(fromBottle, toBottle)
  const poured = getFilled(fromBottle).length - getFilled(fromAfter).length
  const fromElement = document.querySelector<HTMLElement>(`[data-index="${from}"]`)
  const toElement = document.querySelector<HTMLElement>(`[data-index="${to}"]`)
  const color = fromBottle.find(item => item !== '')
  if (poured <= 0 || !fromElement || !toElement || color === undefined) return undefined

  ensureGooFilter()
  freeze(fromElement)
  freeze(toElement)
  const fillStyle = resolveColor(color)
  const sourceBands = getFilled(fromBottle)
    .toReversed()
    .map(item => resolveColor(item))
  const targetBase = getFilled(toBottle)
    .toReversed()
    .map(item => resolveColor(item))
  const targetBands = [...targetBase, ...Array.from({ length: poured }, () => fillStyle)]
  const sourceVolume = getVolume(sourceBands.length)
  const sourceEndVolume = getVolume(sourceBands.length - poured)
  const targetVolume = getVolume(targetBase.length)
  const targetEndVolume = getVolume(targetBands.length)

  const fromRect = fromElement.getBoundingClientRect()
  const toRect = toElement.getBoundingClientRect()
  const direction = toRect.left >= fromRect.left ? 1 : -1
  const sourceStart: Point = { x: fromRect.left + fromRect.width / 2, y: fromRect.top + fromRect.height / 2 }
  const targetCenter: Point = { x: toRect.left + toRect.width / 2, y: toRect.top + toRect.height / 2 }
  // the lip of the pouring bottle is the pivot, it stays right above the target bottle
  const lip: Point = { x: targetCenter.x - direction * 10, y: toRect.top - lipHeight }
  const corner: Point = { x: direction * neckHalfWidth, y: interiorTop }
  /**
   * Where the center of the pouring bottle is when its lip is on the pivot
   * @param degrees the tilt of the bottle
   * @returns the center
   */
  const getPivotCenter = (degrees: number): Point => {
    const offset = rotate(corner, degrees * toRadians)
    return { x: lip.x - offset.x, y: lip.y - offset.y }
  }
  const tiltStart = direction * getLipTilt(sourceVolume, direction)
  const tiltEnd = direction * getLipTilt(sourceEndVolume, direction)
  const centerStart = getPivotCenter(tiltStart)
  const centerEnd = getPivotCenter(tiltEnd)
  const flowDuration = poured * msPerLayer
  const duration = moveInDuration + flowDuration + moveOutDuration

  /**
   * Position of the pouring bottle at a given time
   * @param time the time in ms
   * @returns the angle in degrees, the center and the volume of liquid still inside
   */
  const getFrame = (time: number) => {
    if (time < moveInDuration) {
      const progress = ease(time / moveInDuration)
      return {
        angle: tiltStart * progress,
        center: { x: sourceStart.x + (centerStart.x - sourceStart.x) * progress, y: sourceStart.y + (centerStart.y - sourceStart.y) * progress - 25 * Math.sin(Math.PI * progress) },
        volume: sourceVolume,
      }
    }
    if (time < moveInDuration + flowDuration) {
      const volume = sourceVolume - (sourceVolume - sourceEndVolume) * ((time - moveInDuration) / flowDuration)
      const angle = direction * getLipTilt(volume, direction)
      return { angle, center: getPivotCenter(angle), volume }
    }
    const progress = ease((time - moveInDuration - flowDuration) / moveOutDuration)
    return {
      angle: tiltEnd * (1 - progress),
      center: { x: centerEnd.x + (sourceStart.x - centerEnd.x) * progress, y: centerEnd.y + (sourceStart.y - centerEnd.y) * progress - 25 * Math.sin(Math.PI * progress) },
      volume: sourceEndVolume,
    }
  }

  const liquid = createCanvas(40)
  const effects = createCanvas(41, `url(#${filterId})`)
  const sound = createPourSound()
  const fullVolume = getVolume(5)
  let particles: Particle[] = []
  let bubbles: Bubble[] = []
  let emission = 0
  let sourceAmplitude = 0
  let targetAmplitude = 0
  let lastAngle = 0

  /**
   * Render one frame
   * @param time the time in ms
   * @param delta the time since the last frame in seconds
   */
  const render = (time: number, delta: number) => {
    const fade = Math.min(1, Math.max(0, (duration - time) / 300))
    const frame = getFrame(time)
    fromElement.style.transform = `translate(${frame.center.x - sourceStart.x}px, ${frame.center.y - sourceStart.y}px) rotate(${frame.angle}deg)`

    // waves
    if (delta > 0) {
      const speed = Math.abs(frame.angle - lastAngle) / delta
      sourceAmplitude += (Math.min(4, speed * 0.02) - sourceAmplitude) * 0.2
      targetAmplitude *= Math.exp(-delta * 2.5)
    }
    lastAngle = frame.angle

    // the target gets its volume once the stream arrives
    const targetFilled = targetVolume + (targetEndVolume - targetVolume) * Math.min(1, Math.max(0, (time - moveInDuration - fallDelay) / flowDuration))
    const surface = getLevel(uprightCorners, targetFilled) + targetCenter.y

    // stream emission
    const isFlowing = time >= moveInDuration && time < moveInDuration + flowDuration
    const intensity = isFlowing ? Math.min(1, (time - moveInDuration) / 150, (moveInDuration + flowDuration - time) / 200) : 0
    emission += emissionRate * Math.max(0, intensity) * delta
    const lipOffset = rotate(corner, frame.angle * toRadians)
    while (emission >= 1) {
      emission -= 1
      const ahead = Math.random() * delta
      const vx = direction * (35 + Math.random() * 20)
      const vy = 10 + Math.random() * 30
      particles.push({ isSplash: false, radius: 4.8, vx, vy, x: frame.center.x + lipOffset.x + vx * ahead, y: frame.center.y + lipOffset.y + (Math.random() - 0.5) * 3 + vy * ahead })
    }

    // particles
    const next: Particle[] = []
    for (const particle of particles) {
      particle.vy += gravity * delta
      particle.x += particle.vx * delta
      particle.y += particle.vy * delta
      if (!particle.isSplash) particle.radius = Math.max(3, 4.8 - particle.vy * 0.0035)
      const wave = targetAmplitude * fade
      const isInside = Math.abs(particle.x - targetCenter.x) < neckHalfWidth + 6
      if (isInside && particle.y >= surface + wave && particle.y < toRect.bottom) {
        if (!particle.isSplash) {
          targetAmplitude = Math.min(3.5, targetAmplitude + 0.04)
          // the stream drags air under the surface
          if (Math.random() < 0.05) bubbles.push({ phase: Math.random() * 6.28, radius: 1.2 + Math.random() * 2.2, vy: -(30 + Math.random() * 45), x: particle.x + (Math.random() - 0.5) * 8, y: surface + 8 + Math.random() * 14 })
          if (Math.random() < 0.3) next.push({ isSplash: true, radius: 2.6, vx: (Math.random() - 0.5) * 80, vy: -(70 + Math.random() * 130), x: particle.x, y: surface })
        }
        continue
      }
      if (particle.y < toRect.bottom + 30) next.push(particle)
    }
    particles = next

    // bubbles rise and pop at the surface
    const surfaceWave = targetAmplitude * fade
    for (const bubble of bubbles) {
      bubble.phase += delta * 8
      bubble.x += Math.sin(bubble.phase) * 12 * delta
      bubble.y += bubble.vy * delta
    }
    bubbles = bubbles.filter(bubble => bubble.y > surface + surfaceWave + bubble.radius * 0.5)

    // sound, pitched by the fill level of the target, it follows the stream so it starts when the liquid arrives
    const soundStart = moveInDuration + fallDelay
    const soundEnd = soundStart + flowDuration
    const soundIntensity = time >= soundStart && time < soundEnd ? Math.min(1, (time - soundStart) / 120, (soundEnd - time) / 150) : 0
    sound.update(targetFilled / fullVolume, Math.max(0, soundIntensity), delta)

    // draw
    liquid.context.setTransform(liquid.ratio, 0, 0, liquid.ratio, 0, 0)
    liquid.context.clearRect(0, 0, window.innerWidth, window.innerHeight)
    drawLiquid(liquid.context, frame.center, frame.angle * toRadians, sourceBands, frame.volume, sourceAmplitude * fade, time)
    drawLiquid(liquid.context, targetCenter, 0, targetBands, targetFilled, targetAmplitude * fade, time)
    drawBubbles(liquid.context, targetCenter, bubbles, fade)
    effects.context.setTransform(effects.ratio, 0, 0, effects.ratio, 0, 0)
    effects.context.clearRect(0, 0, window.innerWidth, window.innerHeight)
    effects.context.fillStyle = fillStyle
    for (const particle of particles) {
      effects.context.beginPath()
      effects.context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      effects.context.fill()
    }
  }

  let stopAnimation: (() => void) | undefined // oxlint-disable-line @typescript-eslint/init-declarations
  const finished = new Promise<void>(resolve => {
    let isDone = false
    const cleanup = () => {
      if (isDone) return
      isDone = true
      sound.stop()
      release(fromElement)
      release(toElement)
      liquid.canvas.remove()
      effects.canvas.remove()
      resolve()
    }
    const start = performance.now()
    let last = start
    /**
     * One frame of the animation
     * @param now the time of the frame
     */
    const step = (now: number) => {
      if (isDone) return
      const time = Math.min(duration, now - start)
      render(time, Math.min(0.033, (now - last) / 1000))
      last = now
      // the last frame stays on screen until stop is called, so the dom has time to paint the final state under it
      if (time >= duration) resolve()
      else requestAnimationFrame(step)
    }
    // first frame right now so the canvas takes over from the dom without any blink
    render(0, 0)
    requestAnimationFrame(step)
    stopAnimation = cleanup
    setTimeout(cleanup, duration + 3000) // in case nobody stops us or the tab is hidden
  })

  return {
    duration,
    finished,
    stop: () => {
      stopAnimation?.()
    },
  }
}
