import Button from '@mui/material/Button'
import { render } from 'preact'
import { useState } from 'preact/hooks'
import logo from './assets/logo-fillable.svg?react'
import { BottleGrid } from './components/bottle-grid'
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

  return (
    <div className="container mx-auto flex h-screen w-full max-w-xl flex-col items-center justify-center gap-6 md:justify-start" >
      {logo({ className: `${state === 'initial' ? 'pt-24 pb-6 w-4/5 fill-purple-900' : 'w-56 fill-transparent hidden md:block'} drop-shadow-lg transition-all`, title: 'app logo' }) /* eslint-disable-line unicorn/no-keyword-prefix */}
      {state === 'initial' && <Button onClick={() => machine.start()} variant='contained'>Start game</Button>}
      {state !== 'initial' && <>
        <Button color='warning' onClick={() => machine.reset()} variant='contained'>Reset game</Button>
        <BottleGrid state={state} />
      </>}
      <pre>state : {state} <span className="text-2xl">{machine.icon()}</span></pre>
      <footer class="fixed bottom-2 right-5 mt-4 text-center text-xs font-thin text-gray-500">
        __unique-mark__
      </footer>
    </div>
  )
}

const mountingElement = document.querySelector<HTMLElement>('#app')
// eslint-disable-next-line no-restricted-syntax
if (!mountingElement) throw new Error('Could not find #app')
render(<App />, mountingElement)
