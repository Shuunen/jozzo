import { sleep } from 'shuutils'
import { expect, it } from 'vitest'
import { Machine } from '../src/utils/state.utils'

it('state A initial > ready > selected', () => {
  const machine = new Machine()
  expect(machine.state).toBe('initial')
  machine.start()
  expect(machine.state).toBe('ready')
  machine.select(2)
  expect(machine.state).toBe('selected')
})


it('state B initial cannot go into selected', () => {
  const machine = new Machine()
  expect(machine.state).toBe('initial')
  expect(() => machine.select(2)).toThrowError()
})

it('state C selected > ready', () => {
  const machine = new Machine()
  machine.start()
  machine.select(2)
  machine.deselect()
  expect(machine.state).toBe('ready')
})

it('state D selected > pouring > ready', async () => {
  const machine = new Machine()
  machine.start()
  machine.select(2)
  expect(machine.state).toBe('selected')
  await sleep(1)
  await machine.pour(3)
  expect(machine.state).toBe('ready')
})

it('state E get context', () => {
  const machine = new Machine()
  machine.start()
  machine.select(2)
  expect(machine.context.selected).toBe(2)
})

it('state F reset', () => {
  const machine = new Machine()
  machine.start()
  machine.select(2)
  machine.reset()
  expect(machine.state).toBe('initial')
})

it('state G icon', () => {
  const machine = new Machine()
  expect(machine.icon().length).toBe(2)
})

it('state H transition callback', () => {
  let count = 0
  const machine = new Machine(() => { count += 1 })
  machine.start()
  machine.select(2)
  machine.reset()
  expect(count).toBe(4)
})
