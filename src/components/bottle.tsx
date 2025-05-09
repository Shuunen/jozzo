/**
 * Display a bottle
 * @param props
 * @returns
 */
import type { Color } from '../utils/colors.utils'

type BottleProperties = {
  readonly colors: Color[]
  readonly index: number
  readonly isSelected: boolean
}

/**
 * Display a single bottle
 * @param root0 the properties
 * @param root0.colors the colors contained in the bottle
 * @param root0.index the index of the bottle
 * @param root0.isSelected if the bottle is selected
 * @returns the bottle component
 */
export function AppBottle ({ colors, index, isSelected }: BottleProperties) {
  // bg-red-500 bg-green-500 bg-blue-500 bg-yellow-500
  return (
    <div className={`flex cursor-pointer flex-col border-2 border-t-0 shadow-lg shadow-purple-800 transition-all hover:shadow-purple-500 ${isSelected ? '-translate-y-3 shadow-purple-200 hover:shadow-purple-200' : 'hover:-translate-y-1'}`} data-index={index}>
      {colors.map((color, colorIndex) => <div className={`bg-${color}-500 pointer-events-none h-7 w-12`} key={`${color}-${colorIndex}`} />)}
    </div>
  )
}


