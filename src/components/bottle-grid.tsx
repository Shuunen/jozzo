import { useState } from 'preact/hooks'
import Confetti from 'react-confetti-boom'
import { tw } from 'shuutils'
import hat from '../assets/hat.svg?react'
import { playPouringSound, winEffects } from '../utils/effects.utils'
import { animatePour } from '../utils/pour-animation.utils'
import { machine } from '../utils/state.utils'
import { AppBottle } from './bottle'

type PouringInfo = undefined | { from: number; hasAnimation: boolean; to: number }

// when the tab is hidden, frames are not painted
const paintFallbackMs = 150
// when there is nothing to animate
const noAnimationDuration = 300

/**
 * Wait for the next frames to be painted (with a fallback when the tab is hidden)
 * @returns a promise resolved after two frames
 */
async function waitForPaint() {
  const twoFrames = new Promise<void>(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
  })
  const fallback = new Promise<void>(resolve => {
    setTimeout(resolve, paintFallbackMs)
  })
  await Promise.race([twoFrames, fallback])
}

/**
 * Pour the selected bottle into another one, with the animation and its sound
 * @param index The index of the target bottle
 * @param setPouringInfo State setter for pouring info
 */
async function startPour(index: number, setPouringInfo: (info: PouringInfo) => void) {
  const from = machine.selected
  const fromBottle = machine.bottles[from]
  const toBottle = machine.bottles[index]
  const animation = fromBottle && toBottle ? animatePour({ from, fromBottle: [...fromBottle], to: index, toBottle: [...toBottle] }) : undefined
  setPouringInfo({ from, hasAnimation: animation !== undefined, to: index })
  // the animation makes its own sound, following the fill level
  if (!animation) playPouringSound()
  await Promise.all([machine.pour(index, animation?.duration ?? noAnimationDuration), animation?.finished])
  // let the dom paint the final liquid under the canvas before removing it, else the bottles blink
  await waitForPaint()
  animation?.stop()
  setPouringInfo(undefined)
}

/**
 * Handles bottle selection and pouring logic
 * @param index The index of the bottle
 * @param setPouringInfo State setter for pouring info
 */
async function handleBottleSelection(index: number, setPouringInfo: (info: PouringInfo) => void) {
  if (machine.state === 'pouring') return
  if (index === machine.selected) {
    machine.deselect()
    return
  }
  if (machine.selected === -1) {
    machine.select(index)
    return
  }
  await startPour(index, setPouringInfo)
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
export function BottleGrid(properties: { state: (typeof machine)['state'] }) {
  const { state } = properties
  const [pouringInfo, setPouringInfo] = useState<PouringInfo>()
  const hasWon = state === 'win'
  if (hasWon) winEffects()
  // the pouring bottles keep their classes (z-index above the canvas) until the animation is really removed
  const isPouringState = pouringInfo !== undefined
  const isLiquidHidden = state === 'pouring' && pouringInfo?.hasAnimation === true

  return (
    <div className="my-6 flex justify-center">
      {hasWon && <Confetti mode="fall" />}
      <div
        className="grid grid-cols-3 gap-x-12 gap-y-6"
        onClick={event => {
          handleBottleClick(event, setPouringInfo)
        }}
      >
        {machine.bottles.map((bottle, index) => {
          const isPouring = isPouringState && pouringInfo.from === index
          const isPourTarget = isPouringState && pouringInfo.to === index
          return <AppBottle colors={bottle} index={index} isLiquidHidden={(isPouring || isPourTarget) && isLiquidHidden} isPouring={isPouring} isPourTarget={isPourTarget} isSelected={machine.selected === index} key={index} />
        })}
      </div>
      {hasWon && <Confetti mode="boom" />}
      {hasWon && hat({ className: tw('hat-win-animation absolute h-64') })}
    </div>
  )
}
