import { expect, it } from 'vitest'
import { interpret } from 'xstate'
import { gameMachine } from '../src/utils/state.utils'

it('state A initial > ready > selected', () => {
  const game = interpret(gameMachine).start()
  expect(game.getSnapshot().matches('initial')).toBe(true)
  game.send('start')
  expect(game.getSnapshot().matches('ready')).toBe(true)
  game.send('select')
  expect(game.getSnapshot().matches('selected')).toBe(true)
})

it('state B initial cannot go into selected', () => {
  const game = interpret(gameMachine).start()
  expect(game.getSnapshot().matches('initial')).toBe(true)
  game.send('select')
  expect(game.getSnapshot().matches('initial')).toBe(true)
})

it('state C selected > ready', () => {
  const game = interpret(gameMachine).start()
  expect(game.getSnapshot().matches('initial')).toBe(true)
  game.send('start')
  game.send('select', { index: 1 })
  expect(game.getSnapshot().matches('selected')).toBe(true)
  game.send('deselect')
  expect(game.getSnapshot().matches('ready')).toBe(true)
})

it('state D selected > pouring > ready', () => {
  const game = interpret(gameMachine).start()
  expect(game.getSnapshot().matches('initial')).toBe(true)
  game.send('start')
  game.send('select', { index: 1 })
  expect(game.getSnapshot().matches('selected')).toBe(true)
  game.send('pour', { index: 2 })
  expect(game.getSnapshot().matches('pouring')).toBe(true)
  game.send('stopPouring')
  expect(game.getSnapshot().matches('ready')).toBe(true)
})
