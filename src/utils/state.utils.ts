import { createState, sleep } from 'shuutils'
import { getBottles, pour } from './bottle.utils'
import type { Bottle } from './colors.utils'
import { logger } from './logger.utils'

type State = 'initial' | 'loose' | 'pouring' | 'ready' | 'selected' | 'win'

type Context = { bottles: Bottle[]; selected: number; state: State }

// eslint-disable-next-line no-restricted-syntax
export class Machine {
  private readonly context: Context = { bottles: [], selected: -1, state: 'initial' }
  public readonly watchContext: (key: keyof Context, callback: () => void) => void
  public constructor () {
    const { state, watchState } = createState<Context>(this.context)
    this.context = state
    this.watchContext = watchState
  }
  private transition (from: State, to: State) {
    logger.debug(`state transition ${from} => ${to} (actual ${this.state})`)
    if (from !== this.state) throw new Error(`state cannot apply transition ${from} => ${to} (actual ${this.state})`)
    this.context.state = to
  }
  public deselect (from: State = 'selected') {
    this.transition(from, 'ready')
    this.context.selected = -1
  }
  public icon () {
    const { state } = this
    /* c8 ignore next 7 */
    if (state === 'initial') return '🎬'
    if (state === 'ready') return '🏎️'
    if (state === 'selected') return '🏹'
    if (state === 'pouring') return '💧'
    if (state === 'win') return '🥳'
    if (state === 'loose') return '😭' // eslint-disable-line @typescript-eslint/no-unnecessary-condition
    return '🤔'
  }
  // eslint-disable-next-line max-statements
  public async pour (index: number) {
    this.transition('selected', 'pouring')
    const { bottles, selected } = this.context
    logger.info(`pouring bottle ${selected} into bottle ${index}`)
    await sleep(600) // eslint-disable-line @typescript-eslint/no-magic-numbers
    const from = bottles[selected]
    const to = bottles[index]
    /* c8 ignore next */
    if (!from || !to) throw new Error('bottle from/to not found')
    const [fromUpdated, toUpdated] = pour(from, to)
    bottles[selected] = fromUpdated
    bottles[index] = toUpdated
    this.deselect('pouring')
  }
  public reset () {
    this.deselect(this.state)
    this.transition('ready', 'initial')
  }
  public select (index: number) {
    logger.debug('state select')
    this.transition('ready', 'selected')
    this.context.selected = index
  }
  public start () {
    logger.debug('state start')
    this.transition('initial', 'ready')
    this.context.bottles = getBottles()
  }
  public get bottles () {
    return this.context.bottles
  }
  public get selected () {
    return this.context.selected
  }
  public get state () {
    return this.context.state
  }
}

export const machine = new Machine()
