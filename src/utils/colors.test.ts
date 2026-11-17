import { getNextColor } from './colors.utils'

test('getNextColor A default, no transparent', () => {
  expect.hasAssertions()
  expect(getNextColor()).toMatchInlineSnapshot(`"blue"`)
  expect(getNextColor()).toMatchInlineSnapshot(`"green"`)
  expect(getNextColor()).toMatchInlineSnapshot(`"red"`)
  expect(getNextColor()).toMatchInlineSnapshot(`"yellow"`)
  expect(getNextColor()).toMatchInlineSnapshot(`"blue"`)
  expect(getNextColor()).toMatchInlineSnapshot(`"green"`)
  expect(getNextColor()).toMatchInlineSnapshot(`"red"`)
  expect(getNextColor()).toMatchInlineSnapshot(`"yellow"`)
})

test('getNextColor B transparent', () => {
  expect.hasAssertions()
  expect(getNextColor(true)).toMatchInlineSnapshot(`""`)
  expect(getNextColor(true)).toMatchInlineSnapshot(`"blue"`)
  expect(getNextColor(true)).toMatchInlineSnapshot(`"green"`)
  expect(getNextColor(true)).toMatchInlineSnapshot(`"red"`)
  expect(getNextColor(true)).toMatchInlineSnapshot(`"yellow"`)
  expect(getNextColor(true)).toMatchInlineSnapshot(`""`)
  expect(getNextColor(true)).toMatchInlineSnapshot(`"blue"`)
  expect(getNextColor(true)).toMatchInlineSnapshot(`"green"`)
})
