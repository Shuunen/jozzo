import { sleep } from 'shuutils'
import { getBottles, pour } from './bottle.utils'
import type { Bottle } from './colors.utils'
import { logger } from './logger.utils'

type Context = {
  bottles: Bottle[]
  selected: number
}

export class Machine {

  private localState: 'initial' | 'loose' | 'pouring' | 'ready' | 'selected' | 'win' = 'initial'

  private readonly localContext: Context = { bottles: [], selected: -1 }

  public constructor (private readonly onTransition?: (updatedState: Machine['localState']) => void) { }

  public get state () {
    return this.localState
  }
  public get context () {
    return this.localContext
  }
  private transition (from: typeof this.localState, to: typeof this.localState) {
    logger.debug(`state transition ${from} => ${to} (actual ${this.localState})`)
    if (from !== this.localState) throw new Error(`state cannot apply transition ${from} => ${to} (actual ${this.localState})`)
    this.localState = to
    this.onTransition?.(to)
  }
  public start () {
    logger.debug('state start')
    this.transition('initial', 'ready')
    this.localContext.bottles = getBottles()
  }
  public select (index: number) {
    logger.debug('state select')
    this.transition('ready', 'selected')
    this.localContext.selected = index
  }
  public deselect (from: typeof this.localState = 'selected') {
    this.transition(from, 'ready')
    this.localContext.selected = -1
  }
  public reset () {
    this.deselect(this.localState)
    this.transition('ready', 'initial')
  }
  public icon () {
    const state = this.localState
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
    logger.info(`pouring bottle ${this.localContext.selected} into bottle ${index}`)
    await sleep(600) // eslint-disable-line @typescript-eslint/no-magic-numbers
    const { bottles, selected } = this.localContext
    const from = bottles[selected]
    const to = bottles[index]
    /* c8 ignore next */
    if (!from || !to) throw new Error('bottle from/to not found')
    const [fromUpdated, toUpdated] = pour(from, to)
    bottles[selected] = fromUpdated
    bottles[index] = toUpdated
    this.deselect('pouring')
  }
}
