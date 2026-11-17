import { sleep } from 'shuutils'
import { logger } from './logger.utils'
import { Machine } from './state.utils'

describe('state', () => {
  beforeAll(() => {
    logger.disable()
  })

  afterAll(() => {
    logger.enable()
  })

  it('state A initial > ready > selected', () => {
    expect.hasAssertions()
    const machine = new Machine()
    expect(machine.state).toBe('initial')
    machine.start()
    expect(machine.state).toBe('ready')
    machine.select(2)
    expect(machine.state).toBe('selected')
  })

  it('state B initial cannot go into selected', () => {
    expect.hasAssertions()
    const machine = new Machine()
    expect(machine.state).toBe('initial')
    expect(() => {
      machine.select(2)
    }).toThrow(/./u)
  })

  it('state C selected > ready', () => {
    expect.hasAssertions()
    const machine = new Machine()
    machine.start()
    machine.select(2)
    machine.deselect()
    expect(machine.state).toBe('ready')
  })

  it('state D selected > pouring > ready', async () => {
    expect.hasAssertions()
    const machine = new Machine()
    machine.start()
    machine.select(2)
    expect(machine.state).toBe('selected')
    await sleep(1)
    await machine.pour(3)
    expect(machine.state).toBe('ready')
  })

  it('state E get selected', () => {
    expect.hasAssertions()
    const machine = new Machine()
    machine.start()
    machine.select(2)
    expect(machine.selected).toBe(2)
  })

  it('state F reset', () => {
    expect.hasAssertions()
    const machine = new Machine()
    machine.start()
    machine.select(2)
    machine.reset()
    expect(machine.state).toBe('initial')
  })

  it('state G icon', () => {
    expect.hasAssertions()
    const machine = new Machine()
    expect(machine.icon()).toHaveLength(2)
  })

  it('state H get bottles', () => {
    expect.hasAssertions()
    const machine = new Machine()
    expect(machine.bottles).toHaveLength(0)
  })
})
