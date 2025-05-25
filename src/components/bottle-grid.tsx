import { machine } from '../utils/state.utils';
import { AppBottle } from './bottle';

/**
 * Grid of bottles for the game
 * @param root0 The props object
 * @param root0.pouringInfo Info about which bottle is pouring
 * @param root0.state Current game state
 * @returns JSX.Element
 */
export function BottleGrid({
  pouringInfo: gridPouringInfo,
  state: gridState,
}: {
  pouringInfo: undefined | { from: number; to: number }
  state: typeof machine['state']
}) {
  /**
   * Handle the click event on a bottle
   * @param event The click event
   * @returns nothing
   */
  function handleBottleClick(event: Event) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/consistent-type-assertions
    const element = event.target as HTMLElement
    const index = Number(element.dataset.index)
    if (Number.isNaN(index)) return void 0 // eslint-disable-line no-void
    if (index === machine.selected) return machine.deselect()
    if (machine.selected === -1) return machine.select(index)
    return void machine.pour(index) // eslint-disable-line no-void
  }

  return (
    <div className="my-6 flex justify-center">
      <div className="grid grid-cols-3 gap-12" onClick={handleBottleClick}>
        {machine.bottles.map((bottle, index) => (
          <AppBottle
            colors={bottle}
            index={index}
            isPouring={gridPouringInfo !== undefined && gridPouringInfo.from === index && gridState === 'pouring'}
            isPourTarget={gridPouringInfo !== undefined && gridPouringInfo.to === index && gridState === 'pouring'}
            isSelected={machine.selected === index}
            key={index}
          />
        ))}
      </div>
    </div>
  )
}
