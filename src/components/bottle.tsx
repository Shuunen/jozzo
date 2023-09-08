/* eslint-disable tailwindcss/no-custom-classname */
/* eslint-disable react/no-array-index-key */

/**
 * Display a bottle
 * @param props
 * @returns
 */
import type { Color } from '../utils/colors'

type BottleProperties = {
  readonly colors: Color[]
  readonly index: number
  readonly isSelected: boolean
}

export function AppBottle ({ colors, index, isSelected }: BottleProperties) {
  // bg-red-500 bg-green-500 bg-blue-500 bg-yellow-500
  return (
    <div className={`flex cursor-pointer flex-col border-2 border-t-0 shadow-white transition-transform ${isSelected ? '-translate-y-3' : ''}`} data-index={index}>
      {colors.map((color, colorIndex) => <div className={`bg-${color}-500 pointer-events-none h-4 w-8`} key={`${color}-${colorIndex}`} />)}
    </div>
  )
}


