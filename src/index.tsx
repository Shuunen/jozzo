/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import Button from '@mui/material/Button'
import { render } from 'preact'
import { useState } from 'preact/hooks'
import { pickOne, sleep } from 'shuutils'
import { ReactComponent as logo } from './assets/logo-fillable.svg'
import { AppBottle } from './components/bottle'
import './style.css'
import { pour } from './utils/bottle.utils'
import { colors, type Bottle } from './utils/colors.utils'
import { machine } from './utils/state.utils'

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

// eslint-disable-next-line max-statements
function App () {
  const [selected, setSelected] = useState<number>(-1)
  const [bottles, setBottles] = useState<Bottle[]>(getBottles())
  const [state, setState] = useState(machine.state)

  console.count('render') // eslint-disable-line no-console

  function deselect () {
    setSelected(-1)
    setState('ready')
  }

  function pourInto (index: number) {
    setState('pouring')
    const from = bottles[selected]
    const to = bottles[index]
    if (!from || !to) throw new Error('Could not find from/to bottle')
    const [updatedFrom, updatedTo] = pour(from, to)
    // eslint-disable-next-line promise/prefer-await-to-then, promise/always-return
    void sleep(600).then(() => {
      bottles[selected] = updatedFrom
      bottles[index] = updatedTo
      setBottles(Array.from(bottles))
      deselect()
    })
  }

  function onClick (event: Event) {
    const element = event.target as HTMLElement // eslint-disable-line @typescript-eslint/consistent-type-assertions
    const index = Number(element.dataset.index)
    if (Number.isNaN(index)) return void 0 // eslint-disable-line no-void
    if (index === selected) return deselect()
    setState('selected')
    if (selected === -1) return setSelected(index)
    return pourInto(index)
  }

  function onStart () {
    setState('ready')
  }

  function onReset () {
    setState('initial')
    setSelected(-1)
  }

  function getStateIcon () {
    if (state === 'initial') return '🎬'
    if (state === 'ready') return '🏎️'
    if (state === 'selected') return '🏹'
    if (state === 'pouring') return '💧'
    if (state === 'win') return '🥳'
    if (state === 'loose') return '😭' // eslint-disable-line @typescript-eslint/no-unnecessary-condition
    return '🤔'
  }

  return (
    <div className="container mx-auto flex h-screen w-full max-w-xl flex-col items-center justify-center gap-6 md:justify-start" >
      {logo({ className: `${state === 'initial' ? 'pt-24 pb-6 w-4/5 fill-purple-900' : 'w-56 fill-transparent hidden md:block'} drop-shadow-lg transition-all`, title: 'app logo' }) /* eslint-disable-line unicorn/no-keyword-prefix */}
      {state === 'initial' && <Button onClick={onStart} variant='contained'>Start game</Button>}
      {state !== 'initial' && <>
        <Button color='warning' onClick={onReset} variant='contained'>Reset game</Button>
        <div className="my-6 flex justify-center">
          <div className="grid grid-cols-3 gap-12" onClick={onClick}>
            {bottles.map((bottle, index) => <AppBottle colors={bottle} index={index} isSelected={selected === index} key={index} />)}
          </div>
        </div>
      </>}
      <pre>state : {state} <span className="text-2xl">{getStateIcon()}</span></pre>
    </div>
  )
}

// eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope
const mountingElement = document.querySelector<HTMLElement>('#app')
if (!mountingElement) throw new Error('Could not find #app')
render(<App />, mountingElement)
