/**
 * Display a bottle
 * @param props
 * @returns
 */
import { getInteriorClipPath, interiorBottom, interiorPoints, interiorTop, outerHeight, outerPoints, outerWidth, toSvgPath } from '../utils/bottle-shape.utils'
import type { Color } from '../utils/colors.utils'

interface BottleProperties {
  readonly colors: Color[]
  readonly index: number
  /** The liquid is drawn elsewhere (the pouring canvas), so hide it here */
  readonly isLiquidHidden?: boolean
  readonly isPouring?: boolean
  readonly isPourTarget?: boolean
  readonly isSelected: boolean
}

const innerPath = toSvgPath(interiorPoints)
const outerPath = toSvgPath(outerPoints)
const clipPath = getInteriorClipPath()
// middle of the bottle, and where the thick glass of the base is
const glassCenterX = 28
const glassBaseY = 188
const interiorHeight = interiorBottom - interiorTop

/**
 * The gradients used by the glass
 * @param properties the properties
 * @param properties.id the unique prefix of the gradients
 * @returns the svg definitions
 */
function GlassGradients({ id }: { readonly id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-wall`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#bcd9ff" stop-opacity="0.5" />
        <stop offset="0.5" stop-color="#bcd9ff" stop-opacity="0.14" />
        <stop offset="1" stop-color="#bcd9ff" stop-opacity="0.42" />
      </linearGradient>
      <linearGradient id={`${id}-shade`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#000" stop-opacity="0.34" />
        <stop offset="0.18" stop-color="#000" stop-opacity="0" />
        <stop offset="0.8" stop-color="#000" stop-opacity="0" />
        <stop offset="1" stop-color="#000" stop-opacity="0.38" />
      </linearGradient>
      <linearGradient id={`${id}-sheen`} x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity="0.22" />
        <stop offset="0.45" stop-color="#fff" stop-opacity="0" />
        <stop offset="1" stop-color="#fff" stop-opacity="0.1" />
      </linearGradient>
      <linearGradient id={`${id}-depth`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0.2" stop-color="#fff" stop-opacity="0.1" />
        <stop offset="0.6" stop-color="#000" stop-opacity="0" />
        <stop offset="1" stop-color="#000" stop-opacity="0.28" />
      </linearGradient>
      <linearGradient id={`${id}-streak`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity="0" />
        <stop offset="0.15" stop-color="#fff" stop-opacity="0.75" />
        <stop offset="0.8" stop-color="#fff" stop-opacity="0.3" />
        <stop offset="1" stop-color="#fff" stop-opacity="0" />
      </linearGradient>
    </defs>
  )
}

/**
 * The glass of the bottle: thickness, reflections, shading. It is drawn above the liquid.
 * @param properties the properties
 * @param properties.index the index of the bottle, to have unique ids
 * @returns the svg
 */
function BottleGlass({ index }: { readonly index: number }) {
  const id = `glass-${index}`
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0" height={outerHeight} viewBox={`0 0 ${outerWidth} ${outerHeight}`} width={outerWidth}>
      <GlassGradients id={id} />
      {/* the glass walls, thicker at the bottom */}
      <path d={`${outerPath} ${innerPath}`} fill={`url(#${id}-wall)`} fill-rule="evenodd" />
      {/* the roundness of the liquid and the reflection of the room above it */}
      <path d={innerPath} fill={`url(#${id}-shade)`} />
      <path d={innerPath} fill={`url(#${id}-sheen)`} />
      {/* depth: the liquid is a bit lighter at the top and denser at the bottom */}
      <path d={innerPath} fill={`url(#${id}-depth)`} />
      <path d={outerPath} fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.2" />
      <path d={innerPath} fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="1" />
      {/* the rim of the mouth */}
      <ellipse cx={glassCenterX} cy="1.5" fill="rgba(255,255,255,0.12)" rx="13" ry="2.4" stroke="rgba(255,255,255,0.7)" stroke-width="1" />
      {/* reflections: long streak on the body, small ones on the neck and on the other side */}
      <rect fill={`url(#${id}-streak)`} height="112" rx="2.5" width="5" x="8.5" y="58" />
      <rect fill={`url(#${id}-streak)`} height="26" rx="1.2" width="2.4" x="20" y="6" />
      <rect fill={`url(#${id}-streak)`} height="84" opacity="0.5" rx="1.2" width="2.4" x="44" y="66" />
      <path d="M12 52 Q14 40 22 33" fill="none" stroke="rgba(255,255,255,0.45)" stroke-linecap="round" stroke-width="1.6" />
      {/* the thick glass of the bottom */}
      <ellipse cx={glassCenterX} cy={glassBaseY} fill="rgba(255,255,255,0.16)" rx="17" ry="2" />
    </svg>
  )
}

/**
 * Display a single glass bottle
 * @param root0 the properties
 * @param root0.colors the colors contained in the bottle
 * @param root0.isLiquidHidden if the liquid should be hidden
 * @param root0.index the index of the bottle
 * @param root0.isPouring if the bottle is pouring
 * @param root0.isPourTarget if the bottle is the target of pouring
 * @param root0.isSelected if the bottle is selected
 * @returns the bottle component
 */
export function AppBottle({ colors, index, isLiquidHidden = false, isPouring = false, isPourTarget = false, isSelected }: BottleProperties) {
  // bg-red-500 bg-green-500 bg-blue-500 bg-yellow-500
  return (
    <div
      className={`bottle relative cursor-pointer transition-all ${isSelected ? 'bottle-selected -translate-y-3' : 'hover:-translate-y-1'} ${isPouring ? 'bottle-pouring' : ''} ${isPourTarget ? 'bottle-pour-target' : ''}`}
      data-index={index}
      style={`width:${outerWidth}px;height:${outerHeight}px`}
    >
      <div className="pointer-events-none absolute flex flex-col justify-end" style={`left:4px;top:0;width:48px;height:${interiorHeight}px;clip-path:${clipPath};visibility:${isLiquidHidden ? 'hidden' : 'visible'}`}>
        {colors.map((color, colorIndex) => (
          <div className={`${color === '' ? '' : `bg-${color}-500`} ${color !== '' && colors[colorIndex - 1] !== color ? 'liquid-layer' : ''} h-7 w-12 shrink-0`} key={`${color}-${colorIndex}`} />
        ))}
      </div>
      <BottleGlass index={index} />
    </div>
  )
}
