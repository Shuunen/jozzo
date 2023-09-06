export const colors = ['', 'blue', 'green', 'red', 'yellow'] as const

export type Color = typeof colors[number]

export type Bottle = Color[]
