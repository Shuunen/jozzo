/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import { sleep } from 'shuutils'
import { logger } from './logger.utils'

class Machine {
  public get state () {
    return this._state
  }
  private set state (value: typeof this._state) {
    this._state = value
    logger.debug(`state changed to "${value}"`)
  }
  public get context () {
    return this._context
  }
  private deselect () {
    this._context.selected = -1
  }
  private needState (stateFrom: typeof this._state, stateTo: typeof this._state) {
    if (stateFrom === this._state) return
    throw new Error(`need to be in "${stateFrom}" state to go into "${stateTo}" but current state is "${this._state}"`)
  }
  public start () {
    this.needState('initial', 'ready')
    this.state = 'ready'
    // setup game
    this.deselect()
  }
  public select (index: number) {
    this.needState('ready', 'selected')
    this.state = 'selected'
    this._context.selected = index
  }
  public async pour (index: number) {
    this.needState('selected', 'pouring')
    this.state = 'pouring'
    logger.info(`pouring bottle ${this._context.selected} into bottle ${index}`)
    // pouring logic...
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    await sleep(2000)
    this.deselect()
    this.state = 'ready'
  }
  private _state: 'initial' | 'loose' | 'pouring' | 'ready' | 'selected' | 'win' = 'initial'
  private readonly _context = { bottles: [], selected: -1 }
}

export const machine = new Machine()
