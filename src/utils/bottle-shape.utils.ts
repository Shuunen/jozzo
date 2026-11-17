/* oxlint-disable @typescript-eslint/no-magic-numbers, id-length -- geometry of the bottle, in pixels */
/**
 * Geometry of a glass bottle, shared by the dom (glass, clipping of the liquid) and the pouring animation (liquid physics).
 * All the coordinates are relative to the center of the bottle element.
 */

export interface Point {
  x: number
  y: number
}

interface ShapeSpec {
  readonly bodyHalf: number
  readonly bodyTop: number
  readonly bottom: number
  readonly neckBottom: number
  readonly neckHalf: number
  readonly radius: number
  readonly top: number
}

/** Size of the bottle element in pixels */
export const outerWidth = 56
export const outerHeight = 194
/** Height of one layer of liquid in pixels */
export const slotHeight = 28
/** Size of the inside of the body, where the liquid lives */
const bodyHalfWidth = 24
export const neckHalfWidth = 10
export const interiorTop = -97
export const interiorBottom = 89

/**
 * Build the symmetrical outline of a bottle: neck, shoulders (smooth S curve), body and rounded bottom
 * @param spec the dimensions
 * @returns the points, clockwise, starting at the top right
 */
function buildShape(spec: ShapeSpec) {
  const { bodyHalf, bodyTop, bottom, neckBottom, neckHalf, radius, top } = spec
  const right: Point[] = [
    { x: neckHalf, y: top },
    { x: neckHalf, y: neckBottom },
  ]
  const shoulderSteps = 10
  for (let step = 1; step <= shoulderSteps; step += 1) {
    const ratio = step / shoulderSteps
    const smooth = ratio * ratio * (3 - 2 * ratio)
    right.push({ x: neckHalf + (bodyHalf - neckHalf) * smooth, y: neckBottom + (bodyTop - neckBottom) * ratio })
  }
  right.push({ x: bodyHalf, y: bottom - radius })
  const cornerSteps = 6
  for (let step = 1; step <= cornerSteps; step += 1) {
    const angle = (step / cornerSteps) * (Math.PI / 2)
    right.push({ x: bodyHalf - radius + radius * Math.cos(angle), y: bottom - radius + radius * Math.sin(angle) })
  }
  const left = right.map(point => ({ x: -point.x, y: point.y })).toReversed()
  return [...right, ...left]
}

/** Where the liquid can be */
export const interiorPoints = buildShape({ bodyHalf: bodyHalfWidth, bodyTop: -51, bottom: interiorBottom, neckBottom: -71, neckHalf: neckHalfWidth, radius: 12, top: interiorTop })

/** The outside of the glass */
export const outerPoints = buildShape({ bodyHalf: outerWidth / 2, bodyTop: -51, bottom: outerHeight / 2, neckBottom: -71, neckHalf: 14, radius: 18, top: interiorTop })

/**
 * Convert points to an svg path
 * @param points the points relative to the center of the bottle
 * @returns the path in the coordinates of the bottle element
 */
export function toSvgPath(points: Point[]) {
  return `${points.map((point, index) => `${index === 0 ? 'M' : 'L'}${(point.x + outerWidth / 2).toFixed(2)} ${(point.y + outerHeight / 2).toFixed(2)}`).join(' ')} Z`
}

/**
 * Convert the interior to a css clip-path, relative to the box of the interior (48x186)
 * @returns the css clip-path
 */
export function getInteriorClipPath() {
  return `polygon(${interiorPoints.map(point => `${(point.x + bodyHalfWidth).toFixed(2)}px ${(point.y - interiorTop).toFixed(2)}px`).join(',')})`
}
