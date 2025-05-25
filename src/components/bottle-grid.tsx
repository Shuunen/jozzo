import { useState } from 'preact/hooks'
import Confetti from 'react-confetti-boom'
import { tw } from 'shuutils'
import hat from '../assets/hat.svg?react'
import { backgroundMusic, fireworksSound, playPouringSound, winTheme } from '../utils/audio.utils'
import { machine } from '../utils/state.utils'
import { AppBottle } from './bottle'

type PouringInfo = undefined | { from: number; to: number }

/**
 * Handles bottle selection and pouring logic
 * @param index The index of the bottle
 * @param setPouringInfo State setter for pouring info
 */
async function handleBottleSelection (index: number, setPouringInfo: (info: PouringInfo) => void) {
  if (index === machine.selected) {
    machine.deselect()
    return
  }
  if (machine.selected === -1) {
    machine.select(index)
    return
  }
  setPouringInfo({ from: machine.selected, to: index })
  playPouringSound()
  await machine.pour(index)
  setPouringInfo(undefined)
}

/**
 * Handles click on a bottle
 * @param event The click event
 * @param setPouringInfo State setter for pouring info
 */
function handleBottleClick (event: Event, setPouringInfo: (info: PouringInfo) => void) {
  const element = event.target instanceof HTMLElement ? event.target : undefined
  if (!element) return
  const index = Number(element.dataset.index)
  if (Number.isNaN(index)) return
  void handleBottleSelection(index, setPouringInfo)
}

/**
 * Plays the win ceremony ^^
 */
function onWin () {
  backgroundMusic.pause()
  void fireworksSound.play()
  void winTheme.play()
}

/**
 * Grid of bottles for the game
 * @param properties The properties object
 * @param properties.state Current game state
 * @returns JSX.Element
 */
export function BottleGrid (properties: { state: typeof machine['state'] }) {
  const { state } = properties
  const [pouringInfo, setPouringInfo] = useState<PouringInfo>()
  const hasWon = state === 'win'
  if (hasWon) onWin()

  return (
    <div className="my-6 flex justify-center">
      {hasWon && <Confetti mode='fall' />}
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
      {hasWon && <Confetti mode='boom' />}
      {hasWon && hat({ className: tw('absolute h-64 hat-win-animation') }) /* eslint-disable-line unicorn/no-keyword-prefix */}
    </div>
  )
}
