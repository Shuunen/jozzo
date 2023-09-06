/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { render } from 'preact'
import { useState } from 'preact/hooks'
import { pickOne } from 'shuutils'
import { Bottle } from './components/bottle'
import './style.css'
import { colors, type Color } from './utils/colors'


function getColors (nbColors = 5) {
  const bottle: Color[] = []
  for (let index = 0; index < nbColors; index += 1) {
    const color = pickOne(Array.from(colors))
    bottle.push(color)
  }
  // eslint-disable-next-line etc/no-assign-mutated-array
  return bottle.sort()
}

function getBottles (nbBottles = 6) {
  const bottles: Color[][] = []

  for (let index = 0; index < nbBottles; index += 1)
    bottles.push(getColors())

  return bottles
}

function App () {
  const [selectedBottle, setSelectedBottle] = useState<number>(-1)
  const [bottles] = useState<Color[][]>(getBottles())

  function onClick (event: Event) {
    const element = event.target as HTMLElement // eslint-disable-line @typescript-eslint/consistent-type-assertions
    const index = Number(element.dataset.index)
    if (Number.isNaN(index)) return
    const selected = selectedBottle === index ? -1 : index
    setSelectedBottle(selected)
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="grid gap-8 grid-cols-3" onClick={onClick}>
      {bottles.map((bottle, index) => <Bottle colors={bottle} index={index} isSelected={selectedBottle === index} key={index} />)}
    </div>
  )
}

// eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope
const mountingElement = document.querySelector<HTMLElement>('#app')
if (!mountingElement) throw new Error('Could not find #app')
render(<App />, mountingElement)
