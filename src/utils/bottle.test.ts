/* eslint-disable id-length */
import { expect, it } from 'vitest'
import { getBottles, pour } from './bottle.utils'
import type { Bottle } from './colors.utils'

it('pour A', () => {
  const a: Bottle = ['', '', 'blue']
  const b: Bottle = ['', '', '']

  const [aUpdated, bUpdated] = pour(a, b)
  expect(aUpdated).toEqual(['', '', ''])
  expect(bUpdated).toEqual(['', '', 'blue'])
})

it('pour A bis', () => {
  const a: Bottle = ['red', 'yellow', 'blue']
  const b: Bottle = ['', '', '']

  const [aUpdated, bUpdated] = pour(a, b)
  expect(aUpdated).toEqual(['', 'yellow', 'blue'])
  expect(bUpdated).toEqual(['', '', 'red'])
})

it('pour B', () => {
  const a: Bottle = ['', '', '']
  const b: Bottle = ['', '', '']

  const [aUpdated, bUpdated] = pour(a, b)
  expect(aUpdated).toEqual(['', '', ''])
  expect(bUpdated).toEqual(['', '', ''])
})

it('pour C', () => {
  const a: Bottle = ['', '', '']
  const b: Bottle = ['', '', 'blue']

  const [aUpdated, bUpdated] = pour(a, b)
  expect(aUpdated).toEqual(['', '', ''])
  expect(bUpdated).toEqual(['', '', 'blue'])
})

it('pour D', () => {
  const a: Bottle = ['yellow', 'yellow', 'blue']
  const b: Bottle = ['', '', 'blue']

  const [aUpdated, bUpdated] = pour(a, b)
  expect(aUpdated).toEqual(['', '', 'blue'])
  expect(bUpdated).toEqual(['yellow', 'yellow', 'blue'])
})

it('pour E', () => {
  const a: Bottle = ['yellow', 'yellow', 'blue']
  const b: Bottle = ['', '', '']

  const [aUpdated, bUpdated] = pour(a, b)
  expect(aUpdated).toEqual(['', '', 'blue'])
  expect(bUpdated).toEqual(['', 'yellow', 'yellow'])
})

it('pour F', () => {
  const a: Bottle = ['yellow', 'yellow', 'blue']
  const b: Bottle = ['blue', 'blue', 'blue']

  const [aUpdated, bUpdated] = pour(a, b)
  expect(aUpdated).toEqual(['yellow', 'yellow', 'blue'])
  expect(bUpdated).toEqual(['blue', 'blue', 'blue'])
})

it('pour G', () => {
  const a: Bottle = ['yellow', 'yellow', 'blue']
  const b: Bottle = ['', 'yellow', 'blue']

  const [aUpdated, bUpdated] = pour(a, b)
  expect(aUpdated).toEqual(['', 'yellow', 'blue'])
  expect(bUpdated).toEqual(['yellow', 'yellow', 'blue'])
})

it('getBottles A', () => {
  const bottles = getBottles()
  expect(bottles.length).toBeGreaterThan(1)
})
