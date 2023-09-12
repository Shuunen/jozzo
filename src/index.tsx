/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import Button from '@mui/material/Button'
import { render } from 'preact'
import { useState } from 'preact/hooks'
import { ReactComponent as logo } from './assets/logo-fillable.svg'
import { AppBottle } from './components/bottle'
import './style.css'
import { Machine } from './utils/state.utils'

function App () {
  const [state, setState] = useState<Machine['state']>('initial')
  const [machine] = useState(new Machine((updatedState) => setState(updatedState)))

  console.count('render') // eslint-disable-line no-console

  function onClick (event: Event) {
    const element = event.target as HTMLElement // eslint-disable-line @typescript-eslint/consistent-type-assertions
    const index = Number(element.dataset.index)
    if (Number.isNaN(index)) return void 0 // eslint-disable-line no-void
    if (index === machine.context.selected) return machine.deselect()
    if (machine.context.selected === -1) return machine.select(index)
    return void machine.pour(index) // eslint-disable-line no-void
  }

  return (
    <div className="container mx-auto flex h-screen w-full max-w-xl flex-col items-center justify-center gap-6 md:justify-start" >
      {logo({ className: `${state === 'initial' ? 'pt-24 pb-6 w-4/5 fill-purple-900' : 'w-56 fill-transparent hidden md:block'} drop-shadow-lg transition-all`, title: 'app logo' }) /* eslint-disable-line unicorn/no-keyword-prefix */}
      {state === 'initial' && <Button onClick={() => machine.start()} variant='contained'>Start game</Button>}
      {state !== 'initial' && <>
        <Button color='warning' onClick={() => machine.reset()} variant='contained'>Reset game</Button>
        <div className="my-6 flex justify-center">
          <div className="grid grid-cols-3 gap-12" onClick={onClick}>
            {machine.context.bottles.map((bottle, index) => <AppBottle colors={bottle} index={index} isSelected={machine.context.selected === index} key={index} />)}
          </div>
        </div>
      </>}
      <pre>state : {state} <span className="text-2xl">{machine.icon()}</span></pre>
    </div>
  )
}

// eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope
const mountingElement = document.querySelector<HTMLElement>('#app')
if (!mountingElement) throw new Error('Could not find #app')
render(<App />, mountingElement)
