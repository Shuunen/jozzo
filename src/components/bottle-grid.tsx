import { useState } from 'preact/hooks'
import { machine } from '../utils/state.utils'
import { AppBottle } from './bottle'

type PouringInfo = undefined | { from: number; to: number }

/**
 * Handles bottle selection and pouring logic
 * @param index The index of the bottle
 * @param setPouringInfo State setter for pouring info
 */
async function handleBottleSelection(index: number, setPouringInfo: (info: PouringInfo) => void) {
  if (index === machine.selected) {
    machine.deselect()
    return
  }
  if (machine.selected === -1) {
    machine.select(index)
    return
  }
  setPouringInfo({ from: machine.selected, to: index })
  await machine.pour(index)
  setPouringInfo(undefined)
}

/**
 * Handles click on a bottle
 * @param event The click event
 * @param setPouringInfo State setter for pouring info
 */
function handleBottleClick(event: Event, setPouringInfo: (info: PouringInfo) => void) {
  const element = event.target instanceof HTMLElement ? event.target : undefined
  if (!element) return
  const index = Number(element.dataset.index)
  if (Number.isNaN(index)) return
  void handleBottleSelection(index, setPouringInfo)
}

/**
 * Grid of bottles for the game
 * @param properties The properties object
 * @param properties.state Current game state
 * @returns JSX.Element
 */
export function BottleGrid(properties: { state: typeof machine['state'] }) {
  const { state } = properties
  const [pouringInfo, setPouringInfo] = useState<PouringInfo>()

  return (
    <div className="my-6 flex justify-center">
      <div className="grid grid-cols-3 gap-12" onClick={event => handleBottleClick(event, setPouringInfo)}>
        {machine.bottles.map((bottle, index) => (
          <AppBottle
            colors={bottle}
            index={index}
            isPouring={pouringInfo !== undefined && pouringInfo.from === index && state === 'pouring'}
            isPourTarget={pouringInfo !== undefined && pouringInfo.to === index && state === 'pouring'}
            isSelected={machine.selected === index}
            key={index}
          />
        ))}
      </div>
    </div>
  )
}
