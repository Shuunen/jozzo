/* eslint-disable react/no-array-index-key */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import Button from '@mui/material/Button'
import { useMachine } from '@xstate/react'
import { render } from 'preact'
import { sleep } from 'shuutils'
import { ReactComponent as logo } from './assets/logo-fillable.svg'
import { AppBottle } from './components/bottle'
import './style.css'
import { gameMachine } from './utils/state.utils'

function App () {
  const [state, action] = useMachine(gameMachine)
  const { bottles, selected } = state.context

  console.count('render') // eslint-disable-line no-console

  function onClick (event: Event) {
    const element = event.target as HTMLElement // eslint-disable-line @typescript-eslint/consistent-type-assertions
    const index = Number(element.dataset.index)
    if (Number.isNaN(index)) return void 0 // eslint-disable-line no-void
    if (index === selected) return action('deselect')
    if (selected === -1) return action('select', { index })
    return action('pour', { index })
  }

  function onStart () {
    action('start')
  }

  function onReset () {
    action('reset')
  }

  function getStateIcon () {
    if (state.value === 'initial') return '🎬'
    if (state.value === 'ready') return '🏎️'
    if (state.value === 'selected') return '🏹'
    if (state.value === 'pouring') return '💧'
    if (state.value === 'win') return '🥳'
    if (state.value === 'loose') return '😭'
    return '🤔'
  }

  // start animation
  if (state.matches('pouring')) void sleep(600).then(() => action('stopPouring')) // eslint-disable-line promise/prefer-await-to-then

  return (
    <div className="container mx-auto flex h-screen w-full max-w-xl flex-col items-center justify-center gap-6 md:justify-start" >
      {logo({ className: `${state.matches('initial') ? 'pt-24 pb-6 w-4/5 fill-purple-900' : 'w-56 fill-transparent hidden md:block'} drop-shadow-lg transition-all`, title: 'app logo' }) /* eslint-disable-line unicorn/no-keyword-prefix */}
      {state.matches('initial') && <Button onClick={onStart} variant='contained'>Start game</Button>}
      {!state.matches('initial') && <>
        <Button color='warning' onClick={onReset} variant='contained'>Reset game</Button>
        <div className="my-6 flex justify-center">
          <div className="grid grid-cols-3 gap-12" onClick={onClick}>
            {bottles.map((bottle, index) => <AppBottle colors={bottle} index={index} isSelected={selected === index} key={index} />)}
          </div>
        </div>
      </>}
      <pre>state : {state.value} <span className="text-2xl">{getStateIcon()}</span></pre>
    </div>
  )
}

// eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope
const mountingElement = document.querySelector<HTMLElement>('#app')
if (!mountingElement) throw new Error('Could not find #app')
render(<App />, mountingElement)
