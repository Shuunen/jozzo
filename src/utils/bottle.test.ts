import { asciiBottle, getBottles, pour } from './bottle.utils'
import type { Bottle } from './colors.utils'
import { logger } from './logger.utils'

describe('bottle tests', () => {
  beforeAll(() => {
    logger.disable()
  })

  afterAll(() => {
    logger.enable()
  })

  it('pour A', () => {
    expect.hasAssertions()
    const a: Bottle = ['', '', 'blue']
    const b: Bottle = ['', '', '']

    const [aUpdated, bUpdated] = pour(a, b)
    expect(aUpdated).toStrictEqual(['', '', ''])
    expect(bUpdated).toStrictEqual(['', '', 'blue'])
  })

  it('pour A bis', () => {
    expect.hasAssertions()
    const a: Bottle = ['red', 'yellow', 'blue']
    const b: Bottle = ['', '', '']

    const [aUpdated, bUpdated] = pour(a, b)
    expect(aUpdated).toStrictEqual(['', 'yellow', 'blue'])
    expect(bUpdated).toStrictEqual(['', '', 'red'])
  })

  it('pour B', () => {
    expect.hasAssertions()
    const a: Bottle = ['', '', '']
    const b: Bottle = ['', '', '']

    const [aUpdated, bUpdated] = pour(a, b)
    expect(aUpdated).toStrictEqual(['', '', ''])
    expect(bUpdated).toStrictEqual(['', '', ''])
  })

  it('pour C', () => {
    expect.hasAssertions()
    const a: Bottle = ['', '', '']
    const b: Bottle = ['', '', 'blue']

    const [aUpdated, bUpdated] = pour(a, b)
    expect(aUpdated).toStrictEqual(['', '', ''])
    expect(bUpdated).toStrictEqual(['', '', 'blue'])
  })

  it('pour D', () => {
    expect.hasAssertions()
    const a: Bottle = ['yellow', 'yellow', 'blue']
    const b: Bottle = ['', '', 'blue']

    const [aUpdated, bUpdated] = pour(a, b)
    expect(aUpdated).toStrictEqual(['', '', 'blue'])
    expect(bUpdated).toStrictEqual(['yellow', 'yellow', 'blue'])
  })

  it('pour E', () => {
    expect.hasAssertions()
    const a: Bottle = ['yellow', 'yellow', 'blue']
    const b: Bottle = ['', '', '']

    const [aUpdated, bUpdated] = pour(a, b)
    expect(aUpdated).toStrictEqual(['', '', 'blue'])
    expect(bUpdated).toStrictEqual(['', 'yellow', 'yellow'])
  })

  it('pour F', () => {
    expect.hasAssertions()
    const a: Bottle = ['yellow', 'yellow', 'blue']
    const b: Bottle = ['blue', 'blue', 'blue']

    const [aUpdated, bUpdated] = pour(a, b)
    expect(aUpdated).toStrictEqual(['yellow', 'yellow', 'blue'])
    expect(bUpdated).toStrictEqual(['blue', 'blue', 'blue'])
  })

  it('pour G', () => {
    expect.hasAssertions()
    const a: Bottle = ['yellow', 'yellow', 'blue']
    const b: Bottle = ['', 'yellow', 'blue']

    const [aUpdated, bUpdated] = pour(a, b)
    expect(aUpdated).toStrictEqual(['', 'yellow', 'blue'])
    expect(bUpdated).toStrictEqual(['yellow', 'yellow', 'blue'])
  })

  it('pour H pour one', () => {
    expect.hasAssertions()
    const a: Bottle = ['yellow', 'yellow', 'blue']
    const b: Bottle = ['', '', '']

    const [aUpdated, bUpdated] = pour(a, b, 1)
    expect(aUpdated).toStrictEqual(['', 'yellow', 'blue'])
    expect(bUpdated).toStrictEqual(['', '', 'yellow'])
  })

  it('pour I pour two', () => {
    expect.hasAssertions()
    const a: Bottle = ['red', 'yellow', 'blue', 'blue']
    const b: Bottle = ['', '', '', 'green']

    const [aUpdated, bUpdated] = pour(a, b, 2)
    expect(aUpdated).toStrictEqual(['', 'yellow', 'blue', 'blue'])
    expect(bUpdated).toStrictEqual(['', '', 'red', 'green'])
  })

  it('getBottles A', () => {
    expect.hasAssertions()
    const bottles = getBottles()
    expect(bottles.length).toBeGreaterThan(1)
  })

  it('asciiBottle A with common colors', () => {
    expect.hasAssertions()
    const bottle: Bottle = ['yellow', 'yellow', 'blue']
    const ascii = asciiBottle(bottle)
    expect(ascii).toMatchInlineSnapshot(`"<🟨|🟨|🟦]"`)
  })

  it('asciiBottle B with unhandled colors', () => {
    expect.hasAssertions()
    // @ts-expect-error testing unhandled colors
    const bottle: Bottle = ['yellow', 'purple', 'blue', 'green']
    const ascii = asciiBottle(bottle)
    expect(ascii).toMatchInlineSnapshot(`"<🟨|purple|🟦|🟩]"`)
  })
})
