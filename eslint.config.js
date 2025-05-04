import { base } from 'eslint-plugin-shuunen/configs/base'
import { browser } from 'eslint-plugin-shuunen/configs/browser'
import { typescript } from 'eslint-plugin-shuunen/configs/typescript'

export default [
  ...base,
  ...browser,
  ...typescript,
  {
    name: 'project-overrides',
    rules: {
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    },
  },
]
