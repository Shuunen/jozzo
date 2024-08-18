/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// @ts-expect-error missing types
import shuunen from 'eslint-plugin-shuunen'

export default [
  ...shuunen.configs.base,
  // ...shuunen.configs.node,
  ...shuunen.configs.browser,
  ...shuunen.configs.typescript,
  {
    name: 'project-overrides',
    rules: {
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    },
  },
]
