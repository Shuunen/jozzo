import { getInteriorClipPath, interiorPoints, outerPoints, outerWidth, toSvgPath } from './bottle-shape.utils'

describe('bottle shape', () => {
  it('the interior is symmetrical and fits in the glass', () => {
    expect.hasAssertions()
    const xs = interiorPoints.map(point => point.x)
    expect(Math.max(...xs)).toBe(-Math.min(...xs))
    expect(Math.max(...outerPoints.map(point => point.x))).toBe(outerWidth / 2)
    expect(outerPoints).toHaveLength(interiorPoints.length)
  })

  it('converts the points to a closed svg path', () => {
    expect.hasAssertions()
    const path = toSvgPath(interiorPoints)
    expect(path.startsWith('M')).toBe(true)
    expect(path.endsWith('Z')).toBe(true)
    expect(path.split('L')).toHaveLength(interiorPoints.length)
  })

  it('converts the interior to a css clip-path', () => {
    expect.hasAssertions()
    const clip = getInteriorClipPath()
    expect(clip.startsWith('polygon(')).toBe(true)
    expect(clip.split(',')).toHaveLength(interiorPoints.length)
  })
})
