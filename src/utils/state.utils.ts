import { createMachine } from 'xstate'
import { getBottles, pour } from './bottle.utils'
import type { Bottle } from './colors.utils'

type StateContext = { bottles: Bottle[]; selected: number; target: number }
type States = { context: StateContext; value: 'initial' | 'pouring' | 'ready' | 'selected' }
type Events = { index: number; type: 'pour' | 'reset' | 'select' } | { type: 'deselect' | 'start' | 'stopPouring' }

export const gameMachine = createMachine<StateContext, Events, States>(
  {
    context: {
      bottles: [],
      selected: -1,
      target: -1,
    },
    id: 'jozzo',
    initial: 'initial',
    states: {
      initial: {
        on: {
          start: {
            actions: (context) => {
              context.bottles = getBottles()
            },
            target: 'ready',
          },
        },
      },
      pouring: {
        exit: (context) => {
          const bottleFrom = context.bottles[context.selected]
          const bottleTo = context.bottles[context.target]
          /* c8 ignore next */
          if (bottleFrom === undefined || bottleTo === undefined) throw new Error('bottles[selected] is undefined')
          const [bottleFromUpdated, bottleToUpdated] = pour(bottleFrom, bottleTo)
          context.bottles[context.selected] = bottleFromUpdated
          context.bottles[context.target] = bottleToUpdated
          context.selected = -1
          context.target = -1
        },
        on: {
          stopPouring: 'ready',
        },
      },
      ready: {
        on: {
          reset: {
            target: 'initial',
          },
          select: {
            actions: (context, { index }) => {
              context.selected = index
            },
            target: 'selected',
          },
        },
      },
      selected: {
        on: {
          deselect: {
            actions: (context) => {
              context.selected = -1
            },
            target: 'ready',
          },
          pour: {
            actions: (context, { index }) => {
              context.target = index
            },
            target: 'pouring',
          },
          reset: {
            target: 'initial',
          },
        },
      },
    },
  },
)
