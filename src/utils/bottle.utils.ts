import { pickOne } from 'shuutils'
import { type Bottle, type Color, colors } from './colors.utils'

function getColors (nbColors = 5) {
  const bottle: Bottle = []
  for (let index = 0; index < nbColors; index += 1) {
    const color = pickOne(colors) /* c8 ignore next */ ?? 'blue'
    bottle.push(color)
  }
  return bottle.toSorted()
}

function getFirstColorIndex (bottle: Bottle) {
  return bottle.findIndex((color) => color !== '')
}

export function getBottles (nbBottles = 6) {
  const bottles: Bottle[] = []
  for (let index = 0; index < nbBottles; index += 1) bottles.push(getColors())
  return bottles
}

// eslint-disable-next-line max-statements
export function pour (from: Readonly<Bottle>, to: Readonly<Bottle>) {
  const cloneFrom = Array.from(from)
  const cloneTo = Array.from(to)
  if (cloneFrom.every((color) => color === '')) return [cloneFrom, cloneTo] satisfies [Bottle, Bottle]

  let lastColor: Color | undefined // eslint-disable-line @typescript-eslint/init-declarations

  for (let index = to.length - 1; index >= 0; index -= 1)
    if (to[index] === '') {
      const colorIndex = getFirstColorIndex(cloneFrom)
      const color = cloneFrom[colorIndex]
      if (lastColor !== undefined && lastColor !== color) break
      lastColor = color
      cloneTo[index] = color! // eslint-disable-line @typescript-eslint/no-non-null-assertion
      cloneFrom[colorIndex] = ''
    }

  return [cloneFrom, cloneTo] satisfies [Bottle, Bottle]
}
