import Button from '@mui/material/Button'
import { render } from 'preact'
import { useState } from 'preact/hooks'
import logo from './assets/logo-fillable.svg?react'
import { AppBottle } from './components/bottle'
import './style.css'
import { machine } from './utils/state.utils'

/**
 * The main application
 * @returns the application component
 */
function App () {
  const [state, setState] = useState<typeof machine['state']>('initial')
  machine.watchContext('state', () => setState(machine.state))

  console.count('render') // eslint-disable-line no-console

  /**
   * Handle the click event on a bottle
   * @param event the click event
   * @returns nothing
   */
  function onClick (event: Event) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/consistent-type-assertions
    const element = event.target as HTMLElement
    const index = Number(element.dataset.index)
    if (Number.isNaN(index)) return void 0 // eslint-disable-line no-void
    if (index === machine.selected) return machine.deselect()
    if (machine.selected === -1) return machine.select(index)
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
            {machine.bottles.map((bottle, index) => <AppBottle colors={bottle} index={index} isSelected={machine.selected === index} key={index} />)}
          </div>
        </div>
      </>}
      <pre>state : {state} <span className="text-2xl">{machine.icon()}</span></pre>
      <footer class="fixed bottom-2 right-5 mt-4 text-center text-xs font-thin text-gray-500">
        __unique-mark__
      </footer>
    </div>
  )
}

const mountingElement = document.querySelector<HTMLElement>('#app')
if (!mountingElement) throw new Error('Could not find #app')
render(<App />, mountingElement)
