import { sleep } from 'shuutils'
import { logger } from './logger.utils'

export class Machine {

  private localState: 'initial' | 'loose' | 'pouring' | 'ready' | 'selected' | 'win' = 'initial'

  private readonly localContext = { bottles: [], selected: -1 }

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
  }
  public start () {
    logger.debug('state start')
    this.transition('initial', 'ready')
    // setup game
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
  public async pour (index: number) {
    this.transition('selected', 'pouring')
    logger.info(`pouring bottle ${this.localContext.selected} into bottle ${index}`)
    // pouring logic...
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    await sleep(600)
    this.deselect('pouring')
  }
}

export const machine = new Machine()
