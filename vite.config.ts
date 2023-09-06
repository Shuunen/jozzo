import preact from '@preact/preset-vite'
import { defineConfig } from 'vite'
import svgReact from 'vite-plugin-svgr'

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-anonymous-default-export
export default defineConfig({
  plugins: [
    preact(),
    svgReact(),
  ],
})
