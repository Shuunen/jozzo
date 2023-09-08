/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { render } from 'preact'
import { useState } from 'preact/hooks'
import { pickOne } from 'shuutils'
import { AppBottle } from './components/bottle'
import './style.css'
import { colors, type Bottle } from './utils/colors'

function getColors (nbColors = 5) {
  const bottle: Bottle = []
  for (let index = 0; index < nbColors; index += 1) {
    const color = pickOne(Array.from(colors))
    bottle.push(color)
  }
  return bottle.sort() // eslint-disable-line etc/no-assign-mutated-array
}

function getBottles (nbBottles = 6) {
  const bottles: Bottle[] = []
  for (let index = 0; index < nbBottles; index += 1) bottles.push(getColors())
  return bottles
}

function App () {
  const [selectedBottle, setSelectedBottle] = useState<number>(-1)
  const [bottles] = useState<Bottle[]>(getBottles())

  function onClick (event: Event) {
    const element = event.target as HTMLElement // eslint-disable-line @typescript-eslint/consistent-type-assertions
    const index = Number(element.dataset.index)
    if (Number.isNaN(index)) return
    const selected = selectedBottle === index ? -1 : index
    setSelectedBottle(selected)
  }

  return (
    <div className="grid grid-cols-3 gap-8" onClick={onClick}>
      {bottles.map((bottle, index) => <AppBottle colors={bottle} index={index} isSelected={selectedBottle === index} key={index} />)}
    </div>
  )
}

// eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope
const mountingElement = document.querySelector<HTMLElement>('#app')
if (!mountingElement) throw new Error('Could not find #app')
render(<App />, mountingElement)
